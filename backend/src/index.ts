import express from 'express';
import cors from 'cors';
import emailRoutes from './routes/email';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/email', emailRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 