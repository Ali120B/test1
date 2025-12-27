export function DarsCardSkeleton() {
    return (
        <div className="bg-card rounded-2xl overflow-hidden border border-border/50 h-full relative">
            {/* Thumbnail skeleton with play button */}
            <div className="aspect-video bg-muted skeleton relative overflow-hidden">
                {/* Play button skeleton */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 bg-white/40 rounded-sm ml-0.5" />
                    </div>
                </div>
                {/* Badges skeleton */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <div className="h-6 bg-white/20 backdrop-blur rounded-lg w-16" />
                    <div className="h-6 bg-white/20 backdrop-blur rounded-lg w-20" />
                </div>
            </div>

            <div className="p-6 space-y-4">
                {/* Action buttons skeleton */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-5 bg-muted skeleton rounded w-12" />
                    </div>
                    <div className="flex gap-2">
                        <div className="w-10 h-10 bg-muted skeleton rounded-full" />
                        <div className="w-10 h-10 bg-muted skeleton rounded-full" />
                    </div>
                </div>

                {/* Title skeleton */}
                <div className="space-y-2">
                    <div className="h-7 bg-muted skeleton rounded-lg w-full" />
                    <div className="h-7 bg-muted skeleton rounded-lg w-3/4" />
                </div>

                {/* Description skeleton */}
                <div className="space-y-2">
                    <div className="h-4 bg-muted skeleton rounded w-full" />
                    <div className="h-4 bg-muted skeleton rounded w-5/6" />
                </div>

                {/* Footer skeleton */}
                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                    <div className="h-4 bg-muted skeleton rounded w-20" />
                    <div className="h-4 bg-muted skeleton rounded w-16" />
                </div>
            </div>
        </div>
    );
}

export function QuestionCardSkeleton() {
    return (
        <div className="bg-card rounded-2xl p-6 border border-border/50 relative overflow-hidden">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-6 bg-primary/10 skeleton rounded-full w-20" />
                    <div className="h-4 bg-muted skeleton rounded w-16" />
                </div>
                <div className="flex gap-2">
                    <div className="w-8 h-8 bg-muted skeleton rounded-full" />
                    <div className="w-8 h-8 bg-muted skeleton rounded-full" />
                </div>
            </div>

            {/* Title skeleton */}
            <div className="space-y-2 mb-4">
                <div className="h-7 bg-muted skeleton rounded-lg w-full" />
                <div className="h-7 bg-muted skeleton rounded-lg w-4/5" />
            </div>

            {/* Content skeleton */}
            <div className="space-y-2 mb-6">
                <div className="h-4 bg-muted skeleton rounded w-full" />
                <div className="h-4 bg-muted skeleton rounded w-full" />
                <div className="h-4 bg-muted skeleton rounded w-3/4" />
            </div>

            {/* Footer skeleton */}
            <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <div className="h-4 bg-muted skeleton rounded w-24" />
                <div className="h-8 bg-primary/5 skeleton rounded-lg w-16" />
            </div>
        </div>
    );
}

export function SeriesCardSkeleton() {
    return (
        <div className="relative group cursor-pointer rounded-2xl overflow-hidden border border-border/50 bg-gradient-to-br from-primary/5 to-primary/10 relative">
            {/* Shimmer effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer z-10" />

            {/* Image skeleton */}
            <div className="aspect-video bg-muted relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted/60" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-muted/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                </div>
                {/* Series badge skeleton */}
                <div className="absolute top-4 left-4">
                    <div className="h-6 bg-primary/20 backdrop-blur rounded-lg w-16 animate-pulse" style={{ animationDelay: '0.3s' }} />
                </div>
                {/* Play overlay skeleton */}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center animate-pulse" style={{ animationDelay: '0.4s' }}>
                        <div className="w-4 h-4 bg-white/60 rounded-sm ml-0.5" />
                    </div>
                </div>
            </div>

            {/* Content skeleton */}
            <div className="p-4 bg-card">
                <div className="space-y-2 mb-2">
                    <div className="h-6 bg-muted rounded-lg w-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <div className="h-6 bg-muted/80 rounded-lg w-3/4 animate-pulse" style={{ animationDelay: '0.6s' }} />
                </div>
                <div className="space-y-1 mb-3">
                    <div className="h-4 bg-muted/60 rounded w-full animate-pulse" style={{ animationDelay: '0.7s' }} />
                    <div className="h-4 bg-muted/60 rounded w-2/3 animate-pulse" style={{ animationDelay: '0.8s' }} />
                </div>
                <div className="flex items-center justify-between">
                    <div className="h-4 bg-primary/20 rounded w-20 animate-pulse" style={{ animationDelay: '0.9s' }} />
                    <div className="h-4 bg-muted/60 rounded w-16 animate-pulse" style={{ animationDelay: '1.0s' }} />
                </div>
            </div>
        </div>
    );
}

export function DetailedSkeleton() {
    return (
        <div className="animate-pulse space-y-8">
            <div className="h-64 bg-muted rounded-3xl w-full"></div>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="h-12 bg-muted rounded w-3/4"></div>
                <div className="flex gap-4">
                    <div className="h-6 bg-muted rounded-full w-32"></div>
                    <div className="h-6 bg-muted rounded-full w-32"></div>
                    <div className="h-6 bg-muted rounded-full w-32"></div>
                </div>
                <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
            </div>
        </div>
    );
}
