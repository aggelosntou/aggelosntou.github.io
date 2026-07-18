import { Link, Navigate, useParams } from "react-router-dom";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { profile, writingPosts } from "@/content/site";

const MathParagraph = ({ children }: { children: string }) => {
  const displayMatch = children.match(/^\$\$([\s\S]+)\$\$$/);

  if (displayMatch) {
    return <BlockMath math={displayMatch[1]} />;
  }

  const parts = children.split(/(\$[^$]+\$)/g);
  return (
    <p>
      {parts.map((part, index) =>
        part.startsWith("$") && part.endsWith("$") ? (
          <InlineMath key={`${part}-${index}`} math={part.slice(1, -1)} />
        ) : (
          part
        ),
      )}
    </p>
  );
};

const WritingPost = () => {
  const { slug } = useParams();
  const post = writingPosts.find((item) => item.slug === slug);
  if (!post) return <Navigate to="/404" replace />;

  const date = new Intl.DateTimeFormat("en", { year: "numeric", month: "long", day: "numeric" }).format(new Date(`${post.date}T00:00:00`));
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
          {post.paragraphs.map((paragraph, index) => (
            <MathParagraph key={`${index}-${paragraph}`}>{paragraph}</MathParagraph>
          ))}
        </div>
      </article>
    </main>
  );
};

export default WritingPost;
