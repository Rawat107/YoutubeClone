import { useState, useEffect } from "react";
import VideoCard from "../components/VideoCard";
import { useSearch } from "../context/SearchContext";
import axios from "../utils/axios";

const categories = [
  "All",
  "Tech",
  "Education",
  "Music",
  "Sports",
  "Movies",
  "Entertainment",
  "Gaming",
  "Fashion",
];

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchTerm } = useSearch();

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        // Build query params for category and search
        const params = new URLSearchParams();
        if (selectedCategory !== "All") params.append("category", selectedCategory);
        if (searchTerm) params.append("search", searchTerm);

        const response = await axios.get(`/videos?${params.toString()}`);
        setVideos(response.data.videos || []);
      } catch (err) {
        setVideos([]); // fallback to empty array
      }
      setLoading(false);
    };
    fetchVideos();
  }, [selectedCategory, searchTerm]);

  const filteredVideos = videos; // already filtered by backend

  return (
    <>
      {/* Fixed category bar just below header */}
      <div
        className="sticky top-[49px] sm:top-[50px] z-4 px-4 sm:px-6 w-full max-w-full overflow-x-hidden min-[340px]:px-[0.75rem] max-[639px]:max-w-[100vw] bg-white/70 backdrop-blur-md backdrop-saturate-150"
      >
        <div className="flex gap-2 py-1 sm:pb-2 sm:pt-2 overflow-x-auto hide-scrollbar min-[340px]:gap-[0.375rem] ">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap flex-shrink-0 border-none cursor-pointer transition-all duration-200 ease-in-out ${
                selectedCategory === category
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              } min-[340px]:px-[0.625rem] min-[340px]:py-[0.375rem] min-[340px]:text-[13px]`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Main content container */}
      <div className="px-4 sm:px-6 w-full max-w-full overflow-x-hidden min-[340px]:px-[0.75rem] max-[639px]:max-w-[100vw] relative">
        {/* Video grid */}
        <div className="
          grid gap-4 w-full
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
          xl:grid-cols-5
          min-[340px]:gap-[0.75rem]
        ">
          {loading
            ? [...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg aspect-video mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))
            : filteredVideos.map((video) => (
                <VideoCard
                  key={video._id}
                  video={video}
                />
              ))}
        </div>

        {!loading && filteredVideos.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            No videos match your search.
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
