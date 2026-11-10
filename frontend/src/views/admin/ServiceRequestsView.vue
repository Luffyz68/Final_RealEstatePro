<template>
  <div class="admin-services-page">
    <div class="page-header">
      <h1>Service Request Management</h1>
      <p>Manage customer inspection, valuation, cleaning, and maintenance requests</p>
    </div>
    <div class="toolbar-card admin-toolbar"><div class="search-box"><i class="fa-solid fa-magnifying-glass"></i><input v-model="search" placeholder="Search customer, service, or property…" /></div><select v-model="statusFilter"><option value="">All statuses</option><option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>

    <div v-if="loading" class="loading-state text-center">
      <i class="fa-solid fa-circle-notch fa-spin"></i> Loading service requests...
    </div>

    <div v-else class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Service Type</th>
            <th>Description</th>
            <th>Preferred Date</th>
            <th>Status</th>
            <th>Submitted</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!filteredRequests.length">
            <td colspan="7" class="table-empty">No service requests match the selected filters.</td>
          </tr>
          <tr v-for="s in filteredRequests" :key="s.id">
            <td>
              <strong>{{ s.customer_name }}</strong><br />
              <small class="text-muted">{{ s.customer_email }}</small>
            </td>
            <td><strong>{{ formatType(s.service_type) }}</strong></td>
            <td><div class="desc-box">{{ s.description }}</div></td>
            <td>{{ s.preferred_date || 'Flexible' }}</td>
            <td>
              <select 
                v-model="s.status" 
                class="status-select" 
                :class="'status-' + s.status.toLowerCase()"
                @change="updateStatus(s)"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </td>
            <td>{{ new Date(s.created_at).toLocaleDateString() }}</td>
            <td><button v-if="['completed','cancelled'].includes(s.status)" class="btn-icon text-danger" title="Delete request" @click="removeRequest(s.id)"><i class="fa-solid fa-trash"></i></button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import serviceRequestService from '@/services/serviceRequestService';
import { useUiStore } from '@/stores/uiStore';
import { formatStatus } from '@/utils/formatters';

const requests = ref([]);
const loading = ref(true);
const search = ref('');
const statusFilter = ref('');
const ui = useUiStore();

const formatType = formatStatus;
const filteredRequests = computed(() => requests.value.filter((item) => {
  const term = search.value.toLowerCase();
  return (!statusFilter.value || item.status === statusFilter.value) && (!term || [item.customer_name, item.service_type, item.property_title, item.description].some((value) => String(value || '').toLowerCase().includes(term)));
}));

const fetchRequests = async () => {
  loading.value = true;
  try {
    const res = await serviceRequestService.getServiceRequests();
    if (res && res.data) requests.value = res.data;
  } catch (err) {
    console.error('Failed to load service requests:', err);
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (s) => {
  try {
    await serviceRequestService.updateServiceRequest(s.id, { status: s.status });
    ui.notify('Service request status updated.');
  } catch (err) {
    ui.notify(err.response?.data?.message || 'Failed to update status.', 'error');
    await fetchRequests();
  }
};

const removeRequest = async (id) => {
  if (!await ui.confirm({ title: 'Delete service request?', message: 'This completed or cancelled record will be permanently removed.', confirmText: 'Delete request', danger: true })) return;
  try { await serviceRequestService.deleteServiceRequest(id); await fetchRequests(); ui.notify('Service request deleted.'); }
  catch (error) { ui.notify(error.response?.data?.message || 'Could not delete service request.', 'error'); }
};

onMounted(() => {
  fetchRequests();
});
</script>

<style scoped>
.page-header { margin-bottom: 2rem; }
.table-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
.data-table th { padding: 1rem; background: var(--background); border-bottom: 1px solid var(--border); color: var(--muted); font-size: 0.8rem; text-transform: uppercase; }
.data-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.desc-box { max-width: 300px; font-size: 0.85rem; color: var(--text); }
.status-select { font-weight: 700; border-radius: var(--radius-full); padding: 0.3rem 0.6rem; font-size: 0.8rem; text-transform: uppercase; }
.status-pending { background: #fef3c7; color: #92400e; }
.status-in_progress { background: #dbeafe; color: #1e40af; }
.status-completed { background: #dcfce7; color: #166534; }
.status-cancelled { background: #f1f5f9; color: #475569; }
.text-muted { color: var(--muted); }
</style>
