import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import { FaCloudUploadAlt, FaVideo, FaImage, FaSpinner, FaCheckCircle, FaTimesCircle, FaEye, FaLock, FaLink, FaTrash } from 'react-icons/fa';

const VideoUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [videoData, setVideoData] = useState({
    title: '',
    description: '',
    category: 'Entertainment',
    tags: '',
    visibility: 'public'
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [customThumbnail, setCustomThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [useCustomThumbnail, setUseCustomThumbnail] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState('file'); // 'file' or 'url'
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const categories = [
    'All', 'Tech', 'Education', 'Music', 'Sports', 'Movies', 'Entertainment', 'Gaming', 'Fashion'
  ];

  const visibilityOptions = [
    { value: 'public', label: 'Public', icon: FaEye, description: 'Anyone can search for and view' },
    { value: 'unlisted', label: 'Unlisted', icon: FaLink, description: 'Anyone with the link can view' },
    { value: 'private', label: 'Private', icon: FaLock, description: 'Only you can view' }
  ];

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (selectedFile) => {
    setErrors({});
    
    // Validate file type
    if (!selectedFile.type.startsWith('video/')) {
      setErrors({ file: 'Please select a video file' });
      return;
    }

    // Validate file size (500MB limit as requested)
    if (selectedFile.size > 500 * 1024 * 1024) {
      setErrors({ file: 'File size must be less than 500MB' });
      return;
    }

    setFile(selectedFile);
    setUploadMethod('file');
    
    // Auto-generate title from filename if empty
    if (!videoData.title) {
      const filename = selectedFile.name.replace(/\.[^/.]+$/, '');
      setVideoData(prev => ({ ...prev, title: filename }));
    }

    // Generate auto thumbnail
    generateThumbnail(selectedFile);
  };

  const generateThumbnail = (videoFile) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(video.duration * 0.1, 10); // 10% or 10 seconds
    };
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        setThumbnail(blob);
        if (!useCustomThumbnail) {
          const url = URL.createObjectURL(blob);
          setThumbnailPreview(url);
        }
      }, 'image/jpeg', 0.8);
    };
    video.src = URL.createObjectURL(videoFile);
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors({ thumbnail: 'Please select an image file' });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ thumbnail: 'Thumbnail size must be less than 5MB' });
      return;
    }

    setCustomThumbnail(file);
    setUseCustomThumbnail(true);
    
    const url = URL.createObjectURL(file);
    setThumbnailPreview(url);
    
    // Clear thumbnail error
    if (errors.thumbnail) {
      setErrors(prev => ({ ...prev, thumbnail: '' }));
    }
  };

  const handleUrlSubmit = () => {
    setErrors({});
    
    if (!videoUrl.trim()) {
      setErrors({ url: 'Please enter a video URL' });
      return;
    }

    // Basic YouTube URL validation
    const youtubeRegex = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!youtubeRegex.test(videoUrl)) {
      setErrors({ url: 'Please enter a valid YouTube URL' });
      return;
    }

    setUploadMethod('url');
    setFile(null);
    
    // Extract video ID and generate embed URL
    let videoId = '';
    if (videoUrl.includes('youtu.be/')) {
      videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
    } else if (videoUrl.includes('youtube.com/watch?v=')) {
      videoId = videoUrl.split('v=')[1].split('&')[0];
    }
    
    if (videoId) {
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      setThumbnailPreview(thumbnailUrl);
    }
  };

  const switchToAutoThumbnail = () => {
    setUseCustomThumbnail(false);
    setCustomThumbnail(null);
    if (thumbnail) {
      const url = URL.createObjectURL(thumbnail);
      setThumbnailPreview(url);
    }
  };

  const removeThumbnail = () => {
    setCustomThumbnail(null);
    setThumbnailPreview(null);
    setUseCustomThumbnail(false);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVideoData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (uploadMethod === 'file' && !file) {
      newErrors.file = 'Please select a video file';
    } else if (uploadMethod === 'url' && !videoUrl.trim()) {
      newErrors.url = 'Please enter a video URL';
    }
    
    if (!videoData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (videoData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    
    if (videoData.description.length > 5000) {
      newErrors.description = 'Description must be less than 5000 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      
      if (uploadMethod === 'file') {
        formData.append('video', file);
      } else {
        formData.append('videoUrl', videoUrl);
      }
      
      formData.append('title', videoData.title);
      formData.append('description', videoData.description);
      formData.append('category', videoData.category);
      formData.append('tags', videoData.tags);
      formData.append('visibility', videoData.visibility);
      formData.append('uploadMethod', uploadMethod);

      // Add appropriate thumbnail
      if (useCustomThumbnail && customThumbnail) {
        formData.append('thumbnail', customThumbnail);
      } else if (thumbnail && uploadMethod === 'file') {
        formData.append('thumbnail', thumbnail);
      }

      const response = await axios.post('/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      setUploadStatus('success');
      
      // Redirect to video page after successful upload
      setTimeout(() => {
        navigate(`/video/${response.data.videoId}`);
      }, 2000);

    } catch (error) {
      setUploadStatus('error');
      setErrors({ submit: error.response?.data?.message || 'Upload failed' });
    }
  };

  const resetUpload = () => {
    setFile(null);
    setThumbnail(null);
    setCustomThumbnail(null);
    setThumbnailPreview(null);
    setVideoUrl('');
    setUseCustomThumbnail(false);
    setUploadMethod('file');
    setUploadProgress(0);
    setUploadStatus('idle');
    setErrors({});
    setVideoData({
      title: '',
      description: '',
      category: 'Entertainment',
      tags: '',
      visibility: 'public'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="text-center mb-8">
        <FaVideo className="mx-auto text-4xl text-red-600 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Video</h1>
        <p className="text-gray-600">Share your video with the world</p>
      </div>

      {uploadStatus === 'idle' && (
        <div className="space-y-8">
          {/* Upload Method Selection */}
          <div className="flex justify-center mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setUploadMethod('file')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  uploadMethod === 'file' 
                    ? 'bg-white text-red-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Upload File
              </button>
              <button
                onClick={() => setUploadMethod('url')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  uploadMethod === 'url' 
                    ? 'bg-white text-red-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Video URL
              </button>
            </div>
          </div>

          {/* File Upload Section */}
          {uploadMethod === 'file' && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-400 transition-colors">
              <div
                className={`${dragActive ? 'border-red-400 bg-red-50' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <FaCloudUploadAlt className="mx-auto text-5xl text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-xl text-gray-600">
                    Drag & drop your video here, or{' '}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      browse files
                    </button>
                  </p>
                  <p className="text-sm text-gray-500">
                    Supported formats: MP4, AVI, MOV, WMV • Max size: 500MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* URL Input Section */}
          {uploadMethod === 'url' && (
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Enter Video URL</h3>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleUrlSubmit}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Add URL
                </button>
              </div>
              {errors.url && (
                <p className="mt-2 text-sm text-red-600">{errors.url}</p>
              )}
            </div>
          )}

          {errors.file && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{errors.file}</p>
            </div>
          )}

          {/* File Preview */}
          {file && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaVideo className="text-2xl text-red-600" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      Size: {formatFileSize(file.size)} • Type: {file.type}
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetUpload}
                  className="text-red-600 hover:text-red-700"
                >
                  <FaTimesCircle className="text-xl" />
                </button>
              </div>
            </div>
          )}

          {/* Thumbnail Section */}
          {(file || (uploadMethod === 'url' && videoUrl)) && (
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Thumbnail</h3>
              
              <div className="flex gap-4 mb-4">
                <button
                  onClick={switchToAutoThumbnail}
                  className={`px-4 py-2 text-sm font-medium rounded-md border ${
                    !useCustomThumbnail
                      ? 'bg-red-50 border-red-300 text-red-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Auto-generated
                </button>
                <button
                  onClick={() => thumbnailInputRef.current?.click()}
                  className={`px-4 py-2 text-sm font-medium rounded-md border ${
                    useCustomThumbnail
                      ? 'bg-red-50 border-red-300 text-red-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Upload Custom
                </button>
              </div>

              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                className="hidden"
              />

              {thumbnailPreview && (
                <div className="relative inline-block">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-40 h-24 object-cover rounded-md border"
                  />
                  <button
                    onClick={removeThumbnail}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              )}

              {errors.thumbnail && (
                <p className="mt-2 text-sm text-red-600">{errors.thumbnail}</p>
              )}
            </div>
          )}

          {/* Video Details Form */}
          {(file || (uploadMethod === 'url' && videoUrl)) && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={videoData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter video title"
                    maxLength={100}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {videoData.title.length}/100 characters
                  </p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={videoData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {categories.filter(cat => cat !== 'All').map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={videoData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Tell viewers about your video"
                  maxLength={5000}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {videoData.description.length}/5000 characters
                </p>
              </div>

              {/* Tags and Visibility */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={videoData.tags}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="gaming, tutorial, funny (comma-separated)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visibility
                  </label>
                  <select
                    name="visibility"
                    value={videoData.visibility}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {visibilityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {errors.submit && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={resetUpload}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 font-medium"
                >
                  Upload Video
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Upload Progress */}
      {uploadStatus === 'uploading' && (
        <div className="text-center py-12">
          <FaSpinner className="animate-spin mx-auto text-4xl text-red-600 mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">Uploading your video</h2>
          <p className="text-gray-600 mb-6">Please don't close this page</p>
          
          <div className="max-w-xs mx-auto">
            <div className="bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">{uploadProgress}% complete</p>
          </div>

          {file && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg max-w-sm mx-auto">
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
            </div>
          )}
        </div>
      )}

      {/* Success State */}
      {uploadStatus === 'success' && (
        <div className="text-center py-12">
          <FaCheckCircle className="mx-auto text-5xl text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Complete!</h2>
          <p className="text-gray-600 mb-4">Your video has been uploaded and is being processed</p>
          <p className="text-sm text-gray-500">Redirecting to your video...</p>
        </div>
      )}

      {/* Error State */}
      {uploadStatus === 'error' && (
        <div className="text-center py-12">
          <FaTimesCircle className="mx-auto text-5xl text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Failed</h2>
          <p className="text-gray-600 mb-6">Something went wrong. Please try again.</p>
          <button
            onClick={resetUpload}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoUpload;
