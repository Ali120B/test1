import { useNavigate, useParams } from "react-router-dom";
import { BookOpen, Paperclip, Play, User, Clock, Calendar, ArrowLeft, Share2 } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useEffect, useState } from "react";
import { DarsItem } from "@/contexts/DataContext";
import { getYouTubeEmbedUrl, isYouTubeUrl, getYouTubeId } from "@/lib/youtube";
import { toast } from "sonner";

export default function DarsDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { dars, isLoading, trackView, touchDarsProgress } = useData();
    const [item, setItem] = useState<DarsItem | null>(null);

    const handleShare = () => {
        if (!item) return;
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(
            () => toast.success("Link copied to clipboard"),
            () => toast.error("Failed to copy link")
        );
    };

    useEffect(() => {
        if (dars && id) {
            const found = dars.find((d) => d.id === id);
            if (found) {
                setItem(found);
                // Track view
                void trackView(id, "dars");
                void touchDarsProgress(id);
            }
        }
    }, [dars, id, trackView, touchDarsProgress]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-primary/10 animate-ping"></div>
                </div>
                <p className="mt-4 text-muted-foreground animate-pulse">Loading lesson...</p>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
                <h1 className="text-2xl font-bold mb-4">Dars not found</h1>
                <button
                    onClick={() => navigate("/dars")}
                    className="text-primary hover:underline flex items-center gap-2"
                >
                    <ArrowLeft size={20} /> Back to Dars List
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-16 sm:pb-20">
            <div className="relative h-[300px] sm:h-[400px] w-full overflow-hidden">
                {item.type === "video" && item.videoUrl ? (
                    <div className="w-full h-full bg-black relative">
                        {isYouTubeUrl(item.videoUrl) ? (
                            <img
                                src={`https://img.youtube.com/vi/${getYouTubeId(item.videoUrl)}/maxresdefault.jpg`}
                                className="absolute inset-0 w-full h-full object-cover opacity-60 blur-[2px]"
                                alt=""
                            />
                        ) : (
                            <div className="absolute inset-0 animated-gradient opacity-90"></div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center text-white/10 text-9xl">
                            <Play />
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                        <div className="absolute inset-0 animated-gradient opacity-80"></div>
                        <div className="relative z-10 transform scale-150 text-9xl drop-shadow-2xl">{item.image}</div>
                    </div>
                )}

                <div className="absolute top-4 left-4 z-20">
                    <button
                        onClick={() => {
                            if (item?.seriesId) {
                                navigate(`/series/${item.seriesId}`);
                            } else {
                                navigate("/dars");
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-background/20 backdrop-blur-md hover:bg-background/40 text-white rounded-full transition-all border border-white/20"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                </div>

                <div className="absolute top-4 right-4 z-20">
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-4 py-2 bg-background/20 backdrop-blur-md hover:bg-background/40 text-white rounded-full transition-all border border-white/20"
                        title="Share"
                    >
                        <Share2 size={18} /> <span className="hidden sm:inline">Share</span>
                    </button>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-4 sm:p-8 lg:p-12 bg-gradient-to-t from-background to-transparent pt-20 sm:pt-32">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap animate-in slide-in-from-bottom-4 fade-in duration-700">
                            <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                                {item.category}
                            </span>
                            <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-secondary text-secondary-foreground shadow-lg shadow-secondary/20">
                                {item.type === "video" ? "Video Lesson" : "Article"}
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-4xl lg:text-6xl font-extrabold text-foreground mb-3 sm:mb-4 leading-tight shadow-black/5 drop-shadow-sm animate-in slide-in-from-bottom-6 fade-in duration-700 delay-100">
                            {item.title}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-10">
                <div className="bg-card border border-border rounded-2xl shadow-xl p-4 sm:p-8 lg:p-12 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">

                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-6 lg:gap-8 text-muted-foreground mb-6 sm:mb-8 border-b border-border pb-6 sm:pb-8">
                        <div className="flex items-center gap-2">
                            <User size={16} className="sm:w-5 sm:h-5 text-primary" />
                            <span className="font-medium text-sm sm:text-base lg:text-lg">{item.teacher}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="sm:w-5 sm:h-5 text-primary" />
                            <span className="text-sm sm:text-base lg:text-lg">{item.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="sm:w-5 sm:h-5 text-primary" />
                            <span className="text-sm sm:text-base lg:text-lg">{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>

                    {item.type === "video" && item.videoUrl && (
                        <div className="mb-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-muted">
                            <div className="aspect-video w-full bg-black flex items-center justify-center">
                                {isYouTubeUrl(item.videoUrl) ? (
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={getYouTubeEmbedUrl(item.videoUrl)}
                                        title={item.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <video
                                        src={item.videoUrl}
                                        controls
                                        className="w-full h-full"
                                        poster={item.image}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    <div className="prose prose-base sm:prose-lg prose-slate dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
                        <p className="text-base sm:text-lg lg:text-xl leading-relaxed mb-4 sm:mb-6">{item.description}</p>

                        {item.content && (
                            <div className="mt-6 sm:mt-8 p-4 sm:p-6 lg:p-8 bg-muted/30 rounded-xl sm:rounded-2xl border border-border/50">
                                <h3 className="font-bold text-lg sm:text-xl lg:text-2xl mb-3 sm:mb-4 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /> Lesson Content
                                </h3>
                                <div
                                    className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none font-serif leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: item.content }}
                                />
                            </div>
                        )}
                    </div>

                    {false && (
                        <div className="mt-8 sm:mt-12">
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                                <Paperclip className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                                Downloads & Resources
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {item.attachments.map((att) => (
                                    <a
                                        key={att.id}
                                        href={att.url}
                                        download={att.name}
                                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-card rounded-lg sm:rounded-xl border border-border hover:border-primary hover:shadow-lg transition-all group"
                                    >
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors flex-shrink-0">
                                            <Paperclip size={18} className="sm:w-6 sm:h-6" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <span className="font-bold text-foreground group-hover:text-primary block mb-1 text-sm sm:text-base truncate">{att.name}</span>
                                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Download</span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
