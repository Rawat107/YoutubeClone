import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaHome,
  FaHistory,
  FaList,
  FaVideo,
  FaClock,
  FaThumbsUp,
  FaFire,
  FaShoppingBag,
  FaMusic,
  FaFilm,
  FaBroadcastTower,
  FaUserCircle,
  FaBolt,
  FaPlay,
} from "react-icons/fa";

const Divider = () => <hr className="my-3 border-gray-300" />;

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black opacity-40 z-30 sm:hidden" onClick={onClose}></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-white z-40 shadow-lg transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex flex-col px-4 text-sm text-gray-800 gap-2 overflow-y-auto h-full pt-12 sm:pt-14">

          {/* Top: Basic navigation */}
          <SidebarItem to="/" label="Home" icon={<FaHome />} onClick={onClose} />
          <SidebarItem to="/shorts" label="Shorts" icon={<FaBolt />} onClick={onClose} />
          <SidebarItem to="/subscriptions" label="Subscriptions" icon={<FaPlay />} onClick={onClose} />
          <Divider />

          {/* YOU section */}
          <h2 className="text-xs font-semibold text-gray-500 px-1">You</h2>
          <SidebarItem to="/history" label="History" icon={<FaHistory />} onClick={onClose} />

          {!user ? (
            <>
              <p className="text-xs px-1 text-gray-600 mt-1">
                Sign in to like videos, comment, and subscribe.
              </p>
              <Link
                to="/login"
                className="mt-2 flex items-center justify-center gap-2 px-3 py-2 border text-blue-500 border-blue-500 rounded-full text-xs hover:bg-blue-50"
                onClick={onClose}
              >
                <FaUserCircle />
                Sign In
              </Link>
            </>
          ) : (
            <>
              <SidebarItem to="/" label="Playlists" icon={<FaList />} onClick={onClose}/>
              <SidebarItem to="/" label="Your videos" icon={<FaVideo />} onClick={onClose} />
              <SidebarItem to="/" label="Watch later" icon={<FaClock />} onClick={onClose}/>
              <SidebarItem to="/" label="Liked videos" icon={<FaThumbsUp />} onClick={onClose} />
            </>
          )}
          <Divider />

          {/* Subscriptions */}
          {user && (
            <>
              <h2 className="text-xs font-semibold text-gray-500 px-1">Subscriptions</h2>
              <SidebarItem to="/" label="CodeWithJohn" icon={<FaUserCircle />} onClick={onClose}/>
              <SidebarItem to="/" label="TechWorld" icon={<FaUserCircle />} onClick={onClose}/>
              <Divider />
            </>
          )}

          {/* Explore section */}
          <h2 className="text-xs font-semibold text-gray-500 px-1">Explore</h2>
          <SidebarItem to="/" label="Trending" icon={<FaFire />} onClick={onClose}/>
          <SidebarItem to="/" label="Shopping" icon={<FaShoppingBag />} onClick={onClose}/>
          <SidebarItem to="/" label="Music" icon={<FaMusic />} onClick={onClose}/>
          <SidebarItem to="/" label="Movies" icon={<FaFilm />} onClick={onClose}/>
          <SidebarItem to="/" label="Live" icon={<FaBroadcastTower />} onClick={onClose}/>
        </nav>
      </aside>
    </>
  );
};

const SidebarItem = ({ to, label, icon, onClick }) => (
  <Link to={to} 

    onClick={() => {if(window.innerWidth < 640 && onClick ){
      onClick();}
    }}
    className="flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-100">
    <span className="text-base">{icon}</span>
    <span>{label}</span>
  </Link>
);

export default Sidebar;
