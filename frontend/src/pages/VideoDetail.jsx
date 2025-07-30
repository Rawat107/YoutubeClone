import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { 
  FaThumbsUp, 
  FaThumbsDown, 
  FaShare, 
  FaDownload, 
  FaEllipsisH, 
  FaUserCircle,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes
} from "react-icons/fa";
import VideoCard from "../components/VideoCard";
import { useAuth } from "../context/AuthContext";
import axios from "../utils/axios";
import { generateSeededRandom } from "../utils/channelUtils.js";
import NotificationAlert from "../components/NotificationAlert.jsx";


// - isYouTubeUrl: checks if a video URL is from YouTube
const isYouTubeUrl = url =>
  typeof url === "string" &&
  (url.includes("youtube.com") || url.includes("youtu.be"));

// - getEmbedUrl: transforms a YouTube URL into an embeddable format
const getEmbedUrl = url => {
  if (url.includes("youtube.com/watch?v=")) {
    const videoId = url.split("v=")[1].split("&")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
};

const BASE_URL = import.meta.env.VITE_API_URL;

// - getLocalVideoUrl: resolves local video path using BASE_URL
const getLocalVideoUrl = video => {
  if (!video?.videoUrl) return "";
  return `${BASE_URL}/${video.videoUrl.replace(/\\/g, "/")}`;
};

// - getThumbnailUrl: resolves local or remote thumbnail URL
const getThumbnailUrl = video => {
  if (!video?.thumbnailUrl) return "";
  if (video.thumbnailUrl.startsWith("http")) return video.thumbnailUrl;
  return `${BASE_URL}/${video.thumbnailUrl.replace(/\\/g, "/")}`;
};

// Main logic for VideoDetail page starts here including useState and useEffect for data fetching
const VideoDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [suggestedVideos, setSuggestedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [userLiked, setUserLiked] = useState(false);
  const [userDisliked, setUserDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState(null);

  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showAlert, setShowAlert] = useState({ open: false, message: "" });

  const subCount = useMemo(() => {
    const seed = video?.channelName || video?.channelId?.name || "default";
    return generateSeededRandom(seed, 100, 50000);
  }, [video]);

  const avatarColor = useMemo(() => {
    const colors = ["text-purple-500", "text-blue-500", "text-green-500", "text-amber-500"];
    const username = user?.username || "U";
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  }, [user]);


  // Fetches video data by ID, associated comments, and list of suggested videos
  useEffect(() => {
    const fetchVideoData = async () => {
      setError(null);
      setLoading(true);

      try {
        // Fetch the specific video
        const response = await axios.get(`/videos/${id}`);
        if (response.data && response.data.video) {
          setVideo(response.data.video);
          setLikeCount(response.data.video.likes || 0);
          setDislikeCount(response.data.video.dislikes || 0);
        } else {
          throw new Error('Video not found');
        }
      } catch (error) {
        console.error("Error fetching video:", error);
        setError(error.response?.data?.message || 'Failed to load video');
        setLoading(false);
        return;
      }

      // Fetch persistent comments from the backend
      try {
        const { data } = await axios.get(`/videos/${id}/comments`);
        setComments(data.comments || []);
      } catch (commentError) {
        console.warn('Failed to fetch comments:', commentError);
        setComments([]);
      }

      // Fetch suggested videos
      try {
        const suggestedResponse = await axios.get('/videos?limit=10');
        const allVideos = suggestedResponse.data.videos || [];
        const filtered = allVideos.filter(v => v._id !== id).slice(0, 8);
        setSuggestedVideos(filtered);
      } catch (suggestError) {
        console.warn('Failed to fetch suggested videos:', suggestError);
        setSuggestedVideos([]);
      }

      setLoading(false);
    };

    if (id) {
      fetchVideoData();
    }
  }, [id]);

 // Handles user interactions for liking/disliking a videO
  const handleLike = async () => {
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }

    try {
      await axios.post(`/videos/${id}/like`);
      if (userLiked) {
        setLikeCount(prev => prev - 1);
        setUserLiked(false);
      } else {
        setLikeCount(prev => prev + 1);
        setUserLiked(true);
        if (userDisliked) {
          setDislikeCount(prev => prev - 1);
          setUserDisliked(false);
        }
      }
    } catch (error) {
      console.error("Error liking video:", error);
    }
  };

  const handleDislike = async () => {
     if (!user) {
      setShowAuthPrompt(true);
      return;
    }

    try {
      await axios.post(`/videos/${id}/dislike`);
      if (userDisliked) {
        setDislikeCount(prev => prev - 1);
        setUserDisliked(false);
      } else {
        setDislikeCount(prev => prev + 1);
        setUserDisliked(true);
        if (userLiked) {
          setLikeCount(prev => prev - 1);
          setUserLiked(false);
        }
      }
    } catch (error) {
      console.error("Error disliking video:", error);
    }
  };


  // Functions for adding, editing, canceling, saving, and deleting comments
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }

    if (!newComment.trim()) {
      setShowAlert({ open: true, message: "Comment cannot be empty" });
      return;
    }

    try {
      const { data } = await axios.post(`/videos/${id}/comments`, {
        text: newComment.trim()
      });
      
      // Add the new comment to the beginning of the comments array
      setComments([data.comment, ...comments]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      setShowAlert({ open: true, message: "Failed to add comment" });
    }
  };



  const handleEditComment = (commentId, currentText) => {
      setEditingCommentId(commentId);
      setEditCommentText(currentText);
  };

  const handleSaveEdit = async () => {
    if (!editCommentText.trim()) {
      setShowAlert({ open: true, message: "Comment cannot be empty" });
      return;
    }
    try {
      const { data } = await axios.put(`/videos/${id}/comments/${editingCommentId}`, {
        text: editCommentText.trim()
      });
      setComments(prev =>
        prev.map(c =>
          c._id === editingCommentId
            ? { ...c, text: data.comment.text, timestamp: data.comment.timestamp }
            : c
        )
      );
      setEditingCommentId(null);
      setEditCommentText("");
    } catch (err) {
      setShowAlert({ open: true, message: "Failed to update comment" });
    }
  };


  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentText("");
  };

  const handleDeleteComment = (commentId) => {
    setDeleteCommentId(commentId);
    setShowDeleteConfirm(true);
  };

  const isCommentOwner = (comment) => {
    if (!user || !comment.userId) return false;
    const currentUserId = user.id || user._id;
    return String(comment.userId) === String(currentUserId) || comment.user === user.username;
  };

  // Shows loading spinner or error message based on fetch state
  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading video...</div>;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  if (!video) return <div>Video not found</div>;

  const displayChannelName = video.channelName || 
    (video.channelId && video.channelId.name) || 
    "Unknown Channel";

  // Page layout including video player, metadata, channel info, description, comments, and sidebar
  return (
    <section className="max-w-7xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main video content */}
        <main className="lg:col-span-2">
          {/* Video Player */}
          <div className="bg-black rounded-lg overflow-hidden mb-4">
            {isYouTubeUrl(video.videoUrl) ? (
              <iframe
                src={getEmbedUrl(video.videoUrl)}
                title={video.title}
                className="w-full h-64 md:h-96"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={getLocalVideoUrl(video)}
                controls
                className="w-full h-64 md:h-96 bg-black"
                poster={getThumbnailUrl(video)}
              >
                Sorry, your browser doesn't support embedded videos.
              </video>
            )}
          </div>

          <h1 className="text-xl font-bold mb-2">{video.title}</h1>

          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-600">
              {video.views?.toLocaleString()} views • {new Date(video.uploadDate).toLocaleDateString()}
            </div>
            <div className="flex items-center space-x-4 overflow-scroll hide-scrollbar">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-3 py-1 rounded-full cursor-pointer ${
                  userLiked ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <FaThumbsUp />
                <span>{likeCount.toLocaleString()}</span>
              </button>
              <button
                onClick={handleDislike}
                className={`flex items-center space-x-2 px-3 py-1 rounded-full cursor-pointer ${
                  userDisliked ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <FaThumbsDown />
                <span>{dislikeCount.toLocaleString()}</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer">
                <FaShare />
                <span>Share</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer">
                <FaDownload />
                <span>Download</span>
              </button>
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer">
                <FaEllipsisH />
              </button>
            </div>
          </div>

          {/* Channel info */}
          <div className="flex items-start space-x-3 mb-4">
            <FaUserCircle className={`text-2xl ${avatarColor}`} />
            <div className="flex-1">
              <h3 className="font-bold">{displayChannelName}</h3>
              <p className="text-gray-600 text-sm">
                {subCount.toLocaleString()} subscribers   {/* ← replaced */}
              </p>
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 cursor-pointer">
              Subscribe
            </button>
          </div>

          {/* Description */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-gray-700">
              {showMore ? video.description : `${video.description?.substring(0, 150)}${video.description?.length > 150 ? '...' : ''}`}
            </p>
            {video.description?.length > 150 && (
              <button 
                onClick={() => setShowMore(!showMore)}
                className="text-blue-600 hover:text-blue-800 text-sm mt-2"
              >
                {showMore ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          {/* Comments section */}
          <div>
            <h3 className="font-bold text-lg mb-4">{comments.length} Comments</h3>
            
              <form onSubmit={handleAddComment} className="mb-6">
                <div className="flex space-x-3">
                  <FaUserCircle className={`text-2xl ${avatarColor}`} />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full border-b border-gray-300 focus:border-blue-500 outline-none py-2"
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setNewComment("")}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            

            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c._id} className="flex space-x-3">
                <FaUserCircle className={`text-2xl ${avatarColor}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">{c.user}</span>
                        <span className="text-gray-500 text-sm">{c.timestamp}</span>
                      </div>
                      
                      {isCommentOwner(c) && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditComment(c._id, c.text)}
                            className="text-gray-500 hover:text-blue-600 p-1 cursor-pointer"
                            title="Edit comment"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(c._id)}
                            className="text-gray-500 hover:text-red-600 p-1 cursor-pointer"
                            title="Delete comment"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {editingCommentId === c._id ? (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={editCommentText}
                          onChange={(e) => setEditCommentText(e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                          autoFocus
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
                          >
                            <FaTimes className="inline mr-1" />
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                          >
                            <FaSave className="inline mr-1" />
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 mt-1">{c.text}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Suggested videos sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <h3 className="font-bold text-lg mb-4">Suggested Videos</h3>
            <div className="space-y-3">
              {suggestedVideos.map((suggestedVideo) => (
                <VideoCard 
                  key={suggestedVideo._id} 
                  video={suggestedVideo} 
                  showChannel={true}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <NotificationAlert
        isOpen={showDeleteConfirm}
        type="confirm"
        message="Are you sure you want to delete this comment?"
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setComments(prev => prev.filter(c => c._id !== deleteCommentId));
          setShowDeleteConfirm(false);
        }}
      />

      <NotificationAlert
        isOpen={showAuthPrompt}
        type="auth"
        message="Want to Engage? Sign in to continue"
        onCancel={() => setShowAuthPrompt(false)}
        onConfirm={() => {
          navigate("/login");
          setShowAuthPrompt(false);
        }}
      />

      <NotificationAlert
        isOpen={showAlert.open}
        type="alert"
        message={showAlert.message}
        onConfirm={() => setShowAlert({ open: false, message: "" })}
      />

    </section>
  );
};

export default VideoDetail;
