import express from 'express';

const setupMiddleware = (app) => {
  app.use(express.json());
  // Add other middlewares like CORS, helmet etc. here if needed
};

export { setupMiddleware };
