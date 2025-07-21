import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
  
  // New state for comment editing
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setError(null);
        
        // Fetch the specific video
        const response = await axios.get(`/videos/${id}`);
        if (response.data && response.data.video) {
          setVideo(response.data.video);
          setLikeCount(response.data.video.likes || 0);
          setDislikeCount(response.data.video.dislikes || 0);
        } else {
          throw new Error('Video not found');
        }
        
        // Fetch suggested videos
        try {
          const suggestedResponse = await axios.get('/videos?limit=10');
          const allVideos = suggestedResponse.data.videos || [];
          // Filter out current video and get random suggestions
          const filtered = allVideos.filter(v => v._id !== id).slice(0, 8);
          setSuggestedVideos(filtered);
        } catch (suggestError) {
          console.warn('Failed to fetch suggested videos:', suggestError);
          setSuggestedVideos([]);
        }
        
      } catch (error) {
        console.error("Error fetching video:", error);
        setError(error.response?.data?.message || 'Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVideoData();
    }
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      alert("Please log in to like videos");
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
      alert("Please log in to dislike videos");
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

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to comment");
      return;
    }

    if (newComment.trim()) {
      const newCommentObj = {
        id: Date.now(),
        user: user.username,
        text: newComment,
        timestamp: "Just now",
        userId: user.id || user._id // Store user ID for ownership checking
      };
      setComments([newCommentObj, ...comments]);
      setNewComment("");
    }
  };

  // New function to handle comment editing
  const handleEditComment = (commentId, currentText) => {
    setEditingCommentId(commentId);
    setEditCommentText(currentText);
  };

  // New function to save edited comment
  const handleSaveEdit = () => {
    if (!editCommentText.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    setComments(prevComments =>
      prevComments.map(comment =>
        comment.id === editingCommentId
          ? { 
              ...comment, 
              text: editCommentText.trim(),
              timestamp: "Edited just now" 
            }
          : comment
      )
    );
    
    setEditingCommentId(null);
    setEditCommentText("");
  };

  // New function to cancel editing
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentText("");
  };

  // New function to delete comment
  const handleDeleteComment = (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      setComments(prevComments =>
        prevComments.filter(comment => comment.id !== commentId)
      );
    }
  };

  // Function to check if current user owns the comment
  const isCommentOwner = (comment) => {
    if (!user || !comment.userId) return false;
    const currentUserId = user.id || user._id;
    return String(comment.userId) === String(currentUserId) || comment.user === user.username;
  };

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

  // Get display channel name
  const displayChannelName = video.channelName || 
    (video.channelId && video.channelId.name) || 
    "Unknown Channel";

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main video content */}
        <div className="lg:col-span-2">
          {/* Video Player */}
          <div className="bg-black rounded-lg overflow-hidden mb-4">
            <iframe
              src={video.videoUrl}
              title={video.title}
              className="w-full h-64 md:h-96"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <h1 className="text-xl font-bold mb-2">{video.title}</h1>

          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-600">
              {video.views?.toLocaleString()} views • {new Date(video.uploadDate).toLocaleDateString()}
            </div>
            <div className="flex items-center space-x-4 overflow-scroll">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                  userLiked ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <FaThumbsUp />
                <span>{likeCount.toLocaleString()}</span>
              </button>
              <button
                onClick={handleDislike}
                className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                  userDisliked ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <FaThumbsDown />
                <span>{dislikeCount.toLocaleString()}</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200">
                <FaShare />
                <span>Share</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200">
                <FaDownload />
                <span>Download</span>
              </button>
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                <FaEllipsisH />
              </button>
            </div>
          </div>

          {/* Channel info */}
          <div className="flex items-start space-x-3 mb-4">
            <FaUserCircle className="text-4xl text-gray-400" />
            <div className="flex-1">
              <h3 className="font-bold">{displayChannelName}</h3>
              <p className="text-gray-600 text-sm">1.2K subscribers</p>
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700">
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
            
            {user && (
              <form onSubmit={handleAddComment} className="mb-6">
                <div className="flex space-x-3">
                  <FaUserCircle className="text-3xl text-gray-400" />
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
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="flex space-x-3">
                  <FaUserCircle className="text-2xl text-gray-400" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">{c.user}</span>
                        <span className="text-gray-500 text-sm">{c.timestamp}</span>
                      </div>
                      
                      {/* Edit/Delete buttons for comment owner */}
                      {isCommentOwner(c) && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditComment(c.id, c.text)}
                            className="text-gray-500 hover:text-blue-600 p-1"
                            title="Edit comment"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="text-gray-500 hover:text-red-600 p-1"
                            title="Delete comment"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Comment text or edit input */}
                    {editingCommentId === c.id ? (
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
        </div>

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
    </div>
  );
};

export default VideoDetail;
