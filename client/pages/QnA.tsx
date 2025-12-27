import { useState, useRef } from "react";
import { MessageCircle, Paperclip, Search, User, Clock, Sparkles, Heart, Bookmark, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";

import { useNavigate } from "react-router-dom";
import { QuestionCardSkeleton } from "@/components/SkeletonLoaders";
import { useIsMobile } from "@/hooks/use-mobile";

export default function QnA() {
  const { questions, categories, toggleFavorite, toggleReadLater, isSaved, isLoading, refreshData } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const isMobile = useIsMobile();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Pull to refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);

  // Safeguard against undefined categories
  const safeCategories = categories || [];
  const categoryOptions = ["All", ...safeCategories];

  // Safeguard against undefined questions
  const safeQuestions = questions || [];

  // Pull to refresh functions
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || window.scrollY > 0) return;
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || startY === 0 || window.scrollY > 0) return;
    const currentY = e.touches[0].clientY;
    const distance = Math.max(0, currentY - startY);
    setPullDistance(distance);
  };

  const handleTouchEnd = async () => {
    if (!isMobile || pullDistance < 80) {
      setPullDistance(0);
      setStartY(0);
      return;
    }

    // Add haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    setIsRefreshing(true);
    setPullDistance(0);
    setStartY(0);

    try {
      await refreshData();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const refreshOpacity = Math.min(pullDistance / 80, 1);

  // Voice search functionality
  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Voice search is not supported in your browser");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      toast.info("Listening... Speak now");
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
      toast.success(`Searching for: "${transcript}"`);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast.error("Voice search failed. Please try again.");
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      toast.error("Could not start voice search");
    }
  };

  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const filteredQuestions = safeQuestions.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || q.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div
      className="flex flex-col min-h-screen bg-background font-sans transition-colors duration-300"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Enhanced Pull to refresh indicator */}
      {isMobile && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center justify-center py-6 bg-gradient-to-b from-primary/15 via-primary/10 to-transparent backdrop-blur-md border-b border-primary/20 transition-all duration-300 overflow-hidden"
          style={{
            transform: `translateY(${Math.max(-120, pullDistance - 120)}%)`,
            opacity: refreshOpacity,
            height: Math.max(0, Math.min(120, pullDistance))
          }}
        >
          {/* Progress indicator */}
          <div className="relative mb-2">
            <div className="w-12 h-12 rounded-full border-3 border-primary/30 relative flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full border-3 border-primary border-t-transparent transition-all duration-200"
                style={{
                  transform: `rotate(${Math.min(360, (pullDistance / 80) * 360)}deg)`
                }}
              />
              {isRefreshing && (
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            {/* Progress dots */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    pullDistance > (i + 1) * 25 ? 'bg-primary scale-125' : 'bg-primary/40'
                  }`}
                  style={{
                    animationDelay: `${i * 100}ms`
                  }}
                />
              ))}
            </div>
          </div>

          <span className="text-sm font-semibold text-primary/90">
            {isRefreshing ? 'Refreshing...' : pullDistance > 80 ? 'Release to refresh' : 'Pull to refresh'}
          </span>

          {/* Subtle glow effect */}
          {pullDistance > 40 && (
            <div className="absolute inset-0 bg-primary/5 animate-pulse" />
          )}
        </div>
      )}

      <div className="flex-grow">
        {/* Header Section */}
        <div className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-3xl shadow-lg border-b border-border/50">
          <div className="absolute inset-0 animated-gradient"></div>
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
          <div className="relative z-10 max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl mb-6 shadow-xl border border-white/20">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-sm">
              Q&A Community
            </h1>
            <p className="text-white/90 text-lg sm:text-xl max-w-2xl mx-auto font-light leading-relaxed">
              Ask your Islamic questions, share knowledge, and find answers from
              our community of scholars and students.
            </p>
          </div>
        </div>


        {/* Search and Filter Section */}
        <div className="-mt-8 px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="max-w-5xl mx-auto">
            <div className="bg-card rounded-2xl shadow-xl p-4 sm:p-6 border border-border">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-9 relative">
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search questions by topic or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-14 py-4 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-muted/50 text-foreground transition-all placeholder:text-muted-foreground"
                  />
                  {/* Voice Search Button */}
                  {isMobile && (
                    <button
                      onClick={isListening ? stopVoiceSearch : startVoiceSearch}
                      className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
                        isListening
                          ? 'text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 animate-pulse'
                          : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                      }`}
                      title={isListening ? "Stop voice search" : "Start voice search"}
                    >
                      {isListening ? (
                        <MicOff size={18} className="animate-pulse" />
                      ) : (
                        <Mic size={18} />
                      )}
                    </button>
                  )}
                </div>
                <div className="md:col-span-3 relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-4 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-muted/50 text-foreground cursor-pointer appearance-none transition-all"
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            {filteredQuestions.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-block p-6 bg-muted rounded-full mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">
                  No questions found matching your search.
                </p>
                <button
                  onClick={() => { setSearchTerm(""); setSelectedCategory("All") }}
                  className="mt-4 text-primary font-medium hover:text-primary/90 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Questions List */}
        <div className="px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto space-y-6 scroll-smooth">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <QuestionCardSkeleton key={i} />
              ))
            ) : (
              filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className="bg-card border border-border/50 rounded-2xl transition-all duration-500 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/15 hover:-translate-y-2 cursor-pointer group gradient-border"
                  onClick={() => navigate(`/questions/${question.id}`)}
                >
                  <div className="p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary">
                              {question.category}
                            </span>
                            <span className="flex items-center text-xs text-muted-foreground font-medium">
                              <Clock size={12} className="mr-1" />
                              {question.date instanceof Date
                                ? question.date.toLocaleDateString()
                                : String(question.date)}
                            </span>
                          </div>
                          <div className="flex gap-2 relative z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(question.id, "question");
                              }}
                              className={`p-1.5 rounded-full transition-colors ${isSaved(question.id, "favorite")
                                ? "text-red-500 hover:text-red-600"
                                : "text-muted-foreground hover:text-red-500"
                                }`}
                            >
                              <Heart size={16} fill={isSaved(question.id, "favorite") ? "currentColor" : "none"} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleReadLater(question.id, "question");
                              }}
                              className={`p-1.5 rounded-full transition-colors ${isSaved(question.id, "read_later")
                                ? "text-emerald-600 hover:text-emerald-700"
                                : "text-muted-foreground hover:text-emerald-600"
                                }`}
                            >
                              <Bookmark size={16} fill={isSaved(question.id, "read_later") ? "currentColor" : "none"} />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold mb-3 transition-all duration-300 text-card-foreground group-hover:text-primary group-hover:scale-[1.02] transform origin-left">
                          {question.title}
                        </h3>

                        <p className="text-muted-foreground mb-6 leading-relaxed line-clamp-2 group-hover:text-muted-foreground/80 transition-colors duration-300">
                          {question.content.replace(/<[^>]*>/g, '')}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-border/50 group-hover:border-primary/20 transition-colors duration-300">
                          <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium">
                            <span className="flex items-center gap-2 group-hover:text-primary/80 transition-colors duration-300">
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
                                <User size={12} className="group-hover:text-primary/70 transition-colors duration-300" />
                              </div>
                              <span className="font-semibold">{question.author || "Anonymous"}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-primary font-semibold bg-primary/5 px-3 py-1.5 rounded-lg group-hover:bg-primary/10 group-hover:scale-105 transition-all duration-300">
                            <MessageCircle size={16} />
                            <span>{question.answers?.length || 0} Answers</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div >
  );
}
