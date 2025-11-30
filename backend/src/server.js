import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadRoutes from './routes/uploadRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import productRoutes from './routes/productRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    "http://localhost:5173",                  
    "https://invoice-pro-mu.vercel.app",      
    process.env.FRONTEND_URL                  
  ],
  credentials: true,
  methods: "GET,POST,PUT,DELETE"
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api', uploadRoutes);
app.use('/api', invoiceRoutes);
app.use('/api', productRoutes);
app.use('/api', customerRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Optional global unhandled error safety
process.on("unhandledRejection", err => {
  console.error("Unhandled Rejection:", err);
});


