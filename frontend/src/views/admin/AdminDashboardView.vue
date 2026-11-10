<template>
  <div class="dashboard-view">
    <div class="page-title">
      <h1>System Analytics & Overview</h1>
      <p>Live metrics aggregated directly from the database</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state text-center">
      <i class="fa-solid fa-circle-notch fa-spin"></i> Loading statistics...
    </div>

    <div v-else class="dashboard-content">
      <!-- Stat Cards Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon bg-blue"><i class="fa-solid fa-users"></i></div>
          <div class="stat-info">
            <small>Total Users</small>
            <h3>{{ stats.totalUsers }}</h3>
            <span class="sub-text">{{ stats.totalCustomers }} Customers / {{ stats.totalAgents }} Agents</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-indigo"><i class="fa-solid fa-building"></i></div>
          <div class="stat-info">
            <small>Total Properties</small>
            <h3>{{ stats.totalProperties }}</h3>
            <span class="sub-text">{{ stats.availableProperties }} Available</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-green"><i class="fa-solid fa-handshake"></i></div>
          <div class="stat-info">
            <small>Sold / Rented</small>
            <h3>{{ (stats.soldProperties || 0) + (stats.rentedProperties || 0) }}</h3>
            <span class="sub-text">{{ stats.soldProperties }} Sold / {{ stats.rentedProperties }} Rented</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-amber"><i class="fa-regular fa-comment-dots"></i></div>
          <div class="stat-info">
            <small>Pending Inquiries</small>
            <h3>{{ stats.pendingInquiries }}</h3>
            <span class="sub-text">Awaiting Response</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-purple"><i class="fa-solid fa-id-badge"></i></div>
          <div class="stat-info">
            <small>Agent Requests</small>
            <h3>{{ stats.pendingAgentRequests || 0 }}</h3>
            <span class="sub-text">Pending Approval</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-red"><i class="fa-solid fa-clipboard-check"></i></div>
          <div class="stat-info">
            <small>Pending Properties</small>
            <h3>{{ stats.pendingProperties || 0 }}</h3>
            <span class="sub-text">Awaiting Approval</span>
          </div>
        </div>
      </div>

      <div class="charts-grid">
        <section class="chart-card">
          <div class="card-header"><div><small>PORTFOLIO MIX</small><h3>Properties by type</h3></div></div>
          <div class="bar-chart">
            <div v-for="item in charts.propertyByType" :key="item.label" class="bar-row">
              <span>{{ item.label }}</span><div class="bar-track"><div class="bar-fill" :style="{ width: `${barWidth(item.value, charts.propertyByType)}%` }"></div></div><strong>{{ item.value }}</strong>
            </div>
          </div>
        </section>
        <section class="chart-card">
          <div class="card-header"><div><small>LISTING ACTIVITY</small><h3>Sale and rent distribution</h3></div></div>
          <div class="donut-wrap">
            <div class="donut" :style="{ '--sale': `${listingSalePercent}%` }"><span>{{ stats.totalProperties || 0 }}<small>Total</small></span></div>
            <div class="legend"><div><i class="sale-dot"></i>For sale <strong>{{ listingValue('sale') }}</strong></div><div><i class="rent-dot"></i>For rent <strong>{{ listingValue('rent') }}</strong></div></div>
          </div>
        </section>
      </div>

      <!-- Recent Data Tables -->
      <div class="recent-grid">
        <!-- Pending Properties -->
        <div class="table-card">
          <div class="card-header flex-between">
            <h3>Pending Properties</h3>
            <router-link to="/admin/properties" class="link-btn">View All</router-link>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="recentProperties.length === 0">
                <td colspan="4" class="text-center text-muted py-4">No pending properties.</td>
              </tr>
              <tr v-for="p in recentProperties" :key="p.id">
                <td>
                  <div class="prop-flex">
                    <img :src="p.main_image || placeholderImage" class="table-thumb" alt="" />
                    <span>{{ p.title }}</span>
                  </div>
                </td>
                <td><span :class="'badge badge-' + (p.listing_type || 'sale')">For {{ p.listing_type }}</span></td>
                <td><strong>${{ isNaN(Number(p.price)) ? '0' : Number(p.price).toLocaleString() }}</strong></td>
                <td>
                  <div style="display: flex; gap: 0.4rem;">
                    <button class="btn btn-sm btn-primary" @click="approveProperty(p.id, 'approved')">Approve</button>
                    <button class="btn btn-sm btn-danger" @click="approveProperty(p.id, 'rejected')">Reject</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pending Agent Requests -->
        <div class="table-card">
          <div class="card-header flex-between">
            <h3>Pending Agent Requests</h3>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!stats.recentAgentRequests || stats.recentAgentRequests.length === 0">
                <td colspan="3" class="text-center text-muted py-4">No pending requests.</td>
              </tr>
              <tr v-for="req in (stats.recentAgentRequests || [])" :key="req.id">
                <td><strong>{{ req.full_name }}</strong></td>
                <td><small>{{ req.email }}</small></td>
                <td>
                  <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-sm btn-success" @click="approveAgent(req.id, 'approved')" title="Approve"><i class="fa-solid fa-check"></i></button>
                    <button class="btn btn-sm btn-danger" @click="approveAgent(req.id, 'rejected')" title="Reject"><i class="fa-solid fa-xmark"></i></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Customer Inquiries -->
      <div v-if="recentInquiries.length > 0" class="table-card" style="margin-top: 1.5rem;">
        <div class="card-header flex-between">
          <h3>Recent Customer Inquiries</h3>
          <router-link to="/admin/inquiries" class="text-link" style="font-size: 0.85rem; font-weight: 600;">View All Inquiries →</router-link>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Property</th>
              <th>Message</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inq in recentInquiries" :key="inq.id">
              <td>
                <strong>{{ inq.name }}</strong><br />
                <small class="text-muted">{{ inq.email }}</small>
              </td>
              <td><strong>{{ inq.property_title }}</strong></td>
              <td><div style="max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">"{{ inq.message }}"</div></td>
              <td>{{ new Date(inq.created_at).toLocaleDateString() }}</td>
              <td><span class="badge" :class="'badge-' + (inq.status || 'pending')">{{ inq.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import dashboardService from '@/services/dashboardService';
import agentRequestService from '@/services/agentRequestService';
import propertyService from '@/services/propertyService';

const stats = ref({});
const recentProperties = ref([]);
const recentInquiries = ref([]);
const charts = ref({ propertyByType: [], listingBreakdown: [], monthlyInquiries: [], monthlyAppointments: [] });
const loading = ref(true);
const placeholderImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';

const loadStats = async () => {
  try {
    const res = await dashboardService.getDashboardStats();
    if (res && res.data) {
      stats.value = res.data.stats || {};
      recentProperties.value = res.data.recentProperties || [];
      recentInquiries.value = res.data.recentInquiries || [];
      charts.value = res.data.charts || charts.value;
    }
  } catch (err) {
    console.error('Failed to load dashboard stats:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadStats();
});

const approveAgent = async (id, status) => {
  if (confirm(`Are you sure you want to ${status} this agent request?`)) {
    try {
      await agentRequestService.updateAgentRequest(id, status);
      await loadStats();
      alert(`Request ${status}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update request');
    }
  }
};

const approveProperty = async (id, status) => {
  if (confirm(`Are you sure you want to ${status} this property?`)) {
    try {
      await propertyService.approveProperty(id, status);
      await loadStats();
      alert(`Property ${status}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update property');
    }
  }
};

const barWidth = (value, items) => Math.max(5, (Number(value) / Math.max(1, ...items.map((item) => Number(item.value)))) * 100);
const listingValue = (label) => Number(charts.value.listingBreakdown.find((item) => item.label === label)?.value || 0);
const listingSalePercent = computed(() => Math.round((listingValue('sale') / Math.max(1, listingValue('sale') + listingValue('rent'))) * 100));
</script>

<style scoped>
.page-title { margin-bottom: 2.5rem; }
.page-title h1 { font-size: 2.2rem; font-weight: 800; letter-spacing: -0.02em; color: var(--text); }
.page-title p { color: var(--muted); font-size: 1.05rem; margin-top: 0.25rem; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
.charts-grid{display:grid;grid-template-columns:1.3fr 1fr;gap:2rem;margin-bottom:2.5rem}
.chart-card{background:#ffffff;border:1px solid var(--border);border-radius:16px;padding:1.75rem;box-shadow:0 4px 20px rgba(0,0,0,0.03);transition:transform 0.25s,box-shadow 0.25s}
.chart-card:hover{transform:translateY(-4px);box-shadow:0 12px 30px rgba(0,0,0,0.06)}
.chart-card small{color:var(--secondary);font-weight:800;letter-spacing:.1em;display:block;margin-bottom:0.25rem;text-transform:uppercase}
.bar-chart{display:grid;gap:1rem;margin-top:1.5rem}
.bar-row{display:grid;grid-template-columns:100px 1fr 35px;align-items:center;gap:1rem;font-size:0.9rem;font-weight:600}
.bar-track{height:10px;border-radius:99px;background:#f1f5f9;overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,0.05)}
.bar-fill{height:100%;border-radius:inherit;background:linear-gradient(90deg,#3b82f6,#60a5fa);transition:width 1s ease-out}
.donut-wrap{display:flex;align-items:center;justify-content:space-around;gap:2rem;margin-top:2rem}
.donut{width:160px;height:160px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#3b82f6 0 var(--sale),#f59e0b var(--sale) 100%);position:relative;box-shadow:0 4px 10px rgba(0,0,0,0.1)}
.donut:after{content:'';position:absolute;inset:25px;background:var(--surface);border-radius:50%;box-shadow:inset 0 2px 5px rgba(0,0,0,0.05)}
.donut span{z-index:1;font-size:2rem;font-weight:800;text-align:center;color:var(--text)}
.donut small{display:block;color:var(--muted);font-size:0.75rem;font-weight:600;letter-spacing:0.05em;text-transform:uppercase}
.legend{display:grid;gap:1rem}
.legend div{display:grid;grid-template-columns:auto 1fr auto;gap:0.75rem;align-items:center;font-size:0.95rem;font-weight:600}
.legend i{width:12px;height:12px;border-radius:50%}
.sale-dot{background:#3b82f6;box-shadow:0 0 8px rgba(59,130,246,0.5)}
.rent-dot{background:#f59e0b;box-shadow:0 0 8px rgba(245,158,11,0.5)}
@media(max-width:900px){.charts-grid{grid-template-columns:1fr}}
@media(max-width:560px){.donut-wrap{flex-direction:column}.bar-row{grid-template-columns:80px 1fr 30px}}
.stat-card { background: #ffffff; border: 1px solid var(--border); border-radius: 16px; padding: 1.75rem; display: flex; align-items: center; gap: 1.25rem; box-shadow: 0 4px 20px rgba(0,0,0,0.03); transition: transform 0.25s, box-shadow 0.25s; cursor: default; }
.stat-card:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(0,0,0,0.06); }
.stat-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
.bg-blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.bg-indigo { background: linear-gradient(135deg, #6366f1, #4338ca); }
.bg-green { background: linear-gradient(135deg, #22c55e, #15803d); }
.bg-amber { background: linear-gradient(135deg, #f59e0b, #b45309); }
.stat-info small { color: var(--muted); font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
.stat-info h3 { font-size: 2rem; font-weight: 800; line-height: 1.1; margin: 0.2rem 0; color: var(--text); }
.sub-text { font-size: 0.8rem; color: var(--muted); font-weight: 500; }

.recent-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
.table-card { background: #ffffff; border: 1px solid var(--border); border-radius: 16px; padding: 1.75rem; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
.card-header { margin-bottom: 1.25rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; }
.card-header h3 { font-size: 1.2rem; font-weight: 700; }
.link-btn { font-size: 0.85rem; font-weight: 700; color: #3b82f6; display: flex; align-items: center; gap: 0.4rem; transition: gap 0.2s; }
.link-btn:hover { gap: 0.6rem; color: #1d4ed8; }

.data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
.data-table th { padding: 0.75rem 0.5rem; border-bottom: 1px solid var(--border); color: var(--muted); font-size: 0.8rem; text-transform: uppercase; font-weight: 700; }
.data-table td { padding: 1rem 0.5rem; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
.data-table tbody tr { transition: background-color 0.2s; }
.data-table tbody tr:hover { background-color: #f8fafc; }

.prop-flex { display: flex; align-items: center; gap: 1rem; }
.table-thumb { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }

.status-chip { padding: 0.3rem 0.7rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700; text-transform: capitalize; }
.chip-available { background: #dcfce7; color: #15803d; }
.chip-sold { background: #fee2e2; color: #b91c1c; }
.chip-rented { background: #fef3c7; color: #b45309; }
.chip-pending { background: #fef3c7; color: #b45309; }
.chip-contacted { background: #dbeafe; color: #1d4ed8; }

.bg-purple { background: linear-gradient(135deg, #a855f7, #7e22ce); }
.bg-red { background: linear-gradient(135deg, #ef4444, #b91c1c); }
.btn-sm { padding: 0.35rem 0.65rem; font-size: 0.8rem; border-radius: 6px; cursor: pointer; border: none; font-weight: 600; color: white;}
.btn-primary { background: #3b82f6; } .btn-primary:hover { background: #2563eb; }
.btn-success { background: #22c55e; } .btn-success:hover { background: #16a34a; }
.btn-danger { background: #ef4444; } .btn-danger:hover { background: #dc2626; }
.text-center { text-align: center; }
.py-4 { padding: 1rem 0; }
.text-muted { color: var(--muted); }

@media (max-width: 1024px) {
  .recent-grid { grid-template-columns: 1fr; }
}
</style>
