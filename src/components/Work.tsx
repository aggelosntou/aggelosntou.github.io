import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

const Work = () => {
  const projects = [
    {
      title: "Neural Network Optimization",
      description: "Developed novel optimization techniques for deep learning models using advanced calculus and linear algebra",
      tags: ["Machine Learning", "Python", "TensorFlow"],
      link: "#",
    },
    {
      title: "Mathematical Modeling Research",
      description: "Applied differential equations and statistical methods to model complex systems in computational biology",
      tags: ["Mathematics", "R", "Research"],
      link: "#",
    },
    {
      title: "Computer Vision Project",
      description: "Built an image classification system using convolutional neural networks and probability theory",
      tags: ["Deep Learning", "PyTorch", "CV"],
      link: "#",
    },
    {
      title: "Algorithm Analysis",
      description: "Conducted rigorous mathematical analysis of sorting algorithms and their computational complexity",
      tags: ["Algorithms", "Theory", "Python"],
      link: "#",
    },
  ];

  return (
    <section id="work" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            My Work
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12">
            Projects combining mathematical theory with practical machine learning applications
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((project, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                    <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <CardDescription className="text-base mt-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Work;
