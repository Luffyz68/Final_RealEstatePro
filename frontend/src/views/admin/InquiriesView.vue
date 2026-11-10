<template>
  <div class="admin-inquiries-page">
    <div class="page-header">
      <h1>Inquiry Management</h1>
      <p>View customer property inquiries and update communication status</p>
    </div>
    <div class="toolbar-card admin-toolbar"><div class="search-box"><i class="fa-solid fa-magnifying-glass"></i><input v-model="search" placeholder="Search customer, property, or message…" /></div><select v-model="statusFilter"><option value="">All statuses</option><option value="pending">Pending</option><option value="contacted">Contacted</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></div>

    <div v-if="loading" class="loading-state text-center">
      <i class="fa-solid fa-circle-notch fa-spin"></i> Loading inquiries...
    </div>

    <div v-else class="table-card">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer Name</th>
            <th>Contact Info</th>
            <th>Property</th>
            <th>Message</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!filteredInquiries.length">
            <td colspan="8" class="table-empty">No inquiries match the selected filters.</td>
          </tr>
          <tr v-for="inq in filteredInquiries" :key="inq.id">
            <td>#{{ inq.id }}</td>
            <td><strong>{{ inq.name }}</strong></td>
            <td>
              {{ inq.email }}<br />
              <small class="text-muted">{{ inq.phone }}</small>
            </td>
            <td><strong>{{ inq.property_title }}</strong></td>
            <td>
              <div class="msg-box">"{{ inq.message }}"</div>
              <div v-if="inq.admin_reply" class="reply-box">
                <strong><i class="fa-solid fa-reply"></i> Agent Reply:</strong>
                <p>{{ inq.admin_reply }}</p>
                <small>{{ new Date(inq.replied_at).toLocaleDateString() }}</small>
              </div>
            </td>
            <td>
              <select 
                v-model="inq.status" 
                class="status-select" 
                :class="'status-' + inq.status.toLowerCase()"
                @change="updateStatus(inq)"
              >
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </td>
            <td>{{ new Date(inq.created_at).toLocaleDateString() }}</td>
            <td>
              <div class="action-buttons">
                <button class="btn-icon text-primary" title="Reply to inquiry" @click="openReplyModal(inq)"><i class="fa-regular fa-comments"></i></button>
                <button class="btn-icon text-danger" title="Delete inquiry" @click="removeInquiry(inq.id)"><i class="fa-solid fa-trash"></i></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Reply Modal -->
    <div v-if="replyingTo" class="modal-backdrop" @click.self="closeReplyModal">
      <div class="modal-card">
        <h3>Reply to {{ replyingTo.name }}</h3>
        <p class="modal-subtitle">Regarding: {{ replyingTo.property_title }}</p>
        
        <div class="customer-msg">
          <strong>Customer Message:</strong>
          <p>"{{ replyingTo.message }}"</p>
        </div>

        <div class="form-group">
          <label>Your Reply</label>
          <textarea v-model="replyMessage" rows="5" placeholder="Type your response here..." class="form-control"></textarea>
        </div>

        <div class="modal-actions">
          <button class="btn btn-outline" @click="closeReplyModal">Cancel</button>
          <button class="btn btn-primary" :disabled="!replyMessage.trim() || submitting" @click="submitReply">
            <i class="fa-solid fa-paper-plane"></i> {{ submitting ? 'Sending...' : 'Send Reply' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import inquiryService from '@/services/inquiryService';
import { useUiStore } from '@/stores/uiStore';

const inquiries = ref([]);
const loading = ref(true);
const search = ref('');
const statusFilter = ref('');
const ui = useUiStore();

const replyingTo = ref(null);
const replyMessage = ref('');
const submitting = ref(false);

const filteredInquiries = computed(() => inquiries.value.filter((item) => {
  const term = search.value.toLowerCase();
  return (!statusFilter.value || item.status === statusFilter.value) && (!term || [item.name, item.email, item.property_title, item.message].some((value) => String(value || '').toLowerCase().includes(term)));
}));

const fetchInquiries = async () => {
  loading.value = true;
  try {
    const res = await inquiryService.getInquiries();
    if (res && res.data) inquiries.value = res.data;
  } catch (err) {
    console.error('Failed to load inquiries:', err);
  } finally {
    loading.value = false;
  }
};

const updateStatus = async (inq) => {
  try {
    await inquiryService.updateInquiryStatus(inq.id, inq.status);
    ui.notify('Inquiry status updated.');
  } catch (err) {
    ui.notify(err.response?.data?.message || 'Failed to update status.', 'error');
    await fetchInquiries();
  }
};

const removeInquiry = async (id) => {
  if (!await ui.confirm({ title: 'Delete inquiry?', message: 'This permanently removes the customer message.', confirmText: 'Delete inquiry', danger: true })) return;
  try { await inquiryService.deleteInquiry(id); await fetchInquiries(); ui.notify('Inquiry deleted.'); }
  catch (error) { ui.notify(error.response?.data?.message || 'Could not delete inquiry.', 'error'); }
};

const openReplyModal = (inq) => {
  replyingTo.value = inq;
  replyMessage.value = inq.admin_reply || '';
};

const closeReplyModal = () => {
  replyingTo.value = null;
  replyMessage.value = '';
};

const submitReply = async () => {
  if (!replyMessage.value.trim() || !replyingTo.value) return;
  submitting.value = true;
  try {
    await inquiryService.replyToInquiry(replyingTo.value.id, replyMessage.value);
    ui.notify('Reply sent successfully.');
    closeReplyModal();
    await fetchInquiries();
  } catch (err) {
    ui.notify(err.response?.data?.message || 'Failed to send reply.', 'error');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchInquiries();
});
</script>

<style scoped>
.page-header { margin-bottom: 2rem; }
.table-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
.data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem; }
.data-table th { padding: 1.15rem 1rem; background: var(--background); border-bottom: 1px solid var(--border); color: var(--muted); font-size: 0.8rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; }
.data-table td { padding: 1.25rem 1rem; border-bottom: 1px solid var(--border); vertical-align: top; }
.data-table tbody tr:hover { background-color: #f8fafc; }

.msg-box { max-width: 280px; font-style: italic; color: var(--text); margin-bottom: 0.5rem; line-height: 1.4; }
.reply-box { margin-top: 0.75rem; padding: 0.75rem; background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 4px; font-size: 0.85rem; }
.reply-box strong { color: #1e40af; display: block; margin-bottom: 0.25rem; font-size: 0.75rem; text-transform: uppercase; }
.reply-box p { color: #334155; margin-bottom: 0.35rem; }
.reply-box small { color: #94a3b8; font-size: 0.75rem; }

.status-select { font-weight: 700; border-radius: var(--radius-full); padding: 0.4rem 0.8rem; font-size: 0.75rem; text-transform: uppercase; border: none; outline: none; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.status-pending { background: #fef3c7; color: #b45309; }
.status-contacted { background: #dbeafe; color: #1d4ed8; }
.status-resolved { background: #dcfce7; color: #15803d; }
.status-closed { background: #f1f5f9; color: #475569; }
.text-muted { color: var(--muted); }

.action-buttons { display: flex; gap: 0.5rem; }
.btn-icon { width: 32px; height: 32px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; background: #f1f5f9; transition: all 0.2s; border: none; cursor: pointer; }
.btn-icon:hover { background: #e2e8f0; transform: translateY(-2px); }
.text-primary { color: #2563eb; }
.text-danger { color: #ef4444; }

/* Modal Styles */
.modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 999; }
.modal-card { background: var(--surface); width: 100%; max-width: 500px; border-radius: 16px; padding: 2rem; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
.modal-card h3 { font-size: 1.4rem; color: var(--text); margin-bottom: 0.2rem; }
.modal-subtitle { color: var(--muted); font-size: 0.9rem; margin-bottom: 1.5rem; }
.customer-msg { background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid var(--border); }
.customer-msg strong { display: block; font-size: 0.85rem; color: var(--muted); margin-bottom: 0.4rem; }
.customer-msg p { color: var(--text); font-style: italic; line-height: 1.5; }
.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem; color: var(--text); }
.form-control { width: 100%; padding: 0.75rem; border: 1px solid var(--border); border-radius: 8px; font-family: inherit; font-size: 0.95rem; resize: vertical; transition: border-color 0.2s; }
.form-control:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; }
</style>
