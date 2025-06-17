import express from 'express';
import { connectDB } from './config/database.js';
import app from './app.js';
import seed from './prisma/seed.js';

const PORT = process.env.PORT || 5000;

// Add this function to check for port availability
function checkPort(port) {
  return new Promise((resolve) => {
    const server = express()
      .listen(port, () => {
        server.close();
        resolve(true);
      })
      .on('error', () => {
        resolve(false);
      });
  });
}

async function startServer() {
  try {
    await connectDB();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Running seed in development mode...');
      await seed();
    }

    // Check if port is available
    const portAvailable = await checkPort(PORT);
    
    if (!portAvailable) {
      const newPort = Number(PORT) + 1;
      console.warn(`Port ${PORT} is in use. Trying port ${newPort}...`);
      app.listen(newPort, () => {
        console.log(`Server running on port ${newPort}`);
      });
    } else {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
