import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Users, Share2, Heart } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, isLoading } = useData();
  const { isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  const event = events.find(e => e.id === id);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex-grow">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="aspect-video bg-muted rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-12 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                  <div className="h-4 bg-muted rounded w-4/5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or has been removed.</p>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.eventDate);
  const isUpcoming = eventDate > new Date();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast here
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      <div className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Event Image */}
          <div className="aspect-video bg-muted rounded-xl overflow-hidden mb-8 relative">
            {event.image ? (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <Calendar className="w-16 h-16 text-primary" />
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${isUpcoming
                ? "bg-emerald-500 text-white"
                : "bg-gray-500 text-white"
                }`}>
                {isUpcoming ? "Upcoming" : "Past Event"}
              </span>
            </div>
          </div>

          {/* Event Header */}
          <div className="mb-8">
            {/* Category */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                {event.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {event.title}
            </h1>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-6">


              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-3 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 hover:text-foreground transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>

              {isAuthenticated && (
                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${isSaved
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                  {isSaved ? "Saved" : "Save"}
                </button>
              )}
            </div>
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Left Column - Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">Event Details</h2>

                <div className="space-y-4">
                  {/* Date */}
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">
                        {eventDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {eventDate.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  {event.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">{event.location}</p>
                      </div>
                    </div>
                  )}

                  {/* Organizer */}
                  {event.organizer && (
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Organized by</p>
                        <p className="text-sm text-muted-foreground">{event.organizer}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Description */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">About This Event</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p className="text-base leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>
            </div>
          </div>

          {/* Related Events */}
          <div className="border-t border-border pt-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">More Events</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {events
                .filter(e => e.id !== event.id)
                .slice(0, 2)
                .map((relatedEvent) => (
                  <Link
                    key={relatedEvent.id}
                    to={`/events/${relatedEvent.id}`}
                    className="group bg-card rounded-lg border border-border p-4 hover:shadow-md transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {relatedEvent.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(relatedEvent.eventDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/events"
                className="inline-flex items-center gap-2 px-6 py-3 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 hover:text-foreground transition-colors"
              >
                View All Events
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
