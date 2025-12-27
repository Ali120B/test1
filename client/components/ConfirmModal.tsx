import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "info" | "warning";
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Delete",
    cancelText = "Cancel",
    type = "danger",
}: ConfirmModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-card w-full max-w-md border border-border rounded-2xl shadow-2xl overflow-hidden relative z-10"
                    >
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${type === "danger" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                                    }`}>
                                    <AlertCircle size={28} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold text-foreground">
                                            {title}
                                        </h3>
                                        <button
                                            onClick={onClose}
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-muted/30 px-6 py-4 flex items-center justify-end gap-3 border-t border-border">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 text-sm font-bold text-foreground hover:bg-muted rounded-xl transition-all"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 ${type === "danger"
                                        ? "bg-destructive hover:bg-destructive/90 shadow-destructive/20"
                                        : "bg-primary hover:bg-primary/90 shadow-primary/20"
                                    }`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
