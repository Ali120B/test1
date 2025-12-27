import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Heart, Bookmark, FileText, HelpCircle, ExternalLink, Loader2, Sun, Moon, Palette, Layers, LogOut } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Profile() {
  const { user, isAuthenticated, updateProfile, logout } = useAuth();
  const { savedItems, dars, questions, series, isLoadingSaved } = useData();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"favorite" | "read_later">("favorite");

  if (!isAuthenticated) {
    navigate("/login", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const ok = await updateProfile({
        username,
        email,
        avatarUrl: avatarUrl || undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });
      if (!ok) {
        setError("Could not update profile. Check your details and try again.");
      } else {
        setSuccess("Profile updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Filter saved items based on active tab
  const filteredItems = savedItems.filter(item => item.listType === activeTab);

  const getItemDetails = (item: typeof savedItems[0]) => {
    if (item.itemType === 'dars') {
      const found = dars.find(d => d.id === item.itemId);
      return found ? { title: found.title, subtitle: found.teacher, icon: <FileText size={16} />, link: `/dars/${found.id}` } : null;
    } else if (item.itemType === 'series') {
      const found = series.find(s => s.id === item.itemId);
      return found ? { title: found.name, subtitle: 'Series Collection', icon: <Layers size={16} />, link: `/series/${found.id}` } : null;
    } else {
      const found = questions.find(q => q.id === item.itemId);
      return found ? { title: found.title, subtitle: `Asked by ${found.author}`, icon: <HelpCircle size={16} />, link: `/questions/${found.id}` } : null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="flex-grow px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-12">

          {/* Profile Settings Section */}
          <section>
            <h1 className="text-3xl font-bold text-foreground mb-6">
              Profile Settings
            </h1>

            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded text-sm text-green-600 dark:text-green-400">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary overflow-hidden border border-primary/20">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (username || email)[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    This is your profile avatar. You can use any public image URL.
                  </div>
                </div>

                <div>
                  <label className="block text-foreground font-semibold mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="block text-foreground font-semibold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="block text-foreground font-semibold mb-2">
                    Avatar URL (optional)
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/my-avatar.png"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>

                <div className="border-t border-border pt-6 mt-4">
                  <h2 className="text-lg font-semibold text-foreground mb-2">
                    Change Password (optional)
                  </h2>
                  <p className="text-xs text-muted-foreground mb-4">
                    To change your email or password, please enter your current
                    password.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-foreground font-semibold mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-foreground font-semibold mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          </section>

          {/* Theme Settings Section - Mobile Only */}
          <section className="md:hidden">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Palette className="w-6 h-6 text-primary" />
              Theme Settings
            </h2>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Choose your preferred theme for a better reading experience.
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      theme === "light"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Sun className="w-6 h-6" />
                    <span className="text-sm font-medium">Light</span>
                  </button>

                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      theme === "dark"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Moon className="w-6 h-6" />
                    <span className="text-sm font-medium">Dark</span>
                  </button>

                  <button
                    onClick={() => setTheme("beige")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      theme === "beige"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-100 to-amber-300 border border-amber-400"></div>
                    <span className="text-sm font-medium">Beige</span>
                  </button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Current theme: <span className="font-medium capitalize">{theme}</span>
                </p>
              </div>
            </div>
          </section>

          {/* Saved Items Section */}
          <section>
            <h1 className="text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
              My Library
            </h1>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm min-h-[400px]">
              <div className="flex border-b border-border">
                <button
                  onClick={() => setActiveTab("favorite")}
                  className={`flex-1 py-3 text-center font-semibold transition-colors flex items-center justify-center gap-2 text-sm ${activeTab === "favorite" ? "bg-primary/5 text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-muted/50"}`}
                >
                  <Heart size={16} className={activeTab === "favorite" ? "fill-current" : ""} /> Favorites
                </button>
                <button
                  onClick={() => setActiveTab("read_later")}
                  className={`flex-1 py-3 text-center font-semibold transition-colors flex items-center justify-center gap-2 text-sm ${activeTab === "read_later" ? "bg-primary/5 text-primary border-b-2 border-primary" : "text-muted-foreground hover:bg-muted/50"}`}
                >
                  <Bookmark size={16} className={activeTab === "read_later" ? "fill-current" : ""} /> Read Later
                </button>
              </div>

              <div className="p-6">
                {isLoadingSaved ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p>Loading your library...</p>
                  </div>
                ) : filteredItems.length > 0 ? (
                  <div className="grid gap-4">
                    {filteredItems.map(item => {
                      const details = getItemDetails(item);
                      if (!details) return null; // Skip if item not found (maybe deleted)

                      return (
                        <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition group">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-full bg-primary/10 text-primary mt-1">
                              {details.icon}
                            </div>
                            <div>
                              <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{details.title}</h3>
                              <p className="text-sm text-muted-foreground mb-1">{details.subtitle}</p>
                              <p className="text-xs text-muted-foreground/70">Saved {formatDistanceToNow(item.savedAt, { addSuffix: true })}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate(details.link)}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors"
                            title="View Item"
                          >
                            <ExternalLink size={20} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      {activeTab === "favorite" ? <Heart size={32} /> : <Bookmark size={32} />}
                    </div>
                    <h3 className="text-xl font-bold mb-2">No {activeTab === "favorite" ? "favorites" : "saved items"} yet</h3>
                    <p className="max-w-xs mx-auto">
                      Start exploring content and click the {activeTab === "favorite" ? "heart" : "bookmark"} icon to save items here.
                    </p>
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition"
                    >
                      Explore Content
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Logout Section - Mobile Only */}
          <section className="md:hidden">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <button
                onClick={logout}
                className="flex items-center justify-start gap-2 px-3 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium rounded-lg transition-colors text-sm"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

