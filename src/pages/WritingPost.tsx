import { Link, Navigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { profile } from "@/content/site";
import { writingPosts } from "@/content/posts";

const WritingPost = () => {
  const { slug } = useParams();
  const post = writingPosts.find((item) => item.slug === slug);
  if (!post) return <Navigate to="/404" replace />;

  const date = new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(`${post.date}T00:00:00`));

  return (
    <main className="site-shell article-shell">
      <Link className="back-link" to="/">← {profile.name}</Link>
      <article>
        <header className="article-header">
          <time dateTime={post.date}>{date}</time>
          <h1>{post.title}</h1>
          <p>{post.summary}</p>
        </header>
        <div className="article-body">
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </main>
  );
};

export default WritingPost;
