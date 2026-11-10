<template>
  <div class="admin-locations-page">
    <div class="page-header flex-between">
      <div>
        <h1>Location Management</h1>
        <p>Manage provinces, cities, districts, and geographic coordinates</p>
      </div>
      <button class="btn btn-primary" @click="openModal">
        <i class="fa-solid fa-plus"></i> Add New Location
      </button>
    </div>

    <div v-if="loading" class="loading-state text-center">
      <i class="fa-solid fa-circle-notch fa-spin"></i> Loading locations...
    </div>

    <div v-else class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Province</th>
            <th>City</th>
            <th>District</th>
            <th>Commune</th>
            <th>Address</th>
            <th>Coordinates</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!locations.length">
            <td colspan="7" class="table-empty">No locations have been added yet.</td>
          </tr>
          <tr v-for="l in locations" :key="l.id">
            <td><strong>{{ l.province }}</strong></td>
            <td>{{ l.city }}</td>
            <td>{{ l.district || 'N/A' }}</td>
            <td>{{ l.commune || 'N/A' }}</td>
            <td>{{ l.address || 'N/A' }}</td>
            <td>
              <small v-if="l.latitude && l.longitude">{{ Number(l.latitude).toFixed(4) }}, {{ Number(l.longitude).toFixed(4) }}</small>
              <small v-else class="text-muted">None</small>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn-icon text-secondary" title="Edit Location" @click="openEdit(l)"><i class="fa-solid fa-pen"></i></button>
                <button class="btn-icon text-danger" title="Delete Location" @click="confirmDelete(l.id)">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header flex-between">
          <h3>{{ editingId ? 'Edit Location' : 'Create Location' }}</h3>
          <button class="close-btn" @click="showModal = false">&times;</button>
        </div>
        <form @submit.prevent="handleSave" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label>Province</label>
              <input type="text" v-model="form.province" required />
            </div>
            <div class="form-group">
              <label>City</label>
              <input type="text" v-model="form.city" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>District</label>
              <input type="text" v-model="form.district" />
            </div>
            <div class="form-group">
              <label>Commune</label>
              <input type="text" v-model="form.commune" />
            </div>
          </div>
          <div class="form-group">
            <label>Address</label>
            <input type="text" v-model="form.address" placeholder="Street name, #..." />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Latitude</label>
              <input type="number" step="any" v-model="form.latitude" />
            </div>
            <div class="form-group">
              <label>Longitude</label>
              <input type="number" step="any" v-model="form.longitude" />
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="saving">
            <span v-if="saving"><i class="fa-solid fa-circle-notch fa-spin"></i> Saving...</span>
            <span v-else>Save Location</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import locationService from '@/services/locationService';
import { useUiStore } from '@/stores/uiStore';

const locations = ref([]);
const loading = ref(true);
const showModal = ref(false);
const saving = ref(false);
const editingId = ref(null);
const ui = useUiStore();

const form = reactive({
  province: '',
  city: '',
  district: '',
  commune: '',
  address: '',
  latitude: '',
  longitude: ''
});

const fetchLocations = async () => {
  loading.value = true;
  try {
    const res = await locationService.getLocations();
    if (res && res.data) locations.value = res.data;
  } catch (err) {
    console.error('Failed to load locations:', err);
  } finally {
    loading.value = false;
  }
};

const openModal = () => {
  editingId.value = null;
  form.province = 'Phnom Penh';
  form.city = 'Phnom Penh';
  form.district = '';
  form.commune = '';
  form.address = '';
  form.latitude = '';
  form.longitude = '';
  showModal.value = true;
};

const openEdit = (location) => {
  editingId.value = location.id;
  Object.assign(form, {
    province: location.province, city: location.city, district: location.district || '', commune: location.commune || '',
    address: location.address || '', latitude: location.latitude ?? '', longitude: location.longitude ?? ''
  });
  showModal.value = true;
};

const handleSave = async () => {
  saving.value = true;
  try {
    if (editingId.value) await locationService.updateLocation(editingId.value, form);
    else await locationService.createLocation(form);
    showModal.value = false;
    await fetchLocations();
    ui.notify(editingId.value ? 'Location updated.' : 'Location created.');
  } catch (err) {
    ui.notify(err.response?.data?.message || 'Failed to save location.', 'error');
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async (id) => {
  if (await ui.confirm({ title: 'Delete location?', message: 'Locations assigned to properties cannot be deleted.', confirmText: 'Delete location', danger: true })) {
    try {
      await locationService.deleteLocation(id);
      await fetchLocations();
      ui.notify('Location deleted.');
    } catch (err) {
      ui.notify(err.response?.data?.message || 'Failed to delete location.', 'error');
    }
  }
};

onMounted(() => {
  fetchLocations();
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
.text-muted { color: var(--muted); }
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.modal-card { background: var(--surface); border-radius: var(--radius-lg); width: 100%; max-width: 520px; padding: 2rem; box-shadow: var(--shadow-lg); }
.close-btn { background: none; font-size: 1.5rem; color: var(--muted); border: none; }
.modal-form { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.btn-block { width: 100%; padding: 0.85rem; }
</style>
