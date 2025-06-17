const express = require('express');
const { setupMiddleware } = require('./middleware');
import express from 'express';
import { setupMiddleware } from './middleware/index.js';
import routes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// Setup middleware
setupMiddleware(app);

// Routes
app.use('/api/reviews', routes);

// Error handling middleware
app.use(errorHandler);

export default app;
