import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { FaEdit, FaCog } from "react-icons/fa";
import { generateSeededRandom } from "../utils/channelUtils.js";

const ChannelHeader = ({ 
  channel, 
  username, 
  user, 
  videoCount, 
  isOwner, 
  activeTab = "home",
  isManageMode = false,
  onToggleManageMode,
  onCustomizeChannel
}) => {
  const [showMore, setShowMore] = useState(false);

  const subCount = useMemo(() => {
    const channelIdentifier = channel?.name || username || "default";
    return generateSeededRandom(channelIdentifier, 100, 50000);
  }, [channel?.name, username]);


  const avatarColor = useMemo(() => {
    const colors = ["bg-purple-500", "bg-blue-500", "bg-green-500", "bg-amber-500"];
    const index = username?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  }, [username]);

  // Use database data or fallback
  const displayChannel = channel || {
    name: username || "Channel",
    handle: username ? `@${username}` : "@channel",
    banner: "https://static.vecteezy.com/system/resources/previews/012/865/505/non_2x/idyllic-mountain-panoramic-landscape-fresh-green-meadows-and-blooming-wildflowers-sun-ray-beautiful-nature-countryside-view-rural-sunny-outdoor-natural-bright-banner-nature-spring-summer-panorama-photo.jpg",
    description: "Welcome to my channel! I upload content regularly on web development, tutorials, vlogs, and more. Don't forget to subscribe and stay updated with my latest videos.",
  };

  const getBannerUrl = () => {
    if (channel?.banner === "") {
      return displayChannel.banner;
    }
    return channel?.banner || displayChannel.banner;
  };

  const getChannelName = () => {
    if (!channel) {
      return displayChannel.name;
    }
    return channel.name;
  };

  const getChannelHandle = () => {
    if (!channel) {
      return displayChannel.handle;
    }
    return channel.username ? `@${channel.username}` : `@${username}`;
  };

  const getChannelDescription = () => {
    if (!channel) {
      return displayChannel.description;
    }
    return channel.description || "No description available.";
  };

  return (
    <>
      {/* BANNER SECTION */}
      <article className="w-full h-32 sm:h-40 md:h-48 lg:h-56 xl:h-64 relative overflow-hidden rounded-lg mb-4">
        <img
          src={getBannerUrl()}
          alt={`${getChannelName()} banner`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = displayChannel.banner;
          }}
        />
      </article>

      {/* CHANNEL INFO SECTION */}
      <article className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full ${avatarColor} flex items-center justify-center text-white text-2xl sm:text-3xl font-bold`}>
          {getChannelName().charAt(0).toUpperCase()}
        </div>

        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            {getChannelName()}
          </h1>
          <p className="text-gray-600 mb-2">{getChannelHandle()}</p>
          <p className="text-sm text-gray-500 mb-3">
            {subCount.toLocaleString()} subscribers • {videoCount} videos
          </p>
          
          <div className="text-sm text-gray-700">
            {showMore ? (
              <p>{getChannelDescription()}</p>
            ) : (
              <p>
                {getChannelDescription().length > 100
                  ? `${getChannelDescription().substring(0, 100)}...`
                  : getChannelDescription()}
              </p>
            )}
            {getChannelDescription().length > 100 && (
              <button
                onClick={() => setShowMore(!showMore)}
                className="text-blue-600 hover:text-blue-800 font-medium mt-1"
              >
                {showMore ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        {isOwner && (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={onCustomizeChannel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
            >
              <FaCog size={16} />
              <span>Customize channel</span>
            </button>
            <button
              onClick={onToggleManageMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors cursor-pointer ${
                isManageMode
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <FaEdit size={16} />
              <span>{isManageMode ? 'Exit manage' : 'Manage videos'}</span>
            </button>
          </div>
        )}
      </article>

      {/* NAVIGATION TABS */}
      <nav className="border-b border-gray-200">
        <div className="flex space-x-8">
          <Link
            to={username ? `/channel/${username}` : '/channel'}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'home'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            HOME
          </Link>
          <Link
            to={username ? `/channel/${username}/videos` : '/channel/videos'}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'videos'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            VIDEOS
          </Link>
        </div>
      </nav>
    </>
  );
};

export default ChannelHeader;
