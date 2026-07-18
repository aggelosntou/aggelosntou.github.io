---
title: "Apache Spark from First Principles"
date: "2026-07-18"
summary: "Ten fundamental ideas for understanding distributed computation with Spark and PySpark."
---

Apache Spark is a distributed computation engine for processing datasets that are too large, too expensive, or too slow to handle efficiently on a single machine.

PySpark is the Python interface to Spark. The Python program describes a computation, but the actual execution is coordinated by Spark across a cluster of machines.

The central idea is not merely to divide a dataset into smaller pieces. Spark must also schedule computation, move data between machines, recover from failures, optimize execution plans, and control memory usage.

A useful mental model is

$$\text{Spark application}=\text{distributed data}+\text{execution plan}+\text{cluster resources}.$$

The following ten principles explain most of Spark's behavior and performance.

## 1. Driver and executors

Every Spark application contains one driver process and a collection of executor processes.

The driver runs the main application. It constructs the logical computation, requests resources from the cluster manager, schedules work, and collects metadata about execution.

Executors are processes running on worker nodes. They execute tasks, store cached partitions, and return results or status information to the driver.

The architecture can be summarized as

$$\text{Driver}\longrightarrow\text{Executors}\longrightarrow\text{Partitions}.$$

A cluster manager such as Kubernetes, YARN, or Spark Standalone allocates the machines and resources used by the application. The cluster manager manages resources; Spark manages the computation.

A minimal PySpark application begins by creating a Spark session:

```python
from pyspark.sql import SparkSession

spark = (
    SparkSession.builder
    .appName('orders-analysis')
    .getOrCreate()
)
```

The `SparkSession` is the main entry point for DataFrame and SQL operations. Through it, the driver communicates with the underlying Spark execution engine.

The driver should not be treated as a large data-processing machine. Operations such as `collect()` transfer distributed data back to the driver and may exhaust its memory.

```python
# Dangerous when df is large.
rows = df.collect()

# Safer when only a small sample is required.
rows = df.limit(10).collect()
```

The distinction is fundamental: executors process distributed data, while the driver coordinates the computation.

## 2. Partitions

Spark does not process a DataFrame as one indivisible object. It divides the data into partitions:

$$D=D_1\cup D_2\cup\cdots\cup D_p,$$

where each $D_i$ is a partition and $p$ is the number of partitions.

A partition is the basic unit of parallelism. In general, one task processes one partition during a stage.

If a stage has 200 partitions, Spark can create up to 200 tasks for that stage. The number of tasks that execute simultaneously is limited by the available executor cores.

The number of partitions can be inspected through the underlying RDD representation:

```python
partition_count = df.rdd.getNumPartitions()
print(partition_count)
```

A DataFrame can be redistributed explicitly:

```python
repartitioned = df.repartition(100, 'customer_id')
```

This creates 100 partitions and distributes rows according to `customer_id`. Rows with the same key are assigned consistently according to the partitioning expression.

Partitioning creates a trade-off. Too few partitions underutilize the cluster and produce large tasks. Too many partitions create scheduling overhead and many small files.

If $N$ is the dataset size and $p$ is the number of balanced partitions, the average partition size is approximately

$$\frac{N}{p}.$$

This average is useful only when the data is balanced. In practice, key frequencies may be highly non-uniform, causing some partitions to become much larger than others.

## 3. Lazy evaluation

Spark evaluates transformations lazily. When a transformation is declared, Spark records the operation but does not immediately process the data.

Consider the following code:

```python
from pyspark.sql import functions as F

result = (
    spark.read.parquet('/data/orders')
    .filter(F.col('status') == 'completed')
    .select('customer_id', 'amount')
    .groupBy('customer_id')
    .agg(F.sum('amount').alias('total_amount'))
)
```

At this point, Spark has normally not read all the input or computed the aggregation. It has constructed a plan describing the desired result.

Execution begins only when an action requires a concrete result:

```python
result.show()
```

Lazy evaluation gives Spark an opportunity to inspect the entire computation before executing it. It can combine operations, remove unnecessary work, push filters toward the data source, and choose physical algorithms.

Mathematically, instead of evaluating each intermediate expression immediately, Spark constructs a composition

$$f_k\circ f_{k-1}\circ\cdots\circ f_1(D),$$

and optimizes the composed computation before materializing its result.

Lazy evaluation also means that creating a DataFrame variable does not imply that the result has been computed or stored.

```python
filtered = df.filter(F.col('amount') > 100)
```

The variable `filtered` represents a plan. Unless it is cached and materialized, Spark may recompute that plan whenever a later action requires it.

## 4. Transformations and actions

Spark operations can be divided conceptually into transformations and actions.

A transformation produces a new distributed dataset or DataFrame. Common transformations include `select`, `filter`, `withColumn`, `join`, `groupBy`, `repartition`, and `dropDuplicates`.

```python
clean = (
    df.filter(F.col('amount').isNotNull())
    .withColumn('amount_eur', F.col('amount') * F.lit(0.92))
    .select('customer_id', 'amount_eur')
)
```

An action requests a result and therefore triggers execution. Examples include `count`, `show`, `collect`, `first`, and writes to external storage.

```python
row_count = clean.count()

clean.write.mode('overwrite').parquet('/data/clean-orders')
```

Each action may launch a separate Spark job. Therefore, repeated actions over the same uncached lineage can repeat the same computation.

```python
filtered = df.filter(F.col('status') == 'completed')

filtered.count()                     # First job.
filtered.write.parquet('/output')    # Another job.
```

Whether the second job can reuse previous work depends on caching, exchange reuse, and the resulting physical plan. A Python variable alone does not guarantee reuse.

This distinction is important when reading PySpark code: transformations describe work, while actions demand that the work be performed.

## 5. Jobs, stages, and tasks

Spark decomposes execution into three nested units:

$$\text{Job}\longrightarrow\text{Stages}\longrightarrow\text{Tasks}.$$

An action generally creates a job. Spark then divides the job into stages according to data dependencies. Each stage is executed as a collection of tasks, usually one task per partition.

Suppose a computation reads orders, filters them, groups them by customer, and writes the result:

```python
result = (
    spark.read.parquet('/data/orders')
    .filter(F.col('status') == 'completed')
    .groupBy('customer_id')
    .agg(F.sum('amount').alias('total'))
)

result.write.mode('overwrite').parquet('/data/customer-totals')
```

The write is an action and creates a job. The filter can operate independently on each input partition, but the aggregation requires rows with the same `customer_id` to be brought together.

This redistribution introduces a boundary between stages:

```text
Stage 1
    read -> filter -> partial aggregation

                shuffle

Stage 2
    final aggregation -> write
```

Within a stage, tasks can usually run independently. A downstream stage cannot complete until the required outputs from the preceding shuffle stage are available.

This hierarchy explains Spark's user interface. A job may appear slow because one stage is slow, and a stage may be slow because one or a few tasks process unusually large partitions.

## 6. Narrow and wide transformations

The distinction between narrow and wide transformations determines whether data must move across the cluster.

A transformation is narrow when each output partition depends on a small number of input partitions, usually one.

Examples include `filter`, `select`, and many `withColumn` operations:

```python
filtered = df.filter(F.col('amount') > 0)
selected = filtered.select('customer_id', 'amount')
```

Each executor can apply these transformations locally to its current partition.

A transformation is wide when an output partition may depend on many input partitions. Examples include `groupBy`, many joins, `distinct`, `orderBy`, and `repartition`.

```python
aggregated = df.groupBy('customer_id').sum('amount')
```

To compute the aggregation, Spark must ensure that all rows for a particular customer reach the partition responsible for that customer.

A narrow dependency has the approximate structure

$$D_i\longrightarrow D_i',$$

whereas a wide dependency has the structure

$$\{D_1,\ldots,D_p\}\longrightarrow D_j'.$$

Narrow transformations can often be pipelined into the same stage. Wide transformations generally create shuffle boundaries and therefore new stages.

The narrow-wide distinction is more useful than memorizing whether individual API calls are expensive. The important question is whether the operation requires data to cross partition boundaries.

## 7. Shuffles

A shuffle redistributes data between partitions, usually across executors and machines.

During a shuffle, upstream tasks partition their output into blocks. Downstream tasks fetch the blocks associated with their target partitions.

The data movement can be represented as

$$D_i\longrightarrow\{B_{i1},B_{i2},\ldots,B_{ip}\},$$

where $B_{ij}$ is the block produced by input partition $i$ for output partition $j$.

Common shuffle-producing operations include:

```text
groupBy
join
distinct
orderBy
repartition
```

Shuffles are expensive because they may involve serialization, disk I/O, network transfer, sorting, memory pressure, and synchronization between stages.

Consider a join between two large DataFrames:

```python
joined = orders.join(customers, on='customer_id', how='inner')
```

If neither side is already distributed compatibly and neither side can be broadcast, Spark may shuffle both datasets by `customer_id`.

A small table can often avoid a large shuffle through a broadcast join:

```python
from pyspark.sql.functions import broadcast

joined = orders.join(
    broadcast(country_codes),
    on='country_code',
    how='left',
)
```

The small relation is copied to executors, allowing each executor to join it locally with its partitions of the large relation.

Reducing shuffles does not mean avoiding all wide operations. Aggregations and joins are often the purpose of the application. The objective is to avoid unnecessary redistribution and to make required shuffles balanced and appropriately partitioned.

## 8. Catalyst and execution plans

A PySpark DataFrame is not only a distributed collection of rows. It also represents a relational query plan.

Spark SQL processes a DataFrame computation through several conceptual layers:

$$\text{Unresolved logical plan}$$

$$\downarrow$$

$$\text{Analyzed logical plan}$$

$$\downarrow$$

$$\text{Optimized logical plan}$$

$$\downarrow$$

$$\text{Physical plan}.$$

The Catalyst optimizer applies transformations to the logical plan. These may include predicate pushdown, column pruning, constant folding, projection simplification, and join-related optimizations.

Suppose only two columns and a subset of rows are required:

```python
result = (
    spark.read.parquet('/data/orders')
    .filter(F.col('year') == 2026)
    .select('customer_id', 'amount')
)
```

Spark may push the `year` filter toward the Parquet scan and read only the required columns. This reduces both I/O and subsequent computation.

The execution plan can be inspected with `explain`:

```python
result.explain('formatted')
```

For more detail:

```python
result.explain('extended')
```

The physical plan reveals operators such as scans, filters, exchanges, hash aggregations, sort-merge joins, and broadcast hash joins.

An `Exchange` in the physical plan commonly indicates repartitioning or a shuffle boundary.

Understanding `explain` is one of the most important practical Spark skills. Performance tuning should begin with the execution plan rather than with arbitrary changes to executor memory or partition counts.

Spark SQL may also use Adaptive Query Execution. AQE can modify parts of the physical plan using runtime statistics, such as coalescing small shuffle partitions or handling skewed joins.

## 9. Partitioning and data skew

Distributed execution is efficient only when work is reasonably balanced across tasks.

Suppose most customer identifiers occur a few hundred times, but one identifier occurs hundreds of millions of times. After partitioning by customer, one task may receive a disproportionately large amount of data.

If task durations are

$$T_1,T_2,\ldots,T_p,$$

then the stage completion time is approximately controlled by

$$T_{\mathrm{stage}}\approx\max_i T_i.$$

Therefore, one extremely slow partition can delay the entire stage even when all other tasks have finished.

Skew can be investigated by examining key frequencies:

```python
(
    df.groupBy('customer_id')
    .count()
    .orderBy(F.desc('count'))
    .show(20, truncate=False)
)
```

It can also be identified through the Spark UI when a small number of tasks process substantially more data or run much longer than the rest.

Possible strategies include broadcasting a small join side, filtering irrelevant high-frequency keys, using a more suitable partitioning key, separating exceptional keys, enabling adaptive skew handling, or applying salting.

Salting adds a secondary value to distribute a hot key across several partitions:

```python
salt_buckets = 16

salted = df.withColumn(
    'salt',
    (F.rand(seed=42) * salt_buckets).cast('int'),
)

partial = (
    salted.groupBy('customer_id', 'salt')
    .agg(F.sum('amount').alias('partial_total'))
)

result = (
    partial.groupBy('customer_id')
    .agg(F.sum('partial_total').alias('total'))
)
```

Salting introduces additional complexity and often requires a second aggregation. It should be used when the skew is understood rather than applied blindly.

Partition count and partition balance are separate concerns. A dataset may have many partitions and still perform poorly if one partition contains most of the data.

## 10. Caching and persistence

Because DataFrames are lazily evaluated, Spark may recompute a lineage each time an action requires it.

Caching allows the materialized partitions of an intermediate result to be reused.

```python
features = (
    spark.read.parquet('/data/events')
    .filter(F.col('event_type').isNotNull())
    .groupBy('user_id')
    .agg(
        F.count('*').alias('event_count'),
        F.max('event_time').alias('last_event_time'),
    )
)

features.cache()
features.count()  # Materializes the cache.
```

Later actions may reuse the cached result:

```python
active_users = features.filter(F.col('event_count') > 20).count()

features.write.mode('overwrite').parquet('/data/features')
```

Calling `cache()` marks the DataFrame for persistence but does not immediately compute it. An action is still required to materialize the cached partitions.

The more general `persist()` method accepts an explicit storage level:

```python
from pyspark import StorageLevel

features.persist(StorageLevel.DISK_ONLY)
features.count()
```

When the result is no longer needed, it should be removed from the cache:

```python
features.unpersist()
```

Caching is useful when an expensive intermediate result is reused by multiple actions or multiple downstream branches.

Caching every DataFrame is counterproductive. Cached data consumes executor memory and may cause useful partitions to be evicted, increase garbage collection, or spill other computation to disk.

A simple cost model is

$$\text{cache benefit}\approx\text{recomputation cost saved}-\text{storage and materialization cost}.$$

Caching is therefore a physical execution decision, not a default step in every pipeline.

## A complete example

The following example combines the ten principles in a small PySpark pipeline:

```python
from pyspark.sql import SparkSession
from pyspark.sql import functions as F


spark = (
    SparkSession.builder
    .appName('customer-revenue')
    .getOrCreate()
)

orders = (
    spark.read
    .option('mergeSchema', 'false')
    .parquet('/data/orders')
)

customers = spark.read.parquet('/data/customers')

completed_orders = (
    orders
    .filter(F.col('status') == 'completed')
    .filter(F.col('amount') > 0)
    .select('customer_id', 'amount', 'order_timestamp')
)

customer_revenue = (
    completed_orders
    .groupBy('customer_id')
    .agg(
        F.sum('amount').alias('total_revenue'),
        F.count('*').alias('order_count'),
        F.max('order_timestamp').alias('last_order_timestamp'),
    )
)

result = (
    customer_revenue
    .join(
        F.broadcast(customers.select('customer_id', 'country')),
        on='customer_id',
        how='left',
    )
    .repartition('country')
)

result.explain('formatted')

result.write.mode('overwrite').partitionBy('country').parquet(
    '/data/customer-revenue'
)
```

The driver constructs this computation and asks executors to perform it. The input is divided into partitions. Filters and projections are narrow transformations and can often be pushed toward the Parquet scan.

The `groupBy` creates a wide dependency and normally requires a shuffle by `customer_id`. The small customer relation is broadcast so that the join can be performed locally on each executor.

The final repartition redistributes data by country before writing. The write is an action, so it triggers the job. Spark then divides the job into stages and each stage into partition-level tasks.

## The central principle

Spark performance is largely determined by the physical movement and organization of data.

The most important questions are therefore not only whether the code is syntactically correct, but also:

```text
Where is the data partitioned?
How many tasks will be created?
Which operations introduce shuffles?
Is the work balanced across partitions?
What does the physical plan contain?
Will an intermediate result be recomputed?
Is data being moved unnecessarily to the driver?
```

PySpark provides a Python interface, but Spark itself remains a distributed execution and query-optimization engine. Efficient Spark programs minimize unnecessary data movement, expose useful structure to the optimizer, keep computation distributed, and treat partitioning as part of the algorithm rather than as an implementation detail.

