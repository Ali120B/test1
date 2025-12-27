import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen, Play, Search, Filter, Calendar, User, Clock, Heart, Bookmark, Paperclip, ArrowLeft } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { DarsCardSkeleton } from "@/components/SkeletonLoaders";
import { getYouTubeThumbnail, isYouTubeUrl } from "@/lib/youtube";
import { useIsMobile } from "@/hooks/use-mobile";

export default function SeriesDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dars: allDars, series, categories, toggleFavorite, toggleReadLater, isSaved, isLoading } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const isMobile = useIsMobile();

  // Find the series
  const currentSeries = series?.find(s => s.id === id);

  // Get dars for this series
  const seriesDars = allDars?.filter(d => d.seriesId === id) || [];

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

    setIsRefreshing(true);
    setPullDistance(0);
    setStartY(0);

    try {
      // Refresh data if needed
      window.location.reload();
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const refreshOpacity = Math.min(pullDistance / 80, 1);

  // Safeguard against undefined categories
  const safeCategories = categories || [];
  const categoryOptions = ["All", ...safeCategories];

  const filteredDars = seriesDars.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Redirect if series not found
  useEffect(() => {
    if (!isLoading && !currentSeries) {
      navigate("/dars", { replace: true });
    }
  }, [currentSeries, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background font-sans transition-colors duration-300">
        <div className="flex-grow p-4 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="h-64 bg-muted skeleton rounded-3xl w-full" />
            <div className="space-y-4">
              <div className="h-12 bg-muted skeleton rounded-xl w-3/4" />
              <div className="h-6 bg-muted skeleton rounded-lg w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentSeries) {
    return null;
  }

  return (
    <div
      className="flex flex-col min-h-screen bg-background font-sans transition-colors duration-300"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {isMobile && (
        <div
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-4 bg-primary/10 backdrop-blur-sm transition-opacity duration-200"
          style={{
            transform: `translateY(${Math.max(-100, pullDistance - 100)}%)`,
            opacity: refreshOpacity
          }}
        >
          <div className="flex items-center gap-2 text-primary">
            <div className={`w-4 h-4 border-2 border-primary border-t-transparent rounded-full ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">
              {isRefreshing ? 'Refreshing...' : pullDistance >= 80 ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </div>
      )}

      <div className="flex-grow">
        {/* Header Section */}
        <div className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-3xl shadow-lg border-b border-border/50">
          <div className="absolute inset-0 animated-gradient"></div>
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
          <div className="relative z-10 max-w-7xl mx-auto">
            {/* Back button */}
            <button
              onClick={() => navigate("/dars")}
              className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Dars
            </button>

            <div className="text-center">
              <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl mb-6 shadow-xl border border-white/20">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl sm:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-sm">
                Dars
              </h1>
              <p className="text-white/90 text-lg sm:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                {currentSeries.description || "Explore this curated collection of Islamic teachings"}
              </p>

              {/* Series info */}
              <div className="mt-8 inline-flex items-center gap-4 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{seriesDars.length}</div>
                  <div className="text-sm text-white/80">Lessons</div>
                </div>
                <div className="w-px h-8 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-white">{currentSeries.name}</div>
                  <div className="text-sm text-white/80">Series</div>
                </div>
              </div>
            </div>
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
                    placeholder="Search lessons in this series..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-muted/50 text-foreground transition-all placeholder:text-muted-foreground"
                  />
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

            {filteredDars.length === 0 && seriesDars.length > 0 && (
              <div className="text-center py-16">
                <div className="inline-block p-6 bg-muted rounded-full mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">
                  No lessons found matching your search.
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

        {/* Dars Grid */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <DarsCardSkeleton key={i} />
                ))
              ) : (
                filteredDars.map((dars) => (
                  <div
                    key={dars.id}
                    onClick={() => navigate(`/dars/${dars.id}`)}
                    className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer card-hover"
                  >
                    <div className="aspect-video relative overflow-hidden bg-muted flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>

                      {dars.type === "video" && dars.videoUrl && isYouTubeUrl(dars.videoUrl) ? (
                        <img
                          src={getYouTubeThumbnail(dars.videoUrl)!}
                          alt={dars.title}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        />
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

                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-background/90 backdrop-blur text-foreground text-xs font-bold rounded-lg shadow-sm">
                          {dars.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
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
                            className={`p-1.5 rounded-full transition-colors ${isSaved(dars.id, "favorite")
                              ? "text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20"
                              : "text-muted-foreground hover:text-red-500 hover:bg-muted"
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
                            className={`p-1.5 rounded-full transition-colors ${isSaved(dars.id, "read_later")
                              ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20"
                              : "text-muted-foreground hover:text-emerald-600 hover:bg-muted"
                              }`}
                            title={isSaved(dars.id, "read_later") ? "Remove from Read Later" : "Read Later"}
                          >
                            <Bookmark size={16} fill={isSaved(dars.id, "read_later") ? "currentColor" : "none"} />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-card-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {dars.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-6 line-clamp-2 leading-relaxed">
                        {dars.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-muted-foreground/70" />
                          <span className="truncate max-w-[100px]">{dars.teacher}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-muted-foreground/70" />
                          <span>{dars.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Empty state for series with no dars */}
            {seriesDars.length === 0 && !isLoading && (
              <div className="text-center py-16">
                <div className="inline-block p-6 bg-muted rounded-full mb-4">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Lessons Yet</h3>
                <p className="text-muted-foreground">
                  This series doesn't have any lessons yet. Check back later!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}