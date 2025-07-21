import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  FaThumbsUp, 
  FaThumbsDown, 
  FaShare, 
  FaDownload, 
  FaEllipsisH, 
  FaUserCircle,
} from "react-icons/fa";
import VideoCard from "../components/VideoCard";
import { useAuth } from "../context/AuthContext";
import axios from "../utils/axios.js";

const VideoDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [suggestedVideos, setSuggestedVideos] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [userLiked, setUserLiked] = useState(false);
  const [userDisliked, setUserDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [filterCategory, setFilterCategory] = useState("All");

  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await axios.get(`/videos/${id}`);
        setVideo(response.data.video);
        setLikeCount(response.data.video.likes || 0);
        setDislikeCount(response.data.video.dislikes || 0);
        
        // Fetch suggested videos
        const suggestedResponse = await axios.get(`/videos/suggested/${id}`);
        setSuggestedVideos(suggestedResponse.data.videos || []);
        
        // Fetch comments
        const commentsResponse = await axios.get(`/videos/${id}/comments`);
        setComments(commentsResponse.data.comments || []);
      } catch (error) {
        console.error("Error fetching video:", error);
      }
    };

    fetchVideoData();
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      alert("Please log in to like videos");
      return;
    }

    try {
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
        timestamp: "Just now"
      };
      setComments([newCommentObj, ...comments]);
      setNewComment("");
    }
  };

  const categories = ["All", "Tech", "Education", "Music", "Sports", "Movies", "Entertainment", "Gaming"];

  const filteredSuggestedVideos = suggestedVideos.filter(v => 
    filterCategory === "All" || v.category === filterCategory
  );

  if (!video) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-black rounded-lg overflow-hidden mb-4">
            <iframe
              src={video.videoUrl}
              title={video.title}
              className="w-full h-64 md:h-96"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <h1 className="text-xl font-bold mb-2">{video.title}</h1>

          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-600">
              {video.views?.toLocaleString()} views • {new Date(video.uploadDate).toLocaleDateString()}
            </div>
            <div className="flex items-center space-x-4">
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

          <div className="flex items-start space-x-3 mb-4">
            <FaUserCircle className="text-4xl text-gray-400" />
            <div className="flex-1">
              <h3 className="font-bold">{video.channelName}</h3>
              <p className="text-gray-600 text-sm">5200 subscribers</p>
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700">
              Subscribe
            </button>
          </div>

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
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">{c.user}</span>
                      <span className="text-gray-500 text-sm">{c.timestamp}</span>
                    </div>
                    <p className="text-gray-700">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Up next</h3>
            
            {/* Filter dropdown */}
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          {filteredSuggestedVideos.map((suggestedVideo) => (
            <VideoCard key={suggestedVideo._id} video={suggestedVideo} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;
