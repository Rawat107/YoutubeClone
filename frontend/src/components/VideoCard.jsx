import { Link } from "react-router-dom";
import { useMemo } from "react";

const BASE_URL = import.meta.env.VITE_API_URL

const getThumbnailUrl = video => {
  if (!video?.thumbnailUrl) return "";
  if (video.thumbnailUrl.startsWith("http")) return video.thumbnailUrl;
  const fileName = video.thumbnailUrl.split("\\").pop().split("/").pop();
  return `${BASE_URL}/uploads/thumbnails/${fileName}`;
};

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
  const displayChannelName =
    video.channelName ||
    (video.channelId && video.channelId.name) ||
    "Unknown Channel";

  return (
    <Link to={`/video/${video._id}`} className="block max-w-full hover:shadow-md ">
      <div className="relative w-full aspect-video rounded overflow-hidden">
        <img
          src={getThumbnailUrl(video)}
          alt={video.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform "
        />
        {/* duration badge */}
        <span className="absolute bottom-1 right-1 bg-gray-900 text-white text-xs px-1 py-0.5 rounded">
          {staticDuration}
        </span>
      </div>

      <div className="mt-2 flex gap-2">
        <div className="flex-1">
          <h4 className="font-medium leading-snug line-clamp-2">
            {video.title}
          </h4>
          {showChannel && (
            <p className="text-xs text-gray-600">{displayChannelName}</p>
          )}
          <p className="text-xs text-gray-600">
            {video.views?.toLocaleString()} views • {new Date(video.uploadDate).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
