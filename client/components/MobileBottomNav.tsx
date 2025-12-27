import { useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, MessageCircle, User, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: BookOpen, label: "Dars", path: "/dars" },
  { icon: MessageCircle, label: "Q&A", path: "/qna" },
  { icon: Calendar, label: "Events", path: "/events" },
  { icon: User, label: "Profile", path: "/profile" },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    // Don't show active indicator for admin routes
    if (location.pathname.startsWith('/admin')) {
      setActiveIndex(-1);
      return;
    }

    const index = navItems.findIndex(item =>
      location.pathname === item.path || (item.path === "/" && location.pathname === "/dashboard")
    );
    setActiveIndex(index >= 0 ? index : 0);
  }, [location.pathname]);

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 md:hidden">
      <div className="relative">
        {/* Outer glow effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/15 via-primary/8 to-transparent rounded-full blur-2xl scale-110 opacity-60" />

        {/* Secondary glow for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-full blur-lg" />

        {/* Main glass container with enhanced rounded pill shape */}
        <div className="relative bg-white/12 dark:bg-black/25 backdrop-blur-3xl border border-white/25 dark:border-white/15 rounded-full shadow-2xl shadow-black/25 px-8 py-4 ring-1 ring-white/10">
          {/* Inner highlight gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/8 via-transparent to-black/5 rounded-full" />

          {/* Subtle inner shadow for depth */}
          <div className="absolute inset-0 shadow-inner rounded-full" />

          <div className="relative flex items-center justify-center gap-2">
            {navItems.filter(item => item.path !== "/profile" || isAuthenticated).map((item, index) => {
              const isActive = location.pathname === item.path || (item.path === "/" && location.pathname === "/dashboard");
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "relative flex items-center justify-center w-14 h-14 rounded-full group",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground/70 hover:text-muted-foreground"
                  )}
                >
                  {/* Active background with enhanced glass effect */}
                  <div className={cn(
                    "absolute inset-0 bg-primary/20 backdrop-blur-md rounded-full border border-primary/30 shadow-xl shadow-primary/15 ring-1 ring-primary/20 transition-opacity duration-300",
                    isActive ? "opacity-100" : "opacity-0"
                  )} />

                  {/* Hover ripple effect */}
                  <div className="absolute inset-0 bg-white/10 dark:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100" />

                  {/* Icon with premium styling */}
                  <item.icon className={cn(
                    "w-5 h-5 relative z-10 drop-shadow-sm",
                    isActive ? "filter brightness-110" : ""
                  )} />
                </button>
              );
            })}

            {/* Animated active indicator - dynamic positioning based on visible items */}
            {(() => {
              const visibleItems = navItems.filter(item => item.path !== "/profile" || isAuthenticated);
              const activeVisibleIndex = visibleItems.findIndex(item =>
                location.pathname === item.path || (item.path === "/" && location.pathname === "/dashboard")
              );

              if (activeVisibleIndex === -1) return null;

              // Calculate spacing: padding between buttons is handled by flex gap-2
              // Each button is w-14 (56px) + gap-2 (8px) = 64px
              // The items are centered, so we need to calculate offset relative to center
              const count = visibleItems.length;
              const totalWidth = (count * 56) + ((count - 1) * 8);
              const xPos = (activeVisibleIndex * 64) - (totalWidth / 2) + 28;

              return (
                <div
                  className="absolute -bottom-1 w-1.5 h-1.5 bg-primary/90 backdrop-blur-sm rounded-full shadow-lg shadow-primary/30 ring-1 ring-primary/40 transition-transform duration-300 ease-out"
                  style={{ transform: `translateX(${xPos}px)` }}
                />
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
