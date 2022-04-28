import path from 'path';
import express, { NextFunction, Request, Response } from 'express';
import config from 'config';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import log from './utils/logger';
import connectDB from './utils/connectDB';
import productRouter from './routes/product.route';
import userRouter from './routes/user.route';
import sessionRouter from './routes/session.route';
import reviewRouter from './routes/review.route';
import categoryRouter from './routes/category.route';
import orderRouter from './routes/order.route';
import AppError from './utils/appError';
import errorHandler from './controller/error.controller';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import redisClient from './utils/connectRedis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.set('view engine', 'pug');
app.set('views', `${__dirname}/../views`);

// MIDDLEWARE
// 1. HTTP Headers

app.use(helmet());

// 2. Cookie parser
app.use(cookieParser());

// 3. Express body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// Server static files
app.use('/api/static', express.static(path.join(__dirname, '../public')));

// 4. Parameter Pollution
app.use(
  hpp({
    whitelist: ['avgRating', 'numRating', 'rating', 'price'],
  })
);

// 5. Input Sanitize
app.use(mongoSanitize());

// 6. Logger
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// 7. Trust Proxy
app.enable('trust proxy');

// 8. Cors
app.use(
  cors({
    origin: ['http://localhost:3000', 'localhost:3000'],
    credentials: true,
  })
);

// 9. Rate Limiter
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 99,
  message: 'Too many request from this IP, please try again after 1 hour',
  standardHeaders: true,
});

app.use('/api', limiter);

// ROUTES
app.use('/api/products', productRouter);
app.use('/api/users', userRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/orders', orderRouter);

// Test
app.get('/api/healthChecker', async (req, res) => {
  console.log(req.originalUrl);
  res.json({
    message: 'Welcome to NodeJs with Typescript',
    redisClient: await redisClient.get('key'),
  });
});

// UNHANDLED ROUTE
app.all('*', (req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.protocol}://${req.get('host')}`);
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// ERROR HANDLER
app.use(errorHandler);

const port = config.get<number>('port');
app.listen(port, () => {
  log.info(`Server started in ${process.env.NODE_ENV} mode on port: ${port}`);

  // CONNECT DB
  connectDB();
});
