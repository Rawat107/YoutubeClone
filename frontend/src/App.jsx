import { Routes, Route} from 'react-router-dom';
import { lazy, useState, Suspense  } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load all page components for code splitting
const Home = lazy(() => import('./pages/Home'));
const Register = lazy(() => import('./pages/Register'));
const Login = lazy(() => import('./pages/Login'));
const VideoDetail = lazy(() => import('./pages/VideoDetail'));
const ChannelHome = lazy(() => import('./pages/ChannelHome'));
const ChannelVideos = lazy(() => import('./pages/ChannelVideos'));
const VideoUpload = lazy(() => import('./pages/VideoUpload'));
const CreateChannel = lazy(() => import('./components/CreateChannel'));
const ErrorPage = lazy(() => import('./pages/ErrorPage'));


// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    <span className="ml-3 text-gray-600">Loading...</span>
  </div>
);

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <Header onToggleSidebar={toggleSidebar} />
      <div className="flex">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={closeSidebar}
        />
        
        {/* Main content with responsive behavior */}
        <main 
          className={`
            flex-1 min-h-screen transition-all duration-300 ease-in-out
            ${isSidebarOpen 
              ? 'lg:ml-64 ml-0' // Desktop: shift right, Mobile: no shift (overlay)
              : 'ml-0'
            }
          `}
        >
          {/* Wrap all routes with Suspense for lazy loading */}
          <Suspense fallback={<PageLoader />}>
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

              <Route path="*" element={<ErrorPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </>
  );
}

export default App;
