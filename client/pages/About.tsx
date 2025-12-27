import { ElementType, ReactNode, useEffect } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users2, LightbulbIcon, HeartIcon, BookText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
  icon: ElementType;
  title: string;
  children: ReactNode;
  delay?: number;
  className?: string;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

const stagger: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  children, 
  delay = 0,
  className = '' 
}: FeatureCardProps) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={fadeInUp}
      transition={{ 
        delay: delay * 0.2,
        type: 'spring',
        stiffness: 100,
        damping: 15
      }}
      className={`h-full ${className}`}
    >
      <Card className="h-full transition-all duration-300 hover:shadow-md hover:border-primary/30 overflow-hidden group">
        <CardContent className="p-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2 text-foreground">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{children}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const About = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative py-16 sm:py-24 overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
              <BookText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              About Islami Zindagi
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto">
              Empowering the Muslim community through authentic knowledge and meaningful connections
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={stagger}
            className="space-y-16"
          >
            {/* Mission Section */}
            <motion.section
              variants={fadeInUp}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Our <span className="text-primary">Mission</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Islami Zindagi is dedicated to providing a comprehensive platform for Islamic learning and community engagement. 
                We aim to make authentic Islamic knowledge accessible to everyone, fostering a space where Muslims can learn, 
                share, and grow together in their faith journey.
              </p>
            </motion.section>

            {/* Features Section */}
            <motion.section 
              variants={fadeInUp}
              className="space-y-12"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  What We <span className="text-primary">Offer</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Comprehensive resources for your spiritual and educational journey
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <FeatureCard 
                  icon={BookOpen} 
                  title="Islamic Lessons" 
                  delay={0.2}
                  className="hover:border-primary/50"
                >
                  Access our comprehensive library of Islamic lessons covering Quranic studies, Hadith, Fiqh, and more, 
                  carefully curated by qualified scholars and teachers.
                </FeatureCard>
                
                <FeatureCard 
                  icon={Users2} 
                  title="Q&A Community" 
                  delay={0.4}
                  className="hover:border-primary/50"
                >
                  Get your Islamic questions answered by knowledgeable community members and scholars in our 
                  moderated Q&A forum.
                </FeatureCard>
              </div>
            </motion.section>
          </motion.div>
        </div>
      </div>


      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Join Our Growing Community
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Start your journey of learning and spiritual growth with Islami Zindagi today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/register">Get Started</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dars">Explore Content</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background border-t border-border/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} Islami Zindagi. All rights reserved.
            </p>
            <p className="mt-2 text-muted-foreground/80 text-sm">
              May Allah (SWT) accept our efforts and make this platform a source of benefit for the Ummah.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;