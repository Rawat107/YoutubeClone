import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Header from './components/Header';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import VideoDetail from "./pages/VideoDetail";
import ChannelHome from './pages/ChannelHome';
import ChannelVideos from './pages/ChannelVideos';
import VideoUpload from './pages/VideoUpload';
import ProtectedRoute from './components/ProtectedRoute';
import CreateChannel from './components/CreateChannel';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Header onToggleSidebar={toggleSidebar} />
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} />
        {/* Fixed: Proper responsive behavior for main content */}
        <main 
          className={`
            flex-1 min-h-screen transition-all duration-300 ease-in-out
            ${isSidebarOpen 
              ? 'lg:ml-64 ml-0' // Desktop: shift right, Mobile: no shift (overlay)
              : 'ml-0'
            }
          `}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/video/:id" element={<VideoDetail />} />
            
            <Route path="/create-channel" element={
              <ProtectedRoute>
                <CreateChannel />
              </ProtectedRoute>
            } />
            <Route path="/channel" element={
              <ProtectedRoute>
                <ChannelHome />
              </ProtectedRoute>
            } />
            <Route path="/channel/:username" element={
              <ProtectedRoute>
                <ChannelHome />
              </ProtectedRoute>
            } />
            <Route path="/channel/:username/videos" element={
              <ProtectedRoute>
                <ChannelVideos />
              </ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute>
                <VideoUpload />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;
