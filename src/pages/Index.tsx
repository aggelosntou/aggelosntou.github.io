import { useEffect, useState } from "react";

const Index = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [introPhase, setIntroPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    const fadeOutTimer = window.setTimeout(() => setIntroPhase("out"), 2500);
    const removeTimer = window.setTimeout(() => setShowIntro(false), 3500);

    return () => {
      window.clearTimeout(fadeOutTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (showIntro) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <p
          className={`font-serif text-2xl md:text-3xl lg:text-4xl text-foreground tracking-wide italic ${
            introPhase === "in" ? "animate-intro-in" : "animate-intro-out"
          }`}
        >
          Stay Hungry. Stay Foolish.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-6 md:px-8 py-16 md:py-24 lg:py-32">
        {/* Header (with image) */}
        <header className="animate-section mb-20 md:mb-28">
          <div className="flex items-center justify-between gap-8">
            {/* Text */}
            <div className="min-w-0">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground tracking-tight">
                Aggelos Ntousis
              </h1>
              <div className="mt-4 w-12 h-px bg-foreground/20" />
            </div>

            {/* Photo (colored + circle) */}
            <div className="shrink-0">
              <img
                src="/images/aggelos_ntousis.jpg"
                alt="Aggelos Ntousis"
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover object-[50%_20%] ring-1 ring-foreground/15 shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* Vision Section */}
        <section className="animate-section animate-section-delay-1 mb-20 md:mb-32">
          <p className="font-serif text-xl md:text-2xl text-foreground leading-relaxed mb-8">
            Mathematician working on sampling algorithms, optimization, and machine learning.
          </p>

          <div className="space-y-6 text-muted-foreground">
            <p>
              My core interest lies in understanding and designing algorithms that operate at scale:
              how randomness, geometry, and optimization interact in high-dimensional systems.
            </p>

            <p>
              I am particularly focused on sampling and stochastic optimization methods motivated by
              modern machine learning, where classical assumptions (convexity, global smoothness)
              often fail, yet performance still emerges.
            </p>

            <p>
              Beyond theory, I care deeply about impact. I believe Europe needs a stronger, more ambitious
              technology ecosystem—one that produces original ideas, not just incremental improvements. My
              long-term goal is to help build that ecosystem by combining mathematical depth with engineering
              and entrepreneurial execution.
            </p>

            <p>
              My background includes mathematical research, computer vision, and deep learning, and I am now
              expanding aggressively into systems, large-scale ML, and business.
            </p>

            <p>
              I am drawn to hard problems—those that matter, resist simplification, and shape the future of
              technology.
            </p>
          </div>
        </section>

        {/* Work Section */}
        <section className="animate-section animate-section-delay-2 mb-20 md:mb-32">
          <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-12">Work</h2>

          <div className="space-y-12">
            <article>
              <h3 className="font-serif text-lg md:text-xl text-foreground mb-2">
                Langevin Sampling Algorithms
              </h3>
              <p className="text-muted-foreground text-sm mb-2">ArchimedesAI Research</p>
              <p className="text-muted-foreground">
                Research on the convergence, stability, and practical relevance of Langevin-based sampling
                methods in high dimensions, with a focus on regimes beyond log-concavity.
              </p>
            </article>

            <article>
              <h3 className="font-serif text-lg md:text-xl text-foreground mb-2">
                Tamed Langevin Dynamics (TULA / kTULA)
              </h3>
              <p className="text-muted-foreground text-sm mb-2">Mathematical Research</p>
              <p className="text-muted-foreground">
                Development and analysis of tamed discretizations of Langevin dynamics, providing
                non-asymptotic guarantees under weak regularity assumptions using KL, Wasserstein, and total
                variation bounds.
              </p>
            </article>

            <article>
              <h3 className="font-serif text-lg md:text-xl text-foreground mb-2">
                Satellite Image Segmentation
              </h3>
              <p className="text-muted-foreground text-sm mb-2">Demokritos Research Center</p>
              <p className="text-muted-foreground">
                Applied computer vision research for Earth observation, using deep learning to extract
                semantic information from large-scale satellite imagery.
              </p>
            </article>

            <article>
              <h3 className="font-serif text-lg md:text-xl text-foreground mb-2">
                Neural Network Optimization
              </h3>
              <p className="text-muted-foreground text-sm mb-2">Research &amp; Experimentation</p>
              <p className="text-muted-foreground">
                Study of optimization dynamics in deep neural networks, with the goal of understanding why
                certain methods work and how to design better ones.
              </p>
            </article>
          </div>
        </section>

        {/* Footer */}
        <footer className="animate-section animate-section-delay-3 pt-12 border-t border-border">
          <p className="text-muted-foreground text-sm tracking-wide">
            <a
              href="mailto:aggelosntousis02@gmail.com"
              className="hover:text-foreground transition-colors duration-300"
            >
              aggelosntousis02@gmail.com
            </a>
            <span className="mx-3">·</span>
            Athens, Greece
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;


