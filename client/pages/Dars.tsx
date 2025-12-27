import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { BookOpen, Play, Search, Filter, Calendar, User, Clock, Heart, Bookmark, Paperclip, Layers, Mic, MicOff } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { DarsCardSkeleton } from "@/components/SkeletonLoaders";
import { getYouTubeThumbnail, isYouTubeUrl } from "@/lib/youtube";
import { toast } from "sonner";

export default function Dars() {
  const { dars, categories, series, toggleFavorite, toggleReadLater, isSaved, isLoading, refreshData } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Pull to refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);

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

  // Safeguard against undefined categories
  const safeCategories = categories || [];
  const categoryOptions = ["All", ...safeCategories];

  // Safeguard against undefined dars
  const safeDars = dars || [];

  const filteredDars = safeDars.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    // Only show dars that don't belong to any series (single dars)
    const isSingleDars = !item.seriesId;
    return matchesSearch && matchesCategory && isSingleDars;
  });

  const filteredSeries = series?.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  }) || [];

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
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${pullDistance > (i + 1) * 25 ? 'bg-primary scale-125' : 'bg-primary/40'
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
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-sm">
              Islamic Dars
            </h1>
            <p className="text-white/90 text-lg sm:text-xl max-w-2xl mx-auto font-light leading-relaxed">
              Explore our curated collection of Islamic teachings, Quranic studies, and spiritual insights to illuminate your path.
            </p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="-mt-8 px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="max-w-5xl mx-auto">
            <div className="bg-card rounded-2xl shadow-xl p-4 sm:p-6 border border-border">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 relative">
                  <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search dars by title, topic, or teacher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-14 py-4 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-muted/50 text-foreground transition-all placeholder:text-muted-foreground"
                  />
                  {/* Voice Search Button */}
                  {isMobile && (
                    <button
                      onClick={isListening ? stopVoiceSearch : startVoiceSearch}
                      className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${isListening
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
                <div className="md:col-span-4 relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-12 pr-10 py-4 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-muted/50 text-foreground appearance-none cursor-pointer transition-all"
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

            {filteredDars.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-block p-6 bg-muted rounded-full mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">
                  No dars found matching your search.
                </p>
                <button
                  onClick={() => { setSearchTerm(""); setSelectedCategory("All") }}
                  className="mt-4 text-primary font-medium hover:text-primary/80 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Series Section */}
        {filteredSeries.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Layers className="w-6 h-6 text-primary" />
                Series & Collections
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 scroll-smooth">
              {filteredSeries.map((s) => {
                const seriesDars = safeDars.filter(d => d.seriesId === s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/series/${s.id}`)}
                    className="relative group cursor-pointer rounded-2xl overflow-hidden border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-primary/5 to-primary/10"
                  >
                    <div className="aspect-video bg-muted relative">
                      {s.image && (s.image.startsWith("http") || s.image.startsWith("/")) ? (
                        <img src={s.image} alt={s.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                          {s.image ? (
                            <span className="text-5xl">{s.image}</span>
                          ) : (
                            <Layers className="w-12 h-12 text-primary/40" />
                          )}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Play className="w-12 h-12 text-white fill-current" />
                      </div>
                      {/* Series badge */}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-primary/90 backdrop-blur text-primary-foreground text-xs font-bold rounded-lg shadow-sm">
                          Series
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-card">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                          <Layers size={12} />
                          <span>Series</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(s.id, "series");
                            }}
                            className={`p-2.5 rounded-full transition-colors min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto sm:p-1.5 ${isSaved(s.id, "favorite")
                              ? "text-red-500 hover:text-red-600"
                              : "text-muted-foreground hover:text-red-500"
                              }`}
                            title={isSaved(s.id, "favorite") ? "Remove from Favorites" : "Add to Favorites"}
                          >
                            <Heart size={16} fill={isSaved(s.id, "favorite") ? "currentColor" : "none"} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleReadLater(s.id, "series");
                            }}
                            className={`p-2.5 rounded-full transition-colors min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto sm:p-1.5 ${isSaved(s.id, "read_later")
                              ? "text-emerald-600 hover:text-emerald-700"
                              : "text-muted-foreground hover:text-emerald-600"
                              }`}
                            title={isSaved(s.id, "read_later") ? "Remove from Read Later" : "Read Later"}
                          >
                            <Bookmark size={16} fill={isSaved(s.id, "read_later") ? "currentColor" : "none"} />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-bold text-lg mb-1 line-clamp-1">{s.name}</h3>
                      {s.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{s.description}</p>}
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-primary uppercase tracking-wider">
                          {seriesDars.length} Lessons
                        </span>
                        <span className="text-muted-foreground">
                          Collection
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dars Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          {/* Section Header */}
          {filteredDars.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-primary" />
                Single Dars
              </h2>
              <p className="text-muted-foreground mt-1">Standalone lessons and teachings</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 scroll-smooth">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <DarsCardSkeleton key={i} />
              ))
            ) : (
              filteredDars.map((dars) => (
                <div
                  key={dars.id}
                  onClick={() => navigate(`/dars/${dars.id}`)}
                  className="group relative bg-card border border-border/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/15 transition-all duration-500 cursor-pointer hover:-translate-y-2 hover:border-primary/20 gradient-border"
                >
                  <div className="aspect-video relative overflow-hidden bg-muted flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>

                    {dars.type === "video" && dars.videoUrl && isYouTubeUrl(dars.videoUrl) ? (
                      <img
                        src={getYouTubeThumbnail(dars.videoUrl)!}
                        alt={dars.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : dars.type === "video" ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-500/10 text-emerald-600 transition-colors duration-300 group-hover:bg-emerald-500/20">
                        <Play size={48} className="mb-2 opacity-50" />
                        <span className="text-xs font-bold uppercase tracking-widest opacity-60">Video Lesson</span>
                      </div>
                    ) : (
                      <span className="text-6xl transform group-hover:scale-110 transition-transform duration-500 drop-shadow-md">{dars.image}</span>
                    )}

                    {dars.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg transform scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
                          <Play className="w-6 h-6 text-emerald-600 ml-1" fill="currentColor" />
                        </div>
                      </div>
                    )}

                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      {dars.seriesId && (
                        <span className="px-3 py-1 bg-purple-600/90 backdrop-blur text-white text-xs font-bold rounded-lg shadow-sm">
                          Series
                        </span>
                      )}
                      <span className="px-3 py-1 bg-background/90 backdrop-blur text-foreground text-xs font-bold rounded-lg shadow-sm">
                        {dars.category}
                      </span>
                    </div>

                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                        {dars.type === "video" ? <Play size={12} /> : <BookOpen size={12} />}
                        <span>{dars.type}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(dars.id, "dars");
                          }}
                          className={`p-2.5 rounded-full transition-colors min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto sm:p-1.5 ${isSaved(dars.id, "favorite")
                            ? "text-red-500 hover:text-red-600"
                            : "text-muted-foreground hover:text-red-500"
                            }`}
                          title={isSaved(dars.id, "favorite") ? "Remove from Favorites" : "Add to Favorites"}
                        >
                          <Heart size={16} fill={isSaved(dars.id, "favorite") ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleReadLater(dars.id, "dars");
                          }}
                          className={`p-2.5 rounded-full transition-colors min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto sm:p-1.5 ${isSaved(dars.id, "read_later")
                            ? "text-emerald-600 hover:text-emerald-700"
                            : "text-muted-foreground hover:text-emerald-600"
                            }`}
                          title={isSaved(dars.id, "read_later") ? "Remove from Read Later" : "Read Later"}
                        >
                          <Bookmark size={16} fill={isSaved(dars.id, "read_later") ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-card-foreground mb-1 line-clamp-1 group-hover:text-primary transition-all duration-300 group-hover:scale-[1.02] transform origin-left">
                      {dars.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-2 line-clamp-2 leading-relaxed group-hover:text-muted-foreground/80 transition-colors duration-300">
                      {dars.description}
                    </p>

                    <div className="flex items-center justify-between text-xs font-medium">
                      <div className="flex items-center gap-2 text-primary uppercase tracking-wider">
                        {dars.type === "video" ? <Play size={12} /> : <BookOpen size={12} />}
                        <span>{dars.type}</span>
                      </div>
                      <div className="text-muted-foreground">
                        {dars.category}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
