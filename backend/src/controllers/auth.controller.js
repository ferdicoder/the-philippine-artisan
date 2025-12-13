import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createHttpError } from '../utils/errorHandler.js';
import { findUserByEmail, createUser } from '../models/user.model.js';

function signToken(user) {
  const payload = { id: user.id, role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    throw createHttpError(400, 'Email and password are required');
  }
  const user = findUserByEmail(email);
  if (!user) {
    throw createHttpError(401, 'Invalid credentials');
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    throw createHttpError(401, 'Invalid credentials');
  }
  const token = signToken(user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}

export async function logout(req, res) {
  // With stateless JWT, logout is client-side (delete token). We respond success.
  res.json({ message: 'Logged out' });
}

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw createHttpError(400, 'name, email, password are required');
  }
  const existing = findUserByEmail(email);
  if (existing) {
    throw createHttpError(409, 'Email already registered');
  }
  // Self-signup users always get role 'User'
  const user = createUser({ name, email, role: 'User', password });
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
  const { passwordHash, ...safe } = user;
  res.status(201).json({ token, user: safe });
}
