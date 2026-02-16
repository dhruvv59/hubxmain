import { Play, Clock, ChevronRight } from "lucide-react";

interface Video {
    id: string;
    title: string;
    subject: string;
    thumbnail: string;
    duration: string;
    author: string;
    views: string;
}

interface RecommendedVideosWidgetProps {
    videos: Video[];
}

export function RecommendedVideosWidget({ videos }: RecommendedVideosWidgetProps) {
    if (!videos || videos.length === 0) return null;

    return (
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col w-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-bold text-gray-800">Recommended Learning</h3>
                <button className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 flex items-center">
                    Browse Library <ChevronRight className="h-4 w-4 ml-1" />
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((video) => (
                    <div key={video.id} className="group cursor-pointer">
                        {/* Thumbnail Container */}
                        <div className={`relative aspect-video rounded-xl ${video.thumbnail} mb-3 overflow-hidden`}>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="h-10 w-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                                    <Play className="h-4 w-4 text-gray-900 fill-gray-900 ml-1" />
                                </div>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                {video.duration}
                            </div>
                        </div>

                        {/* Content */}
                        <div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">{video.subject}</span>
                            <h4 className="text-sm font-bold text-gray-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {video.title}
                            </h4>
                            <p className="text-[11px] text-gray-400">
                                {video.author} • {video.views} views
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
