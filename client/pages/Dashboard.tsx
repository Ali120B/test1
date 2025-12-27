import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { BookOpen, MessageCircle, Play, Sparkles, TrendingUp, Award, Clock, ArrowRight, Star, Bookmark, Download, History, Compass, MessageSquare, Calendar, MapPin } from "lucide-react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import EmailVerificationPrompt from "@/components/EmailVerificationPrompt";

// Widget types
type WidgetType =
  | 'recently-viewed-dars'
  | 'explore-dars'
  | 'q-and-a-widget'
  | 'upcoming-events';

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { dars, darsProgress, savedItems, getRandomDars, getRandomQuestions, refreshData, events } = useData();
  const { deferredPrompt, promptToInstall } = useInstallPrompt();
  const isMobile = useIsMobile();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const firstName = (user?.username || user?.email || "Friend").split("@")[0];

  // Available widgets
  const widgets: Widget[] = [
    { id: 'recently-viewed-dars', type: 'recently-viewed-dars', title: 'Recently Viewed Dars' },
    { id: 'explore-dars', type: 'explore-dars', title: 'Explore Dars' },
    { id: 'q-and-a-widget', type: 'q-and-a-widget', title: 'Q&A Highlights' },
    { id: 'upcoming-events', type: 'upcoming-events', title: 'Upcoming Events' },
  ];

  // Get recently viewed dars from real data
  const recentlyViewedDars = darsProgress
      .sort((a, b) => b.lastVisitedAt.getTime() - a.lastVisitedAt.getTime())
    .slice(0, 3)
    .map((progress) => {
      const darsItem = dars.find(d => d.id === progress.darsId);
      if (!darsItem) return null;

      return {
        id: darsItem.id,
        title: darsItem.title,
        teacher: darsItem.teacher,
        category: darsItem.category,
        image: darsItem.image || '📖',
        lastViewed: progress.lastVisitedAt.toLocaleDateString(),
        hasSeries: !!darsItem.seriesId
      };
    })
    .filter(Boolean)
      .slice(0, 3);

  // Get explore dars (random recommendations from real data)
  const exploreDars = getRandomDars(3);

  // Get Q&A highlights from real data
  const qAndAHighlights = getRandomQuestions(3);

  // Get upcoming events (filter and sort)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(event => new Date(event.eventDate) > now) // Only upcoming events
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()) // Sort by date
      .slice(0, 3); // Limit to 3 events
  }, [events]);

  // Widget rendering functions
  const renderRecentlyViewedWidget = () => (
    <section className="bg-card rounded-3xl p-8 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
            <History size={20} />
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Recently Viewed Dars</h2>
        </div>
        <button onClick={() => navigate("/dars")} className="text-sm md:text-base text-blue-700 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 hover:gap-2 transition-all">
          View All <ArrowRight size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {recentlyViewedDars.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(`/dars/${item.id}`)}
            className="w-full group bg-muted/30 hover:bg-muted/70 border border-border hover:border-primary/30 rounded-xl p-4 transition-all duration-300 text-left relative"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl flex-shrink-0">{item.image}</div>
              <div className="flex-grow">
                <h3 className="font-bold text-card-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <BookOpen size={12} className="text-primary" />
                    {item.category}
                  </span>
                  <span>{item.teacher}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{item.lastViewed}</span>
                  <span className="text-xs text-muted-foreground">By {item.teacher}</span>
                </div>
              </div>
            </div>

            {/* Series pill in mid-right */}
            {item.hasSeries && (
              <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                <span className="px-2 py-1 bg-purple-600/90 backdrop-blur text-white text-xs font-bold rounded-md shadow-sm">
                  Series
                </span>
              </div>
            )}
          </button>
        ))}
      </div>
    </section>
  );

  const renderExploreWidget = () => (
    <section className="bg-card rounded-3xl p-8 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
            <Compass size={20} />
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Explore Dars</h2>
        </div>
        <button onClick={() => navigate("/dars")} className="text-sm md:text-base text-purple-700 dark:text-purple-400 font-medium hover:text-purple-800 dark:hover:text-purple-300 flex items-center gap-1 hover:gap-2 transition-all">
          Browse All <ArrowRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exploreDars.map((dars) => (
          <button
            key={dars.id}
            onClick={() => navigate(`/dars/${dars.id}`)}
            className="group bg-card text-card-foreground border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 text-left relative"
        >
            <div className="aspect-video bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center relative overflow-hidden">
              <div className="text-4xl transform group-hover:scale-110 transition-transform duration-500 drop-shadow-sm">{dars.image || '📖'}</div>
              {dars.type === "video" && (
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 flex items-center justify-center transition-all">
                  <div className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg transform scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all">
                    <Play className="w-4 h-4 text-emerald-600 ml-0.5" fill="currentColor" />
                  </div>
                </div>
              )}
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-background/90 backdrop-blur text-xs font-bold text-foreground rounded-md shadow-sm border border-border">
                  {dars.category}
                </span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-card-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors text-sm">
                {dars.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen size={10} className="text-purple-500" />
                  {dars.type}
            </span>
                <span>{dars.teacher}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );

  const renderQAndAWidget = () => (
    <section className="bg-card rounded-3xl p-8 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-700 dark:text-emerald-400">
            <MessageSquare size={20} />
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Q&A Highlights</h2>
        </div>
        <button onClick={() => navigate("/qna")} className="text-sm md:text-base text-emerald-700 dark:text-emerald-400 font-medium hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 hover:gap-2 transition-all">
          View All <ArrowRight size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {qAndAHighlights.map((question) => (
          <button
            key={question.id}
            onClick={() => navigate(`/questions/${question.id}`)}
            className="w-full group bg-muted/30 hover:bg-muted/70 border border-border hover:border-primary/30 rounded-xl p-6 transition-all duration-300 text-left"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center border border-border shadow-sm text-muted-foreground group-hover:text-primary transition-colors">
                  <MessageSquare size={18} />
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {question.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                  {question.content.replace(/<[^>]*>/g, '')}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <BookOpen size={10} className="text-emerald-500" />
                    {question.category}
                  </span>
                  <span>{question.date instanceof Date ? question.date.toLocaleDateString() : String(question.date)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">By {question.author || 'Anonymous'}</span>
                  <div className="flex items-center gap-2 bg-primary/5 px-3 py-1 rounded-lg">
                    <MessageSquare size={12} className="text-primary" />
                    <span className="text-xs text-primary font-medium">{question.answers?.length || 0} answers</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );

  // Render upcoming events widget
  const renderUpcomingEventsWidget = () => (
    <section className="bg-card rounded-3xl p-8 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
            <Calendar size={20} />
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">Upcoming Events</h2>
        </div>
        <button onClick={() => navigate("/events")} className="text-sm md:text-base text-emerald-700 dark:text-emerald-400 font-medium hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 hover:gap-2 transition-all">
          View All <ArrowRight size={16} />
        </button>
      </div>

      {upcomingEvents.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Upcoming Events</h3>
          <p className="text-muted-foreground">Check back later for upcoming Islamic events and gatherings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => {
            const eventDate = new Date(event.eventDate);
            return (
              <button
                key={event.id}
                onClick={() => navigate(`/events/${event.id}`)}
                className="group bg-card text-card-foreground border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 text-left"
              >
                {/* Event Image */}
                <div className="aspect-video bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 flex items-center justify-center relative overflow-hidden">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
                      <Calendar className="w-12 h-12 text-emerald-500" />
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-background/90 backdrop-blur text-xs font-bold text-foreground rounded-md shadow-sm border border-border">
                      {event.category}
                    </span>
                  </div>

                  {/* Date Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full shadow-sm">
                      {eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Event Content */}
                <div className="p-4">
                  <h3 className="font-bold text-card-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors text-sm">
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground text-xs line-clamp-2 mb-3">
                    {event.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} className="text-emerald-500" />
                      {eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin size={12} className="text-emerald-500" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );

  // Widget rendering function
  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'recently-viewed-dars':
        return renderRecentlyViewedWidget();
      case 'explore-dars':
        return renderExploreWidget();
      case 'q-and-a-widget':
        return renderQAndAWidget();
      case 'upcoming-events':
        return renderUpcomingEventsWidget();
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans transition-colors duration-300">
      <div className="flex-grow">
        {/* Welcome Section */}
        <div className="relative py-12 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-3xl shadow-lg border-b border-border/50 bg-emerald-900 dark:bg-background">
          <div className="absolute inset-0 animated-gradient opacity-90 dark:opacity-40"></div>
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent"></div>

          <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white text-center md:text-left">
              <h1 className="text-3xl sm:text-5xl font-extrabold mb-2 tracking-tight">
                Welcome back, <span className="text-emerald-200 dark:text-emerald-400">{firstName}</span>!
              </h1>
              <p className="text-emerald-50 dark:text-muted-foreground text-base md:text-lg opacity-90 max-w-xl">
                Continue your journey of knowledge and explore the latest insights from our educators.
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 pb-16 pt-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                </div>

            {/* Email Verification Prompt */}
            <EmailVerificationPrompt />

            {/* Widgets Grid */}
            <div className="space-y-8">
              {widgets.map((widget) => (
                <div key={widget.id} className="relative">
                  {renderWidget(widget)}
                </div>
                ))}
              </div>
              </div>

            {deferredPrompt && (
              <div className="mt-12 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl font-bold text-foreground mb-2">Install the App</h3>
                    <p className="text-muted-foreground">Get quick access to your lessons and Q&A by installing the app on your device.</p>
                  </div>
                  <button
                    onClick={promptToInstall}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all"
                  >
                    <Download size={20} />
                    Install Now
                  </button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
