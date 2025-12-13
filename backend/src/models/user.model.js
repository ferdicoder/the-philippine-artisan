import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.resolve(__dirname, '../../data/users.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_PATH)) {
    const adminPasswordHash = bcrypt.hashSync('admin123', 10);
    const seed = [
      { id: uuidv4(), name: 'Admin', email: 'admin@example.com', role: 'Admin', passwordHash: adminPasswordHash, createdAt: new Date().toISOString() },
      { id: uuidv4(), name: 'Demo User', email: 'user@example.com', role: 'User', passwordHash: bcrypt.hashSync('user123', 10), createdAt: new Date().toISOString() }
    ];
    fs.writeFileSync(DATA_PATH, JSON.stringify(seed, null, 2));
  }
}

function readAll() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

function writeAll(users) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(users, null, 2));
}

export function listUsers() {
  return readAll();
}

export function findUserByEmail(email) {
  return readAll().find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id) {
  return readAll().find(u => u.id === id);
}

export function createUser({ name, email, role = 'User', password }) {
  const users = readAll();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Email already exists');
  }
  const passwordHash = bcrypt.hashSync(password, 10);
  const user = { id: uuidv4(), name, email, role, passwordHash, createdAt: new Date().toISOString() };
  users.push(user);
  writeAll(users);
  return user;
}

export function updateUser(id, { name, email, role, password }) {
  const users = readAll();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return null;
  const existing = users[idx];
  if (name !== undefined) existing.name = name;
  if (email !== undefined) existing.email = email;
  if (role !== undefined) existing.role = role;
  if (password !== undefined && password !== '') existing.passwordHash = bcrypt.hashSync(password, 10);
  users[idx] = existing;
  writeAll(users);
  return existing;
}

export function deleteUser(id) {
  const users = readAll();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return false;
  users.splice(idx, 1);
  writeAll(users);
  return true;
}
