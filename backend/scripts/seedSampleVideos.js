// scripts/seedSampleVideos.js
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

const seedSampleVideos = async () => {
  try {
    // Verify environment variables are loaded
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not defined. Check your .env file path.');
    }

    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if sample videos already exist
    const existingCount = await Video.countDocuments({ isSampleData: true });
    if (existingCount > 0) {
      console.log(` ${existingCount} sample videos are already imported`);
      console.log('Skipping seeding to avoid duplicates.');
      return;
    }

    console.log(' Seeding sample videos...');

    // Prepare sample videos for database
    const videosToInsert = sampleVideos.map(video => ({
      title: video.title,
      description: video.description,
      videoUrl: video.youtubeUrl,
      thumbnailUrl: video.thumbnailUrl,
      views: video.views,
      likes: video.likes,
      dislikes: video.dislikes,
      category: video.category,
      uploadDate: new Date(video.uploadDate),
      channelName: video.channelName, // Store channel name directly
      isSampleData: true, // Mark as sample data
      // No channelId or userId needed for sample data
    }));

    // Insert all sample videos at once
    const insertedVideos = await Video.insertMany(videosToInsert);
    
    console.log(` Successfully seeded ${insertedVideos.length} sample videos!`);
    
    // Group by channel for summary
    const channelCounts = {};
    insertedVideos.forEach(video => {
      channelCounts[video.channelName] = (channelCounts[video.channelName] || 0) + 1;
    });
    
    console.log('\n Videos per channel:');
    Object.entries(channelCounts).forEach(([channel, count]) => {
      console.log(`  • ${channel}: ${count} videos`);
    });

  } catch (error) {
    console.error(' Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the seeding
seedSampleVideos();
