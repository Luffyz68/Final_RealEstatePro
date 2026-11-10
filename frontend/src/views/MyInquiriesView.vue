<template>
  <div class="inquiries-page container section">
    <div class="page-header">
      <h1>My Property Inquiries</h1>
      <p>Track your questions and responses for property listings</p>
    </div>

    <div v-if="loading" class="loading-state text-center">
      <i class="fa-solid fa-circle-notch fa-spin"></i> Loading inquiries...
    </div>

    <div v-else-if="inquiries.length > 0" class="inquiries-list">
      <div v-for="inq in inquiries" :key="inq.id" class="inquiry-card">
        <div class="inquiry-header flex-between">
          <div>
            <h3>{{ inq.property_title }}</h3>
            <small class="date-text">Submitted on {{ formatDate(inq.created_at) }}</small>
          </div>
          <span class="badge-status" :class="'status-' + inq.status.toLowerCase()">
            {{ inq.status }}
          </span>
        </div>
        <p class="inquiry-msg">"{{ inq.message }}"</p>
        <div v-if="inq.admin_reply" class="reply-box">
          <strong><i class="fa-solid fa-reply"></i> Agent Reply:</strong>
          <p>{{ inq.admin_reply }}</p>
          <small v-if="inq.replied_at" class="text-muted">Replied on {{ formatDate(inq.replied_at) }}</small>
        </div>
        <div class="inquiry-meta">
          <span><i class="fa-solid fa-user"></i> Contact: {{ inq.name }}</span>
          <span><i class="fa-solid fa-phone"></i> {{ inq.phone }}</span>
        </div>
      </div>
    </div>

    <div v-else class="empty-state text-center">
      <i class="fa-regular fa-comment-dots empty-icon"></i>
      <h3>No inquiries submitted yet</h3>
      <p>Send an inquiry on any property page to contact listing agents directly.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import inquiryService from '@/services/inquiryService';

const inquiries = ref([]);
const loading = ref(true);

const formatDate = (d) => new Date(d).toLocaleDateString();

onMounted(async () => {
  try {
    const res = await inquiryService.getInquiries();
    if (res && res.data) {
      inquiries.value = res.data;
    }
  } catch (err) {
    console.error('Failed to load inquiries:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.page-header { margin-bottom: 2.5rem; }
.inquiries-list { display: flex; flex-direction: column; gap: 1.5rem; }
.inquiry-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; box-shadow: var(--shadow-sm); }
.inquiry-header h3 { font-size: 1.2rem; }
.date-text { color: var(--muted); }
.badge-status { padding: 0.25rem 0.75rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
.status-pending { background: #fef3c7; color: #92400e; }
.status-contacted { background: #dbeafe; color: #1e40af; }
.reply-box {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-left: 4px solid #16a34a;
  border-radius: var(--radius-sm);
  padding: 0.85rem 1rem;
  margin: 0.75rem 0;
}
.reply-box strong {
  display: block;
  color: #15803d;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}
.reply-box p {
  color: var(--text);
  font-size: 0.95rem;
  margin-bottom: 0.25rem;
}
.reply-box small {
  color: #64748b;
  font-size: 0.75rem;
}
.status-resolved { background: #dcfce7; color: #166534; }
.status-closed { background: #f1f5f9; color: #475569; }
.inquiry-msg { margin: 1rem 0; font-style: italic; color: var(--text); background: var(--background); padding: 1rem; border-radius: var(--radius-sm); }
.inquiry-meta { display: flex; gap: 2rem; font-size: 0.85rem; color: var(--muted); }
.empty-state { padding: 5rem 2rem; background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius); }
.empty-icon { font-size: 4rem; color: var(--muted); margin-bottom: 1rem; }
</style>
