import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { generateSeededRandom } from "../utils/channelUtils.js";

const ChannelHeader = ({ 
  channel, 
  username, 
  user, 
  videoCount, 
  isOwner, 
  activeTab = "home" 
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
    if (channel.banner === "") {
      return displayChannel.banner;
    }
    return channel.banner || displayChannel.banner;
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
      {/* BANNER - EXACT SAME STYLING */}
      <div
        className="w-full h-32 sm:h-40 md:h-52 bg-center bg-cover rounded-xl"
        style={{ backgroundImage: `url(${getBannerUrl()})` }}
      ></div>

      {/* CHANNEL INFO - EXACT SAME STYLING */}
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
              <p className={showMore ? "whitespace-pre-wrap" : "line-clamp-1"}>
                {getChannelDescription()}
              </p>
              {getChannelDescription().length > 100 && (
                <button
                  onClick={() => setShowMore((prev) => !prev)}
                  className="text-blue-600 hover:underline mt-1"
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
            <button className="px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-full hover:bg-gray-50 transition-colors cursor-pointer">
              Customize Channel
            </button>
            <Link to={`/channel/${username}/videos`}>
              <button className="px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-full hover:bg-gray-50 transition-colors cursor-pointer">
                Manage Videos
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* TABS - EXACT SAME STYLING */}
      <div className="mt-6 border-b border-gray-300 flex space-x-6 text-sm sm:text-base font-medium">
        <Link to={`/channel/${username}`}>
          <button className={`pb-3 px-1 border-b-2  cursor-pointer ${activeTab === "home" ? "border-black" : "border-transparent text-gray-600 hover:text-black hover:border-gray-300"}`}>
            Home
          </button>
        </Link>
        {videoCount > 0 && (
          <Link to={`/channel/${username}/videos`}>
            <button className={`pb-3 px-1 border-b-2  cursor-pointer ${activeTab === "videos" ? "border-black" : "border-transparent text-gray-600 hover:text-black hover:border-gray-300"}`}>
              Videos
            </button>
          </Link>
        )}
        <button className="pb-3 px-1 text-gray-600 cursor-pointer  hover:text-black border-b-2 border-transparent hover:border-gray-300">
          Posts
        </button>
      </div>
    </>
  );
};

export default ChannelHeader;
