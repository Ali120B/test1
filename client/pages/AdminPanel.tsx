import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { BookOpen, MessageCircle, Layers, Calendar, Tag } from "lucide-react";
import DarsEditor from "@/components/DarsEditor";
import QnAEditor from "@/components/QnAEditor";
import SeriesEditor from "@/components/SeriesEditor";
import EventEditor from "@/components/EventEditor";
import EventCategoriesManager from "@/components/EventCategoriesManager";

export default function AdminPanel() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { dars, questions, categories } = useData();
  const [activeTab, setActiveTab] = useState<"dars" | "qna" | "series" | "events">("dars");

  // Redirect if not admin (run as a side-effect)
  useEffect(() => {
    if (!isAdmin) {
      navigate("/", { replace: true });
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-sans transition-colors duration-300">


      <div className="flex-grow">
        {/* Header Section */}
        <div className="relative py-8 sm:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-primary pb-16 sm:pb-24 shadow-xl">
          <div className="absolute inset-0 animated-gradient opacity-90"></div>
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>

          <div className="relative z-10 max-w-7xl mx-auto">
            <h1 className="text-xl sm:text-4xl font-bold text-white mb-2 sm:mb-4 tracking-tight">Dashboard Overview</h1>
            <p className="text-white/80 text-xs sm:text-lg max-w-2xl font-medium">
              Manage content, monitor activity, and oversee growth from one central hub.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="-mt-4 sm:-mt-12 px-3 sm:px-6 lg:px-8 pb-12 relative z-20">
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">


            {/* Management Section */}
            <div className="bg-card rounded-2xl shadow-xl shadow-black/5 border border-border overflow-hidden">
              {/* Tabs Header */}
              <div className="flex border-b border-border bg-muted/30 p-1 lg:p-2 gap-1 lg:gap-2">
                <button
                  onClick={() => setActiveTab("dars")}
                  className={`flex-1 flex items-center justify-center gap-1 px-1 lg:px-6 py-2 lg:py-3 rounded-lg lg:rounded-xl font-bold text-[10px] sm:text-xs transition-all duration-300 ${activeTab === "dars"
                    ? "bg-card text-primary shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  <BookOpen size={12} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  <span className="truncate">Dars</span>
                </button>
                <button
                  onClick={() => setActiveTab("series")}
                  className={`flex-1 flex items-center justify-center gap-1 px-1 lg:px-6 py-2 lg:py-3 rounded-lg lg:rounded-xl font-bold text-[10px] sm:text-xs transition-all duration-300 ${activeTab === "series"
                    ? "bg-card text-primary shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  <Layers size={12} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  <span className="truncate">Series</span>
                </button>
                <button
                  onClick={() => setActiveTab("qna")}
                  className={`flex-1 flex items-center justify-center gap-1 px-1 lg:px-6 py-2 lg:py-3 rounded-lg lg:rounded-xl font-bold text-[10px] sm:text-xs transition-all duration-300 ${activeTab === "qna"
                    ? "bg-card text-primary shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  <MessageCircle size={12} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  <span className="truncate">Q&A</span>
                </button>
                <button
                  onClick={() => setActiveTab("events")}
                  className={`flex-1 flex items-center justify-center gap-1 px-1 lg:px-6 py-2 lg:py-3 rounded-lg lg:rounded-xl font-bold text-[10px] sm:text-xs transition-all duration-300 ${activeTab === "events"
                    ? "bg-card text-primary shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  <Calendar size={12} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  <span className="truncate">Events</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-3 sm:p-6">
                {activeTab === "dars" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <DarsEditor />
                  </div>
                )}
                {activeTab === "series" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <SeriesEditor />
                  </div>
                )}
                {activeTab === "qna" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <QnAEditor />
                  </div>
                )}
                {activeTab === "events" && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <EventCategoriesManager />
                    <EventEditor />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
