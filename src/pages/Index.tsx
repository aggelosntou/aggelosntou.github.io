import Sidebar from "@/components/Sidebar";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Sidebar />
      
      {/* Mobile header */}
      <div className="lg:hidden border-b border-border p-4">
        <h1 className="text-xl font-medium">yourname.com</h1>
      </div>

      {/* Main content */}
      <main className="lg:ml-64 max-w-3xl mx-auto p-6 lg:p-12">
        <section id="main" className="mb-16">
          <h1 className="text-3xl mb-4">
            Welcome to <em>my</em> corner of the internet!
          </h1>
          
          <p className="mb-4">
            Greetings fellow traveler! Salutations! Callooh! Callay!
          </p>
          
          <p className="mb-4">
            My name is [Your Name]. I'm a math major interested in machine learning.
            I love working on hard problems with great people. My goal is to contribute 
            to groundbreaking research at organizations like Google DeepMind or NASA.
          </p>
          
          <p className="mb-6">
            Below are some of the things I've been doing.
          </p>

          {/* Currently section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Currently</h3>
            <table className="w-full">
              <tbody>
                <tr className="border-t border-border">
                  <td className="py-3 pr-4 text-muted-foreground align-top whitespace-nowrap">
                    Aug 2024 - Present
                  </td>
                  <td className="py-3">
                    Pursuing <strong>Bachelor's in Mathematics</strong> with a focus on machine learning applications
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="py-3 pr-4 text-muted-foreground align-top whitespace-nowrap">
                    Sep 2024 - Present
                  </td>
                  <td className="py-3">
                    Working on <strong>ML research project</strong> involving neural network optimization
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Previously section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Previously</h3>
            <table className="w-full">
              <tbody>
                <tr className="border-t border-border">
                  <td className="py-3 pr-4 text-muted-foreground align-top whitespace-nowrap">
                    Oct 2024
                  </td>
                  <td className="py-3">
                    Published research paper on <a href="#">neural network optimization techniques</a>
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="py-3 pr-4 text-muted-foreground align-top whitespace-nowrap">
                    May 2024
                  </td>
                  <td className="py-3">
                    Won first place in regional mathematics olympiad
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="py-3 pr-4 text-muted-foreground align-top whitespace-nowrap">
                    Jan 2024
                  </td>
                  <td className="py-3">
                    Built <a href="#">computer vision classification system</a> using CNNs and probability theory
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="py-3 pr-4 text-muted-foreground align-top whitespace-nowrap">
                    Sep 2023
                  </td>
                  <td className="py-3">
                    Completed coursework in Linear Algebra, Differential Equations, and Statistical Learning
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="about" className="mb-16 border-t border-border pt-12">
          <h2 className="text-2xl mb-4">Life</h2>
          
          <p className="mb-4">
            I'm passionate about using mathematics to solve real-world problems through AI. 
            My studies focus on the intersection of pure mathematics and machine learning, 
            exploring areas like optimization algorithms, statistical learning, and neural network theory.
          </p>
          
          <p className="mb-4">
            When I'm not buried in textbooks or coding, you might find me thinking about space exploration, 
            reading research papers, or working on personal ML projects.
          </p>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Recent Announcements</h3>
            <ul className="space-y-2 list-disc list-inside">
              <li>Accepted to present research at upcoming ML conference (2024)</li>
              <li>Started new research collaboration on deep learning theory (2024)</li>
            </ul>
          </div>
        </section>

        <section id="contact" className="mb-16 border-t border-border pt-12">
          <h2 className="text-2xl mb-4">Contact</h2>
          
          <p className="mb-4">
            Interested in collaboration or have questions? Feel free to reach out:
          </p>
          
          <ul className="space-y-2">
            <li>
              <strong>Email:</strong> <a href="mailto:your.email@example.com">your.email@example.com</a>
            </li>
            <li>
              <strong>GitHub:</strong> <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer">github.com/yourusername</a>
            </li>
            <li>
              <strong>LinkedIn:</strong> <a href="https://linkedin.com/in/yourprofile" target="_blank" rel="noopener noreferrer">linkedin.com/in/yourprofile</a>
            </li>
          </ul>
        </section>

        <footer className="text-sm text-muted-foreground border-t border-border pt-8 pb-12">
          <p>© {new Date().getFullYear()} All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
