/**
 * Admin Dashboard Script
 * Handles admin dashboard functionality and navigation
 */

document.addEventListener('DOMContentLoaded', function() {
  'use strict';

  // Protect admin page - redirect if not authenticated
  AdminModule.protectAdminPage();

  // Admin dashboard logic: fetch stats and users, support CRUD
  (function () {
    const API_BASE = 'http://localhost:4000/api';

    const token = localStorage.getItem('token');
    const headers = token
      ? { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };

    const el = (id) => document.getElementById(id);
    const logoutBtn = el('logoutBtn');
    const currentUserEl = el('currentUser');
    const statTotal = el('statTotal');
    const statAdmins = el('statAdmins');
    const recentUsers = el('recentUsers');
    const usersBody = el('usersBody');
    const searchInput = el('searchInput');
    const toast = el('toast');

    const userModal = el('userModal');
    const openCreateModal = el('openCreateModal');
    const closeModal = el('closeModal');
    const cancelBtn = el('cancelBtn');
    const userForm = el('userForm');
    const userId = el('userId');
    const nameInput = el('name');
    const emailInput = el('email');
    const roleSelect = el('role');
    const passwordInput = el('password');
    const modalTitle = el('modalTitle');

    function showToast(msg) {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('hidden'), 2500);
    }

    function ensureToken() {
      if (!token) {
        alert('Please login first.');
        window.location.href = 'SignIn.html';
        throw new Error('Missing token');
      }
    }

    function openModal() {
      userModal.classList.remove('hidden');
      userModal.setAttribute('aria-hidden', 'false');
    }
    function closeModalFn() {
      userModal.classList.add('hidden');
      userModal.setAttribute('aria-hidden', 'true');
      userForm.reset();
      userId.value = '';
    }

    async function fetchMe() {
      ensureToken();
      const res = await fetch(API_BASE + '/users/me', { headers });
      if (!res.ok) throw new Error('Failed to fetch current user');
      const me = await res.json();
      currentUserEl.textContent = `${me.name} (${me.role})`;
      if (me.role !== 'Admin') {
        alert('Admins only.');
        window.location.href = 'HomePage.html';
      }
    }

    async function fetchDashboard() {
      const res = await fetch(API_BASE + '/admin/dashboard', { headers });
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      const data = await res.json();
      statTotal.textContent = data.totalUsers;
      statAdmins.textContent = data.adminCount;
      recentUsers.innerHTML = data.recentUsers
        .map((u) => `<li>${u.name} • ${u.email}</li>`)
        .join('');
    }

    let USERS_CACHE = [];
    async function fetchUsers() {
      const res = await fetch(API_BASE + '/users', { headers });
      if (!res.ok) throw new Error('Failed to fetch users');
      const users = await res.json();
      USERS_CACHE = users;
      renderUsers(users);
    }

    function renderUsers(users) {
      const q = (searchInput?.value || '').toLowerCase();
      const filtered = users.filter(
        (u) => (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q)
      );
      usersBody.innerHTML = filtered
        .map(
          (u) => `
        <tr>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td>${new Date(u.createdAt).toLocaleString()}</td>
          <td>
            <button class="btn-small" data-edit="${u.id}">Edit</button>
            <button class="btn-small delete" data-delete="${u.id}">Delete</button>
          </td>
        </tr>
      `
        )
        .join('');
    }

    async function createUser(data) {
      const res = await fetch(API_BASE + '/users', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create user');
      showToast('User created');
      await fetchUsers();
    }

    async function updateUser(id, data) {
      const res = await fetch(API_BASE + '/users/' + id, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update user');
      showToast('User updated');
      await fetchUsers();
    }

    async function deleteUser(id) {
      if (!confirm('Delete this user?')) return;
      const res = await fetch(API_BASE + '/users/' + id, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Failed to delete user');
      showToast('User deleted');
      await fetchUsers();
    }

    // Events
    logoutBtn?.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'SignIn.html';
    });
    openCreateModal?.addEventListener('click', () => {
      modalTitle.textContent = 'Create User';
      passwordInput.placeholder = '(required)';
      openModal();
    });
    closeModal?.addEventListener('click', closeModalFn);
    cancelBtn?.addEventListener('click', closeModalFn);
    searchInput?.addEventListener('input', () => renderUsers(USERS_CACHE));

    usersBody?.addEventListener('click', (e) => {
      const t = e.target;
      const editId = t.getAttribute('data-edit');
      const delId = t.getAttribute('data-delete');
      if (editId) {
        const u = USERS_CACHE.find((x) => x.id === editId);
        if (!u) return;
        modalTitle.textContent = 'Update User';
        userId.value = u.id;
        nameInput.value = u.name;
        emailInput.value = u.email;
        roleSelect.value = u.role;
        passwordInput.value = '';
        passwordInput.placeholder = '(leave empty to keep)';
        openModal();
      } else if (delId) {
        deleteUser(delId);
      }
    });

    userForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        role: roleSelect.value,
      };
      const pwd = passwordInput.value.trim();
      try {
        if (userId.value) {
          if (pwd) payload.password = pwd;
          await updateUser(userId.value, payload);
        } else {
          if (!pwd) {
            alert('Password is required');
            return;
          }
          payload.password = pwd;
          await createUser(payload);
        }
        closeModalFn();
      } catch (err) {
        alert('Operation failed: ' + err.message);
      }
    });

    // Init
    (async function init() {
      try {
        await fetchMe();
        await fetchDashboard();
        await fetchUsers();
      } catch (err) {
        console.error(err);
        alert('Failed to load admin data. Please login as Admin.');
        window.location.href = 'SignIn.html';
      }
    })();
  })();
