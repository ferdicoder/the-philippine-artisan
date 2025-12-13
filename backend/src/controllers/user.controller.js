import { createHttpError } from '../utils/errorHandler.js';
import { listUsers, createUser, updateUser, deleteUser, findUserById } from '../models/user.model.js';

export function getMe(req, res) {
  const { id, name, email, role } = req.user;
  res.json({ id, name, email, role });
}

export function list(req, res) {
  const users = listUsers().map(({ passwordHash, ...rest }) => rest);
  res.json(users);
}

export function getById(req, res) {
  const user = findUserById(req.params.id);
  if (!user) throw createHttpError(404, 'User not found');
  const { passwordHash, ...rest } = user;
  res.json(rest);
}

export function create(req, res) {
  const { name, email, role, password } = req.body;
  if (!name || !email || !password) {
    throw createHttpError(400, 'name, email, password are required');
  }
  const validRoles = ['Admin', 'User'];
  if (role && !validRoles.includes(role)) {
    throw createHttpError(400, 'Invalid role');
  }
  const user = createUser({ name, email, role: role || 'User', password });
  const { passwordHash, ...rest } = user;
  res.status(201).json(rest);
}

export function update(req, res) {
  const { name, email, role, password } = req.body;
  const updated = updateUser(req.params.id, { name, email, role, password });
  if (!updated) throw createHttpError(404, 'User not found');
  const { passwordHash, ...rest } = updated;
  res.json(rest);
}

export function remove(req, res) {
  const ok = deleteUser(req.params.id);
  if (!ok) throw createHttpError(404, 'User not found');
  res.status(204).send();
}
