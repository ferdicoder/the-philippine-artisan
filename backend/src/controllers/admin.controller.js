import { listUsers } from '../models/user.model.js';

export function dashboard(req, res) {
  const users = listUsers();
  const total = users.length;
  const admins = users.filter(u => u.role === 'Admin').length;
  const recent = users
    .map(({ passwordHash, ...rest }) => rest)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  res.json({ totalUsers: total, adminCount: admins, recentUsers: recent });
}
