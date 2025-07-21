import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import axios from "../utils/axios.js";
import sampleVideos from "../../../backend/data/sampleVideos.js";
import VideoCard from "../components/VideoCard";

const ChannelVideos = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizedUsername = username?.toLowerCase() || "";

  // Fetch channel data on component mount
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchChannelData = async () => {
      try {
        if (username) {
          const response = await axios.get(`/api/channels/${username}`);
          setChannel(response.data.channel);
        } else {
          const response = await axios.get('/api/channels/my');
          setChannel(response.data.channel);
        }
      } catch (error) {
        console.error('Failed to fetch channel:', error);
        setChannel(null);
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [username, user, navigate]);

  // Generate consistent random number based on channel name
  const generateSeededRandom = (seed, min, max) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    const normalized = Math.abs(hash) / 2147483647;
    return Math.floor(normalized * (max - min + 1)) + min;
  };

  // Filter videos for this channel
  const videos = sampleVideos.filter((v) => {
    const channelName = v.channelName?.toLowerCase() || "";
    return channelName === normalizedUsername || 
           (channel && channelName === channel.name?.toLowerCase());
  });

  const videoCount = videos.length;

  // Generate consistent subscriber count for this channel
  const subCount = useMemo(() => {
    const channelIdentifier = channel?.name || username || "default";
    return generateSeededRandom(channelIdentifier, 100, 50000);
  }, [channel?.name, username]);

  // Calculate total views from all videos
  const totalViews = useMemo(() => {
    return videos.reduce((sum, video) => sum + (video.views || 0), 0);
  }, [videos]);

  // Determine if current user is the owner
  const isOwner = user && channel && channel.userId === user.id;

  const avatarColor = useMemo(() => {
    const colors = ["bg-purple-500", "bg-blue-500", "bg-green-500", "bg-amber-500"];
    const channelIdentifier = channel?.name || username || "default";
    const index = channelIdentifier.charCodeAt(0) % colors.length;
    return colors[index];
  }, [channel?.name, username]);

  // Default channel data for display
  const displayChannel = channel || {
    name: username || "Channel",
    handle: username ? `@${username}` : "@channel",
    banner: "https://static.vecteezy.com/system/resources/previews/012/865/505/non_2x/idyllic-mountain-panoramic-landscape-fresh-green-meadows-and-blooming-wildflowers-sun-ray-beautiful-nature-countryside-view-rural-sunny-outdoor-natural-bright-banner-nature-spring-summer-panorama-photo.jpg",
    description: "Welcome to my channel! I upload content regularly on web development, tutorials, vlogs, and more. Don't forget to subscribe and stay updated with my latest videos.",
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading channel...</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6">
      {/* BANNER */}
      <div
        className="w-full h-32 sm:h-40 md:h-52 bg-center bg-cover rounded-xl"
        style={{ backgroundImage: `url(${displayChannel.banner})` }}
      ></div>

      {/* CHANNEL INFO */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex items-start gap-4 flex-1">
          {/* Avatar */}
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ${avatarColor}`}
          >
            {displayChannel.name.charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{displayChannel.name}</h2>
            <p className="text-gray-600">{displayChannel.handle}</p>
            <p className="text-gray-500 mt-1">
              {subCount.toLocaleString()} subscribers • {videoCount} videos
            </p>
            {totalViews > 0 && (
              <p className="text-gray-500 text-sm">
                {totalViews.toLocaleString()} total views
              </p>
            )}
          </div>
        </div>

        {/* Owner Buttons */}
        {isOwner && (
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            <button className="px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
              Customize Channel
            </button>
            <Link to="/upload">
              <button className="px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                Upload Video
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="mt-6 border-b border-gray-300 flex space-x-6 text-sm sm:text-base font-medium">
        <Link to={`/channel/${username}`}>
          <button className="pb-3 px-1 text-gray-600 hover:text-black border-b-2 border-transparent hover:border-gray-300">
            Home
          </button>
        </Link>
        <button className="pb-3 px-1 border-b-2 border-black">Videos</button>
        <button className="pb-3 px-1 text-gray-600 hover:text-black border-b-2 border-transparent hover:border-gray-300">
          Posts
        </button>
      </div>

      {/* CONTENT: Videos Tab */}
      <div className="py-6">
        {videoCount === 0 ? (
          <div className="text-center text-gray-600 space-y-4 max-w-md mx-auto">
            <img
              src="https://www.gstatic.com/youtube/img/creator/no_content_illustration.svg"
              alt="No content"
              className="mx-auto w-32 sm:w-44"
            />
            <p className="text-lg font-semibold">
              {isOwner ? "Upload your first video" : "No videos uploaded yet"}
            </p>
            <p className="text-sm">
              {isOwner 
                ? "Upload and record at home or on the go. Everything you make public will appear here."
                : "This channel hasn't uploaded any videos yet."
              }
            </p>
            {isOwner && (
              <Link to="/upload">
                <button className="mt-2 px-5 py-2.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
                  Upload Video
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filter and Sort Options */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="text-gray-600">Sort by:</span>
              <select className="bg-gray-100 border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="newest">Date added (newest)</option>
                <option value="oldest">Date added (oldest)</option>
                <option value="popular">Most popular</option>
              </select>
            </div>

            {/* Videos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {videos.map((video) => (
                <div key={video.videoId} className="group">
                  <Link to={`/video/${video.videoId}`}>
                    <div className="relative pb-[56.25%] cursor-pointer">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="absolute inset-0 w-full h-full rounded-lg object-cover group-hover:opacity-90 transition-opacity"
                      />
                      {/* Video duration overlay */}
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                        {Math.floor(Math.random() * 10) + 1}:{(Math.floor(Math.random() * 60)).toString().padStart(2, '0')}
                      </div>
                    </div>
                  </Link>
                  <div className="mt-3">
                    <Link to={`/video/${video.videoId}`}>
                      <h4 className="font-medium line-clamp-2 group-hover:text-blue-600 cursor-pointer">
                        {video.title}
                      </h4>
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      {video.views?.toLocaleString()} views
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(video.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button (if needed) */}
            {videos.length > 20 && (
              <div className="text-center mt-8">
                <button className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
                  Load more videos
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelVideos;