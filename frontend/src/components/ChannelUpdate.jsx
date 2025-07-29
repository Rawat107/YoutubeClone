import { useState } from 'react';
import { FaTimes, FaImage, FaTrash } from 'react-icons/fa';
import axios from '../utils/axios';

// ChannelUpdate modal component for editing channel details
const ChannelUpdate = ({ channel, onClose, onUpdate }) => {

  // Initialize form state with current channel values or defaults
  const [formData, setFormData] = useState({
    name: channel?.name || '',
    username: channel?.username || '',
    description: channel?.description || '',
    banner: channel?.banner || '',
  });

  // Store validation errors and loading state
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Handle form input changes and clear error for that field
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Submit updated form data to the backend API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({}); // clear previous errors

    try {
      const response = await axios.put('/channels/my', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // If update is successful, pass updated data back to parent  
      onUpdate(response.data.channel);
    } catch (error) {
      // Handle validation or general errors returned from API
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.response?.data?.message || 'Failed to update channel' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Full-screen dark backdrop for modal
    <section className="fixed inset-0 bg-black/70 backdrop-blur-md bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <header className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Customize Channel</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.general && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{errors.general}</div>
            </div>
          )}

          {/* Channel name input */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Channel name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter your channel name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Username input with "@" prefix */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Channel username *
            </label>
            <div className="flex rounded-md shadow-sm">
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="channelname"
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          {/* Description textarea */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Tell viewers about your channel..."
            />
          </div>

          {/* Banner URL input with preview */}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            
            {/* Preview if URL is present */}
            {formData.banner && (
              <div className="relative mt-4">
                <img
                  src={formData.banner}
                  alt="Banner preview"
                  className="w-full h-24 object-cover rounded-lg border"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, banner: '' }))}
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

          {/* Form actions: Cancel and Submit */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium cursor-pointer text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Channel'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ChannelUpdate;
