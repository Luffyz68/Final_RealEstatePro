<template>
  <div class="admin-users-page">
    <div class="page-header flex-between">
      <div>
        <h1>User & Agent Management</h1>
        <p>Manage system accounts, create agents, and toggle status</p>
      </div>
      <button class="btn btn-primary" @click="openCreateModal">
        <i class="fa-solid fa-user-plus"></i> Add New User / Agent
      </button>
    </div>

    <!-- Filters -->
    <div class="toolbar-card flex-between">
      <div class="users-search-box">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" v-model="search" placeholder="Search name, email, phone..." @input="applyUserFilters" />
      </div>

      <div class="filter-controls">
        <select v-model="roleFilter" @change="applyUserFilters">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="agent">Agent</option>
          <option value="customer">Customer</option>
        </select>

        <select v-model="statusFilter" @change="applyUserFilters">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div v-if="loading" class="loading-state text-center">
      <i class="fa-solid fa-circle-notch fa-spin"></i> Loading users...
    </div>

    <div v-else class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Contact</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!users.length">
            <td colspan="6" class="table-empty">No users match the selected filters.</td>
          </tr>
          <tr v-for="u in users" :key="u.id">
            <td>
              <div class="user-cell">
                <img :src="u.profile_image || defaultAvatar" class="avatar" alt="" />
                <div>
                  <strong>{{ u.full_name }}</strong><br />
                  <small>{{ u.email }}</small>
                </div>
              </div>
            </td>
            <td>{{ u.phone || 'N/A' }}</td>
            <td>
              <span class="role-badge" :class="'role-' + u.role">{{ u.role }}</span>
            </td>
            <td>
              <span class="status-badge" :class="u.status === 'active' ? 'status-active' : 'status-inactive'">
                {{ u.status }}
              </span>
            </td>
            <td>{{ new Date(u.created_at).toLocaleDateString() }}</td>
            <td>
              <div class="action-buttons">
                <button class="btn-icon text-secondary" title="Edit Account" @click="openEditModal(u)"><i class="fa-solid fa-pen"></i></button>
                <button 
                  class="btn-icon" 
                  :title="u.status === 'active' ? 'Deactivate Account' : 'Activate Account'"
                  @click="toggleStatus(u)"
                >
                  <i :class="u.status === 'active' ? 'fa-solid fa-user-slash text-warning' : 'fa-solid fa-user-check text-success'"></i>
                </button>

                <button class="btn-icon text-danger" title="Delete User" @click="confirmDelete(u.id)">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="pagination.totalPages > 1" class="admin-pagination"><button class="btn btn-outline" :disabled="pagination.page === 1" @click="changePage(pagination.page - 1)">Previous</button><span>Page {{ pagination.page }} of {{ pagination.totalPages }}</span><button class="btn btn-outline" :disabled="pagination.page === pagination.totalPages" @click="changePage(pagination.page + 1)">Next</button></div>
    </div>

    <!-- Modal for Create/Edit User -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header flex-between">
          <h3>{{ editingId ? 'Edit Account' : 'Create New User / Agent' }}</h3>
          <button class="close-btn" @click="showModal = false">&times;</button>
        </div>

        <form @submit.prevent="handleSaveUser" class="modal-form">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" v-model="form.full_name" required />
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <input type="email" v-model="form.email" required />
          </div>

          <div class="form-group">
            <label>{{ editingId ? 'New Password (optional)' : 'Password' }}</label>
            <div class="password-input-wrapper">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                v-model="form.password" 
                :required="!editingId" 
                minlength="8" 
                autocomplete="new-password"
              />
              <button 
                type="button" 
                class="password-toggle-btn" 
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                :title="showPassword ? 'Hide password' : 'Show password'"
              >
                <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" v-model="form.phone" />
          </div>
          <div class="form-group"><label>Status</label><select v-model="form.status"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>

          <div class="form-group">
            <label>Role</label>
            <select v-model="form.role" required>
              <option value="customer">Customer</option>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="saving">
            <span v-if="saving"><i class="fa-solid fa-circle-notch fa-spin"></i> Saving...</span>
            <span v-else>{{ editingId ? 'Save Changes' : 'Create Account' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import userService from '@/services/userService';
import { useUiStore } from '@/stores/uiStore';

const users = ref([]);
const loading = ref(true);
const search = ref('');
const roleFilter = ref('');
const statusFilter = ref('');
const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
const ui = useUiStore();
const editingId = ref(null);
const pagination = reactive({ page: 1, limit: 10, totalPages: 1, total: 0 });

const showPassword = ref(false);
const showModal = ref(false);
const saving = ref(false);
const form = reactive({
  full_name: '',
  email: '',
  password: '',
  phone: '',
  role: 'agent',
  status: 'active'
});

const fetchUsers = async () => {
  loading.value = true;
  try {
    const params = {
      search: search.value,
      role: roleFilter.value,
      status: statusFilter.value,
      page: pagination.page,
      limit: pagination.limit
    };
    const res = await userService.getUsers(params);
    if (res && res.data) {
      users.value = res.data;
      if (res.pagination) Object.assign(pagination, res.pagination);
    }
  } catch (err) {
    console.error('Failed to fetch users:', err);
  } finally {
    loading.value = false;
  }
};

const changePage = (newPage) => { pagination.page = newPage; fetchUsers(); };
let searchTimer;
const applyUserFilters = () => {
  pagination.page = 1;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(fetchUsers, 250);
};

const openCreateModal = () => {
  editingId.value = null;
  form.full_name = '';
  form.email = '';
  form.password = '';
  form.phone = '';
  form.role = 'agent';
  form.status = 'active';
  showModal.value = true;
};

const openEditModal = (user) => {
  editingId.value = user.id;
  Object.assign(form, { full_name: user.full_name, email: user.email, password: '', phone: user.phone || '', role: user.role, status: user.status });
  showModal.value = true;
};

const handleSaveUser = async () => {
  saving.value = true;
  try {
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    if (editingId.value) await userService.updateUser(editingId.value, payload);
    else await userService.createUser(payload);
    showModal.value = false;
    await fetchUsers();
    ui.notify(editingId.value ? 'Account updated successfully.' : 'Account created successfully.');
  } catch (err) {
    ui.notify(err.response?.data?.message || 'Failed to save account.', 'error');
  } finally {
    saving.value = false;
  }
};

const toggleStatus = async (user) => {
  const newStatus = user.status === 'active' ? 'inactive' : 'active';
  try {
    await userService.updateUser(user.id, { status: newStatus });
    await fetchUsers();
    ui.notify(`Account ${newStatus === 'active' ? 'activated' : 'deactivated'}.`);
  } catch (err) {
    ui.notify(err.response?.data?.message || 'Failed to update user status.', 'error');
  }
};

const confirmDelete = async (id) => {
  if (await ui.confirm({ title: 'Delete account?', message: 'This action permanently removes this account and related customer records.', confirmText: 'Delete account', danger: true })) {
    try {
      await userService.deleteUser(id);
      await fetchUsers();
      ui.notify('Account deleted.');
    } catch (err) {
      ui.notify(err.response?.data?.message || 'Failed to delete user.', 'error');
    }
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.page-header { margin-bottom: 2rem; }
.toolbar-card { background: #ffffff; border: 1px solid #e8eaf0; padding: 1.25rem 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
.users-search-box { display: flex; align-items: center; gap: 0.6rem; background: #fafbfc; border: 1px solid #e6e8ee; border-radius: 10px; padding: 0 1rem; width: 320px; height: 42px; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; }
.users-search-box:focus-within { background: #ffffff; border-color: rgba(99, 91, 255, 0.45); box-shadow: 0 0 0 3px rgba(99, 91, 255, 0.08); }
.users-search-box i { color: #a0a7b4; font-size: 0.9rem; }
.users-search-box input { border: none; background: transparent; padding: 0; flex: 1; outline: none; font-size: 0.9rem; color: #303542; }
.users-search-box input::placeholder { color: #a8aeba; }
.filter-controls { display: flex; gap: 1rem; }
.filter-controls select { width: 140px; height: 42px; border-radius: 10px; border: 1px solid #e6e8ee; background: #ffffff; color: #303542; font-size: 0.9rem; padding: 0 1rem; cursor: pointer; outline: none; transition: border-color 0.2s; }
.filter-controls select:focus { border-color: #635bff; }

.table-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); }
.data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
.data-table th { padding: 1rem; background: var(--background); border-bottom: 1px solid var(--border); color: var(--muted); font-size: 0.8rem; text-transform: uppercase; }
.data-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }

.user-cell { display: flex; align-items: center; gap: 0.75rem; }
.avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
.role-badge { padding: 0.2rem 0.6rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.role-admin { background: #fee2e2; color: #991b1b; }
.role-agent { background: #fef3c7; color: #92400e; }
.role-customer { background: #dbeafe; color: #1e40af; }

.status-badge { padding: 0.2rem 0.6rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700; }
.status-active { background: #dcfce7; color: #166534; }
.status-inactive { background: #f1f5f9; color: #64748b; }

.action-buttons { display: flex; gap: 0.5rem; }
.btn-icon { background: none; border: none; font-size: 1.1rem; cursor: pointer; padding: 0.3rem; }
.text-warning { color: var(--warning); }
.text-success { color: var(--success); }
.text-danger { color: var(--danger); }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.modal-card { background: var(--surface); border-radius: var(--radius-lg); width: 100%; max-width: 480px; padding: 2rem; box-shadow: var(--shadow-lg); }
.close-btn { background: none; font-size: 1.5rem; color: var(--muted); border: none; }
.modal-form { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
.password-input-wrapper { position: relative; display: flex; align-items: center; }
.password-input-wrapper input { width: 100%; padding-right: 2.5rem; }
.password-toggle-btn { position: absolute; right: 0.75rem; background: transparent; border: none; color: var(--muted); font-size: 1rem; cursor: pointer; padding: 0.25rem; display: flex; align-items: center; justify-content: center; }
.password-toggle-btn:hover { color: var(--secondary); }
.btn-block { width: 100%; padding: 0.85rem; }
</style>
