<template>
  <div class="admin-appointments-page">
    <div class="page-header">
      <h1>Appointment & Viewing Management</h1>
      <p>Manage customer viewing appointments and tour requests</p>
    </div>
    <div class="toolbar-card admin-toolbar"><div class="search-box"><i class="fa-solid fa-magnifying-glass"></i><input v-model="search" placeholder="Search customer, property, or agent…" /></div><select v-model="statusFilter"><option value="">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>

    <div v-if="loading" class="loading-state text-center">
      <i class="fa-solid fa-circle-notch fa-spin"></i> Loading appointments...
    </div>

    <div v-else class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Property</th>
            <th>Agent</th>
            <th>Date & Time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!filteredAppointments.length">
            <td colspan="6" class="table-empty">No appointments match the selected filters.</td>
          </tr>
          <tr v-for="app in filteredAppointments" :key="app.id">
            <td>
              <strong>{{ app.customer_name }}</strong><br />
              <small class="text-muted">{{ app.customer_phone }}</small>
            </td>
            <td><strong>{{ app.property_title }}</strong></td>
            <td>{{ app.agent_name }}</td>
            <td>
              <strong>{{ app.appointment_date }}</strong><br />
              <small>{{ app.appointment_time }}</small>
            </td>
            <td>
              <span class="badge-status" :class="'status-' + app.status.toLowerCase()">
                {{ app.status }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button 
                  v-if="app.status === 'pending'" 
                  class="btn btn-sm btn-success" 
                  @click="changeStatus(app.id, 'approved')"
                >
                  Approve
                </button>
                <button v-if="['rejected','completed','cancelled'].includes(app.status)" class="btn-icon text-danger" title="Delete appointment" @click="removeAppointment(app.id)"><i class="fa-solid fa-trash"></i></button>
                <button 
                  v-if="app.status === 'pending'" 
                  class="btn btn-sm btn-danger" 
                  @click="changeStatus(app.id, 'rejected')"
                >
                  Reject
                </button>
                <button 
                  v-if="app.status === 'approved'" 
                  class="btn btn-sm btn-primary" 
                  @click="changeStatus(app.id, 'completed')"
                >
                  Mark Completed
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import appointmentService from '@/services/appointmentService';
import { useUiStore } from '@/stores/uiStore';

const appointments = ref([]);
const loading = ref(true);
const search = ref('');
const statusFilter = ref('');
const ui = useUiStore();
const filteredAppointments = computed(() => appointments.value.filter((item) => {
  const term = search.value.toLowerCase();
  return (!statusFilter.value || item.status === statusFilter.value) && (!term || [item.customer_name, item.property_title, item.agent_name].some((value) => String(value || '').toLowerCase().includes(term)));
}));

const fetchAppointments = async () => {
  loading.value = true;
  try {
    const res = await appointmentService.getAppointments();
    if (res && res.data) appointments.value = res.data;
  } catch (err) {
    console.error('Failed to load appointments:', err);
  } finally {
    loading.value = false;
  }
};

const changeStatus = async (id, newStatus) => {
  try {
    await appointmentService.updateAppointment(id, { status: newStatus });
    await fetchAppointments();
    ui.notify(`Appointment marked ${newStatus}.`);
  } catch (err) {
    ui.notify(err.response?.data?.message || 'Failed to update status.', 'error');
  }
};

const removeAppointment = async (id) => {
  if (!await ui.confirm({ title: 'Delete appointment record?', message: 'This completed or cancelled record will be permanently removed.', confirmText: 'Delete record', danger: true })) return;
  try { await appointmentService.deleteAppointment(id); await fetchAppointments(); ui.notify('Appointment record deleted.'); }
  catch (error) { ui.notify(error.response?.data?.message || 'Could not delete appointment.', 'error'); }
};

onMounted(() => {
  fetchAppointments();
});
</script>

<style scoped>
.page-header { margin-bottom: 2rem; }
.table-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
.data-table th { padding: 1rem; background: var(--background); border-bottom: 1px solid var(--border); color: var(--muted); font-size: 0.8rem; text-transform: uppercase; }
.data-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }

.badge-status { padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.status-pending { background: #fef3c7; color: #92400e; }
.status-approved { background: #dcfce7; color: #166534; }
.status-rejected { background: #fee2e2; color: #991b1b; }
.status-completed { background: #dbeafe; color: #1e40af; }
.status-cancelled { background: #f1f5f9; color: #475569; }

.action-buttons { display: flex; gap: 0.4rem; }
.btn-sm { padding: 0.3rem 0.6rem; font-size: 0.75rem; }
.btn-success { background: #16a34a; color: #ffffff; }
.btn-danger { background: #dc2626; color: #ffffff; }
.text-muted { color: var(--muted); }
</style>
