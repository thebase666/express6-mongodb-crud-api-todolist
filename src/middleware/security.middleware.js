import { aj } from '../config/arcjet.js';
import logger from '../config/logger.js';
import { slidingWindow } from '@arcjet/node';

const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest';

    let limit;
    switch (role) {
      case 'admin':
        limit = 20;
        break;
      case 'user':
        limit = 10;
        break;
      case 'guest':
        limit = 5;
        break;
      default:
        limit = 5;
    }

    // throw new Error('test');
    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE', // LIVE mode ensures rate limiting works in both production and development
        interval: '1m',
        max: limit,
        name: `${role}-rate-limit`,
      })
    );

    const decision = await client.protect(req);

    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn('Bot request blocked', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        role: role,
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: 'Automated requests are not allowed',
      });
    }

    // Shield protection, SQL injection, XSS, CSRF
    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Shield blocked request - potential attack detected', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
        role: role,
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: 'Request blocked by security policy',
      });
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      // 记录速率限制警告
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        role: role,
        limit: limit,
      });

      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Maximum ${limit} requests per minute for ${role} role.`,
      });
    }

    next();
  } catch (error) {
    logger.error('Security middleware error', {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      path: req.path,
    });

    next();
  }
};

export default securityMiddleware;
