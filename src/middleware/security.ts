import { Request, Response, NextFunction } from 'express';
import { security } from '../lib/security';
import { rateLimit } from 'express-rate-limit';
import csrf from 'csurf';
import helmet from 'helmet';
import { ApiError } from '../utils/ApiError';

// Rate limiting configuration
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for authentication routes
export const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 failed attempts per hour
  message: 'Too many login attempts, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
});

// CSRF Protection
export const csrfProtection = csrf({
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    httpOnly: true
  }
});

// Security Headers Middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Add security headers
  Object.entries(security.securityHeaders).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  next();
};

// Input Sanitization Middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitize request body
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = security.sanitizeHtml(req.body[key]);
        }
      });
    }

    // Sanitize query parameters
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = security.sanitizeHtml(req.query[key] as string);
        }
      });
    }

    next();
  } catch (error) {
    next(new ApiError(400, 'Invalid input data'));
  }
};

// Advanced Security Configuration
export const securityMiddleware = [
  // Basic security headers
  helmet({
    contentSecurityPolicy: {
      directives: security.buildCSP()
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true
  }),

  // Custom security headers
  securityHeaders,

  // Input sanitization
  sanitizeInput,

  // Rate limiting
  rateLimiter,

  // CSRF Protection
  csrfProtection
];

// Error handler for CSRF token errors
export const handleCSRFError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      error: 'Invalid or missing CSRF token'
    });
  }
  next(err);
};

// Validate request origins
export const validateOrigin = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.get('origin');
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
  
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({
      error: 'Origin not allowed'
    });
  }
  
  next();
};

// Secure file upload configuration
export const fileUploadConfig = {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req: any, file: any, cb: Function) => {
    // Allow only specific mime types
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
};