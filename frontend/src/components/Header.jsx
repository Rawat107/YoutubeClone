import { useEffect, useRef, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaMicrophone,
  FaBell,
  FaUserCircle,
  FaVideo,
  FaEllipsisV,
  FaSearch,
  FaArrowLeft,
  FaTimes,
  FaSignOutAlt,
} from "react-icons/fa";
import axios from "../utils/axios";

function Header({ onToggleSidebar }) {
  const { user, logout } = useAuth(); // Auth context
  const { searchTerm, setSearchTerm } = useSearch(); // Search context
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);  // Avatar dropdown
  const [notification, setNotification] = useState(null); // Toast notifications
  const navigate = useNavigate();

  const dropdownRef = useRef(); // Ref for dropdown outside click

  const [showCreateMenu, setShowCreateMenu] = useState(false); // Create menu state
  const createMenuRef = useRef(); // Ref for "Create" menu

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        createMenuRef.current &&
        !createMenuRef.current.contains(e.target)
      ) {
        setShowCreateMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout user and close dropdown
  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  // Handle search form submit (you can expand this for routing)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  // Handle "Create Channel" button click
  const handleCreateClick = async () => {
    if (!user) {
      navigate('/login'); // Redirect if not logged in
      return;
    }

    try {
      const response = await axios.get('/channels/my'); // Check if channel exists
      if (!response.data.channel) {
        navigate('/create-channel');
      } else {
      setNotification({
        type: 'info',
        message: 'You already have a channel! Taking you to your channel.',
        duration: 3000
      });
      setTimeout(() => {
        setNotification(null)
        navigate(`/channel/${response.data.channel.username}`);
      }, 1500);
      }
    } catch (error) {
      // If not found, allow user to create a channel
      if (error.response?.status === 404) {
        navigate('/create-channel');
      } else {
        console.error('Error checking channel:', error);
        navigate('/create-channel');
      }
    }
  };

  // Handle "Your Channel" option in dropdown
  const handleViewChannelClick = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const response = await axios.get('/channels/my');
      if (!response.data.channel) {
        navigate('/create-channel');
      } else {

        navigate(`/channel/${response.data.channel.username}`);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        navigate('/create-channel');
      } else {
        console.error('Error checking channel:', error);
        navigate('/create-channel');
      }
    }
  };

  // Generate consistent avatar color based on username
  const avatarColor = useMemo(() => {
    const colors = ["bg-purple-500", "bg-blue-500", "bg-green-500", "bg-amber-500"];
    const index = user?.username?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  }, [user]);

  return (
    <header className="flex items-center justify-between border-b px-2 py-2 sticky top-0 z-50 w-full bg-white/70 backdrop-blur-md">
      {/* Mobile Search */}
      <div className={`flex items-center w-full ${showMobileSearch ? "sm:hidden" : "hidden"} bg-white pb-1`} style={{ zIndex: 60, position: "relative" }}>        <button onClick={() => setShowMobileSearch(false)} className="mr-2 text-lg">
          <FaArrowLeft />
        </button>
        <form onSubmit={handleSearchSubmit} className="flex flex-1">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 w-full rounded-l-full px-3 py-1 text-sm focus:outline-none bg-white"
            />
          <button type="submit" className="bg-gray-100 px-3 py-1 border border-l-0 border-gray-300">
            <FaSearch />
          </button>
          {searchTerm && (
            <button type="button" className="ml-2 text-gray-500" onClick={() => setSearchTerm("")}>
              <FaTimes />
            </button>
          )}
        </form>
      </div>

      {/* Full Header */}
      <div className={`w-full items-center justify-between ${showMobileSearch ? "hidden" : "flex"} sm:flex`}>
        {/* Left */}
        <div className="flex items-center gap-2 min-w-[100px]">
          <button className="text-lg cursor-pointer" onClick={onToggleSidebar}>
            <FaBars />
          </button>
          <Link to="/" className="flex items-center gap-1 text-lg font-bold">
            <img
              src="https://www.gstatic.com/youtube/img/branding/youtubelogo/svg/youtubelogo.svg"
              alt="YouTube"
              className="h-5 sm:h-6"
            />
            <sup className="text-[9px] text-gray-600 -ml-1">IN</sup>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden sm:flex flex-1 justify-center px-2 max-w-[600px]">
          <form onSubmit={handleSearchSubmit} className="flex w-full">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border border-gray-300 rounded-l-full px-3 py-1 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-gray-100 px-3 py-1 border border-l-0 border-gray-300 rounded-r-full cursor-pointer"
            >
              <FaSearch />
            </button>
            {searchTerm && (
              <button
                type="button"
                className="ml-2 text-gray-500"
                onClick={() => setSearchTerm("")}
              >
                <FaTimes />
              </button>
            )}
          </form>
          <button className="ml-2 p-2 rounded-full hover:bg-gray-200 cursor-pointer">
            <FaMicrophone />
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-fit">
          {!user && (
            <Link
              to="/login"
              className="px-3 sm:px-4 py-1 border border-blue-500 text-blue-500 text-sm sm:text-base rounded-full hover:bg-blue-50 font-medium"
            >
              Sign In
            </Link>
          )}

          {/* Show Search icon for small screen */}
          {user && (
            <>
              <button className="text-lg sm:hidden" onClick={() => setShowMobileSearch(true)}>
                <FaSearch />
              </button>
            </>
          )}

          {user && (
            <>
              {/* Create Menu Button - Visible on All Screens */}
              <div className="relative" ref={createMenuRef}>
                <button
                  onClick={() => setShowCreateMenu(prev => !prev)}
                  className="p-2 sm:px-4 sm:py-1 bg-gray-800 text-white rounded-full text-sm font-medium hover:bg-gray-700 flex items-center gap-1 cursor-pointer"
                >
                  <FaVideo />
                  <span className="hidden sm:inline">Create</span>
                </button>

                {showCreateMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg z-50">
                    <button
                      onClick={() => {
                        setShowCreateMenu(false);
                        navigate("/upload");
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:rounded-xl cursor-pointer"
                    >
                      Upload video
                    </button>
                    <button
                      onClick={async () => {
                        setShowCreateMenu(false);
                        await handleCreateClick(); // 
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hover:rounded-xl cursor-pointer"
                    >
                      Create channel
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Show only on medium+ screens if logged in */}
          {user && (
            <>
              <button className="text-lg hidden sm:inline">
                <FaBell />
              </button>
              <button className="text-xl hidden sm:inline">
                <FaEllipsisV />
              </button>
            </>
          )}

          {/* Avatar and dropdown */}
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold cursor-pointer text-white ${avatarColor}`}
              >
                {user.avatar || user.username.charAt(0).toUpperCase()}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white border rounded-xl shadow-lg z-50 p-2">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${avatarColor}`}
                    >
                      {user.avatar || user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 text-sm font-medium">{user.username}</div>
                  </div>
                  <hr className="my-1" />
                  <button
                    onClick={handleViewChannelClick}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                  >
                    Your channel
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    <FaSignOutAlt />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Notification toast */}
      {notification && (
        <div className="fixed top-20 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-in">
          <div className="flex items-center gap-2">
            <div className="text-sm">{notification.message}</div>
            <button onClick={() => setNotification(null)} className="ml-2 text-white hover:text-gray-200">
              ×
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
