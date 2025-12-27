export function getYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

export function isYouTubeUrl(url: string | undefined): boolean {
    if (!url) return false;
    return getYouTubeId(url) !== null;
}

export function getYouTubeEmbedUrl(url: string): string {
    const id = getYouTubeId(url);
    return id ? `https://www.youtube.com/embed/${id}` : url;
}

export function getYouTubeThumbnail(url: string): string | null {
    const id = getYouTubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
}
