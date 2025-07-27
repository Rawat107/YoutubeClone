import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file path and resolve .env location
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv to look in the parent directory (backend/)
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models and data after dotenv is configured
import Video from '../models/Video.js';
import sampleVideos from '../data/sampleVideos.js';

// Predefined sample comments for each video
const generateSampleComments = (videoTitle, category) => {
  const commentTemplates = {
    Education: [
      "Great tutorial! Very clear and easy to follow. Thanks for sharing!",
      "This helped me understand the concept so much better. Excellent explanation!",
      "Perfect pacing and great examples. Looking forward to more videos like this!",
      "Finally found a tutorial that makes sense. You're a great teacher!",
      "This is exactly what I was looking for. Bookmarked for future reference!"
    ],
    Tech: [
      "Amazing tech content! Really appreciate the detailed breakdown.",
      "This is so helpful for developers. Thanks for sharing your knowledge!",
      "Great insights into the latest technology trends. Keep it up!",
      "Your technical explanations are always on point. Subscribed!",
      "This will definitely help me in my next project. Thanks!"
    ],
    Music: [
      "This is so relaxing and peaceful. Perfect for studying!",
      "Beautiful music! This really helps me unwind after a long day.",
      "Love this! Playing this on repeat. Such great vibes.",
      "Perfect background music for work. Thank you for this!",
      "This music just hits different. So soothing and calming."
    ],
    Sports: [
      "Incredible moments! These highlights never get old.",
      "What an amazing compilation! Some truly legendary plays here.",
      "The skill level is insane! Thanks for putting this together.",
      "These are the moments that make sports so exciting to watch!",
      "Pure athleticism on display. Absolutely mind-blowing!"
    ],
    Movies: [
      "Can't wait for this to come out! The trailer looks incredible.",
      "This is going to be epic! Already planning to watch it opening night.",
      "The cinematography looks absolutely stunning. Really excited!",
      "This has all the makings of a blockbuster. Can't wait!",
      "The cast is perfect and the story looks amazing. So hyped!"
    ],
    Entertainment: [
      "This made my day! So funny and entertaining.",
      "I can't stop laughing! This is pure comedy gold.",
      "Perfect entertainment after a stressful day. Thanks for this!",
      "This is why I love this channel. Always quality content!",
      "Sharing this with all my friends. Too good not to share!"
    ],
    Gaming: [
      "Sick gameplay! Your skills are incredible.",
      "This is why I love gaming content. Amazing plays!",
      "The strategy here is next level. Learning so much!",
      "Epic gaming moments! This is pure entertainment.",
      "Your gaming setup must be insane. Great content!"
    ],
    Fashion: [
      "Love the style inspiration! Definitely trying some of these looks.",
      "Fashion goals! Your taste is impeccable.",
      "These trends are perfect for the season. Thanks for the inspiration!",
      "Great fashion content! Always learn something new from your videos.",
      "Your style advice is always on point. Keep the fashion content coming!"
    ]
  };

  const defaultComments = [
    "Great video! Really enjoyed watching this.",
    "Thanks for sharing this content. Very informative!",
    "Excellent work! Looking forward to more videos like this.",
    "This is really well done. Keep up the great work!",
    "Amazing content as always. You never disappoint!"
  ];

  const comments = commentTemplates[category] || defaultComments;
  
  // Select 3 random comments for each video
  const selectedComments = [];
  const usedIndexes = new Set();
  
  while (selectedComments.length < 3 && selectedComments.length < comments.length) {
    const randomIndex = Math.floor(Math.random() * comments.length);
    if (!usedIndexes.has(randomIndex)) {
      usedIndexes.add(randomIndex);
      selectedComments.push(comments[randomIndex]);
    }
  }

  // Create comment objects with sample data
  return selectedComments.map((text, index) => ({
    _id: new mongoose.Types.ObjectId(),
    text: text,
    user: `SampleUser${index + 1}`,
    userId: new mongoose.Types.ObjectId(), // Generate fake ObjectId for sample comments
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
    isSampleComment: true
  }));
};

const seedSampleVideos = async () => {
  try {
    // Verify environment variables are loaded
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not defined. Check your .env file path.');
    }

    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if sample videos already exist
    const existingCount = await Video.countDocuments({ isSampleData: true });
    if (existingCount > 0) {
      console.log(`📹 ${existingCount} sample videos are already imported`);
      console.log('🔄 Skipping seeding to avoid duplicates.');
      return;
    }

    console.log('🌱 Seeding sample videos with comments...');

    // Prepare sample videos for database with comments
    const videosToInsert = sampleVideos.map(video => {
      const sampleComments = generateSampleComments(video.title, video.category);
      
      return {
        title: video.title,
        description: video.description,
        videoUrl: video.youtubeUrl,
        thumbnailUrl: video.thumbnailUrl,
        views: video.views,
        likes: video.likes,
        dislikes: video.dislikes,
        category: video.category,
        uploadDate: new Date(video.uploadDate),
        channelName: video.channelName,
        isSampleData: true,
        comments: sampleComments,
        commentCount: sampleComments.length
      };
    });

    // Insert all sample videos at once
    const insertedVideos = await Video.insertMany(videosToInsert);
    console.log(`✅ Successfully seeded ${insertedVideos.length} sample videos!`);

    // Calculate total comments
    const totalComments = insertedVideos.reduce((sum, video) => sum + video.commentCount, 0);
    console.log(`💬 Added ${totalComments} sample comments across all videos!`);

    // Group by channel for summary
    const channelCounts = {};
    const channelComments = {};
    
    insertedVideos.forEach(video => {
      const channelName = video.channelName;
      channelCounts[channelName] = (channelCounts[channelName] || 0) + 1;
      channelComments[channelName] = (channelComments[channelName] || 0) + video.commentCount;
    });

    console.log('\n📊 Videos and comments per channel:');
    Object.entries(channelCounts).forEach(([channel, count]) => {
      console.log(`  • ${channel}: ${count} videos, ${channelComments[channel]} comments`);
    });

    console.log('\n🎉 Sample data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seeding
seedSampleVideos();
