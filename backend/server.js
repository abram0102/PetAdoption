import express from 'express';
import cors from 'cors';
import pet from './api/pet.route.js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/pet', pet);

app.use('*', (req, res) => {
  res.status(404).json({ error: "not found" });
});

export default app;