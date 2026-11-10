<template>
  <section class="customer-dashboard">
    <div class="container dashboard-wrap">
      <header class="welcome-card">
        <div>
          <span class="eyebrow">MY PROPERTY HUB</span>
          <h1>Welcome back, {{ auth.user?.full_name?.split(' ')[0] }}</h1>
          <p>Track saved homes, conversations, viewings, and property services in one place.</p>
        </div>
        <router-link to="/properties" class="btn btn-primary"><i class="fa-solid fa-magnifying-glass"></i> Explore properties</router-link>
      </header>

      <LoadingState v-if="loading" label="Loading your dashboard…" />
      <template v-else>
        <div class="summary-grid">
          <router-link v-for="card in cards" :key="card.label" :to="card.to" class="summary-card">
            <span class="summary-icon" :style="{ background: card.color }"><i :class="card.icon"></i></span>
            <div><strong>{{ card.value }}</strong><span>{{ card.label }}</span></div>
            <i class="fa-solid fa-arrow-right"></i>
          </router-link>
        </div>

        <div class="dashboard-grid">
          <article class="panel">
            <div class="panel-head"><div><span class="eyebrow">NEXT STEPS</span><h2>Manage your activity</h2></div></div>
            <div class="action-list">
              <router-link to="/my-appointments"><i class="fa-regular fa-calendar-check"></i><div><strong>Viewing appointments</strong><span>Review dates and approval status</span></div></router-link>
              <router-link to="/my-inquiries"><i class="fa-regular fa-comments"></i><div><strong>Property inquiries</strong><span>See messages sent to agents</span></div></router-link>
              <router-link to="/my-service-requests"><i class="fa-solid fa-screwdriver-wrench"></i><div><strong>Property services</strong><span>Request inspections and valuation</span></div></router-link>
              <router-link to="/profile"><i class="fa-regular fa-user"></i><div><strong>Account settings</strong><span>Keep your contact details current</span></div></router-link>
            </div>
          </article>
          <aside class="panel tip-panel">
            <span class="eyebrow">BUYER TIP</span>
            <h2>Shortlist before you visit</h2>
            <p>Save promising properties, compare their location and price, then request viewings only for your strongest choices.</p>
            <router-link to="/favorites" class="text-link">Review saved properties <i class="fa-solid fa-arrow-right"></i></router-link>
          </aside>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import dashboardService from '@/services/dashboardService';
import LoadingState from '@/components/ui/LoadingState.vue';

const auth = useAuthStore();
const loading = ref(true);
const stats = ref({});
const cards = computed(() => [
  { label: 'Saved properties', value: stats.value.totalFavorites || 0, to: '/favorites', icon: 'fa-solid fa-heart', color: '#fff1f2' },
  { label: 'Inquiries', value: stats.value.totalInquiries || 0, to: '/my-inquiries', icon: 'fa-regular fa-comments', color: '#eff6ff' },
  { label: 'Viewings', value: stats.value.totalAppointments || 0, to: '/my-appointments', icon: 'fa-regular fa-calendar-check', color: '#ecfdf5' },
  { label: 'Service requests', value: stats.value.totalServiceRequests || 0, to: '/my-service-requests', icon: 'fa-solid fa-screwdriver-wrench', color: '#fffbeb' }
]);

onMounted(async () => {
  try { const result = await dashboardService.getDashboardStats(); stats.value = result.data?.stats || {}; }
  finally { loading.value = false; }
});
</script>

<style scoped>
.customer-dashboard{padding:3rem 0 5rem;background:linear-gradient(180deg,#eff6ff 0,#f8fafc 320px)}.dashboard-wrap{display:grid;gap:2rem}.welcome-card{display:flex;align-items:center;justify-content:space-between;gap:2rem;padding:2.4rem;border-radius:24px;background:#0f172a;color:#cbd5e1;box-shadow:0 22px 60px rgba(15,23,42,.18)}.welcome-card h1{color:#fff;font-size:clamp(2rem,4vw,3.2rem);margin:.4rem 0}.eyebrow{font-size:.75rem;letter-spacing:.14em;font-weight:800;color:#3b82f6}.summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}.summary-card{display:grid;grid-template-columns:auto 1fr auto;gap:1rem;align-items:center;background:#fff;padding:1.25rem;border:1px solid var(--border);border-radius:16px;color:var(--text);box-shadow:var(--shadow-sm)}.summary-card:hover{transform:translateY(-3px);box-shadow:var(--shadow)}.summary-icon{width:48px;height:48px;border-radius:13px;display:grid;place-items:center;color:var(--secondary)}.summary-card strong{display:block;font-size:1.75rem;color:var(--primary)}.summary-card span{color:var(--muted);font-size:.86rem}.dashboard-grid{display:grid;grid-template-columns:1.6fr 1fr;gap:1.5rem}.panel{background:#fff;border:1px solid var(--border);border-radius:20px;padding:1.6rem}.action-list{display:grid;grid-template-columns:1fr 1fr;gap:.8rem;margin-top:1.2rem}.action-list a{display:flex;gap:.9rem;padding:1rem;border-radius:14px;background:#f8fafc;color:var(--text)}.action-list i{color:var(--secondary);margin-top:.25rem}.action-list strong,.action-list span{display:block}.action-list span{font-size:.82rem;color:var(--muted)}.tip-panel{background:linear-gradient(145deg,#fff,#eff6ff)}.tip-panel h2{margin:.45rem 0}.tip-panel p{color:var(--muted);margin-bottom:1.5rem}.text-link{font-weight:700}@media(max-width:900px){.summary-grid{grid-template-columns:1fr 1fr}.dashboard-grid{grid-template-columns:1fr}}@media(max-width:650px){.welcome-card{align-items:flex-start;flex-direction:column;padding:1.5rem}.summary-grid,.action-list{grid-template-columns:1fr}}
</style>
