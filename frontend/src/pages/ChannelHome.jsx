import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useMemo, useState} from "react";
import axios from "../utils/axios.js";
import { FaTrash, FaVideo, FaPlay } from "react-icons/fa";
import ChannelHeader from "../components/ChannelHeader.jsx";
import ChannelUpdate from "../components/ChannelUpdate.jsx";
import NotificationAlert from "../components/NotificationAlert.jsx";

const ChannelHome = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  const [error, setError] = useState(null);
  const [deletingVideo, setDeletingVideo] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertVideoId, setAlertVideoId] = useState(null);


  const BASE_URL = import.meta.env.VITE_API_URL;
  const getLocalVideoUrl = (video) => {
    if (!video?.videoUrl) return "";
    return `${BASE_URL}/${video.videoUrl.replace(/\\/g, "/")}`;
  };

  const getThumbnailUrl = (video) => {
    if (!video?.thumbnailUrl) return "";
    if (video.thumbnailUrl.startsWith("http")) return video.thumbnailUrl;
    return `${BASE_URL}/${video.thumbnailUrl.replace(/\\/g, "/")}`;
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchChannelData = async () => {
      try {
        setError(null);
        if (username) {
          const response = await axios.get(`/channels/${username}`);
          if (response.data?.channel) {
            setChannel(response.data.channel);
            try {
              const videosResponse = await axios.get(
                `/videos/channel/${response.data.channel._id}`
              );
              setVideos(videosResponse.data.videos || []);
            } catch {
              setVideos([]);
            }
          } else {
            throw new Error("Invalid channel response structure");
          }
        } else {
          try {
            const response = await axios.get("/channels/my");
            if (response.data?.channel) {
              setChannel(response.data.channel);
              try {
                const videosResponse = await axios.get(
                  `/videos/channel/${response.data.channel._id}`
                );
                setVideos(videosResponse.data.videos || []);
              } catch {
                setVideos([]);
              }
            } else {
              throw new Error("Invalid my channel response structure");
            }
          } catch (err) {
            if (err.response?.status === 404) {
              setShowCreateModal(true);
              setChannel(null);
            } else {
              throw err;
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch channel:", err);
        setError(err.message || "Failed to load channel");
        setChannel(null);
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [username, user, navigate]);

  const handleChannelUpdated = (updatedChannel) => {
    setChannel(updatedChannel);
    setShowUpdateModal(false);
  };

  const handleDeleteVideo = (videoId) => {
    setAlertVideoId(videoId);
    setAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    setAlertOpen(false);
    setDeletingVideo(alertVideoId);
    try {
      await axios.delete(`/videos/${alertVideoId}`);
      setVideos(prev => prev.filter(v => v._id !== alertVideoId));
    } catch {
      alert("Failed to delete video. Please try again.");
    } finally {
      setDeletingVideo(null);
      setAlertVideoId(null);
    }
  };

  const isOwner = useMemo(() => {
    if (!user || !channel) return false;
    let cid = typeof channel.userId === "object" && channel.userId._id
      ? channel.userId._id
      : channel.userId;
    const uid = user._id || user.id;
    return cid.toString() === uid.toString();
  }, [user, channel]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-gray-300 rounded-lg"></div>
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!channel && showCreateModal) {
    return (
      <div className="max-w-6xl mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Create Your Channel</h1>
        <p className="text-gray-600 mb-6">
          You need to create a channel before you can view this page.
        </p>
        <Link
          to="/create-channel"
          className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
        >
          Create Channel
        </Link>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto p-4">
      <ChannelHeader
        channel={channel}
        username={username}
        user={user}
        videoCount={videos.length}
        isOwner={isOwner}
        activeTab="home"
        isManageMode={isManageMode}
        onToggleManageMode={() => setIsManageMode(!isManageMode)}
        onCustomizeChannel={() => setShowUpdateModal(true)}
      />

      <section className="mt-8">
        {videos.length === 0 ? (
          <section className="text-center py-16">
            <FaVideo className="mx-auto text-6xl text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isOwner
                ? "Create content on any device"
                : "No videos uploaded yet"}
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {isOwner
                ? "Upload and record at home or on the go. Everything you make public will appear here."
                : "This channel hasn't uploaded any videos yet."}
            </p>
            {isOwner && (
              <Link
                to="/upload"
                className="inline-block bg-red-600 text-white px-6 py-3 rounded-2xl hover:bg-red-700"
              >
                Create Video
              </Link>
            )}
          </section>
        ) : (
          <section>
            <header className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Latest videos
              </h2>
            </header>

            {videos[0] && (
              <article className="mb-8 bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/2 relative group">
                    <Link to={`/video/${videos[0]._id}`}>
                      <img
                        src={getThumbnailUrl(videos[0])}
                        alt={videos[0].title}
                        className="w-full h-48 md:h-64 object-cover group-hover:opacity-90 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaPlay className="text-white text-4xl" />
                      </div>
                    </Link>
                    {isManageMode && isOwner && (
                      <button
                        onClick={() => handleDeleteVideo(videos[0]._id)}
                        disabled={deletingVideo === videos[0]._id}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                        title="Delete video"
                      >
                        <FaTrash size={12} />
                      </button>
                    )}
                  </div>
                  <div className="md:w-1/2 p-6">
                    <Link to={`/video/${videos[0]._id}`}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-red-600">
                        {videos[0].title}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 mb-2">
                      {videos[0].views} views •{" "}
                      {new Date(videos[0].uploadDate).toLocaleDateString()}
                    </p>
                    <p className="text-gray-700 line-clamp-3">
                      {videos[0].description || "No description available"}
                    </p>
                  </div>
                </div>
              </article>
            )}

            {videos.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {videos.slice(1).map((video) => (
                  <article
                    key={video._id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden relative group transition-transform hover:scale-105 hover:shadow-lg cursor-pointer"
                    onClick={() => navigate(`/video/${video._id}`)}
                  >
                    <div className="relative">
                      <img
                        src={getThumbnailUrl(video)}
                        alt={video.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaPlay className="text-white text-2xl" />
                      </div>
                    </div>
                    {isManageMode && isOwner && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteVideo(video._id);
                        }}
                        disabled={deletingVideo === video._id}
                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                        title="Delete video"
                      >
                        <FaTrash size={10} />
                      </button>
                    )}
                    <div className="p-3">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-2 hover:text-red-600">
                        {video.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {video.views} views •{" "}
                        {new Date(video.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </section>

      {showUpdateModal && (
        <ChannelUpdate
          channel={channel}
          onClose={() => setShowUpdateModal(false)}
          onUpdate={handleChannelUpdated}
        />
      )}
      <NotificationAlert
        isOpen={alertOpen}
        type="confirm"
        message="Are you sure you want to delete this video? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setAlertOpen(false)}
      />
    </section>
  );
};

export default ChannelHome;
