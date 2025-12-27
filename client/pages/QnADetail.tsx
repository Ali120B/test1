import { useNavigate, useParams } from "react-router-dom";
import { MessageCircle, Paperclip, User, Clock, Sparkles, ChevronLeft, ArrowLeft } from "lucide-react";
import { useData, Question } from "@/contexts/DataContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Helper function to format dates consistently
const formatDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString();
  } catch {
    return String(date);
  }
};

export default function QnADetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { questions, isLoading } = useData();
    const [question, setQuestion] = useState<Question | null>(null);

    useEffect(() => {
        if (questions && id) {
            const found = questions.find((q) => q.id === id);
            if (found) {
                setQuestion(found);
            }
        }
    }, [questions, id]);

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: question?.title || "Question",
                    text: question?.content || "Check out this question",
                    url,
                });
            } catch (err) {
                // Ignore abort errors
                console.log("Share aborted");
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                toast.success("Link copied to clipboard");
            } catch (err) {
                toast.error("Failed to copy link");
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-primary/10 animate-ping"></div>
                </div>
                <p className="mt-4 text-muted-foreground animate-pulse">Loading question...</p>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
                <h1 className="text-2xl font-bold mb-4">Question not found</h1>
                <button
                    onClick={() => navigate("/qna")}
                    className="text-primary hover:underline flex items-center gap-2"
                >
                    <ArrowLeft size={20} /> Back to Q&A List
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-16 pt-20 sm:pt-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                <button
                    onClick={() => navigate("/qna")}
                    className="mb-6 sm:mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-card border border-border flex items-center justify-center group-hover:border-primary/50 transition-colors">
                        <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
                    </div>
                    <span className="font-medium text-sm sm:text-base">Back to Questions</span>
                </button>

                <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-500">
                    {/* Header */}
                    <div className="p-4 sm:p-8 lg:p-10 border-b border-border bg-muted/10">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                            <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary w-fit">
                                {question.category}
                            </span>
                            <span className="text-xs sm:text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                                <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                                {formatDate(question.date)}
                            </span>
                        </div>

                        <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-foreground mb-3 sm:mb-4 leading-tight">
                            {question.title}
                        </h1>

                        <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                <User size={12} className="sm:w-3.5 sm:h-3.5" />
                            </div>
                            <span className="font-medium text-foreground text-sm sm:text-base">{question.author || "Anonymous"}</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-8 lg:p-10">
                        <div
                            className="prose prose-base sm:prose-lg prose-slate dark:prose-invert max-w-none mb-6 sm:mb-10 text-base sm:text-xl leading-relaxed text-foreground/90 font-medium"
                            dangerouslySetInnerHTML={{ __html: question.content }}
                        />

                        {false && (
                            <div className="mb-6 sm:mb-10 bg-muted/30 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-border">
                                <h4 className="font-bold text-foreground mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                                    <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                    Attached Resources
                                </h4>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                    {question.attachments.map((att) => (
                                        <a
                                            key={att.id}
                                            href={att.url}
                                            download={att.name}
                                            className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 bg-card rounded-lg border border-border hover:border-primary hover:shadow-md transition-all group"
                                        >
                                            <Paperclip size={16} className="sm:w-4.5 sm:h-4.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                                            <span className="font-medium group-hover:underline text-xs sm:text-sm truncate">{att.name}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Answers Section */}
                        <div className="border-t border-border pt-6 sm:pt-10">
                            <h2 className="text-lg sm:text-2xl font-bold text-foreground mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center text-primary">
                                    <MessageCircle size={18} className="sm:w-6 sm:h-6" />
                                </div>
                                {question.answers?.length || 0} Answers
                            </h2>

                            {(question.answers?.length || 0) > 0 ? (
                                <div className="space-y-4 sm:space-y-8">
                                    {question.answers.map((answer) => (
                                        <div
                                            key={answer.id}
                                            className={`p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl transition-all ${answer.isOfficial
                                                ? "bg-primary/5 border-2 border-primary/20 ring-1 ring-primary/10"
                                                : "bg-muted/30 border border-border"
                                                }`}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
                                                <div className="flex items-center gap-3 sm:gap-4">
                                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-xl shadow-md ${answer.isOfficial ? "bg-primary" : "bg-primary"
                                                        }`}>
                                                        {(answer.author || "A")[0]}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="font-bold text-base sm:text-lg text-foreground flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                                            <span className="truncate">{answer.author || "Anonymous"}</span>
                                                            {answer.isOfficial && <Sparkles size={14} className="sm:w-4 sm:h-4 text-primary fill-primary flex-shrink-0" />}
                                                        </div>
                                                        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                                                            {formatDate(answer.date)}
                                                        </p>
                                                    </div>
                                                </div>
                                                {answer.isOfficial && (
                                                    <span className="bg-primary text-primary-foreground text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-primary/20 shadow-sm flex items-center gap-1 sm:gap-1.5 w-fit flex-shrink-0">
                                                        <Sparkles size={10} className="sm:w-3 sm:h-3" />
                                                        <span className="hidden sm:inline">Official Answer</span>
                                                        <span className="sm:hidden">Official</span>
                                                    </span>
                                                )}
                                            </div>

                                            <div
                                                className="prose prose-sm sm:prose-base prose-slate dark:prose-invert max-w-none text-foreground/90 leading-relaxed"
                                                dangerouslySetInnerHTML={{ __html: answer.content }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 sm:py-16 bg-muted/20 rounded-xl sm:rounded-2xl border border-dashed border-border/60">
                                    <MessageCircle size={32} className="sm:w-12 sm:h-12 mx-auto text-muted-foreground/30 mb-3 sm:mb-4" />
                                    <h3 className="text-base sm:text-lg font-bold text-foreground">No answers yet</h3>
                                    <p className="text-xs sm:text-sm text-muted-foreground px-4 sm:px-0">Check back later for answers from our scholars.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
