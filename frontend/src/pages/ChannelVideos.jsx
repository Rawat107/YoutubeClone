import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import axios from "../utils/axios.js";
import VideoCard from "../components/VideoCard";
import ChannelHeader from "../components/ChannelHeader.jsx";

const ChannelVideos = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchChannelData = async () => {
      try {
        setError(null);
        
        const response = await axios.get(`/channels/${username}`);
        if (response.data && response.data.channel) {
          setChannel(response.data.channel);
          
          // Fetch videos for this channel - only user-uploaded videos
          try {
            const videosResponse = await axios.get(`/videos/channel/${response.data.channel._id}`);
            setVideos(videosResponse.data.videos || []);
          } catch (videoError) {
            console.warn('Failed to fetch videos:', videoError);
            setVideos([]);
          }
        } else {
          throw new Error('Invalid channel response structure');
        }
      } catch (error) {
        console.error('Failed to fetch channel:', error);
        setError(error.message || 'Failed to load channel');
        setChannel(null);
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [username, user, navigate]);

  // Robust isOwner logic
  const isOwner = useMemo(() => {
    if (!user || !channel) return false;
    
    let channelUserId;
    if (typeof channel.userId === 'object' && channel.userId._id) {
      channelUserId = channel.userId._id.toString();
    } else {
      channelUserId = channel.userId.toString();
    }
    
    const currentUserId = user._id ? user._id.toString() : user.id.toString();
    return channelUserId === currentUserId;
  }, [user, channel]);

  const sortedVideos = useMemo(() => {
    const sorted = [...videos];
    switch (sortBy) {
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
      case 'popular':
        return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    }
  }, [videos, sortBy]);

  const videoCount = videos.length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading channel...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 sm:px-6">
      {/* SHARED CHANNEL HEADER - NO DUPLICATION */}
      <ChannelHeader 
        channel={channel}
        username={username}
        user={user}
        videoCount={videoCount}
        isOwner={isOwner}
        activeTab="videos"
      />

      {/* VIDEOS CONTENT ONLY - DRY APPROACH */}
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
          </div>
        ) : (
          <div className="space-y-6">
            {/* Sort Options */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-100 border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Date added (newest)</option>
                <option value="oldest">Date added (oldest)</option>
                <option value="popular">Most popular</option>
              </select>
            </div>

            {/* Videos Grid - Same as Home styling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {sortedVideos.map((video) => (
                <VideoCard key={video._id} video={video} showChannel={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelVideos;
