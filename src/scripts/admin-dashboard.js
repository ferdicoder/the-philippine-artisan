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
    const API_BASE = '/the-philippine-artisan/src/php/api';

    // Debug: Check if running from localhost
    if (window.location.protocol === 'file:') {
      alert('Error: You must access this page via http://localhost, not as a file. Please open http://localhost/the-philippine-artisan/src/Admin.html');
      return;
    }

    const token = localStorage.getItem('token');
    console.log('Token found:', token ? 'Yes (length: ' + token.length + ')' : 'No');
    console.log('Token value:', token ? token.substring(0, 50) + '...' : 'null');
    
    if (!token) {
      console.error('No token found in localStorage. Please login first.');
      alert('Please login first.');
      window.location.href = 'SignIn.html';
      return;
    }
    
    const headers = { 
      'Authorization': 'Bearer ' + token, 
      'Content-Type': 'application/json' 
    };

    const el = (id) => document.getElementById(id);
    const logoutBtn = el('logoutBtn');
    const sidebarLogout = el('sidebarLogout');
    const currentUserEl = el('currentUser');
    const sidebarAdminName = el('sidebarAdminName');
    const sidebarAdminEmail = el('sidebarAdminEmail');
    const adminAvatar = el('adminAvatar');
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
      const url = API_BASE + '/auth/me.php';
      console.log('Fetching:', url);
      console.log('Headers being sent:', JSON.stringify(headers));
      
      try {
        const res = await fetch(url, { 
          method: 'GET',
          headers: headers,
          credentials: 'same-origin'
        });
        console.log('Response status:', res.status);
        console.log('Response ok:', res.ok);
        console.log('Response headers:', [...res.headers.entries()]);
        
        const text = await res.text();
        console.log('Raw response:', text);
        
        if (!text) {
          throw new Error('Empty response from server');
        }
        
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseErr) {
          console.error('JSON parse error:', parseErr);
          console.error('Response text was:', text);
          throw new Error('Invalid JSON response from server');
        }
        
        console.log('Parsed data:', data);
        
        if (!data.success) {
          throw new Error(data.message || 'API returned error');
        }
        
        const me = data.data.user;
        console.log('User loaded:', me);
        
        if (currentUserEl) currentUserEl.textContent = `${me.name} (${me.role})`;
        
        // Populate sidebar admin info
        if (sidebarAdminName) sidebarAdminName.textContent = me.name;
        if (sidebarAdminEmail) sidebarAdminEmail.textContent = me.email;
        if (adminAvatar) {
          adminAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(me.name)}&background=243978&color=fff&size=150`;
        }
        
        if (me.role !== 'Admin') {
          alert('Admins only.');
          window.location.href = 'index.html';
        }
        
        return me;
      } catch (err) {
        console.error('Fetch exception:', err.message);
        throw err;
      }
    }

    async function fetchDashboard() {
      const res = await fetch(API_BASE + '/admin/dashboard.php', { headers });
      const data = await res.json();
      if (!res.ok) {
        console.error('fetchDashboard error:', data);
        throw new Error(data.message || 'Failed to fetch dashboard');
      }
      statTotal.textContent = data.data.stats.totalUsers;
      statAdmins.textContent = data.data.stats.totalAdmins;
      recentUsers.innerHTML = data.data.recentUsers
        .map((u) => `<li>${u.name} • ${u.email}</li>`)
        .join('');
    }

    let USERS_CACHE = [];
    async function fetchUsers() {
      const res = await fetch(API_BASE + '/users/index.php', { headers });
      const data = await res.json();
      if (!res.ok) {
        console.error('fetchUsers error:', data);
        throw new Error(data.message || 'Failed to fetch users');
      }
      const users = data.data.users;
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
          <td><span class="role-badge ${u.role === 'Admin' ? 'admin' : 'user'}">${u.role}</span></td>
          <td>${new Date(u.createdAt).toLocaleString()}</td>
          <td>
            <button class="btn-small ${u.role === 'Admin' ? 'remove-admin' : 'make-admin'}" data-role="${u.id}" data-current="${u.role}">
              ${u.role === 'Admin' ? 'Remove Admin' : 'Make Admin'}
            </button>
            <button class="btn-small" data-edit="${u.id}">Edit</button>
            <button class="btn-small delete" data-delete="${u.id}">Delete</button>
          </td>
        </tr>
      `
        )
        .join('');
    }

    async function createUser(data) {
      const res = await fetch(API_BASE + '/users/index.php', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create user');
      showToast('User created');
      await fetchUsers();
    }

    async function updateUser(id, data) {
      const res = await fetch(API_BASE + '/users/user.php?id=' + id, {
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
      const res = await fetch(API_BASE + '/users/user.php?id=' + id, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Failed to delete user');
      showToast('User deleted');
      await fetchUsers();
    }

    async function toggleAdminRole(id, currentRole) {
      const newRole = currentRole === 'Admin' ? 'User' : 'Admin';
      const confirmMsg = currentRole === 'Admin' 
        ? 'Remove admin privileges from this user?' 
        : 'Grant admin privileges to this user?';
      
      if (!confirm(confirmMsg)) return;
      
      const res = await fetch(API_BASE + '/users/user.php?id=' + id, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error('Failed to update user role');
      showToast(`User role changed to ${newRole}`);
      await fetchDashboard();
      await fetchUsers();
    }

    // Events
    logoutBtn?.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'SignIn.html';
    });
    sidebarLogout?.addEventListener('click', () => {
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
      const roleId = t.getAttribute('data-role');
      const currentRole = t.getAttribute('data-current');
      
      if (roleId && currentRole) {
        toggleAdminRole(roleId, currentRole);
      } else if (editId) {
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
        console.log('=== Admin Dashboard Initialization ===');
        console.log('API Base:', API_BASE);
        console.log('Current URL:', window.location.href);
        console.log('Protocol:', window.location.protocol);
        
        await fetchMe();
        await fetchDashboard();
        await fetchUsers();
        console.log('=== Dashboard loaded successfully ===');
      } catch (err) {
        console.error('Admin dashboard error:', err);
        console.error('Error stack:', err.stack);
        alert('Failed to load admin data: ' + err.message + '\n\nPlease check the browser console (F12) for details.');
        // Only redirect if it's an auth error
        if (err.message.includes('token') || err.message.includes('auth') || err.message.includes('401')) {
          window.location.href = 'SignIn.html';
        }
      }
    })();
  })();
});

