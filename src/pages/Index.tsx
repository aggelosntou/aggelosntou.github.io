import { Link } from "react-router-dom";
import { experience, intro, life, profile, projects } from "@/content/site";
import { writingPosts } from "@/content/posts";

const formatDate = (date: string) => new Intl.DateTimeFormat("en", { year: "numeric", month: "long", day: "numeric" }).format(new Date(`${date}T00:00:00`));

const Index = () => (
  <main className="site-shell">
    <header className="hero">
      <img className="portrait" src="/images/aggelos_ntousis.jpg" alt={profile.name} />
      <div>
        <h1>{profile.name}</h1>
        <nav className="social-links" aria-label="Social links">
          <a href={profile.social.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href={profile.social.github} target="_blank" rel="noreferrer">GitHub</a>
          <a href={profile.social.x} target="_blank" rel="noreferrer">X</a>
          <a href={`mailto:${profile.email}`}>Email</a>
        </nav>
      </div>
    </header>

    <section className="intro">
      {intro.map((line) => <p key={line}>{line}</p>)}
    </section>

    <section>
      <h2>Projects</h2>
      <div className="project-grid">
        {projects.map((project) => (
          <article className="project-card" key={project.title}>
            <h3>{project.href ? <a href={project.href} target="_blank" rel="noreferrer">{project.title} ↗</a> : project.title}</h3>
            <p>{project.description}</p>
          </article>
        ))}
      </div>
    </section>

    <section>
      <h2>Research + Experience</h2>
      <div className="timeline">
        {experience.map((item) => (
          <article className="timeline-row" key={`${item.date}-${item.title}`}>
            <time>{item.date}</time>
            <div>
              <h3>{item.href ? <a href={item.href} target="_blank" rel="noreferrer">{item.title} ↗</a> : item.title}</h3>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>

    <section>
      <h2>Writing</h2>
      <div className="writing-list">
        {writingPosts.map((post) => (
          <article className="writing-row" key={post.slug}>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <div><h3><Link to={`/writing/${post.slug}`}>{post.title} →</Link></h3><p>{post.summary}</p></div>
          </article>
        ))}
      </div>
    </section>

    <section>
      <h2>Life</h2>
      <p className="life-copy">{life}</p>
    </section>

    <footer>© {profile.name} {new Date().getFullYear()}</footer>
  </main>
);

export default Index;
