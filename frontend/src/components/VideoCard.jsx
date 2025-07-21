import { Link } from "react-router-dom";
import { useMemo } from "react";

const VideoCard = ({ video }) => {
  // Fixed: Generate static duration based on video ID, not random
  const staticDuration = useMemo(() => {
    const videoId = video.videoId || video._id || 'default';
    let hash = 0;
    for (let i = 0; i < videoId.length; i++) {
      hash = ((hash << 5) - hash) + videoId.charCodeAt(i);
      hash = hash & hash;
    }
    const minutes = Math.abs(hash) % 15 + 1; // 1-15 minutes
    const seconds = Math.abs(hash >> 8) % 60; // 0-59 seconds
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [video.videoId, video._id]);

  return (
    <Link to={`/video/${video.videoId}`} className="block">
      <div className="cursor-pointer group">
        {/* Fixed: Better responsive image container */}
        <div className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {/* Fixed: Static duration overlay */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
            {staticDuration}
          </div>
        </div>
        
        {/* Fixed: Better text layout for mobile */}
        <div className="mt-3 px-1">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">
            {video.title}
          </h3>
          <p className="text-xs text-gray-600 mt-1">{video.channelName}</p>
          <p className="text-xs text-gray-500 mt-1">
            {video.views?.toLocaleString()} views • {new Date(video.uploadDate).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
