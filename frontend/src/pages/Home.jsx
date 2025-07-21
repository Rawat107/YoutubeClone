import { useState } from "react";
import sampleVideos from "../../../backend/data/sampleVideos.js";
import VideoCard from "../components/VideoCard";
import { useSearch } from "../context/SearchContext";

const categories = ["All", "Tech", "Education", "Music", "Sports", "Movies", "Entertainment", "Gaming", 'Fashion'];

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { searchTerm } = useSearch();

  const filteredVideos = sampleVideos.filter((video) => {
    const matchesCategory =
      selectedCategory === "All" || video.category === selectedCategory;
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* Fixed category bar just below header */}
      <div
        className="sticky top-[49px] sm:top-[50px] z-4 px-4 sm:px-6 w-full max-w-full overflow-x-hidden min-[340px]:px-[0.75rem] max-[639px]:max-w-[100vw] bg-white/70 backdrop-blur-md backdrop-saturate-150"
      >
        <div className="flex gap-2 pt-1 sm:pb-2 sm:pt-2 overflow-x-auto hide-scrollbar min-[340px]:gap-[0.375rem] ">
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
          {filteredVideos.map((video) => (
            <VideoCard key={video.videoId} video={video} />
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center text-gray-500 mt-12">
            No videos match your search.
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
