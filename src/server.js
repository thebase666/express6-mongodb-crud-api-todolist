import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from './config/logger.js';
import helmet from 'helmet';
import morgan from 'morgan';
import securityMiddleware from './middleware/security.middleware.js';
import { clerkMiddleware } from '@clerk/express';
import { clerkClient, requireAuth, getAuth } from '@clerk/express';
import { clerkTokenAuth } from './middleware/clerkAuth.middleware.js';

import { ENV } from './config/env.js';
import { connectDB } from './config/database.js';
import todoRoutes from './routes/todo.routes.js';

const app = express();
app.use(helmet()); // security middleware, protects against common web vulnerabilities like XSS, etc.
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(securityMiddleware); // arcjet middleware
app.use(clerkMiddleware());

// morgan：get http request info
// morgan captures request info and passes it to logger
app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);

// Use requireAuth() to protect this route
// If user isn't authenticated, requireAuth() will redirect back to the homepage /
app.post('/p', requireAuth(), async (req, res) => {
  // Use `getAuth()` to get the user's `userId`
  const { userId } = getAuth(req);
  console.log('userId-p', userId);
  // Use Clerk's JS Backend SDK to get the user's User object
  const user = await clerkClient.users.getUser(userId);

  return res.json({ user });
});

// manually verify token middleware, can add some custom logic in the middleware.
app.post('/p3', clerkTokenAuth, async (req, res) => {
  const { userId } = getAuth(req);
  console.log('Verified userId:', userId);
  const user = await clerkClient.users.getUser(userId);
  return res.json({ user });
});

app.use('/todos', clerkTokenAuth, todoRoutes);

app.get('/', (req, res) => res.send('Hello from server'));

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  logger.error('Unhandled error', {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
    },
    request: {
      method: req.method,
      url: req.url,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.body,
      query: req.query,
      params: req.params,
    },
    timestamp: new Date().toISOString(),
  });
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const startServer = async () => {
  try {
    await connectDB();

    const PORT = ENV.PORT || 3000;

    if (ENV.NODE_ENV === 'production') {
      app.listen(PORT, '0.0.0.0', () => {
        logger.info(`Production server is running on PORT: ${PORT}`);
        console.log(`Production server is running on PORT: ${PORT}`);
      });
    } else {
      app.listen(PORT, () => {
        console.log(`Development server is up and running on PORT: ${PORT}`);
      });
    }
  } catch (error) {
    logger.error('Failed to start server:', {
      error: error.message,
      stack: error.stack,
    });
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
