<template>
  <div class="agent-properties-page">
    <div class="page-header flex-between">
      <div>
        <h1>My Property Listings</h1>
        <p>Manage and create property listings assigned to your account</p>
      </div>
      <button class="btn btn-primary" @click="openCreateModal">
        <i class="fa-solid fa-plus"></i> Add New Property
      </button>
    </div>

    <!-- Table -->
    <div v-if="loading" class="loading-state text-center">
      <i class="fa-solid fa-circle-notch fa-spin"></i> Loading properties...
    </div>

    <div v-else class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Property</th>
            <th>Type</th>
            <th>Price</th>
            <th>Listing</th>
            <th>Status</th>
            <th>Approval</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!properties.length">
            <td colspan="7" class="table-empty text-center py-4 text-muted" style="text-align: center; padding: 2rem;">
              No property listings found. Click "Add New Property" to create one.
            </td>
          </tr>
          <tr v-for="p in properties" :key="p.id">
            <td>
              <div class="prop-flex">
                <img :src="p.main_image || placeholderImage" class="table-thumb" alt="" />
                <div>
                  <strong>{{ p.title }}</strong><br />
                  <small>{{ p.city }}, {{ p.province }}</small>
                </div>
              </div>
            </td>
            <td>{{ p.property_type_name }}</td>
            <td><strong>${{ isNaN(Number(p.price)) ? '0' : Number(p.price).toLocaleString() }}</strong></td>
            <td><span class="badge" :class="p.listing_type === 'sale' ? 'badge-sale' : 'badge-rent'">For {{ p.listing_type }}</span></td>
            <td><span class="status-chip" :class="'chip-' + p.status.toLowerCase()">{{ p.status }}</span></td>
            <td>
              <span class="status-chip" :class="'chip-' + (p.approval_status || 'pending').toLowerCase()">
                {{ p.approval_status || 'pending' }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <router-link :to="'/properties/' + p.id" class="btn-icon text-secondary" title="View Property">
                  <i class="fa-solid fa-eye"></i>
                </router-link>
                <button class="btn-icon text-secondary" title="Edit Property" @click="openEditModal(p)">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn-icon text-danger" title="Delete Property" @click="confirmDelete(p.id)">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal for Agent Create Property -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header flex-between">
          <h3>{{ editingId ? 'Edit Property' : 'Add New Property' }}</h3>
          <button class="close-btn" @click="showModal = false">&times;</button>
        </div>

        <form @submit.prevent="handleSaveProperty" class="modal-form">
          <div class="form-group">
            <label>Property Title</label>
            <input type="text" v-model="form.title" placeholder="e.g. Modern Condo Suite" required />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Price ($)</label>
              <input type="number" v-model="form.price" required />
            </div>
            <div class="form-group">
              <label>Listing Type</label>
              <select v-model="form.listing_type" required>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Property Type</label>
              <select v-model="form.property_type_id" required>
                <option v-for="t in propertyTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Location</label>
              <select v-model="form.location_id" required>
                <option v-for="l in locations" :key="l.id" :value="l.id">{{ l.address || l.commune }}, {{ l.city }}</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Bedrooms</label>
              <input type="number" v-model="form.bedrooms" min="0" />
            </div>
            <div class="form-group">
              <label>Bathrooms</label>
              <input type="number" v-model="form.bathrooms" min="0" />
            </div>
            <div class="form-group">
              <label>Area (sqm)</label>
              <input type="number" v-model="form.area" required />
            </div>
          </div>

          <div class="form-group">
            <label>Main Image</label>
            <div class="image-mode-tabs">
              <button 
                type="button" 
                class="mode-tab" 
                :class="{ active: mainImageMode === 'file' }" 
                @click="mainImageMode = 'file'"
              >
                <i class="fa-solid fa-upload"></i> Upload File
              </button>
              <button 
                type="button" 
                class="mode-tab" 
                :class="{ active: mainImageMode === 'url' }" 
                @click="mainImageMode = 'url'"
              >
                <i class="fa-solid fa-link"></i> Image URL
              </button>
            </div>

            <div v-if="mainImageMode === 'file'" class="file-upload-box">
              <input 
                type="file" 
                accept="image/jpeg,image/png,image/webp,image/gif" 
                @change="handleMainImageFileUpload" 
              />
              <small>Upload main property image file from your device</small>
            </div>
            <div v-else>
              <input type="url" v-model="form.main_image" placeholder="https://images.unsplash.com/..." />
            </div>

            <div v-if="form.main_image" class="main-image-preview">
              <img :src="form.main_image" alt="Main image preview" />
            </div>
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="form.description" rows="3"></textarea>
          </div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="saving">
            <span v-if="saving"><i class="fa-solid fa-circle-notch fa-spin"></i> Submitting...</span>
            <span v-else>{{ editingId ? 'Save Changes' : 'Create Property Listing' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import propertyService from '@/services/propertyService';
import propertyTypeService from '@/services/propertyTypeService';
import locationService from '@/services/locationService';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

const authStore = useAuthStore();
const ui = useUiStore();
const properties = ref([]);
const propertyTypes = ref([]);
const locations = ref([]);
const loading = ref(true);
const mainImageMode = ref('url');
const showModal = ref(false);
const saving = ref(false);
const editingId = ref(null);

const handleMainImageFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    ui.notify('File size must be 5MB or smaller.', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = (event) => {
    form.main_image = event.target.result;
  };
  reader.readAsDataURL(file);
};
const form = reactive({
  title: '',
  price: '',
  listing_type: 'sale',
  property_type_id: 1,
  location_id: 1,
  bedrooms: 3,
  bathrooms: 2,
  area: 200,
  main_image: '',
  description: ''
});

const fetchData = async () => {
  loading.value = true;
  try {
    const [pRes, ptRes, lRes] = await Promise.all([
      propertyService.getProperties({ agent_id: authStore.user?.id, limit: 50 }),
      propertyTypeService.getPropertyTypes(),
      locationService.getLocations()
    ]);
    if (pRes && pRes.data) properties.value = pRes.data;
    if (ptRes && ptRes.data) propertyTypes.value = ptRes.data;
    if (lRes && lRes.data) locations.value = lRes.data;
  } catch (err) {
    console.error('Failed to load agent property data:', err);
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  editingId.value = null;
  form.title = '';
  form.price = '';
  form.main_image = '';
  form.description = '';
  form.property_type_id = propertyTypes.value[0]?.id || 1;
  form.location_id = locations.value[0]?.id || 1;
  showModal.value = true;
};

const openEditModal = (p) => {
  editingId.value = p.id;
  Object.assign(form, {
    title: p.title,
    price: p.price,
    listing_type: p.listing_type,
    property_type_id: p.property_type_id,
    location_id: p.location_id,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area: p.area,
    main_image: p.main_image || '',
    description: p.description || ''
  });
  showModal.value = true;
};

const handleSaveProperty = async () => {
  saving.value = true;
  try {
    if (editingId.value) {
      await propertyService.updateProperty(editingId.value, form);
      ui.notify('Property listing updated successfully.');
    } else {
      await propertyService.createProperty(form);
      ui.notify('Property listing created successfully.');
    }
    showModal.value = false;
    await fetchData();
  } catch (err) {
    ui.notify(err.response?.data?.message || 'Failed to save property.', 'error');
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async (id) => {
  if (await ui.confirm({ title: 'Delete property?', message: 'This permanently removes your listing and its related activity.', confirmText: 'Delete property', danger: true })) {
    try {
      await propertyService.deleteProperty(id);
      await fetchData();
      ui.notify('Property deleted.');
    } catch (err) {
      ui.notify(err.response?.data?.message || 'Failed to delete property.', 'error');
    }
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.page-header { margin-bottom: 2rem; }
.table-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-sm); }
.data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
.data-table th { padding: 1rem; background: var(--background); border-bottom: 1px solid var(--border); color: var(--muted); font-size: 0.8rem; text-transform: uppercase; }
.data-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }

.prop-flex { display: flex; align-items: center; gap: 0.75rem; }
.table-thumb { width: 44px; height: 44px; border-radius: 6px; object-fit: cover; }
.status-chip { padding: 0.2rem 0.6rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700; text-transform: capitalize; }
.chip-available { background: #dcfce7; color: #166534; }
.chip-sold { background: #fee2e2; color: #991b1b; }
.chip-rented { background: #fef3c7; color: #92400e; }
.chip-pending { background: #fef3c7; color: #b45309; }
.chip-approved { background: #dcfce7; color: #166534; }
.chip-rejected { background: #fee2e2; color: #991b1b; }

.action-buttons { display: flex; gap: 0.5rem; }
.btn-icon { background: none; border: none; font-size: 1.1rem; cursor: pointer; padding: 0.3rem; }
.text-secondary { color: var(--secondary); }
.text-danger { color: var(--danger); }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.modal-card { background: var(--surface); border-radius: var(--radius-lg); width: 100%; max-width: 600px; padding: 2rem; box-shadow: var(--shadow-lg); max-height: 90vh; overflow-y: auto; }
.close-btn { background: none; font-size: 1.5rem; color: var(--muted); border: none; }
.modal-form { display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.btn-block { width: 100%; padding: 0.85rem; }

.image-mode-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}

.mode-tab {
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--background);
  color: var(--muted);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
}

.mode-tab.active {
  background: var(--secondary);
  color: #ffffff;
  border-color: var(--secondary);
}

.main-image-preview {
  margin-top: 0.6rem;
}

.main-image-preview img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid var(--border);
}
</style>
