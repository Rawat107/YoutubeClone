import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import axios from "../utils/axios.js";
import { generateRandomDuration, generateSeededRandom } from "../utils/channelUtils.js";

const ChannelHome = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [error, setError] = useState(null);

  const normalizedUsername = username?.toLowerCase() || "";

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchChannelData = async () => {
      try {
        setError(null);
        
        if (username) {
          console.log(`Fetching channel for username: ${username}`);
          const response = await axios.get(`/channels/${username}`);
          console.log('Channel response:', response.data);
          
          if (response.data && response.data.channel) {
            setChannel(response.data.channel);
            
            // Fetch videos for this channel
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
          console.log('Fetching user\'s own channel');
          try {
            const response = await axios.get('/channels/my');
            console.log('My channel response:', response.data);
            
            if (response.data && response.data.channel) {
              setChannel(response.data.channel);
              
              // Fetch videos for user's channel
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
              console.log('User has no channel, showing create modal');
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

  // FIXED: Robust isOwner logic that handles all ObjectId scenarios
  const isOwner = useMemo(() => {
    if (!user || !channel) return false;
    
    // Get the channel's userId (could be string, ObjectId, or populated object)
    let channelUserId;
    if (typeof channel.userId === 'object' && channel.userId._id) {
      channelUserId = channel.userId._id.toString();
    } else {
      channelUserId = channel.userId.toString();
    }
    
    // Get the current user's ID
    const currentUserId = user._id ? user._id.toString() : user.id.toString();
    
    const isOwner = channelUserId === currentUserId;
    
    console.log('isOwner calculation:', {
      channelUserId,
      currentUserId,
      isOwner,
      channelUserIdType: typeof channel.userId,
      userIdType: typeof user._id
    });
    
    return isOwner;
  }, [user, channel]);

  const videoCount = videos.length;
  
  const subCount = useMemo(() => {
    const channelIdentifier = channel?.name || username || "default";
    return generateSeededRandom(channelIdentifier, 100, 50000);
  }, [channel?.name, username]);

  const avatarColor = useMemo(() => {
    const colors = ["bg-purple-500", "bg-blue-500", "bg-green-500", "bg-amber-500"];
    const index = username?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  }, [username]);

  // FIXED: Only use fallback when channel is null, not when fields are empty
  const getBannerUrl = () => {
    if (!channel) {
      return "https://static.vecteezy.com/system/resources/previews/012/865/505/non_2x/idyllic-mountain-panoramic-landscape-fresh-green-meadows-and-blooming-wildflowers-sun-ray-beautiful-nature-countryside-view-rural-sunny-outdoor-natural-bright-banner-nature-spring-summer-panorama-photo.jpg";
    }
    return channel.banner || "https://static.vecteezy.com/system/resources/previews/012/865/505/non_2x/idyllic-mountain-panoramic-landscape-fresh-green-meadows-and-blooming-wildflowers-sun-ray-beautiful-nature-countryside-view-rural-sunny-outdoor-natural-bright-banner-nature-spring-summer-panorama-photo.jpg";
  };

  const getChannelName = () => {
    if (!channel) {
      return username || "Channel";
    }
    return channel.name;
  };

  const getChannelHandle = () => {
    if (!channel) {
      return username ? `@${username}` : "@channel";
    }
    return channel.username ? `@${channel.username}` : `@${username}`;
  };

  const getChannelDescription = () => {
    if (!channel) {
      return "Welcome to my channel! I upload content regularly on web development, tutorials, vlogs, and more. Don't forget to subscribe and stay updated with my latest videos.";
    }
    return channel.description || "No description available.";
  };

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
      {/* BANNER - Shows actual database banner */}
      <div
        className="w-full h-32 sm:h-40 md:h-52 bg-center bg-cover rounded-xl"
        style={{ backgroundImage: `url(${getBannerUrl()})` }}
      ></div>

      {/* CHANNEL INFO - Shows actual database data */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ${avatarColor}`}
            style={{ aspectRatio: 1 }}
          >
            {getChannelName().charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{getChannelName()}</h2>
            <p className="text-gray-600">{getChannelHandle()}</p>
            <p className="text-gray-500 mt-1">
              {subCount.toLocaleString()} subscribers • {videoCount} videos
            </p>

            <div className="mt-1 text-sm text-gray-700">
            <p
              className={`${
                showMore ? "whitespace-pre-wrap" : "line-clamp-1"
              } sm:line-clamp-none`}
            >
              {getChannelDescription()}
            </p>

            {/* Show button ONLY on small screens where clamp is active */}
            {getChannelDescription().length > 10 && (
              <button
                onClick={() => setShowMore((prev) => !prev)}
                className="text-blue-600 hover:underline mt-1 block sm:hidden"
              >
                {showMore ? "Show less" : "Show more"}
              </button>
            )}
          </div>

          </div>
        </div>

        {/* OWNER BUTTONS - EXACT SAME STYLING */}
        {isOwner && (
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            <button className="px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
              Customize Channel
            </button>
            <Link to={`/channel/${username}/videos`}>
              <button className="px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
                Manage Videos
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* TABS - EXACT SAME STYLING */}
      <div className="mt-6 border-b border-gray-300 flex space-x-6 text-sm sm:text-base font-medium">
        <button className="pb-3 px-1 border-b-2 border-black">Home</button>
        {videoCount > 0 && (
          <Link to={`/channel/${username}/videos`}>
            <button className="pb-3 px-1 text-gray-600 hover:text-black border-b-2 border-transparent hover:border-gray-300">
              Videos
            </button>
          </Link>
        )}
        <button className="pb-3 px-1 text-gray-600 hover:text-black border-b-2 border-transparent hover:border-gray-300">
          Posts
        </button>
      </div>

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
                  <div className="relative pb-[56.25%]">
                    <img
                      src={videos[0].thumbnailUrl}
                      alt="Latest video"
                      className="absolute inset-0 w-full h-full rounded-xl object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                      {generateRandomDuration()}
                    </div>
                  </div>
                </div>
                <div className="w-full lg:w-1/3">
                  <h4 className="text-lg font-bold">{videos[0].title}</h4>
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
                    <div className="relative pb-[56.25%]">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="absolute inset-0 w-full h-full rounded-lg object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                        {generateRandomDuration()}
                      </div>
                    </div>
                    <div className="mt-3">
                      <h4 className="font-medium line-clamp-2">{video.title}</h4>
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
