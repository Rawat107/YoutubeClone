import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaImage, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';

const CreateChannel = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    description: '',
    banner: '', // Added banner field
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    console.log("Submitting form:", formData);

    try {
      // Send JSON data instead of FormData
      const response = await axios.post('/channels', {
        name: formData.name,
        username: formData.username,
        description: formData.description,
        banner: formData.banner, // now it's just a URL string
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Navigate to the newly created channel
      navigate(`/channel/${response.data.channel.username}`);
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message?.includes('already have a channel')) {
        // If they already have a channel, get it and navigate there
        try {
          const channelResponse = await axios.get('/channels/my');
          navigate(`/channel/${channelResponse.data.channel.username}`);
        } catch (channelError) {
          setErrors({ general: 'You already have a channel but we couldn\'t find it.' });
        }
      } else {
        setErrors({ general: error.response?.data?.message || 'Failed to create channel' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your channel
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Set up your YouTube channel to start sharing your content
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{errors.general}</div>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Channel name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your channel name"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Channel username *
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  @
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="flex-1 appearance-none rounded-none rounded-r-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="channelname"
                />
              </div>
              {errors.username && (
                <p className="mt-2 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Tell viewers about your channel..."
              />
            </div>

            {/* NEW: Banner Upload Section */}
            <div>
              <label htmlFor="banner" className="block text-sm font-medium text-gray-700 mb-2">
                Channel Banner URL <span className="text-gray-400 text-xs">(optional)</span>
              </label>

              <input
                id="banner"
                name="banner"
                type="text"
                value={formData.banner}
                onChange={handleChange}
                placeholder="Paste image URL (e.g. https://...)"
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              />

              {/* Preview if URL is present */}
              {formData.banner && (
                <div className="relative mt-4">
                  <img
                    src={formData.banner}
                    alt="Banner preview"
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, banner: '' }))
                    }
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              )}

              {errors.banner && (
                <p className="mt-2 text-sm text-red-600">{errors.banner}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Creating...' : 'Create Channel'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateChannel;