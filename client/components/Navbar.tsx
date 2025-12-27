import { useMemo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Menu, X, LogOut, Sun, Moon, Coffee, Settings, Download, Search, Book, MessageCircle, ArrowRight } from "lucide-react";
import GlobalSearch from "./GlobalSearch";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { useData } from "@/contexts/DataContext";
import { Command } from "cmdk";

// Mobile Search Modal Component
function GlobalSearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [search, setSearch] = useState("");
  const { dars, questions } = useData();
  const navigate = useNavigate();

  const stripHtml = (value: string) =>
    value ? value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "";

  const filteredDars = dars.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  const filteredQuestions = questions
    .filter(
      (item) =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        stripHtml(item.content).toLowerCase().includes(search.toLowerCase())
    )
    .map((item) => ({
      ...item,
      preview: stripHtml(item.content),
    }));

  const handleSelect = (item: any, type: 'dars' | 'question') => {
    if (type === 'dars') {
      navigate(`/dars/${item.id}`);
    } else {
      navigate(`/qna/${item.id}`);
    }
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 px-4">
      <div
        className="fixed inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center border-b border-border px-4 py-3">
          <Search size={20} className="text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for dars, questions, or topics..."
            className="flex-1 ml-3 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded text-xs text-muted-foreground ml-2"
          >
            ESC
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-2">
          {search && (
            <>
              {filteredDars.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-muted-foreground px-2 py-1 mb-2">Dars</h3>
                  {filteredDars.slice(0, 5).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item, 'dars')}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg text-left"
                    >
                      <Book size={16} className="text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">{item.title}</div>
                        <div className="text-sm text-muted-foreground truncate">{item.description}</div>
                      </div>
                      <ArrowRight size={16} className="text-muted-foreground flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {filteredQuestions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground px-2 py-1 mb-2">Q&A</h3>
                  {filteredQuestions.slice(0, 5).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item, 'question')}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg text-left"
                    >
                      <MessageCircle size={16} className="text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">{item.title}</div>
                        <div className="text-sm text-muted-foreground truncate">{item.preview}</div>
                      </div>
                      <ArrowRight size={16} className="text-muted-foreground flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {filteredDars.length === 0 && filteredQuestions.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  No results found for "{search}"
                </div>
              )}
            </>
          )}

          {!search && (
            <div className="py-12 text-center text-muted-foreground">
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <p>Start typing to search...</p>
              <p className="text-sm mt-2">Search through dars, questions, and topics</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { deferredPrompt, promptToInstall } = useInstallPrompt();
  const location = useLocation();
  const navigate = useNavigate();
  const desktopUserMenuRef = useRef<HTMLDivElement>(null);
  const mobileUserMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        desktopUserMenuRef.current &&
        desktopUserMenuRef.current.contains(event.target as Node)
      ) {
        return;
      }

      if (
        mobileUserMenuRef.current &&
        mobileUserMenuRef.current.contains(event.target as Node)
      ) {
        return;
      }

      if (
        desktopUserMenuRef.current ||
        mobileUserMenuRef.current
      ) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;
  const homePath = useMemo(
    () => (isAuthenticated ? "/dashboard" : "/"),
    [isAuthenticated],
  );

  return (
    <nav className="sticky top-0 z-50 transition-all duration-300 border-b border-border/40 bg-background/80 backdrop-blur-md md:rounded-none rounded-b-2xl md:rounded-b-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left side: Logo */}
          <div className="flex items-center">
            {/* Logo/Brand */}
            <Link
              to={homePath}
              className="flex items-center space-x-2.5 font-bold text-xl hover:opacity-90 transition group"
            >
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                <span className="text-primary-foreground font-bold text-lg">I</span>
              </div>
              <span className="tracking-tight text-foreground font-display">Islami Zindagi</span>
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <GlobalSearch />
          </div>

          {/* Mobile Right Side: Search, Theme, and Admin */}
          <div className="lg:hidden flex items-center gap-2">
            {!isAuthenticated && (
              <div className="flex bg-muted/50 p-1 rounded-full border border-border/50">
                <button
                  onClick={() => setTheme("light")}
                  className={`p-1.5 rounded-full transition-all ${theme === "light" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  title="Light Mode"
                >
                  <Sun size={14} />
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`p-1.5 rounded-full transition-all ${theme === "dark" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  title="Dark Mode"
                >
                  <Moon size={14} />
                </button>
                <button
                  onClick={() => setTheme("beige")}
                  className={`p-1.5 rounded-full transition-all ${theme === "beige" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  title="Reading Mode"
                >
                  <Coffee size={14} />
                </button>
              </div>
            )}
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 hover:bg-muted border border-border/50 rounded-full text-muted-foreground hover:text-foreground transition-all text-xs"
            >
              <Search size={14} />
              <span className="font-medium">Search</span>
            </button>
            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition"
              >
                Admin
              </Link>
            )}
          </div>

          <div className="hidden lg:flex items-center space-x-1">
            <Link
              to={homePath}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${isActive(homePath)
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              Home
            </Link>
            <Link
              to="/dars"
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${isActive("/dars")
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              Dars
            </Link>
            <Link
              to="/qna"
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${isActive("/qna")
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              Q&A
            </Link>
            <Link
              to="/events"
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${isActive("/events")
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
            >
              Events
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${isActive("/admin")
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                Admin Panel
              </Link>
            )}

            {isAuthenticated ? (
              <div className="ml-4 relative" ref={desktopUserMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((open) => !open)}
                  className="w-10 h-10 rounded-full bg-muted border-2 border-transparent hover:border-primary transition-all duration-300 flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {user?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatarUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-primary font-bold">{(user?.username || user?.email || "U")[0]?.toUpperCase()}</span>
                  )}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-card text-card-foreground rounded-2xl shadow-xl border border-border z-50 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200 p-2">
                    <div className="px-4 py-3 border-b border-border mb-2">
                      <p className="text-sm font-bold truncate">{user?.username || "User"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>

                    <div className="px-2 mb-2">
                      <div className="text-xs font-semibold text-muted-foreground px-2 py-1 uppercase tracking-wider mb-1">Theme</div>
                      <div className="grid grid-cols-3 gap-1 bg-muted/50 p-1 rounded-lg">
                        <button
                          onClick={() => setTheme("light")}
                          className={`flex items-center justify-center p-2 rounded-md transition-all ${theme === "light"
                            ? "bg-white text-emerald-600 shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                          title="Light Mode"
                        >
                          <Sun size={18} />
                        </button>
                        <button
                          onClick={() => setTheme("dark")}
                          className={`flex items-center justify-center p-2 rounded-md transition-all ${theme === "dark"
                            ? "bg-slate-800 text-emerald-400 shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                          title="Dark Mode"
                        >
                          <Moon size={18} />
                        </button>
                        <button
                          onClick={() => setTheme("beige")}
                          className={`flex items-center justify-center p-2 rounded-md transition-all ${theme === "beige"
                            ? "bg-[#EFEBE0] text-[#8C7A6B] shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                          title="Reading Mode"
                        >
                          <Coffee size={18} />
                        </button>
                      </div>
                    </div>

                    {deferredPrompt && (
                      <div className="px-4 py-2 mt-1 mb-2">
                        <button
                          onClick={() => {
                            void promptToInstall();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-emerald-600 text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                        >
                          <Download size={18} />
                          Install App
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate("/profile");
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm rounded-lg hover:bg-muted font-medium flex items-center gap-2 transition"
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        void logout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium flex items-center gap-2 transition"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="hidden lg:flex bg-muted/50 p-1 rounded-full border border-border">
                  <button
                    onClick={() => setTheme("light")}
                    className={`p-1.5 rounded-full transition-all ${theme === "light" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    title="Light Mode"
                  >
                    <Sun size={14} />
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`p-1.5 rounded-full transition-all ${theme === "dark" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    title="Dark Mode"
                  >
                    <Moon size={14} />
                  </button>
                  <button
                    onClick={() => setTheme("beige")}
                    className={`p-1.5 rounded-full transition-all ${theme === "beige" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    title="Reading Mode"
                  >
                    <Coffee size={14} />
                  </button>
                </div>
                <Link
                  to="/login"
                  className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold hover:opacity-90 rounded-xl transition shadow-lg shadow-emerald-900/10"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          <div className="hidden flex items-center gap-2"></div>
        </div>
      </div>

      {/* Mobile Search Modal */}
      {mobileSearchOpen && (
        <GlobalSearchModal
          isOpen={mobileSearchOpen}
          onClose={() => setMobileSearchOpen(false)}
        />
      )}
    </nav>
  );
}
