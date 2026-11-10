<template>
  <div class="profile-page container section">
    <div class="page-header">
      <h1>My Profile</h1>
      <p>Manage your personal information, profile photo, and account security</p>
    </div>

    <div class="profile-layout">
      <!-- ============ Summary sidebar ============ -->
      <aside class="profile-summary">
        <div class="summary-banner">
          <span class="banner-shape shape-1"></span>
          <span class="banner-shape shape-2"></span>
          <span class="banner-shape shape-3"></span>
        </div>

        <div class="summary-body">
          <div class="avatar-wrap">
            <img
              v-if="authStore.user?.profile_image && !sidebarAvatarFailed"
              :src="authStore.user.profile_image"
              class="summary-avatar"
              alt="Avatar"
              @error="sidebarAvatarFailed = true"
            />
            <div v-else class="summary-avatar avatar-initials">{{ initials }}</div>
            <span class="status-dot" title="Active"></span>
          </div>

          <h2 class="summary-name">{{ authStore.user?.full_name || 'User' }}</h2>
          <span class="role-badge" :class="`role-${authStore.user?.role}`">
            <i :class="roleIcon"></i> {{ authStore.user?.role }}
          </span>

          <p v-if="authStore.user?.bio" class="summary-bio">
            {{ authStore.user.bio }}
          </p>

          <!-- Completion meter -->
          <div class="completion">
            <div class="completion-head">
              <span class="completion-label">
                <i class="fa-solid fa-bolt"></i> Profile completion
              </span>
              <span class="completion-pct">{{ completion }}%</span>
            </div>
            <div class="completion-track">
              <div
                class="completion-fill"
                :class="completionLevel"
                :style="{ width: completion + '%' }"
              ></div>
            </div>
            <small v-if="completion < 100" class="completion-hint">
              Add {{ missingFields }} to complete your profile
            </small>
          </div>

          <!-- Info list -->
          <div class="info-list">
            <div class="info-item">
              <span class="info-icon"><i class="fa-regular fa-envelope"></i></span>
              <div class="info-text">
                <span class="info-label">Email</span>
                <span class="info-value email">{{ authStore.user?.email }}</span>
              </div>
              <button
                class="copy-btn"
                :class="{ copied }"
                type="button"
                title="Copy email"
                @click="copyEmail"
              >
                <i :class="copied ? 'fa-solid fa-check' : 'fa-regular fa-copy'"></i>
              </button>
            </div>

            <div class="info-item">
              <span class="info-icon"><i class="fa-solid fa-phone"></i></span>
              <div class="info-text">
                <span class="info-label">Phone</span>
                <span class="info-value">{{ authStore.user?.phone || 'Not provided' }}</span>
              </div>
            </div>

            <div class="info-item">
              <span class="info-icon"><i class="fa-regular fa-calendar"></i></span>
              <div class="info-text">
                <span class="info-label">Member since</span>
                <span class="info-value">{{ formatDate(authStore.user?.created_at) }}</span>
              </div>
            </div>

            <div class="info-item">
              <span class="info-icon status"><i class="fa-solid fa-circle-check"></i></span>
              <div class="info-text">
                <span class="info-label">Account status</span>
                <span class="info-value status-text">{{ formatStatus(authStore.user?.status) }}</span>
              </div>
            </div>
          </div>

          <!-- Role-aware quick links -->
          <div class="quick-links">
            <span class="quick-links-title">Quick access</span>
            <div class="quick-links-grid">
              <router-link
                v-for="link in quickLinks"
                :key="link.to"
                :to="link.to"
                class="quick-link"
              >
                <i :class="link.icon"></i>
                <span>{{ link.label }}</span>
              </router-link>
            </div>
          </div>
        </div>
      </aside>

      <!-- ============ Main form column ============ -->
      <form @submit.prevent="handleUpdate" class="profile-main">
        <!-- Success toast -->
        <transition name="toast">
          <div v-if="successMsg" :key="toastKey" class="toast toast-success">
            <span class="toast-icon"><i class="fa-solid fa-circle-check"></i></span>
            <span>{{ successMsg }}</span>
            <span class="toast-progress"></span>
          </div>
        </transition>

        <div v-if="errorMsg" class="alert alert-danger">
          <i class="fa-solid fa-circle-exclamation"></i> {{ errorMsg }}
        </div>

        <!-- Personal information -->
        <div class="section-card">
          <div class="section-title">
            <span class="section-icon"><i class="fa-regular fa-user"></i></span>
            <div>
              <h3>Personal Information</h3>
              <p>Update your name and contact details</p>
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Full Name <span class="required">*</span></label>
              <input type="text" v-model="form.full_name" required />
              <small v-if="form.full_name && form.full_name.length < 2" class="field-error">
                <i class="fa-solid fa-circle-exclamation"></i> Name must be at least 2 characters
              </small>
            </div>
            <div class="form-group">
              <label>Email Address <span class="required">*</span></label>
              <input type="email" v-model="form.email" required />
              <small v-if="form.email && !isValidEmail(form.email)" class="field-error">
                <i class="fa-solid fa-circle-exclamation"></i> Please enter a valid email address
              </small>
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input type="tel" v-model="form.phone" placeholder="+855 12 345 678" />
              <small v-if="form.phone && !isValidPhone(form.phone)" class="field-error">
                <i class="fa-solid fa-circle-exclamation"></i> Please enter a valid phone number
              </small>
            </div>
            <div class="form-group full-width">
              <label>Bio</label>
              <textarea 
                v-model="form.bio" 
                placeholder="Tell us a little about yourself..."
                rows="3"
                maxlength="500"
              ></textarea>
              <small class="char-count" :class="{ 'near-limit': form.bio && form.bio.length > 450 }">
                {{ form.bio ? form.bio.length : 0 }} / 500
              </small>
            </div>
          </div>
        </div>

        <!-- Profile picture -->
        <div class="section-card">
          <div class="section-title">
            <span class="section-icon"><i class="fa-regular fa-image"></i></span>
            <div>
              <h3>Profile Picture</h3>
              <p>Upload an image file or paste an image URL</p>
            </div>
          </div>
          <div class="avatar-edit">
            <div class="preview-wrap">
              <img
                v-if="form.profile_image && !previewFailed"
                :src="form.profile_image"
                class="avatar-preview"
                alt="Avatar preview"
                @error="previewFailed = true"
              />
              <div v-else class="avatar-preview avatar-initials">{{ formInitials }}</div>
              <span class="preview-camera"><i class="fa-solid fa-camera"></i></span>
            </div>
            <div class="avatar-input form-group">
              <div class="image-mode-tabs">
                <button 
                  type="button" 
                  class="mode-tab" 
                  :class="{ active: avatarMode === 'file' }" 
                  @click="avatarMode = 'file'"
                >
                  <i class="fa-solid fa-upload"></i> Upload File
                </button>
                <button 
                  type="button" 
                  class="mode-tab" 
                  :class="{ active: avatarMode === 'url' }" 
                  @click="avatarMode = 'url'"
                >
                  <i class="fa-solid fa-link"></i> Image URL
                </button>
              </div>

              <div v-if="avatarMode === 'file'" class="file-upload-box">
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp,image/gif" 
                  @change="handleAvatarFileUpload" 
                />
                <small class="form-hint">Choose an image file from your device (Max 5MB)</small>
              </div>
              <div v-else>
                <input type="url" v-model="form.profile_image" placeholder="https://images.unsplash.com/..." />
                <small v-if="previewFailed && form.profile_image" class="preview-error">
                  <i class="fa-solid fa-triangle-exclamation"></i> This URL could not be loaded — your initials will be used instead.
                </small>
              </div>
            </div>
          </div>
        </div>

        <!-- Become an Agent -->
        <div v-if="authStore.user?.role === 'customer' || agentRequestStatus" class="section-card">
          <div class="section-title">
            <span class="section-icon"><i class="fa-solid fa-briefcase"></i></span>
            <div>
              <h3>Become an Agent</h3>
              <p>Apply to list and manage properties on our platform</p>
            </div>
          </div>
          
          <div v-if="agentRequestStatus === 'pending'" class="alert alert-info" style="background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 1rem; border-radius: var(--radius-sm);">
            <i class="fa-solid fa-hourglass-half"></i> Your agent application is currently <strong>pending review</strong>. We will notify you once approved.
          </div>
          <div v-else-if="agentRequestStatus === 'rejected'" class="alert alert-danger">
            <i class="fa-solid fa-circle-xmark"></i> Your previous application was rejected. You can submit a new one below.
          </div>
          <div v-else-if="agentRequestStatus === 'approved'" class="alert alert-success" style="background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; padding: 1rem; border-radius: var(--radius-sm);">
            <i class="fa-solid fa-circle-check"></i> Your application was approved! 🎉 Your account has been upgraded to <strong>Agent</strong>. <router-link to="/agent/dashboard" style="color: #15803d; font-weight: 600;">Go to Agent Dashboard →</router-link>
          </div>
          
          <div v-if="!agentRequestStatus || agentRequestStatus === 'rejected'">
            <p style="margin-bottom: 1rem; color: var(--text);">Submit your application to become a certified real estate agent. Our team will review your request shortly.</p>
            <button type="button" class="btn btn-primary" @click="submitAgentApplication" :disabled="submittingAgentReq">
              <span v-if="submittingAgentReq"><i class="fa-solid fa-circle-notch fa-spin"></i> Submitting...</span>
              <span v-else><i class="fa-solid fa-paper-plane"></i> Submit Application</span>
            </button>
          </div>
        </div>

        <!-- Security -->
        <div class="section-card">
          <div class="section-title">
            <span class="section-icon security"><i class="fa-solid fa-shield-halved"></i></span>
            <div>
              <h3>Change Password</h3>
              <p>Leave blank to keep your current password</p>
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Current Password</label>
              <div class="input-wrapper">
                <input
                  :type="showCurrentPassword ? 'text' : 'password'"
                  v-model="form.current_password"
                  placeholder="Enter your current password"
                  autocomplete="current-password"
                  :required="!!form.password"
                />
                <button
                  type="button"
                  class="password-toggle"
                  :title="showCurrentPassword ? 'Hide password' : 'Show password'"
                  @click="showCurrentPassword = !showCurrentPassword"
                >
                  <i :class="showCurrentPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>New Password</label>
              <div class="input-wrapper">
                <input
                  :type="showNewPassword ? 'text' : 'password'"
                  v-model="form.password"
                  placeholder="••••••••"
                  autocomplete="new-password"
                />
                <button
                  type="button"
                  class="password-toggle"
                  :title="showNewPassword ? 'Hide password' : 'Show password'"
                  @click="showNewPassword = !showNewPassword"
                >
                  <i :class="showNewPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                </button>
              </div>

              <!-- Strength meter -->
              <div v-if="form.password" class="strength">
                <div class="strength-track">
                  <span
                    v-for="n in 4"
                    :key="n"
                    class="strength-seg"
                    :class="passwordStrength.score >= n ? passwordStrength.tone : ''"
                  ></span>
                </div>
                <span class="strength-label" :class="passwordStrength.tone">
                  {{ passwordStrength.label }}
                </span>
              </div>
            </div>

            <div class="form-group">
              <label>Confirm New Password</label>
              <div class="input-wrapper">
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  v-model="form.confirm_password"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  :required="!!form.password"
                />
                <button
                  type="button"
                  class="password-toggle"
                  :title="showConfirmPassword ? 'Hide password' : 'Show password'"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <i :class="showConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                </button>
              </div>
              <small v-if="form.confirm_password && form.password !== form.confirm_password" class="field-error">
                <i class="fa-solid fa-circle-exclamation"></i> Passwords do not match
              </small>
              <small v-else-if="form.confirm_password && form.password === form.confirm_password" class="field-success">
                <i class="fa-solid fa-circle-check"></i> Passwords match
              </small>
            </div>
          </div>

          <small class="password-hint">
            <i class="fa-solid fa-circle-info"></i>
            New passwords need at least 8 characters, uppercase, lowercase, and a number.
          </small>
        </div>

        <!-- Form footer bar -->
        <div class="form-footer" :class="{ dirty: isDirty }">
          <transition name="fade">
            <span v-if="isDirty" class="dirty-pill">
              <i class="fa-solid fa-pen"></i> Unsaved changes
            </span>
            <span v-else class="saved-pill">
              <i class="fa-solid fa-cloud-arrow-up"></i> All changes saved
            </span>
          </transition>

          <div class="footer-actions">
            <button
              v-if="isDirty"
              type="button"
              class="btn btn-ghost"
              :disabled="loading"
              @click="resetForm"
            >
              <i class="fa-solid fa-rotate-left"></i> Discard
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading || !isDirty">
              <span v-if="loading"><i class="fa-solid fa-circle-notch fa-spin"></i> Saving...</span>
              <span v-else><i class="fa-solid fa-floppy-disk"></i> Save Changes</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onBeforeUnmount, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { formatDate, formatStatus } from '@/utils/formatters';
import agentRequestService from '@/services/agentRequestService';

const authStore = useAuthStore();
const router = useRouter();
const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

/* ---------- Role helpers ---------- */
const roleIcons = {
  admin: 'fa-solid fa-user-shield',
  agent: 'fa-solid fa-briefcase',
  customer: 'fa-regular fa-user'
};
const roleIcon = computed(() => roleIcons[authStore.user?.role] || 'fa-regular fa-user');

const quickLinks = computed(() => {
  if (authStore.isAdmin) {
    return [
      { to: '/admin/dashboard', icon: 'fa-solid fa-gauge', label: 'Dashboard' },
      { to: '/admin/properties', icon: 'fa-solid fa-building', label: 'Properties' },
      { to: '/admin/users', icon: 'fa-solid fa-users', label: 'Users' }
    ];
  }
  if (authStore.isAgent) {
    return [
      { to: '/agent/dashboard', icon: 'fa-solid fa-chart-line', label: 'Dashboard' },
      { to: '/agent/properties', icon: 'fa-solid fa-building', label: 'My Listings' }
    ];
  }
  return [
    { to: '/dashboard', icon: 'fa-solid fa-chart-pie', label: 'Dashboard' },
    { to: '/favorites', icon: 'fa-solid fa-heart', label: 'Favorites' },
    { to: '/my-appointments', icon: 'fa-regular fa-calendar-check', label: 'Appointments' }
  ];
});

/* ---------- Initials fallback ---------- */
const initials = computed(() => (authStore.user?.full_name || '?')
  .split(' ')
  .map((word) => word.charAt(0))
  .slice(0, 2)
  .join('')
  .toUpperCase());

const formInitials = computed(() => (form.full_name || '?')
  .split(' ')
  .map((word) => word.charAt(0))
  .slice(0, 2)
  .join('')
  .toUpperCase());

/* ---------- Form + dirty tracking ---------- */
const original = reactive({
  full_name: authStore.user?.full_name || '',
  email: authStore.user?.email || '',
  phone: authStore.user?.phone || '',
  bio: authStore.user?.bio || '',
  profile_image: authStore.user?.profile_image || ''
});

const form = reactive({
  ...original,
  password: '',
  current_password: '',
  confirm_password: ''
});

const isDirty = computed(() =>
  form.full_name !== original.full_name
  || form.email !== original.email
  || form.phone !== original.phone
  || form.bio !== original.bio
  || form.profile_image !== original.profile_image
  || form.password !== ''
);

/* ---------- Validation helpers ---------- */
const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
const isValidPhone = (val) => !val || /^[+]?[\d\s()-]{6,20}$/.test(val);

watch(() => authStore.user, (u) => {
  if (u) {
    Object.assign(original, {
      full_name: u.full_name || '',
      email: u.email || '',
      phone: u.phone || '',
      bio: u.bio || '',
      profile_image: u.profile_image || ''
    });
    resetForm();
  }
}, { immediate: true });

const resetForm = () => {
  Object.assign(form, original, { password: '', current_password: '', confirm_password: '' });
};

/* ---------- Profile completion ---------- */
const completion = computed(() => {
  const checks = [
    !!authStore.user?.full_name,
    !!authStore.user?.phone,
    !!authStore.user?.bio,
    !!authStore.user?.profile_image
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
});

const completionLevel = computed(() => {
  if (completion.value >= 100) return 'level-full';
  if (completion.value >= 66) return 'level-high';
  if (completion.value >= 34) return 'level-mid';
  return 'level-low';
});

const missingFields = computed(() => {
  const missing = [];
  if (!authStore.user?.phone) missing.push('a phone number');
  if (!authStore.user?.bio) missing.push('a bio');
  if (!authStore.user?.profile_image) missing.push('a profile photo');
  return missing.join(', ');
});

/* ---------- Avatar preview & file upload ---------- */
const avatarMode = ref('url');
const previewFailed = ref(false);
const sidebarAvatarFailed = ref(false);

const previewSrc = computed(() => form.profile_image || authStore.user?.profile_image || defaultAvatar);

const handleAvatarFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    alert('File size must be 5MB or smaller.');
    return;
  }
  const reader = new FileReader();
  reader.onload = (event) => {
    form.profile_image = event.target.result;
    previewFailed.value = false;
  };
  reader.readAsDataURL(file);
};

watch(() => form.profile_image, () => {
  previewFailed.value = false;
});

/* ---------- Copy email ---------- */
const copied = ref(false);
let copyTimer = null;

const markCopied = () => {
  copied.value = true;
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => { copied.value = false; }, 2000);
};

const copyEmail = async () => {
  const email = authStore.user?.email || '';
  try {
    await navigator.clipboard.writeText(email);
    markCopied();
  } catch {
    // Fallback for environments without the Clipboard API
    try {
      const helper = document.createElement('textarea');
      helper.value = email;
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      document.execCommand('copy');
      document.body.removeChild(helper);
      markCopied();
    } catch {
      /* clipboard unavailable — ignore */
    }
  }
};

/* ---------- Password strength ---------- */
const showNewPassword = ref(false);
const showCurrentPassword = ref(false);
const showConfirmPassword = ref(false);

const passwordStrength = computed(() => {
  const pw = form.password;
  if (!pw) return { score: 0, label: '', tone: '' };
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/\d/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  if (pw.length < 8) score = Math.min(score, 1);

  if (score <= 1) return { score, label: 'Weak', tone: 'tone-weak' };
  if (score === 2) return { score, label: 'Fair', tone: 'tone-fair' };
  if (score === 3) return { score, label: 'Good', tone: 'tone-good' };
  return { score, label: 'Strong', tone: 'tone-strong' };
});

/* ---------- Submit ---------- */
const loading = ref(false);
const successMsg = ref('');
const errorMsg = ref('');
const toastKey = ref(0);
let toastTimer = null;

const handleUpdate = async () => {
  loading.value = true;
  successMsg.value = '';
  errorMsg.value = '';

  // Client-side validation
  if (!form.full_name || form.full_name.trim().length < 2) {
    errorMsg.value = 'Full name must be at least 2 characters.';
    loading.value = false;
    return;
  }
  if (!form.email || !isValidEmail(form.email)) {
    errorMsg.value = 'Please enter a valid email address.';
    loading.value = false;
    return;
  }
  if (form.phone && !isValidPhone(form.phone)) {
    errorMsg.value = 'Please enter a valid phone number.';
    loading.value = false;
    return;
  }
  if (form.password) {
    if (!form.current_password) {
      errorMsg.value = 'Current password is required to change your password.';
      loading.value = false;
      return;
    }
    if (form.password !== form.confirm_password) {
      errorMsg.value = 'New password and confirm password do not match.';
      loading.value = false;
      return;
    }
    if (form.password.length < 8) {
      errorMsg.value = 'New password must be at least 8 characters.';
      loading.value = false;
      return;
    }
  }

  const updatePayload = {
    full_name: form.full_name,
    email: form.email,
    phone: form.phone,
    bio: form.bio,
    profile_image: form.profile_image
  };
  if (form.password) {
    updatePayload.password = form.password;
    updatePayload.current_password = form.current_password;
  }

  try {
    const res = await authStore.updateProfile(updatePayload);
    if (res && res.success) {
      Object.assign(original, {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        bio: form.bio,
        profile_image: form.profile_image
      });
      form.password = '';
      form.current_password = '';
      form.confirm_password = '';
      sidebarAvatarFailed.value = false;
      successMsg.value = 'Profile updated successfully!';
      toastKey.value += 1;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { successMsg.value = ''; }, 4000);
    }
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Failed to update profile.';
  } finally {
    loading.value = false;
  }
};

/* ---------- Agent Request ---------- */
const agentRequestStatus = ref(null);
const submittingAgentReq = ref(false);

const loadAgentRequest = async () => {
  if (authStore.user?.role === 'customer' || authStore.user?.role === 'agent') {
    try {
      const res = await agentRequestService.getMyAgentRequest();
      if (res.data) {
        agentRequestStatus.value = res.data.status;
        // If approved, refresh the session to update role from customer to agent
        if (res.data.status === 'approved') {
          await authStore.refreshSession();
        }
      }
    } catch (err) {
      console.error('Failed to load agent request', err);
    }
  }
};

const submitAgentApplication = async () => {
  submittingAgentReq.value = true;
  try {
    await agentRequestService.submitAgentRequest();
    successMsg.value = 'Agent application submitted successfully!';
    toastKey.value += 1;
    agentRequestStatus.value = 'pending';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { successMsg.value = ''; }, 4000);
  } catch (err) {
    errorMsg.value = err.response?.data?.message || 'Failed to submit application.';
  } finally {
    submittingAgentReq.value = false;
  }
};

onMounted(async () => {
  try {
    await authStore.fetchProfile();
  } catch (err) {
    console.error('Failed to load fresh profile:', err);
  }
  loadAgentRequest();
});

onBeforeUnmount(() => {
  clearTimeout(toastTimer);
  clearTimeout(copyTimer);
});
</script>

<style scoped>
/* ==========================================
   Page & layout
========================================== */
.profile-page { padding: 3rem 1.5rem 4rem; }

.page-header { margin-bottom: 1.75rem; }

/* ==========================================
   Validation & new field styles
========================================== */
.required { color: #ef4444; font-weight: 600; }

.field-error {
  display: flex; align-items: center; gap: 0.35rem;
  color: #ef4444; font-size: 0.8rem; margin-top: 0.35rem;
}

.field-success {
  display: flex; align-items: center; gap: 0.35rem;
  color: #22c55e; font-size: 0.8rem; margin-top: 0.35rem;
}

.char-count {
  display: block; text-align: right; font-size: 0.75rem;
  color: var(--text-muted, #94a3b8); margin-top: 0.25rem;
}
.char-count.near-limit { color: #f59e0b; font-weight: 600; }

.summary-bio {
  font-size: 0.85rem;
  color: var(--text-muted, #64748b);
  line-height: 1.5;
  margin: 0.75rem 0 0;
  text-align: center;
  font-style: italic;
  padding: 0 0.5rem;
  word-break: break-word;
}

.form-group.full-width { grid-column: 1 / -1; }

.form-group textarea {
  width: 100%;
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: var(--radius-sm, 6px);
  font: inherit;
  font-size: 0.9rem;
  line-height: 1.5;
  resize: vertical;
  background: var(--surface, #fff);
  transition: border-color 0.2s;
}
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.profile-layout {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 1.5rem;
  align-items: start;
}

/* ==========================================
   Summary sidebar
========================================== */
.profile-summary {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
  position: sticky;
  top: 88px;
}

.summary-banner {
  position: relative;
  height: 96px;
  background: linear-gradient(120deg, #1e40af 0%, #2563eb 55%, #3b82f6 100%);
  overflow: hidden;
}

.banner-shape { position: absolute; border-radius: 50%; }
.shape-1 {
  width: 140px; height: 140px; top: -70px; right: -30px;
  background: rgba(255, 255, 255, 0.14);
}
.shape-2 {
  width: 80px; height: 80px; bottom: -40px; left: 18%;
  background: rgba(255, 255, 255, 0.10);
}
.shape-3 {
  width: 44px; height: 44px; top: 18px; left: 42%;
  background: rgba(255, 255, 255, 0.18);
}

.summary-body {
  padding: 0 1.5rem 1.75rem;
  text-align: center;
  margin-top: -46px;
}

/* Avatar + status dot */
.avatar-wrap { position: relative; display: inline-block; }

.summary-avatar {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--surface);
  box-shadow: var(--shadow);
  display: block;
}

.avatar-initials {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--secondary), #1d4ed8);
  color: #ffffff;
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1.5rem;
  letter-spacing: 0.02em;
}

.status-dot {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--success);
  border: 3px solid var(--surface);
}

.summary-name { font-size: 1.3rem; margin-top: 0.75rem; }

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.3rem 0.85rem;
  border-radius: var(--radius-full);
  margin-top: 0.5rem;
}

.role-admin { background: #eff6ff; color: var(--secondary); }
.role-agent { background: #fefce8; color: var(--accent); }
.role-customer { background: #f0fdf4; color: var(--success); }

/* Completion meter */
.completion {
  margin-top: 1.25rem;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.85rem 1rem;
  text-align: left;
}

.completion-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.completion-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text);
}
.completion-label i { color: var(--secondary); margin-right: 0.3rem; }

.completion-pct {
  font-size: 0.82rem;
  font-weight: 700;
  font-family: var(--font-heading);
  color: var(--secondary);
}

.completion-track {
  height: 8px;
  background: var(--border);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.completion-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.6s cubic-bezier(0.34, 1.3, 0.64, 1);
}
.level-low { background: linear-gradient(90deg, #f87171, #ef4444); }
.level-mid { background: linear-gradient(90deg, #fbbf24, #f59e0b); }
.level-high { background: linear-gradient(90deg, #60a5fa, #2563eb); }
.level-full { background: linear-gradient(90deg, #34d399, #16a34a); }

.completion-hint {
  display: block;
  margin-top: 0.45rem;
  color: var(--muted);
  font-size: 0.75rem;
}

/* Info list */
.info-list {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  text-align: left;
}

.info-item { display: flex; align-items: center; gap: 0.75rem; }

.info-icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  background: var(--background);
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.info-icon.status { background: #f0fdf4; color: var(--success); }

.info-text { flex: 1; min-width: 0; }

.info-label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
  font-weight: 600;
}

.info-value { display: block; font-weight: 600; font-size: 0.88rem; }
.info-value.email { word-break: break-all; }
.info-value.status-text { color: var(--success); }

.copy-btn {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  font-size: 0.8rem;
  display: grid;
  place-items: center;
  transition: var(--transition);
}

.copy-btn:hover { border-color: var(--secondary); color: var(--secondary); }
.copy-btn.copied { border-color: var(--success); color: var(--success); background: #f0fdf4; }

/* Quick links */
.quick-links {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border);
  text-align: left;
}

.quick-links-title {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
  font-weight: 600;
  margin-bottom: 0.6rem;
}

.quick-links-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }

.quick-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.8rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  transition: var(--transition);
}

.quick-link i { color: var(--secondary); font-size: 0.78rem; }

.quick-link:hover {
  border-color: var(--secondary);
  background: #eff6ff;
  color: var(--secondary);
  transform: translateY(-1px);
}

/* ==========================================
   Main form column
========================================== */
.profile-main { display: flex; flex-direction: column; gap: 1.25rem; min-width: 0; }

.section-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 1.75rem;
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}

.section-card:hover { box-shadow: var(--shadow); }

.section-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.section-icon {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  background: #eff6ff;
  color: var(--secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.section-icon.security { background: #fff7ed; color: #ea580c; }

.section-title h3 { font-size: 1.05rem; }
.section-title p { color: var(--muted); font-size: 0.85rem; }

.form-group label {
  display: block;
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.45rem;
  color: var(--text);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

/* Password toggle */
.input-wrapper { position: relative; }

.input-wrapper input { padding-right: 2.9rem; }

.password-toggle {
  position: absolute;
  right: 0.6rem;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: none;
  color: var(--muted);
  display: grid;
  place-items: center;
  font-size: 0.9rem;
  transition: var(--transition);
}

.password-toggle:hover { color: var(--secondary); background: #eff6ff; }

/* Strength meter */
.strength {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.6rem;
}

.strength-track { display: flex; gap: 4px; flex: 1; }

.strength-seg {
  height: 5px;
  flex: 1;
  border-radius: 2px;
  background: var(--border);
  transition: background 0.3s ease;
}

.strength-seg.tone-weak { background: #ef4444; }
.strength-seg.tone-fair { background: #f59e0b; }
.strength-seg.tone-good { background: #2563eb; }
.strength-seg.tone-strong { background: #16a34a; }

.strength-label {
  font-size: 0.75rem;
  font-weight: 700;
  min-width: 48px;
  text-align: right;
}
.strength-label.tone-weak { color: #ef4444; }
.strength-label.tone-fair { color: #f59e0b; }
.strength-label.tone-good { color: #2563eb; }
.strength-label.tone-strong { color: #16a34a; }

/* Avatar editor */
.avatar-edit { display: flex; align-items: flex-start; gap: 1.5rem; }

.preview-wrap { position: relative; flex-shrink: 0; }

.avatar-preview {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--secondary);
  display: block;
}

.preview-camera {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--secondary);
  color: #ffffff;
  display: grid;
  place-items: center;
  font-size: 0.75rem;
  border: 2px solid var(--surface);
}

.avatar-input { flex: 1; }

.preview-error { color: var(--danger); }
.preview-error i { margin-right: 0.25rem; }

.password-hint {
  display: block;
  margin-top: 1rem;
  color: var(--muted);
  font-size: 0.8rem;
}

.password-hint i { margin-right: 0.3rem; color: var(--secondary); }

/* ==========================================
   Form footer
========================================== */
.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 0.9rem 1.25rem;
  box-shadow: var(--shadow-sm);
  position: sticky;
  bottom: 12px;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.form-footer.dirty {
  border-color: rgba(245, 158, 11, 0.5);
  box-shadow: 0 8px 24px -8px rgba(245, 158, 11, 0.35);
}

.dirty-pill, .saved-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.83rem;
  font-weight: 600;
}

.dirty-pill { color: #b45309; }
.saved-pill { color: var(--success); }

.footer-actions { display: flex; gap: 0.75rem; }

.btn-ghost {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  transition: var(--transition);
}

.btn-ghost:hover { border-color: var(--danger); color: var(--danger); background: #fef2f2; }

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  border: none;
  transition: var(--transition);
  white-space: nowrap;
}

.btn-primary {
  background: var(--secondary);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.btn-primary:hover:not(:disabled) {
  background: var(--secondary-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
}

/* ==========================================
   Toasts & alerts
========================================== */
.toast {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1.1rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 600;
  overflow: hidden;
}

.toast-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
}

.toast-icon { font-size: 1rem; }

.toast-progress {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 3px;
  width: 100%;
  background: #16a34a;
  transform-origin: left;
  animation: toastBar 4s linear forwards;
}

@keyframes toastBar {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

.toast-enter-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from { opacity: 0; transform: translateY(-10px); }
.toast-leave-to { opacity: 0; transform: translateY(-6px); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.alert-danger {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: var(--danger);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
}

.image-mode-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.mode-tab {
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--background);
  color: var(--muted);
  font-size: 0.82rem;
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

.file-upload-box input {
  padding: 0.5rem;
}

@media (max-width: 960px) {
  .profile-layout { grid-template-columns: 1fr; }
  .profile-summary { position: static; }
}

@media (max-width: 640px) {
  .form-grid { grid-template-columns: 1fr; }
  .avatar-edit { flex-direction: column; align-items: center; }
  .avatar-input { width: 100%; }
  .section-card { padding: 1.25rem; }
  .form-footer { flex-direction: column; align-items: stretch; text-align: center; }
  .footer-actions { flex-direction: column-reverse; }
  .footer-actions .btn { width: 100%; }
}
</style>
