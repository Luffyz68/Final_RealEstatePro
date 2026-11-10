<template>
  <div class="services-page container section">
    <div class="page-header flex-between">
      <div>
        <h1>My Real Estate Service Requests</h1>
        <p>Request professional inspection, valuation, cleaning, and legal services</p>
      </div>
      <button class="btn btn-primary" @click="showModal = true">
        <i class="fa-solid fa-plus"></i> New Service Request
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state text-center">
      <i class="fa-solid fa-circle-notch fa-spin"></i> Loading service requests...
    </div>

    <!-- List -->
    <div v-else-if="requests.length > 0" class="requests-list">
      <div v-for="req in requests" :key="req.id" class="request-card">
        <div class="request-header flex-between">
          <div>
            <h3><i class="fa-solid fa-wrench"></i> {{ formatServiceType(req.service_type) }}</h3>
            <p v-if="req.property_title" class="prop-link">Property: {{ req.property_title }}</p>
          </div>
          <span class="badge-status" :class="'status-' + req.status.toLowerCase()">
            {{ req.status.replace('_', ' ') }}
          </span>
        </div>
        <p class="desc-text">{{ req.description }}</p>
        <div class="request-footer flex-between">
          <small><i class="fa-regular fa-calendar"></i> Preferred Date: {{ req.preferred_date || 'Flexible' }}</small>
          <small class="date-text">Submitted: {{ new Date(req.created_at).toLocaleDateString() }}</small>
        </div>
        <button v-if="req.status === 'pending'" class="btn btn-outline" @click="cancelRequest(req.id)">Cancel request</button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state text-center">
      <i class="fa-solid fa-wrench empty-icon"></i>
      <h3>No service requests submitted yet</h3>
      <p>Submit a request for inspection, valuation, maintenance, or legal consultation.</p>
      <button class="btn btn-primary" style="margin-top: 1rem;" @click="showModal = true">
        Create Service Request
      </button>
    </div>

    <!-- Modal for New Request -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header flex-between">
          <h3>Request Real Estate Service</h3>
          <button class="close-btn" @click="showModal = false">&times;</button>
        </div>
        <form @submit.prevent="handleCreateRequest" class="modal-form">
          <div class="form-group">
            <label>Service Type</label>
            <select v-model="form.service_type" required>
              <option value="property_inspection">Property Inspection</option>
              <option value="property_maintenance">Property Maintenance</option>
              <option value="cleaning">Cleaning</option>
              <option value="valuation">Valuation</option>
              <option value="legal_consultation">Legal Consultation</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label>Preferred Date</label>
            <input type="date" v-model="form.preferred_date" />
          </div>

          <div class="form-group">
            <label>Service Description & Details</label>
            <textarea v-model="form.description" rows="4" placeholder="Describe what service you require..." required></textarea>
          </div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="submitting">
            <span v-if="submitting"><i class="fa-solid fa-circle-notch fa-spin"></i> Submitting...</span>
            <span v-else>Submit Service Request</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import serviceRequestService from '@/services/serviceRequestService';
import { useUiStore } from '@/stores/uiStore';

const requests = ref([]);
const loading = ref(true);
const showModal = ref(false);
const submitting = ref(false);
const ui = useUiStore();

const form = reactive({
  service_type: 'property_inspection',
  preferred_date: '',
  description: ''
});

const formatServiceType = (t) => {
  return t ? t.replace('_', ' ').toUpperCase() : '';
};

const fetchRequests = async () => {
  loading.value = true;
  try {
    const res = await serviceRequestService.getServiceRequests();
    if (res && res.data) {
      requests.value = res.data;
    }
  } catch (err) {
    console.error('Failed to load service requests:', err);
  } finally {
    loading.value = false;
  }
};

const handleCreateRequest = async () => {
  submitting.value = true;
  try {
    await serviceRequestService.createServiceRequest({
      service_type: form.service_type,
      preferred_date: form.preferred_date,
      description: form.description
    });
    showModal.value = false;
    form.description = '';
    await fetchRequests();
    ui.notify('Service request submitted successfully.');
  } catch (err) {
    ui.notify(err.response?.data?.message || 'Failed to submit request.', 'error');
  } finally {
    submitting.value = false;
  }
};

const cancelRequest = async (id) => {
  if (!await ui.confirm({ title: 'Cancel service request?', message: 'This request will be marked as cancelled.', confirmText: 'Cancel request', danger: true })) return;
  try {
    await serviceRequestService.updateServiceRequest(id, { status: 'cancelled' });
    await fetchRequests();
    ui.notify('Service request cancelled.');
  } catch (error) { ui.notify(error.response?.data?.message || 'Could not cancel this request.', 'error'); }
};

onMounted(() => {
  fetchRequests();
});
</script>

<style scoped>
.page-header { margin-bottom: 2.5rem; }
.requests-list { display: flex; flex-direction: column; gap: 1.5rem; }
.request-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; box-shadow: var(--shadow-sm); }
.request-header h3 { font-size: 1.15rem; color: var(--primary); }
.prop-link { color: var(--secondary); font-size: 0.9rem; margin-top: 0.2rem; }
.badge-status { padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.status-pending { background: #fef3c7; color: #92400e; }
.status-in_progress { background: #dbeafe; color: #1e40af; }
.status-completed { background: #dcfce7; color: #166534; }
.status-cancelled { background: #f1f5f9; color: #475569; }
.desc-text { margin: 1rem 0; color: var(--text); background: var(--background); padding: 1rem; border-radius: var(--radius-sm); }
.request-footer { color: var(--muted); font-size: 0.85rem; border-top: 1px solid var(--border); padding-top: 0.75rem; }
.empty-state { padding: 5rem 2rem; background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius); }
.empty-icon { font-size: 4rem; color: var(--muted); margin-bottom: 1rem; }

.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.modal-card { background: var(--surface); border-radius: var(--radius-lg); width: 100%; max-width: 500px; padding: 2rem; box-shadow: var(--shadow-lg); }
.modal-header h3 { font-size: 1.25rem; }
.close-btn { background: none; font-size: 1.5rem; color: var(--muted); border: none; }
.modal-form { display: flex; flex-direction: column; gap: 1.25rem; margin-top: 1.25rem; }
.btn-block { width: 100%; padding: 0.85rem; }
</style>
