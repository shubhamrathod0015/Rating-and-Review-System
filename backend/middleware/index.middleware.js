import express from 'express';
import cors from 'cors';

const setupMiddleware = (app) => {
   app.use(cors({ origin: 'http://localhost:5173' }));
  app.use(express.json());

};

export { setupMiddleware };
