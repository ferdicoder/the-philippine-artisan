import jwt from 'jsonwebtoken';
import { createHttpError } from '../utils/errorHandler.js';
import { findUserById } from '../models/user.model.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createHttpError(401, 'Missing or invalid Authorization header'));
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = findUserById(decoded.id);
    if (!user) return next(createHttpError(401, 'User no longer exists'));
    req.user = user;
    next();
  } catch (e) {
    return next(createHttpError(401, 'Invalid or expired token'));
  }
}

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return next(createHttpError(401, 'Unauthorized'));
    if (!allowedRoles.includes(req.user.role)) {
      return next(createHttpError(403, 'Forbidden: insufficient role'));
    }
    next();
  };
}
