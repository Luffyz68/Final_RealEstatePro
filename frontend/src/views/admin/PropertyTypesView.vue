<template>
  <div class="admin-types-page">
    <div class="page-header flex-between">
      <div>
        <h1>Property Category Management</h1>
        <p>Define property types and classifications</p>
      </div>
      <button class="btn btn-primary" @click="openModal">
        <i class="fa-solid fa-plus"></i> Add Property Type
      </button>
    </div>

    <!-- Table -->
    <div v-if="loading" class="loading-state text-center">
      <i class="fa-solid fa-circle-notch fa-spin"></i> Loading categories...
    </div>

    <div v-else class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Created Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!types.length">
            <td colspan="5" class="table-empty">No property types have been added yet.</td>
          </tr>
          <tr v-for="t in types" :key="t.id">
            <td>#{{ t.id }}</td>
            <td><strong>{{ t.name }}</strong></td>
            <td>{{ t.description || 'N/A' }}</td>
            <td>{{ new Date(t.created_at).toLocaleDateString() }}</td>
            <td>
              <button class="btn-icon text-secondary" title="Edit Type" @click="openEdit(t)"><i class="fa-solid fa-pen"></i></button>
              <button class="btn-icon text-danger" title="Delete Type" @click="confirmDelete(t.id)">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header flex-between">
          <h3>{{ editingId ? 'Edit Property Type' : 'Create Property Type' }}</h3>
          <button class="close-btn" @click="showModal = false">&times;</button>
        </div>
        <form @submit.prevent="handleSave" class="modal-form">
          <div class="form-group">
            <label>Name</label>
            <input type="text" v-model="name" placeholder="e.g. Duplex" required />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea v-model="description" rows="3"></textarea>
          </div>
          <button type="submit" class="btn btn-primary btn-block" :disabled="saving">
            <span v-if="saving"><i class="fa-solid fa-circle-notch fa-spin"></i> Saving...</span>
            <span v-else>Save Property Type</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import propertyTypeService from '@/services/propertyTypeService';
import { useUiStore } from '@/stores/uiStore';

const types = ref([]);
const loading = ref(true);
const showModal = ref(false);
const saving = ref(false);
const name = ref('');
const description = ref('');
const editingId = ref(null);
const ui = useUiStore();

const fetchTypes = async () => {
  loading.value = true;
  try {
    const res = await propertyTypeService.getPropertyTypes();
    if (res && res.data) types.value = res.data;
  } catch (err) {
    console.error('Failed to load types:', err);
  } finally {
    loading.value = false;
  }
};

const openModal = () => {
  editingId.value = null;
  name.value = '';
  description.value = '';
  showModal.value = true;
};

const openEdit = (type) => {
  editingId.value = type.id;
  name.value = type.name;
  description.value = type.description || '';
  showModal.value = true;
};

const handleSave = async () => {
  saving.value = true;
  try {
    if (editingId.value) await propertyTypeService.updatePropertyType(editingId.value, { name: name.value, description: description.value });
    else await propertyTypeService.createPropertyType({ name: name.value, description: description.value });
    showModal.value = false;
    await fetchTypes();
    ui.notify(editingId.value ? 'Property type updated.' : 'Property type created.');
  } catch (err) {
    ui.notify(err.response?.data?.message || 'Failed to save property type.', 'error');
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async (id) => {
  if (await ui.confirm({ title: 'Delete property type?', message: 'Types assigned to properties cannot be deleted.', confirmText: 'Delete type', danger: true })) {
    try {
      await propertyTypeService.deletePropertyType(id);
      await fetchTypes();
      ui.notify('Property type deleted.');
    } catch (err) {
      ui.notify(err.response?.data?.message || 'Failed to delete property type.', 'error');
    }
  }
};

onMounted(() => {
  fetchTypes();
});
</script>

<style scoped>
.page-header { margin-bottom: 2rem; }
.table-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
.data-table th { padding: 1rem; background: var(--background); border-bottom: 1px solid var(--border); color: var(--muted); font-size: 0.8rem; text-transform: uppercase; }
.data-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; }
.btn-icon { background: none; border: none; font-size: 1.1rem; cursor: pointer; }
.text-danger { color: var(--danger); }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.modal-card { background: var(--surface); border-radius: var(--radius-lg); width: 100%; max-width: 440px; padding: 2rem; box-shadow: var(--shadow-lg); }
.close-btn { background: none; font-size: 1.5rem; color: var(--muted); border: none; }
.modal-form { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
.btn-block { width: 100%; padding: 0.85rem; }
</style>
