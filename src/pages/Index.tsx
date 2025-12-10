import { useState, useEffect } from "react";

const Index = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [introPhase, setIntroPhase] = useState<'in' | 'out'>('in');

  useEffect(() => {
    // After 2.5s, start fade out
    const fadeOutTimer = setTimeout(() => {
      setIntroPhase('out');
    }, 2500);

    // After 3.5s, remove intro completely
    const removeTimer = setTimeout(() => {
      setShowIntro(false);
    }, 3500);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (showIntro) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <p 
          className={`font-serif text-2xl md:text-3xl lg:text-4xl text-foreground tracking-wide italic ${
            introPhase === 'in' ? 'animate-intro-in' : 'animate-intro-out'
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
        
        {/* Header */}
        <header className="animate-section mb-20 md:mb-32">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground tracking-tight">
            Aggelos Ntousis
          </h1>
          <div className="mt-4 w-12 h-px bg-foreground/20" />
        </header>

        {/* Vision Section */}
        <section className="animate-section animate-section-delay-1 mb-20 md:mb-32">
          <p className="font-serif text-xl md:text-2xl text-foreground leading-relaxed mb-8">
            Developing the algorithms and infrastructure that will power the next generation of AI companies.
          </p>
          
          <div className="space-y-6 text-muted-foreground">
            <p>
              I believe the most profound 
              discoveries happen at the intersection of rigorous theory and fearless experimentation.
            </p>
            <p>
              Bachelor in Mathematics. Research on non-logconcave sampling algorithms.
              Experience in computer vision and deep learning.
            </p>
            <p>
              I'm drawn to hard problems—the kind that keep you up at night and reward obsession. 
              The kind that matter.
            </p>
          </div>
        </section>

        {/* Work Section */}
        <section className="animate-section animate-section-delay-2 mb-20 md:mb-32">
          <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-12">
            Work
          </h2>
          
          <div className="space-y-12">
            <article className="group">
              <h3 className="font-serif text-lg md:text-xl text-foreground mb-2">
                Langevin Sampling Algorithms
              </h3>
              <p className="text-muted-foreground text-sm mb-2">
                ArchimedesAI Research
              </p>
              <p className="text-muted-foreground">
                Investigating the convergence properties and applications of Langevin dynamics 
                in high-dimensional sampling problems. Exploring the beautiful mathematics where 
                stochastic processes meet optimization.
              </p>
            </article>

            <article className="group">
              <h3 className="font-serif text-lg md:text-xl text-foreground mb-2">
                Stochastic TULA
              </h3>
              <p className="text-muted-foreground text-sm mb-2">
                Mathematical Research
              </p>
              <p className="text-muted-foreground">
                Developing and analyzing variants of the Tamed Unadjusted Langevin Algorithm 
                for sampling from complex distributions. Work that bridges theoretical guarantees 
                with practical implementation.
              </p>
            </article>

            <article className="group">
              <h3 className="font-serif text-lg md:text-xl text-foreground mb-2">
                Satellite Image Segmentation
              </h3>
              <p className="text-muted-foreground text-sm mb-2">
                Demokritos Research Center
              </p>
              <p className="text-muted-foreground">
                Building computer vision systems for Earth observation. Applying deep learning 
                to extract meaning from the vast streams of satellite data that observe our planet.
              </p>
            </article>

            <article className="group">
              <h3 className="font-serif text-lg md:text-xl text-foreground mb-2">
                Neural Network Optimization
              </h3>
              <p className="text-muted-foreground text-sm mb-2">
                Published Research
              </p>
              <p className="text-muted-foreground">
                Investigating optimization techniques for deep neural networks. Understanding 
                why and how these systems learn.
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
