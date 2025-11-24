import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

const About = () => {
  const announcements = [
    {
      title: "Research Paper Published",
      description: "Latest work on neural network optimization accepted",
      date: "2024",
    },
    {
      title: "Math Competition Winner",
      description: "First place in regional mathematics olympiad",
      date: "2024",
    },
  ];

  return (
    <section id="about" className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            About Me
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12">
            Passionate about using mathematics to solve real-world problems through AI
          </p>

          <Card className="mb-8 shadow-lg">
            <CardContent className="p-8">
              <p className="text-lg leading-relaxed mb-6">
                I'm a mathematics major with a deep passion for machine learning and artificial intelligence. 
                My goal is to contribute to groundbreaking research at organizations like Google DeepMind or NASA, 
                where mathematical rigor meets cutting-edge technology.
              </p>
              <p className="text-lg leading-relaxed">
                Through my studies, I've developed strong foundations in linear algebra, calculus, probability theory, 
                and their applications in neural networks, optimization algorithms, and statistical learning. 
                I believe that the future of AI lies at the intersection of pure mathematics and practical implementation.
              </p>
            </CardContent>
          </Card>

          <div>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-accent" />
              <h3 className="text-2xl font-bold">Recent Announcements</h3>
            </div>
            <div className="grid gap-4">
              {announcements.map((announcement, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-lg">{announcement.title}</h4>
                      <Badge variant="secondary">{announcement.date}</Badge>
                    </div>
                    <p className="text-muted-foreground">{announcement.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
