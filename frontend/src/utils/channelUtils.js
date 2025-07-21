// utils/channelUtils.js

export const generateSeededRandom = (seed, min, max) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const normalized = Math.abs(hash) / 2147483647;
  return Math.floor(normalized * (max - min + 1)) + min;
};

export const generateSubscriberCount = (channelName) => {
  const seed = channelName || "default";
  return generateSeededRandom(seed, 100, 50000);
};

export const generateAvatarColor = (channelName) => {
  const colors = ["bg-purple-500", "bg-blue-500", "bg-green-500", "bg-amber-500"];
  const seed = channelName || "default";
  const index = seed.charCodeAt(0) % colors.length;
  return colors[index];
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

export const formatViews = (views) => {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + "M";
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + "K";
  }
  return views.toString();
};

// ADDED: Generate random duration function
export const generateRandomDuration = () => {
  const minutes = Math.floor(Math.random() * 15) + 1; // 1-15 minutes
  const seconds = Math.floor(Math.random() * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
