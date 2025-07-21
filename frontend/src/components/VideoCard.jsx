import { Link } from "react-router-dom";
import { useMemo } from "react";

const VideoCard = ({ video, showChannel = true }) => {
  // Static duration based on video ID
  const staticDuration = useMemo(() => {
    const videoId = video._id || video.videoId || 'default';
    let hash = 0;
    for (let i = 0; i < videoId.length; i++) {
      hash = ((hash << 5) - hash) + videoId.charCodeAt(i);
      hash = hash & hash;
    }
    const minutes = Math.abs(hash) % 15 + 1;
    const seconds = Math.abs(hash >> 8) % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [video._id, video.videoId]);

  // Get display channel name (works for both sample and real data)
  const displayChannelName = video.channelName || 
    (video.channelId && video.channelId.name) || 
    "Unknown Channel";

  return (
    <Link to={`/video/${video._id}`} className="block w-full">
      <div className="cursor-pointer group w-full">
        {/* Video thumbnail with static duration */}
        <div className="relative w-full bg-gray-200 rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {/* Duration overlay */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded-md font-medium">
            {staticDuration}
          </div>
        </div>
        
        {/* Video info */}
        <div className="mt-3 w-full">
          <h3 className="text-sm font-semibold text-gray-900 leading-5 mb-1" style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {video.title}
          </h3>
          {showChannel && (
            <p className="text-xs text-gray-600 hover:text-gray-900 transition-colors">
              {displayChannelName}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {video.views?.toLocaleString()} views • {new Date(video.uploadDate).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
