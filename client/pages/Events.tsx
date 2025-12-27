import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, ArrowRight, Search, Filter, X } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Events() {
  const { events, isLoading, eventCategories } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"upcoming" | "recent" | "past">("upcoming");
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get event categories from DataContext
  const categories = useMemo(() => {
    const categoryNames = eventCategories.map(cat => cat.name);
    return ["all", ...categoryNames];
  }, [eventCategories]);

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    // Filter by search query
    let result = events.filter(event =>
      event.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      event.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (event.location && event.location.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
      (event.organizer && event.organizer.toLowerCase().includes(debouncedSearch.toLowerCase()))
    );

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter(event => event.category === selectedCategory);
    }

    // Sort events
    switch (sortOrder) {
      case "upcoming":
        return result.sort((a, b) =>
          new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        ).filter(event => new Date(event.eventDate) > new Date());
      case "recent":
        return result.sort((a, b) =>
          new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
        );
      case "past":
        return result.sort((a, b) =>
          new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        ).filter(event => new Date(event.eventDate) <= new Date());
      default:
        return result.sort((a, b) =>
          new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        );
    }
  }, [events, debouncedSearch, selectedCategory, sortOrder, eventCategories]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card rounded-xl p-6 space-y-4">
                    <div className="h-48 bg-muted rounded-lg"></div>
                    <div className="space-y-2">
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header Section */}
      <div className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-primary pb-16 sm:pb-24 shadow-xl">
        <div className="absolute inset-0 animated-gradient opacity-90"></div>
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            Islamic Events
          </h1>
          <p className="text-white/80 text-lg sm:text-xl max-w-3xl">
            Discover upcoming Islamic conferences, lectures, workshops, and community events.
            Connect with scholars, deepen your knowledge, and engage with the Muslim community.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow -mt-8 sm:-mt-16 px-4 sm:px-6 lg:px-8 pb-12 relative z-20">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Search and Sort Controls */}
          <div className="bg-card rounded-2xl shadow-xl shadow-black/5 border border-border p-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search events by title, description, location, or organizer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Sort Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSortOrder("upcoming")}
                      className={`px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium transition-all ${sortOrder === "upcoming" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                    >
                      Upcoming
                    </button>
                    <button
                      onClick={() => setSortOrder("recent")}
                      className={`px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium transition-all ${sortOrder === "recent" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                    >
                      Recent
                    </button>
                    <button
                      onClick={() => setSortOrder("past")}
                      className={`px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium transition-all ${sortOrder === "past" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                    >
                      Past
                    </button>
                  </div>
                </div>

                {/* Desktop Category Filter */}
                <div className="hidden lg:block w-[200px]">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === "all" ? "All Events" : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Category Filter */}
          <div className="lg:hidden bg-card rounded-2xl shadow-xl shadow-black/5 border border-border p-6 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Filter by Category</h3>
            <div className="w-[200px]">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === "all" ? "All Events" : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Events Grid */}
          {filteredAndSortedEvents.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Events Found</h3>
              <p className="text-muted-foreground">
                {selectedCategory === "all"
                  ? "There are no events matching your criteria."
                  : `No events found in the "${selectedCategory}" category.`}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedEvents.map((event) => {
                const eventDate = new Date(event.eventDate);
                const isUpcoming = eventDate > new Date();

                return (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="group bg-card rounded-xl border border-border shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden hover:-translate-y-1"
                  >
                    {/* Event Image */}
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {event.image ? (
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Calendar className="w-12 h-12 text-primary" />
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${isUpcoming ? "bg-emerald-500 text-white" : "bg-gray-500 text-white"}`}>
                          {isUpcoming ? "Upcoming" : "Past"}
                        </span>
                      </div>
                    </div>

                    {/* Event Content */}
                    <div className="p-6">
                      {/* Category */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                          {event.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {event.title}
                      </h3>

                      {/* Description */}
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>

                      {/* Event Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{eventDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                        </div>

                        {event.location && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}

                        {event.organizer && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span className="truncate">{event.organizer}</span>
                          </div>
                        )}
                      </div>

                      {/* Learn More */}
                      <div className="flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                        Learn More
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
