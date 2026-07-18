---
title: "Apache Airflow from First Principles"
date: "2026-07-18"
summary: "A technical introduction to workflow orchestration, DAGs, scheduling, reliability, and Spark integration."
---

Modern data and machine-learning systems are composed of many separate computations. A pipeline may ingest data, validate schemas, create features, train a model, evaluate it, publish artifacts, and notify downstream services.

Running these steps with independent cron jobs quickly becomes difficult. Cron can start a process at a particular time, but it does not naturally represent dependencies, retries, task state, historical runs, parallelism, or conditional execution.

Apache Airflow is a workflow orchestrator. It does not normally process large datasets itself. Instead, it coordinates work performed by systems such as Python, SQL databases, Spark, Kubernetes, cloud services, and external APIs.

## 1. Workflows as directed acyclic graphs

Airflow represents each workflow as a Directed Acyclic Graph, or DAG:

$$G=(V,E),$$

where $V$ is the set of tasks and $E$ is the set of directed dependencies between them.

An edge $u\rightarrow v$ means that task $v$ depends on task $u$. Acyclicity prevents circular dependencies and ensures that the graph has a valid topological ordering.

Consider the dependency graph

$$\text{extract}\rightarrow\text{transform}\rightarrow\text{load}.$$

In Airflow 3, the TaskFlow API can express this pipeline directly in Python:

```python
from datetime import timedelta

import pendulum
from airflow.sdk import dag, task


@dag(
    dag_id='daily_sales_pipeline',
    schedule='0 6 * * *',
    start_date=pendulum.datetime(2026, 1, 1, tz='UTC'),
    catchup=False,
    default_args={
        'retries': 3,
        'retry_delay': timedelta(minutes=5),
    },
    tags=['sales', 'production'],
)
def daily_sales_pipeline():

    @task
    def extract() -> list[dict]:
        return [
            {'order_id': 1, 'amount': 20.0},
            {'order_id': 2, 'amount': 35.0},
        ]

    @task
    def transform(rows: list[dict]) -> list[dict]:
        return [
            {**row, 'amount_with_tax': row['amount'] * 1.24}
            for row in rows
        ]

    @task
    def load(rows: list[dict]) -> None:
        print(f'Loading {len(rows)} rows')

    raw_rows = extract()
    clean_rows = transform(raw_rows)
    load(clean_rows)


daily_sales_pipeline()
```

Calling one task with the output of another creates both a data dependency and an execution dependency. Airflow stores and evaluates the resulting DAG rather than executing the functions when the DAG file is parsed.

## 2. Scheduler, executor, workers, and metadata database

The scheduler continuously examines DAG runs and task instances. When a task's dependencies and execution conditions are satisfied, the scheduler makes that task eligible for execution.

The executor determines how eligible tasks are launched. Depending on the deployment, tasks may execute in local processes, distributed workers, Kubernetes pods, or other configured environments.

Workers perform the actual task computation. The metadata database records DAG runs, task states, retries, scheduling information, connections, variables, and other orchestration metadata.

The conceptual flow is

$$\text{DAG definition}\rightarrow\text{Scheduler}\rightarrow\text{Executor}\rightarrow\text{Worker}.$$

Airflow therefore separates orchestration from computation. The scheduler decides what may run; the execution layer decides where it runs; the worker performs the work.

## 3. Tasks, operators, and sensors

A task is the smallest independently scheduled unit of work in a DAG. It should have a clear input, a clear output, and an observable success or failure state.

Operators are reusable task templates. Common examples include Python tasks, shell commands, SQL statements, HTTP requests, Kubernetes pods, and Spark submissions.

```python
from airflow.providers.standard.operators.bash import BashOperator

check_filesystem = BashOperator(
    task_id='check_filesystem',
    bash_command='df -h',
)
```

A sensor is a specialized task that waits for an external condition. For example, a sensor may wait for a file, a database record, an object-store key, or the completion of an external workflow.

```python
from airflow.providers.standard.sensors.filesystem import FileSensor

wait_for_input = FileSensor(
    task_id='wait_for_input',
    filepath='/data/incoming/orders.csv',
    poke_interval=60,
    timeout=3600,
    mode='reschedule',
)
```

Long-running waits should avoid occupying a worker unnecessarily. Rescheduling sensors or deferrable operators allow the task to release execution resources while waiting for an external event.

## 4. Idempotency and fault tolerance

A task is idempotent when repeating it produces the same intended final state as running it once:

$$f(f(x))=f(x).$$

Idempotency matters because retries, manual reruns, catchup, and backfills are normal parts of workflow orchestration. A task that blindly inserts the same rows on every retry can corrupt data.

A non-idempotent database write might look like this:

```python
cursor.execute(
    'INSERT INTO daily_metrics (date, value) VALUES (%s, %s)',
    (run_date, value),
)
```

A safer implementation uses an upsert or replaces a known partition:

```python
cursor.execute(
    '''
    INSERT INTO daily_metrics (date, value)
    VALUES (%s, %s)
    ON CONFLICT (date)
    DO UPDATE SET value = EXCLUDED.value
    ''',
    (run_date, value),
)
```

Another common pattern is to write output into a temporary location and publish it atomically only after validation succeeds.

Tasks should also avoid depending on mutable local worker state. A retry may run on another machine, so durable intermediate results belong in databases, object stores, data lakes, or other shared systems.

## 5. Retries, timeouts, and failure handling

Airflow can retry transient failures such as temporary network errors or unavailable external services.

```python
from datetime import timedelta
from airflow.sdk import task


@task(
    retries=4,
    retry_delay=timedelta(minutes=2),
    retry_exponential_backoff=True,
    execution_timeout=timedelta(minutes=20),
)
def call_external_service() -> dict:
    return request_data()
```

Retries should not be used to hide deterministic failures. Invalid SQL, malformed input, missing credentials, and broken application logic should usually fail clearly rather than repeat indefinitely.

Execution timeouts restrict the duration of an individual attempt. Sensor timeouts restrict the total period during which a sensor may wait.

## 6. Scheduling, cron, logical dates, and data intervals

A schedule determines when Airflow creates DAG runs. A five-field cron expression has the form

```text
minute hour day-of-month month day-of-week
```

For example,

```cron
0 6 * * *
```

creates a daily schedule associated with 06:00.

Other examples include:

```text
*/15 * * * *     every fifteen minutes
0 0 * * 1        every Monday at midnight
0 2 1 * *        on the first day of each month
```

A scheduled DAG run normally represents a logical data interval. For a daily pipeline, a run may process the data belonging to one complete day rather than simply whatever happens to exist when the worker starts.

Tasks should therefore use Airflow's logical interval values instead of calling the current system time inside business logic:

```python
from airflow.sdk import task


@task
def process_partition(**context):
    start = context['data_interval_start']
    end = context['data_interval_end']

    print(f'Processing records from {start} to {end}')
```

This makes historical execution reproducible. Rerunning the same logical interval should process the same partition of data.

Airflow also supports custom timetables and event-oriented scheduling when a simple cron expression does not describe the required behavior.

## 7. Catchup and backfills

Catchup creates missing scheduled DAG runs between the configured start date and the latest completed data interval.

```python
@dag(
    schedule='@daily',
    start_date=pendulum.datetime(2026, 7, 1, tz='UTC'),
    catchup=True,
)
def historical_pipeline():
    ...
```

A backfill explicitly creates DAG runs for a historical range. Backfills are useful when business logic changes, missing data arrives, or historical partitions must be recomputed.

Backfill-safe tasks must be idempotent and partition-aware. A historical task should write to the partition represented by its data interval, not to a table or path derived from the current date.

## 8. Dependencies and trigger rules

Dependencies can be declared with the shift operators:

```python
extract >> transform >> load
```

Airflow also supports fan-out and fan-in structures:

```python
extract >> [transform_users, transform_orders]
[transform_users, transform_orders] >> publish
```

By default, a downstream task generally runs only after all upstream tasks succeed. Trigger rules modify this condition.

Common trigger rules include `all_success`, `all_done`, `one_success`, `one_failed`, `none_failed`, and `none_failed_min_one_success`.

A cleanup task, for example, may need to run regardless of whether upstream computation succeeded:

```python
from airflow.providers.standard.operators.empty import EmptyOperator

cleanup = EmptyOperator(
    task_id='cleanup',
    trigger_rule='all_done',
)

[train_model, evaluate_model] >> cleanup
```

Trigger rules are especially important after branching because intentionally skipped branches should not necessarily prevent a downstream join from running.

## 9. Branching

Branching selects one or more downstream paths at runtime.

```python
from airflow.providers.standard.operators.empty import EmptyOperator
from airflow.providers.standard.operators.python import BranchPythonOperator


def choose_path(**context) -> str:
    row_count = context['ti'].xcom_pull(
        task_ids='count_rows',
        key='return_value',
    )
    return 'train_model' if row_count >= 1000 else 'skip_training'


choose = BranchPythonOperator(
    task_id='choose_path',
    python_callable=choose_path,
)

train_model = EmptyOperator(task_id='train_model')
skip_training = EmptyOperator(task_id='skip_training')

join = EmptyOperator(
    task_id='join',
    trigger_rule='none_failed_min_one_success',
)

choose >> [train_model, skip_training] >> join
```

Tasks on branches that were not selected are marked as skipped. The downstream join therefore needs a trigger rule compatible with skipped upstream tasks.

## 10. XComs

Tasks may execute on different workers and should not communicate through shared process memory. XComs provide a mechanism for exchanging small values and metadata between task instances.

The TaskFlow API automatically stores returned values as XComs:

```python
@task
def create_model_path() -> str:
    return 's3://models/churn/2026-07-18/model.pkl'


@task
def register_model(model_path: str) -> None:
    print(f'Registering {model_path}')


path = create_model_path()
register_model(path)
```

XComs should contain small references such as identifiers, row counts, status values, or object-store paths. Large DataFrames and model binaries should be stored externally, with only their location passed through XCom.

## 11. Variables, connections, and secrets

Variables store runtime configuration expressed as key-value data.

```python
from airflow.sdk import Variable

environment = Variable.get('environment', default='development')
settings = Variable.get('pipeline_settings', deserialize_json=True)
```

Variables should not replace version-controlled application configuration. Values that define the structure or behavior of a DAG are usually easier to test and review when stored in code.

Connections describe access to external systems. Operators and hooks typically refer to them by a connection identifier:

```python
from airflow.sdk import Connection

warehouse = Connection.get('analytics_warehouse')
print(warehouse.host)
```

Credentials should not be hard-coded in DAG files. Production deployments commonly resolve connections and variables through environment injection or an external secrets backend.

## 12. Pools, queues, priorities, and concurrency

Parallel execution must be controlled because databases, APIs, clusters, and worker fleets have finite capacity.

A pool limits how many pool slots may be occupied by a category of tasks. This can prevent hundreds of tasks from overwhelming a shared database.

```python
@task(
    pool='warehouse_queries',
    pool_slots=2,
    priority_weight=10,
)
def expensive_query() -> None:
    run_query()
```

Queues can route tasks to particular groups of workers when the chosen executor supports queue-based routing.

```python
@task(queue='gpu')
def train_deep_model() -> None:
    train()
```

Airflow also exposes DAG-level and deployment-level concurrency controls. These should be configured together with the real capacity of downstream systems rather than treated only as Airflow tuning parameters.

## 13. Deadline alerts and observability

Production workflows require visibility into task states, retries, duration, logs, and missed completion expectations.

Airflow 3 replaced the older SLA mechanism with Deadline Alerts. A deadline describes when a DAG run is expected to reach a particular timing condition and can invoke a callback when that deadline is missed.

Operational monitoring should cover both orchestration and business correctness. A green task only means that its code completed successfully; it does not prove that the resulting dataset is complete or statistically valid.

Data-quality checks should therefore be explicit tasks:

```python
@task
def validate_output(row_count: int, null_rate: float) -> None:
    if row_count == 0:
        raise ValueError('Output dataset is empty')

    if null_rate > 0.01:
        raise ValueError(f'Null rate too high: {null_rate}')
```

## 14. Airflow with Spark

Airflow and Spark solve different problems. Airflow orchestrates the workflow, while Spark performs distributed data processing.

A Spark application can be submitted with `SparkSubmitOperator`:

```python
from airflow.providers.apache.spark.operators.spark_submit import SparkSubmitOperator

build_features = SparkSubmitOperator(
    task_id='build_features',
    application='/opt/spark/jobs/build_features.py',
    conn_id='spark_default',
    application_args=[
        '--input',
        's3://data/raw/orders/{{ data_interval_start | ds }}',
        '--output',
        's3://data/features/orders/{{ data_interval_start | ds }}',
    ],
    conf={
        'spark.executor.instances': '4',
        'spark.executor.memory': '4g',
        'spark.executor.cores': '2',
    },
)
```

Airflow submits and monitors the application, but Spark's driver and executors perform the distributed computation. Large intermediate datasets should remain in the data platform rather than pass through Airflow.

A complete machine-learning workflow may combine Spark and Python tasks:

```python
from datetime import timedelta

import pendulum
from airflow.providers.apache.spark.operators.spark_submit import SparkSubmitOperator
from airflow.sdk import dag, task


@dag(
    dag_id='weekly_model_training',
    schedule='0 4 * * 1',
    start_date=pendulum.datetime(2026, 1, 1, tz='UTC'),
    catchup=False,
    default_args={
        'retries': 2,
        'retry_delay': timedelta(minutes=10),
    },
)
def weekly_model_training():

    build_features = SparkSubmitOperator(
        task_id='build_features',
        application='/opt/spark/jobs/features.py',
        conn_id='spark_default',
        application_args=[
            '--start', '{{ data_interval_start }}',
            '--end', '{{ data_interval_end }}',
        ],
    )

    @task(pool='training_jobs')
    def train_model() -> str:
        model_uri = train_from_feature_store()
        return model_uri

    @task
    def evaluate_model(model_uri: str) -> dict:
        return evaluate(model_uri)

    @task
    def publish(metrics: dict) -> None:
        if metrics['auc'] < 0.80:
            raise ValueError('Model quality threshold not reached')
        publish_model(metrics['model_uri'])

    model_uri = train_model()
    metrics = evaluate_model(model_uri)
    publication = publish(metrics)

    build_features >> model_uri
    publication


weekly_model_training()
```

The main engineering principle is separation of concerns. Airflow should describe dependencies, execution conditions, schedules, retries, and operational policy. The underlying systems should perform data processing, model training, storage, and serving.

A reliable Airflow pipeline is therefore not merely a collection of Python functions. It is a reproducible dependency graph whose tasks are idempotent, independently retryable, observable, bounded in resource usage, and defined around explicit data intervals.

