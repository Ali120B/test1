import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, MessageCircle, Users, Star, ArrowRight, CheckCircle2, Download, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { useData } from "@/contexts/DataContext";
import { getYouTubeThumbnail, isYouTubeUrl } from "@/lib/youtube";

export default function Index() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { deferredPrompt, promptToInstall } = useInstallPrompt();
  const { dars, questions } = useData();

  const formatCount = (count: number) => {
    return count > 1000 ? "1000+" : count;
  };

  // If already logged in, send users to their landing (dashboard)
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: BookOpen,
      title: "Dars (Islamic Lessons)",
      description: "Access comprehensive Islamic teachings through engaging articles and video lessons.",
      color: "emerald"
    },
    {
      icon: MessageCircle,
      title: "Q&A Section",
      description: "Get your Islamic questions answered by knowledgeable teachers and scholars.",
      color: "amber"
    },
  ];

  const recommendedDars = dars.slice(0, 3);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 text-foreground transition-colors duration-300">
      {/* Hero Section */}
      <section className="flex-grow relative overflow-hidden glass">
        {/* Subtle Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="z-10 space-y-8"
            >
              <div className="inline-flex items-center space-x-2 bg-background/60 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-1.5 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-primary"></span>
                <span className="text-sm font-medium text-primary font-outfit">Welcome to Islami Zindagi</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-foreground leading-tight tracking-tight">
                The Way to <br />
                <span className="gradient-text">Real Success</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-lg">
                Embark on a transformative journey of Islamic learning. Access
                comprehensive dars (lessons), engage with our community
                through Q&A.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto"
                >
                  <Link
                    to="/dars"
                    className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 w-full bg-primary text-primary-foreground font-bold rounded-2xl transition-all duration-200 hover:bg-primary/90 text-base sm:text-lg shadow-emerald-lg"
                  >
                    Explore Dars
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto"
                >
                  <Link
                    to="/qna"
                    className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 w-full bg-secondary text-secondary-foreground font-bold rounded-2xl transition-all duration-200 hover:bg-secondary/90 text-base sm:text-lg"
                  >
                    Ask Questions
                  </Link>
                </motion.div>
              </div>

              <div className="hidden lg:flex pt-8 items-center gap-8 border-t border-border">
                <div className="text-center sm:text-left">
                  <p className="text-3xl font-bold text-foreground">{formatCount(dars.length)}</p>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Lessons</p>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div className="text-center sm:text-left">
                  <p className="text-3xl font-bold text-foreground">{formatCount(questions.length)}</p>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Questions</p>
                </div>
              </div>
            </motion.div>

            {/* Right Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="z-10 relative lg:h-[600px] flex items-center justify-center"
            >
              <div className="relative w-full max-w-lg bg-card/80 backdrop-blur-md border border-border shadow-xl rounded-[32px] p-8 sm:p-12">
                <div className="grid grid-cols-2 gap-6">
                  {/* Card 1: Learn */}
                  <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-border/50 transition-all duration-200 hover:bg-card/80 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-200 hover:scale-105">
                      <BookOpen size={28} />
                    </div>
                    <p className="text-foreground font-bold text-lg">Learn</p>
                    <p className="text-muted-foreground text-sm">Knowledge</p>
                  </div>

                  {/* Card 2: Ask */}
                  <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-border/50 transition-all duration-200 hover:bg-card/80 hover:border-secondary/40 hover:shadow-lg hover:shadow-secondary/10">
                    <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-200 hover:scale-105">
                      <MessageCircle size={28} />
                    </div>
                    <p className="text-foreground font-bold text-lg">Ask</p>
                    <p className="text-muted-foreground text-sm">Guidance</p>
                  </div>

                  {/* Card 3: Succeed (Spans full width) */}
                  <div className="col-span-2 bg-card/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-border/50 transition-all duration-200 hover:bg-card/90 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10">
                    <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-200 hover:scale-105">
                      <Star size={28} />
                    </div>
                    <p className="text-foreground font-bold text-lg">Succeed</p>
                    <p className="text-muted-foreground text-sm">Hereafter</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative glass md:backdrop-blur-xl">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 tracking-tight">
              Why Choose <span className="gradient-text">Islami Zindagi</span>?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed">
              We provide a comprehensive ecosystem for your spiritual learning and growth journey.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                  className="bg-card/70 md:backdrop-blur-sm border border-border/60 rounded-3xl p-6 sm:p-10 transition-all duration-200 hover:bg-card/90 hover:border-primary/30 group"
                >
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300 ${feature.color === 'emerald' ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground' : 'bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-foreground'
                    }`}>
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Recommended Lessons Section */}
      {isAuthenticated && recommendedDars.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 glass">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Recommended for You
              </h2>
              <p className="text-muted-foreground text-lg">
                Start your learning journey with these popular lessons
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedDars.map((item) => (
                <Link
                  key={item.id}
                  to={`/dars/${item.id}`}
                  className="bg-card/70 backdrop-blur-sm rounded-xl border border-border/60 hover:border-primary/30 transition-all duration-200 hover:bg-card/90 overflow-hidden group shadow-sm hover:shadow-md"
                >
                  <div className="aspect-video relative overflow-hidden bg-muted flex items-center justify-center">
                    {item.type === "video" && item.videoUrl && isYouTubeUrl(item.videoUrl) ? (
                      <img
                        src={getYouTubeThumbnail(item.videoUrl)!}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : item.type === "video" ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-500/10 text-emerald-600">
                        <Play size={32} className="mb-1 opacity-50" />
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Video</span>
                      </div>
                    ) : (
                      <span className="text-4xl">{item.image}</span>
                    )}

                    {item.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                          <Play size={16} className="text-emerald-600 ml-0.5" fill="currentColor" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 glass md:backdrop-blur-xl">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card/70 md:backdrop-blur-sm border border-border/60 rounded-[3rem] p-8 sm:p-16 text-center shadow-emerald"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Start Your Journey Today
            </h2>
            <p className="text-xl mb-10 text-muted-foreground max-w-2xl mx-auto">
              Join thousands of learners on the path to real success through
              authentic Islamic knowledge.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link
                to="/dars"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all duration-200 min-w-[160px]"
              >
                Browse Dars
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-secondary text-secondary-foreground font-bold rounded-xl hover:bg-secondary/90 transition-all duration-200 min-w-[160px]"
              >
                Create Account
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center space-x-8 text-sm font-medium text-muted-foreground">
              <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2" /> Free Access</div>
              <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2" /> Verified Content</div>
              <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2" /> 24/7 Support</div>
            </div>
          </motion.div>
        </div>
      </section>

      {deferredPrompt && (
        <section className="py-8 px-4 sm:px-6 lg:px-8 glass">
          <div className="max-w-3xl mx-auto">
            <div className="bg-card/70 backdrop-blur-sm border border-border/60 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-8 text-center sm:text-left">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">Get the App</h3>
                <p className="text-muted-foreground">Install Islami Zindagi for a better mobile experience.</p>
              </div>
              <button
                onClick={promptToInstall}
                className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all duration-200 whitespace-nowrap shadow-md hover:shadow-lg"
              >
                <Download size={20} />
                Install Now
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
