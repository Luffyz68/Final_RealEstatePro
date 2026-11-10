<template>
  <div class="appointments-page container section">
    <div class="page-header">
      <h1>My Property Viewing Appointments</h1>
      <p>Manage your booked tours and private viewings</p>
    </div>

    <div v-if="loading" class="loading-state text-center">
      <i class="fa-solid fa-circle-notch fa-spin"></i> Loading appointments...
    </div>

    <div v-else-if="appointments.length > 0" class="appointments-list">
      <div v-for="app in appointments" :key="app.id" class="appt-card">
        <div class="appt-header flex-between">
          <div>
            <h3>{{ app.property_title }}</h3>
            <p class="agent-info"><i class="fa-solid fa-user-tie"></i> Agent: {{ app.agent_name }} ({{ app.agent_phone }})</p>
          </div>
          <span class="badge-status" :class="'status-' + app.status.toLowerCase()">
            {{ app.status }}
          </span>
        </div>

        <div class="appt-details">
          <div><i class="fa-regular fa-calendar"></i> <strong>Date:</strong> {{ app.appointment_date }}</div>
          <div><i class="fa-regular fa-clock"></i> <strong>Time:</strong> {{ app.appointment_time }}</div>
        </div>

        <p v-if="app.message" class="appt-msg">Note: {{ app.message }}</p>
        <button v-if="app.status === 'pending'" class="btn btn-outline" @click="cancelAppointment(app.id)"><i class="fa-solid fa-xmark"></i> Cancel request</button>
      </div>
    </div>

    <div v-else class="empty-state text-center">
      <i class="fa-regular fa-calendar-check empty-icon"></i>
      <h3>No appointments booked</h3>
      <p>Schedule a private property viewing directly from any property details page.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import appointmentService from '@/services/appointmentService';
import { useUiStore } from '@/stores/uiStore';

const appointments = ref([]);
const loading = ref(true);
const ui = useUiStore();

const cancelAppointment = async (id) => {
  if (!await ui.confirm({ title: 'Cancel viewing request?', message: 'The agent will be notified that you no longer need this appointment.', confirmText: 'Cancel viewing', danger: true })) return;
  try {
    await appointmentService.updateAppointment(id, { status: 'cancelled' });
    const item = appointments.value.find((appointment) => appointment.id === id);
    if (item) item.status = 'cancelled';
    ui.notify('Viewing request cancelled.');
  } catch (error) { ui.notify(error.response?.data?.message || 'Could not cancel the appointment.', 'error'); }
};

onMounted(async () => {
  try {
    const res = await appointmentService.getAppointments();
    if (res && res.data) {
      appointments.value = res.data;
    }
  } catch (err) {
    console.error('Failed to load appointments:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.page-header { margin-bottom: 2.5rem; }
.appointments-list { display: flex; flex-direction: column; gap: 1.5rem; }
.appt-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; box-shadow: var(--shadow-sm); }
.appt-header h3 { font-size: 1.2rem; }
.agent-info { color: var(--muted); font-size: 0.9rem; margin-top: 0.2rem; }
.badge-status { padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.status-pending { background: #fef3c7; color: #92400e; }
.status-approved { background: #dcfce7; color: #166534; }
.status-rejected { background: #fee2e2; color: #991b1b; }
.status-completed { background: #dbeafe; color: #1e40af; }
.status-cancelled { background: #f1f5f9; color: #475569; }
.appt-details { display: flex; gap: 2rem; margin: 1rem 0; font-size: 0.95rem; background: var(--background); padding: 0.75rem 1rem; border-radius: var(--radius-sm); }
.appt-msg { font-size: 0.9rem; color: var(--muted); }
.empty-state { padding: 5rem 2rem; background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius); }
.empty-icon { font-size: 4rem; color: var(--muted); margin-bottom: 1rem; }
</style>
