<template>
  <div class="agent-dashboard">
    <div class="page-title">
      <h1>Agent Dashboard & Overview</h1>
      <p>Manage your real estate listings, inquiries, and tour bookings</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state text-center">
      <i class="fa-solid fa-circle-notch fa-spin"></i> Loading agent stats...
    </div>

    <div v-else class="dashboard-content">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon bg-indigo"><i class="fa-solid fa-house"></i></div>
          <div class="stat-info">
            <small>My Properties</small>
            <h3>{{ stats.totalProperties || 0 }}</h3>
            <span class="sub-text">{{ stats.availableProperties || 0 }} Available</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-amber"><i class="fa-regular fa-comment-dots"></i></div>
          <div class="stat-info">
            <small>Pending Inquiries</small>
            <h3>{{ stats.pendingInquiries || 0 }}</h3>
            <span class="sub-text">Awaiting Response</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-green"><i class="fa-regular fa-calendar-check"></i></div>
          <div class="stat-info">
            <small>Pending Appointments</small>
            <h3>{{ stats.pendingAppointments || 0 }}</h3>
            <span class="sub-text">Tour Requests</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import dashboardService from '@/services/dashboardService';

const stats = ref({});
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await dashboardService.getDashboardStats();
    if (res && res.data) {
      stats.value = res.data.stats || {};
    }
  } catch (err) {
    console.error('Failed to load agent stats:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.page-title { margin-bottom: 2rem; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
.stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; display: flex; align-items: center; gap: 1.25rem; box-shadow: var(--shadow-sm); }
.stat-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: #ffffff; }
.bg-indigo { background: #4f46e5; }
.bg-green { background: #16a34a; }
.bg-amber { background: #d97706; }
.stat-info small { color: var(--muted); font-weight: 600; font-size: 0.85rem; }
.stat-info h3 { font-size: 1.75rem; line-height: 1.1; margin: 0.2rem 0; }
.sub-text { font-size: 0.75rem; color: var(--muted); }
</style>
