const Sidebar = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <aside className="w-64 fixed left-0 top-0 h-screen p-8 border-r border-border hidden lg:block">
      <div className="space-y-8">
        <div>
          <button
            onClick={() => scrollToSection("main")}
            className="text-xl font-medium hover:no-underline"
          >
            yourname.com
          </button>
        </div>

        <nav className="space-y-3">
          <button
            onClick={() => scrollToSection("main")}
            className="block text-foreground/70 hover:text-foreground hover:no-underline"
          >
            Welcome to my corner of the internet!
          </button>
          <button
            onClick={() => scrollToSection("about")}
            className="block text-foreground/70 hover:text-foreground hover:no-underline"
          >
            Life
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="block text-foreground/70 hover:text-foreground hover:no-underline"
          >
            Contact
          </button>
        </nav>

        <div className="space-y-2">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="block text-sm">
            Github
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="block text-sm">
            LinkedIn
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
