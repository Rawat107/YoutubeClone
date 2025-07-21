import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import axios from "../utils/axios.js";
import { generateRandomDuration } from "../utils/channelUtils.js";
import ChannelHeader from "../components/ChannelHeader.jsx";

const ChannelHome = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchChannelData = async () => {
      try {
        setError(null);
        
        if (username) {
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
        } else {
          try {
            const response = await axios.get('/channels/my');
            if (response.data && response.data.channel) {
              setChannel(response.data.channel);
              
              // Fetch videos for user's channel - only their uploaded videos
              try {
                const videosResponse = await axios.get(`/videos/channel/${response.data.channel._id}`);
                setVideos(videosResponse.data.videos || []);
              } catch (videoError) {
                console.warn('Failed to fetch user videos:', videoError);
                setVideos([]);
              }
            } else {
              throw new Error('Invalid my channel response structure');
            }
          } catch (error) {
            if (error.response?.status === 404) {
              setShowCreateModal(true);
              setChannel(null);
            } else {
              throw error;
            }
          }
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

  const handleChannelCreated = (newChannel) => {
    setChannel(newChannel);
    setShowCreateModal(false);
    navigate(`/channel/${newChannel.username}`);
  };

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

  const videoCount = videos.length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading channel...</div>
      </div>
    );
  }

  if (error && !showCreateModal) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 sm:px-6">
      {/* SHARED CHANNEL HEADER */}
      <ChannelHeader 
        channel={channel}
        username={username}
        user={user}
        videoCount={videoCount}
        isOwner={isOwner}
        activeTab="home"
      />

      {/* CONTENT - EXACT SAME STYLING */}
      <div className="py-6">
        {videoCount === 0 ? (
          <div className="text-center text-gray-600 space-y-4 max-w-md mx-auto">
            <img
              src="https://www.gstatic.com/youtube/img/creator/no_content_illustration.svg"
              alt="No content"
              className="mx-auto w-32 sm:w-44"
            />
            <p className="text-lg font-semibold">Create content on any device</p>
            <p className="text-sm">
              Upload and record at home or on the go. Everything you make public will appear here.
            </p>
            <Link to="/upload">
              <button className="mt-2 px-5 py-2.5 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
                Create
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Latest Video - EXACT SAME STYLING */}
            <div>
              <h3 className="text-xl font-bold mb-4">Latest upload</h3>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-2/3">
                  <Link to={`/video/${videos[0]._id}`}>
                    <div className="relative pb-[56.25%] cursor-pointer group">
                      <img
                        src={videos[0].thumbnailUrl}
                        alt="Latest video"
                        className="absolute inset-0 w-full h-full rounded-xl object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                        {generateRandomDuration()}
                      </div>
                    </div>
                  </Link>
                </div>
                <div className="w-full lg:w-1/3">
                  <Link to={`/video/${videos[0]._id}`}>
                    <h4 className="text-lg font-bold hover:text-blue-600 cursor-pointer">{videos[0].title}</h4>
                  </Link>
                  <p className="text-gray-500 mt-2">
                    {videos[0].views} views • {new Date(videos[0].uploadDate).toLocaleDateString()}
                  </p>
                  <p className="mt-4 line-clamp-4">
                    {videos[0].description || "No description available"}
                  </p>
                </div>
              </div>
            </div>

            {/* Uploads Grid - EXACT SAME STYLING */}
            <div>
              <h3 className="text-xl font-bold mb-4">Uploads</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {videos.map((video, index) => (
                  <div key={video._id} className={index === 0 ? "sm:hidden" : ""}>
                    <Link to={`/video/${video._id}`}>
                      <div className="relative pb-[56.25%] cursor-pointer group">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="absolute inset-0 w-full h-full rounded-lg object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                          {generateRandomDuration()}
                        </div>
                      </div>
                    </Link>
                    <div className="mt-3">
                      <Link to={`/video/${video._id}`}>
                        <h4 className="font-medium line-clamp-2 hover:text-blue-600 cursor-pointer">{video.title}</h4>
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        {video.views} views • {new Date(video.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelHome;
