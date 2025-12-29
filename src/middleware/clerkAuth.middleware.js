import { verifyToken } from '@clerk/backend';
import { ENV } from '../config/env.js';
import logger from '../config/logger.js';

export const clerkTokenAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const token = authHeader.replace(/^Bearer\s*/i, '').trim();

    // console.log('token-middle', token);
    if (!token) {
      return res
        .status(401)
        .json({ error: 'unauthorized', message: 'Authentication required' });
    }

    // verify the token
    try {
      if (!ENV.CLERK_SECRET_KEY) {
        logger.error('CLERK_SECRET_KEY is not configured');
        return res.status(500).json({ error: 'Server configuration error' });
      }

      const decoded = await verifyToken(token, {
        secretKey: ENV.CLERK_SECRET_KEY,
      });
      // console.log('decoded', decoded);

      const clerkUserId = decoded.sub; // Clerk user ID 在 sub 字段中

      // 将验证后的用户 ID 附加到 req 对象
      req.clerk = {
        userId: clerkUserId,
      };

      next();
    } catch (err) {
      logger.warn('Invalid Clerk token', {
        error: err.message,
        path: req.path,
        ip: req.ip,
      });
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    logger.error('Error in clerkTokenAuth middleware', {
      error: error.message,
      stack: error.stack,
      path: req.path,
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
};
