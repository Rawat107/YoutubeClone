import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import axios from "../utils/axios.js";
import { FaTrash, FaVideo, FaPlay } from "react-icons/fa";
import ChannelHeader from "../components/ChannelHeader.jsx";
import NotificationAlert from "../components/NotificationAlert.jsx";

const ChannelVideos = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [isManageMode, setIsManageMode] = useState(false);
  const [deletingVideo, setDeletingVideo] = useState(null);

  // NotificationAlert state
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertVideoId, setAlertVideoId] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const fetchChannelData = async () => {
      try {
        setError(null);
        const { data: chData } = await axios.get(`/channels/${username}`);
        setChannel(chData.channel);
        const { data: vidData } = await axios.get(`/videos/channel/${chData.channel._id}`);
        setVideos(vidData.videos || []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load channel or videos.");
      } finally {
        setLoading(false);
      }
    };
    fetchChannelData();
  }, [username, user, navigate]);

  const isOwner = useMemo(() => {
    if (!user || !channel) return false;
    const chUserId = typeof channel.userId === "object" && channel.userId._id
      ? channel.userId._id
      : channel.userId;
    const currId = user._id || user.id;
    return chUserId.toString() === currId.toString();
  }, [user, channel]);

  const sortedVideos = useMemo(() => {
    const arr = [...videos];
    if (sortBy === "oldest") {
      return arr.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
    }
    if (sortBy === "popular") {
      return arr.sort((a, b) => (b.views || 0) - (a.views || 0));
    }
    return arr.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  }, [videos, sortBy]);

  const getThumbnailUrl = (video) => {
    if (!video?.thumbnailUrl) return "";
    return video.thumbnailUrl.startsWith("http")
      ? video.thumbnailUrl
      : `${BASE_URL}/${video.thumbnailUrl.replace(/\\/g, "/")}`;
  };

  const confirmDelete = (id) => {
    setAlertVideoId(id);
    setAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    const id = alertVideoId;
    setAlertOpen(false);
    setDeletingVideo(id);
    try {
      await axios.delete(`/videos/${id}`);
      setVideos((prev) => prev.filter((v) => v._id !== id));
    } catch {
      alert("Delete failed");
    } finally {
      setDeletingVideo(null);
      setAlertVideoId(null);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <ChannelHeader
        channel={channel}
        username={username}
        user={user}
        videoCount={videos.length}
        isOwner={isOwner}
        activeTab="videos"
        isManageMode={isManageMode}
        onToggleManageMode={() => setIsManageMode(!isManageMode)}
        onCustomizeChannel={() => navigate("/")}
      />

      <section className="mt-8">
        {videos.length === 0 ? (
          <section className="text-center py-16">
            <FaVideo className="mx-auto text-6xl text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isOwner ? "Upload your first video" : "No videos uploaded yet"}
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {isOwner
                ? "Upload and record at home or on the go. Everything you make public will appear here."
                : "This channel hasn't uploaded any videos yet."}
            </p>
          </section>
        ) : (
          <section>
            <header className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Videos ({videos.length})</h2>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="newest">Date added (newest)</option>
                <option value="oldest">Date added (oldest)</option>
                <option value="popular">Most popular</option>
              </select>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedVideos.map((video) => (
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
                        confirmDelete(video._id);
                      }}
                      disabled={deletingVideo === video._id}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                      title="Delete video"
                    >
                      <FaTrash size={10} />
                    </button>
                  )}

                  <div className="p-3">
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
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
          </section>
        )}
      </section>

      <NotificationAlert
        isOpen={alertOpen}
        type="confirm"
        message="Are you sure you want to delete this video? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setAlertOpen(false)}
      />
    </div>
  );
};

export default ChannelVideos;
