import { useState, useEffect, useMemo } from "react";
import { Command } from "cmdk";
import { Search, Book, MessageCircle, ArrowRight, Mic, MicOff, Filter, X, Calendar, User, Globe, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";

export default function GlobalSearch({ variant = "bar" }: { variant?: "bar" | "icon" }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [filters, setFilters] = useState({
        contentType: "all" as "all" | "article" | "video" | "question",
        category: "all" as string,
        scholar: "all" as string,
        language: "all" as "all" | "english" | "arabic" | "urdu",
        dateRange: "all" as "all" | "week" | "month" | "year" | "custom",
        difficulty: "all" as "all" | "beginner" | "intermediate" | "advanced"
    });
    const { dars, questions, categories } = useData();
    const navigate = useNavigate();

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Toggle the menu when ⌘K or Ctrl+K is pressed
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const handleVoiceSearch = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Voice search not supported in this browser');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setSearch(transcript);
        };
        recognition.onerror = () => setIsListening(false);

        recognition.start();
    };

    const stripHtml = (value: string) =>
        value ? value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : "";

    // Helper function to check date range
    const isWithinDateRange = (itemDate: Date, range: string) => {
        if (range === "all") return true;
        const now = new Date();
        const itemTime = itemDate.getTime();
        const nowTime = now.getTime();

        switch (range) {
            case "week":
                return nowTime - itemTime <= 7 * 24 * 60 * 60 * 1000;
            case "month":
                return nowTime - itemTime <= 30 * 24 * 60 * 60 * 1000;
            case "year":
                return nowTime - itemTime <= 365 * 24 * 60 * 60 * 1000;
            default:
                return true;
        }
    };

    const filteredDars = dars.filter((item) => {
        // Text search
        const matchesSearch = debouncedSearch === "" ||
            item.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            item.description.toLowerCase().includes(debouncedSearch.toLowerCase());

        // Content type filter
        const matchesType = filters.contentType === "all" ||
            (filters.contentType === "article" && item.type === "article") ||
            (filters.contentType === "video" && item.type === "video");

        // Category filter
        const matchesCategory = filters.category === "all" || item.category === filters.category;

        // Date range filter
        const matchesDate = filters.dateRange === "all" || isWithinDateRange(new Date(item.createdAt), filters.dateRange);

        // Language filter (basic implementation - could be enhanced)
        const matchesLanguage = filters.language === "all";

        // Difficulty filter (basic implementation - would need difficulty field in data)
        const matchesDifficulty = filters.difficulty === "all";

        return matchesSearch && matchesType && matchesCategory && matchesDate && matchesLanguage && matchesDifficulty;
    });

    const filteredQuestions = useMemo(
        () =>
            questions
                .filter((item) => {
                    // Text search
                    const matchesSearch = debouncedSearch === "" ||
                        item.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                        stripHtml(item.content).toLowerCase().includes(debouncedSearch.toLowerCase());

                    // Content type filter
                    const matchesType = filters.contentType === "all" || filters.contentType === "question";

                    // Category filter
                    const matchesCategory = filters.category === "all" || item.category === filters.category;

                    // Date range filter
                    const matchesDate = filters.dateRange === "all" || isWithinDateRange(new Date(item.date), filters.dateRange);

                    // Language filter (basic implementation)
                    const matchesLanguage = filters.language === "all";

                    // Difficulty filter (basic implementation)
                    const matchesDifficulty = filters.difficulty === "all";

                    return matchesSearch && matchesType && matchesCategory && matchesDate && matchesLanguage && matchesDifficulty;
                })
                .map((item) => ({
                    ...item,
                    preview: stripHtml(item.content),
                })),
        [questions, debouncedSearch, filters]
    );

    return (
        <>
            {variant === "icon" ? (
                <button
                    onClick={() => setOpen(true)}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition"
                    aria-label="Open search"
                >
                    <Search size={22} />
                </button>
            ) : (
                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-2 w-full px-5 py-2.5 bg-muted/50 hover:bg-muted border border-border rounded-full text-muted-foreground transition-all group"
                >
                    <Search size={18} className="group-hover:text-primary transition-colors" />
                    <span className="text-sm font-medium flex-1 text-left">Search knowledge...</span>
                    <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </button>
            )}

            <Command.Dialog
                open={open}
                onOpenChange={setOpen}
                label="Global Search"
                className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-[10vh] px-4"
            >
                <div 
                    className="fixed inset-0 bg-black/40" 
                    onClick={() => setOpen(false)} 
                />
                <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center border-b border-border px-4 py-3">
                        <Search size={20} className="text-muted-foreground" />
                        <Command.Input
                            value={search}
                            onValueChange={setSearch}
                            placeholder="Search for dars, questions, or topics..."
                            className="flex-1 ml-3 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
                        />
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className={`p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary transition-colors ${showAdvanced ? 'text-primary' : ''}`}
                            title="Advanced filters"
                        >
                            <Filter size={18} />
                        </button>
                        <button
                            onClick={handleVoiceSearch}
                            className="md:hidden p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary transition-colors"
                            title="Voice search"
                        >
                            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>
                        <button
                            onClick={() => setOpen(false)}
                            className="p-1 hover:bg-muted rounded text-xs text-muted-foreground"
                        >
                            ESC
                        </button>
                    </div>

                    {/* Advanced Search Filters */}
                    {showAdvanced && (
                        <div className="border-b border-border p-4 bg-muted/20">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Content Type</label>
                                    <select
                                        value={filters.contentType}
                                        onChange={(e) => setFilters({...filters, contentType: e.target.value as any})}
                                        className="w-full px-2 py-1 text-xs border border-border rounded bg-background"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="article">Articles</option>
                                        <option value="video">Videos</option>
                                        <option value="question">Q&A</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
                                    <select
                                        value={filters.category}
                                        onChange={(e) => setFilters({...filters, category: e.target.value})}
                                        className="w-full px-2 py-1 text-xs border border-border rounded bg-background"
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Language</label>
                                    <select
                                        value={filters.language}
                                        onChange={(e) => setFilters({...filters, language: e.target.value as any})}
                                        className="w-full px-2 py-1 text-xs border border-border rounded bg-background"
                                    >
                                        <option value="all">All Languages</option>
                                        <option value="english">English</option>
                                        <option value="arabic">Arabic</option>
                                        <option value="urdu">Urdu</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Date Range</label>
                                    <select
                                        value={filters.dateRange}
                                        onChange={(e) => setFilters({...filters, dateRange: e.target.value as any})}
                                        className="w-full px-2 py-1 text-xs border border-border rounded bg-background"
                                    >
                                        <option value="all">All Time</option>
                                        <option value="week">Past Week</option>
                                        <option value="month">Past Month</option>
                                        <option value="year">Past Year</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Difficulty</label>
                                    <select
                                        value={filters.difficulty}
                                        onChange={(e) => setFilters({...filters, difficulty: e.target.value as any})}
                                        className="w-full px-2 py-1 text-xs border border-border rounded bg-background"
                                    >
                                        <option value="all">All Levels</option>
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <button
                                        onClick={() => setFilters({
                                            contentType: "all",
                                            category: "all",
                                            scholar: "all",
                                            language: "all",
                                            dateRange: "all",
                                            difficulty: "all"
                                        })}
                                        className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <Command.List className="max-h-[70vh] sm:max-h-[60vh] overflow-y-auto p-2 outline-none">
                        <Command.Empty className="py-12 text-center text-muted-foreground">
                            No results found for "{search}"
                        </Command.Empty>

                        {filteredDars.length > 0 && (
                            <Command.Group heading="Dars & Lessons" className="px-2 py-3">
                                {filteredDars.map((item) => (
                                    <Command.Item
                                        key={item.id}
                                        onSelect={() => {
                                            navigate(`/dars/${item.id}`);
                                            setOpen(false);
                                        }}
                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-primary/10 cursor-pointer transition-colors group"
                                    >
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                            <Book size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-foreground truncate">{item.title}</span>
                                                <span className="text-[10px] uppercase tracking-wider font-bold text-primary/60">{item.category}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                                        </div>
                                        <ArrowRight size={14} className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}

                        {filteredQuestions.length > 0 && (
                            <Command.Group heading="Q&A Archive" className="px-2 py-3 mt-4 border-t border-border/50">
                                {filteredQuestions.map((item) => (
                                    <Command.Item
                                        key={item.id}
                                        onSelect={() => {
                                            navigate(`/questions/${item.id}`);
                                            setOpen(false);
                                        }}
                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/10 cursor-pointer transition-colors group"
                                    >
                                        <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                                            <MessageCircle size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-foreground truncate">{item.title}</span>
                                                <span className="text-[10px] uppercase tracking-wider font-bold text-secondary/60">{item.category}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{item.preview}</p>
                                        </div>
                                        <ArrowRight size={14} className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Command.Item>
                                ))}
                            </Command.Group>
                        )}
                    </Command.List>

                    <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-t border-border text-[10px] text-muted-foreground font-medium">
                        <div className="flex gap-4">
                            <span className="flex items-center gap-1"><kbd className="bg-background px-1 rounded border border-border">↑↓</kbd> Navigate</span>
                            <span className="flex items-center gap-1"><kbd className="bg-background px-1 rounded border border-border">Enter</kbd> Select</span>
                        </div>
                        <span>Press <kbd className="bg-background px-1 rounded border border-border">ESC</kbd> to close</span>
                    </div>
                </div>
            </Command.Dialog>
        </>
    );
}
