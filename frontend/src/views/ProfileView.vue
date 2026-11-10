<template>
  <div class="profile-page" :class="{ 'in-admin': isAdminRoute, 'container section': !isAdminRoute }">
    <!-- Header: Shown only when on customer / main website layout to avoid duplicate headers in Admin -->
    <div v-if="!isAdminRoute" class="page-header">
      <div class="header-content">
        <h1>My Profile</h1>
        <p>Manage your personal information, profile photo, and account security</p>
      </div>
      <div class="header-badges">
        <span class="role-pill" :class="`role-${authStore.user?.role}`">
          <i :class="roleIcon"></i> {{ roleLabel }}
        </span>
        <span class="status-pill status-active">
          <span class="pulse-dot"></span> Active Account
        </span>
      </div>
    </div>

    <div class="profile-layout">
      <!-- ==========================================
           LEFT COLUMN: Profile Card & Summary
      ========================================== -->
      <aside class="profile-summary-card">
        <!-- Banner with geometric glow -->
        <div class="summary-hero-banner" :class="`banner-${authStore.user?.role || 'customer'}`">
          <div class="banner-glass"></div>
          <span class="banner-circle c-1"></span>
          <span class="banner-circle c-2"></span>
          <span class="banner-circle c-3"></span>
          <span class="banner-tag">
            <i :class="roleIcon"></i> {{ roleLabel }}
          </span>
        </div>

        <div class="summary-content">
          <!-- Main Avatar Display -->
          <div class="avatar-container">
            <div class="avatar-ring">
              <img
                v-if="effectiveAvatar && !avatarFailed"
                :src="effectiveAvatar"
                class="avatar-img"
                alt="Profile picture"
                @error="avatarFailed = true"
              />
              <div v-else class="avatar-img avatar-fallback">
                {{ userInitials }}
              </div>
            </div>
            <span class="online-indicator" title="Account Active"></span>
            <button
              type="button"
              class="avatar-quick-edit-btn"
              title="Change profile photo"
              @click="focusPhotoSection"
            >
              <i class="fa-solid fa-camera"></i>
            </button>
          </div>

          <!-- Name & Role -->
          <h2 class="user-display-name">{{ authStore.user?.full_name || 'User Profile' }}</h2>
          <p class="user-handle">{{ authStore.user?.email }}</p>

          <!-- Bio Block -->
          <div v-if="authStore.user?.bio" class="bio-quote-block">
            <i class="fa-solid fa-quote-left quote-icon"></i>
            <p>{{ authStore.user.bio }}</p>
          </div>
          <div v-else class="bio-placeholder" @click="focusBioInput">
            <i class="fa-solid fa-pen-nib"></i>
            <span>Add a short bio about yourself...</span>
          </div>

          <!-- Profile Completion Widget -->
          <div class="completion-widget">
            <div class="completion-header">
              <span class="completion-title">
                <i class="fa-solid fa-bolt-lightning"></i> Profile Strength
              </span>
              <span class="completion-percent" :class="completionClass">{{ completionPct }}%</span>
            </div>
            <div class="completion-bar-track">
              <div
                class="completion-bar-fill"
                :class="completionClass"
                :style="{ width: `${completionPct}%` }"
              ></div>
            </div>
            <div class="completion-checklist">
              <span class="check-item" :class="{ done: !!authStore.user?.full_name }">
                <i :class="authStore.user?.full_name ? 'fa-solid fa-check' : 'fa-regular fa-circle'"></i> Name
              </span>
              <span class="check-item" :class="{ done: !!authStore.user?.phone }">
                <i :class="authStore.user?.phone ? 'fa-solid fa-check' : 'fa-regular fa-circle'"></i> Phone
              </span>
              <span class="check-item" :class="{ done: !!authStore.user?.bio }">
                <i :class="authStore.user?.bio ? 'fa-solid fa-check' : 'fa-regular fa-circle'"></i> Bio
              </span>
              <span class="check-item" :class="{ done: !!authStore.user?.profile_image }">
                <i :class="authStore.user?.profile_image ? 'fa-solid fa-check' : 'fa-regular fa-circle'"></i> Photo
              </span>
            </div>
          </div>

          <!-- Details List -->
          <div class="profile-meta-list">
            <div class="meta-row">
              <span class="meta-icon"><i class="fa-regular fa-envelope"></i></span>
              <div class="meta-data">
                <label>Email Address</label>
                <span class="meta-val">{{ authStore.user?.email || '—' }}</span>
              </div>
              <button
                type="button"
                class="copy-icon-btn"
                :class="{ copied: emailCopied }"
                :title="emailCopied ? 'Copied!' : 'Copy Email'"
                @click="copyToClipboard(authStore.user?.email, 'email')"
              >
                <i :class="emailCopied ? 'fa-solid fa-check' : 'fa-regular fa-copy'"></i>
              </button>
            </div>

            <div class="meta-row">
              <span class="meta-icon"><i class="fa-solid fa-phone"></i></span>
              <div class="meta-data">
                <label>Phone Number</label>
                <span class="meta-val">{{ authStore.user?.phone || 'Not provided' }}</span>
              </div>
            </div>

            <div class="meta-row">
              <span class="meta-icon"><i class="fa-regular fa-calendar-days"></i></span>
              <div class="meta-data">
                <label>Member Since</label>
                <span class="meta-val">{{ formatDate(authStore.user?.created_at) }}</span>
              </div>
            </div>

            <div class="meta-row">
              <span class="meta-icon"><i class="fa-solid fa-shield-halved"></i></span>
              <div class="meta-data">
                <label>System Role</label>
                <span class="meta-val role-tag">{{ roleLabel }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Navigation Links -->
          <div class="quick-nav-section">
            <div class="quick-nav-title">Quick Actions</div>
            <div class="quick-nav-grid">
              <router-link
                v-for="link in quickLinks"
                :key="link.to"
                :to="link.to"
                class="quick-nav-pill"
              >
                <i :class="link.icon"></i>
                <span>{{ link.label }}</span>
              </router-link>
            </div>
          </div>
        </div>
      </aside>

      <!-- ==========================================
           RIGHT COLUMN: Interactive Edit Forms
      ========================================== -->
      <form @submit.prevent="handleSaveProfile" class="profile-editor-form">
        <!-- Floating notification toast -->
        <transition name="toast-slide">
          <div v-if="toastMessage" class="floating-toast" :class="`toast-${toastType}`">
            <i :class="toastType === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-triangle-exclamation'"></i>
            <span>{{ toastMessage }}</span>
            <button type="button" class="toast-close-btn" @click="toastMessage = ''">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </transition>

        <!-- Inline alert if error -->
        <div v-if="errorAlert" class="alert-box alert-error">
          <i class="fa-solid fa-circle-exclamation"></i>
          <div>
            <strong>Error updating profile</strong>
            <p>{{ errorAlert }}</p>
          </div>
          <button type="button" class="alert-dismiss" @click="errorAlert = ''">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- CARD 1: Profile Photo Customizer -->
        <div ref="photoSectionRef" class="edit-card photo-card">
          <div class="card-header">
            <div class="card-icon-wrap photo-icon">
              <i class="fa-solid fa-camera-retro"></i>
            </div>
            <div>
              <h3>Profile Picture</h3>
              <p>Upload a photo from your computer, paste an image link, or choose a preset</p>
            </div>
          </div>

          <div class="photo-editor-body">
            <!-- Live Preview Area -->
            <div class="photo-preview-box">
              <div class="preview-avatar-circle">
                <img
                  v-if="form.profile_image && !formPreviewFailed"
                  :src="form.profile_image"
                  class="preview-img"
                  alt="Avatar preview"
                  @error="formPreviewFailed = true"
                />
                <div v-else class="preview-img preview-initials">
                  {{ formInitials }}
                </div>
              </div>
              <span class="preview-caption">Live Preview</span>
              <button
                v-if="form.profile_image"
                type="button"
                class="remove-photo-btn"
                title="Remove profile photo"
                @click="removeProfilePhoto"
              >
                <i class="fa-solid fa-trash-can"></i> Remove Photo
              </button>
            </div>

            <!-- Upload & Selector Controls -->
            <div class="photo-controls">
              <!-- Mode Tabs -->
              <div class="photo-mode-tabs">
                <button
                  type="button"
                  class="mode-btn"
                  :class="{ active: photoMode === 'upload' }"
                  @click="photoMode = 'upload'"
                >
                  <i class="fa-solid fa-cloud-arrow-up"></i> Upload File
                </button>
                <button
                  type="button"
                  class="mode-btn"
                  :class="{ active: photoMode === 'url' }"
                  @click="photoMode = 'url'"
                >
                  <i class="fa-solid fa-link"></i> Image URL
                </button>
                <button
                  type="button"
                  class="mode-btn"
                  :class="{ active: photoMode === 'presets' }"
                  @click="photoMode = 'presets'"
                >
                  <i class="fa-solid fa-wand-magic-sparkles"></i> Preset Avatars
                </button>
              </div>

              <!-- Tab 1: File Upload (drag & drop) -->
              <div v-if="photoMode === 'upload'" class="tab-pane">
                <div
                  class="file-drop-zone"
                  :class="{ 'is-dragging': isDraggingFile }"
                  @dragover.prevent="isDraggingFile = true"
                  @dragleave.prevent="isDraggingFile = false"
                  @drop.prevent="handleFileDrop"
                  @click="$refs.fileInputRef.click()"
                >
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    class="hidden-file-input"
                    @change="handleFileInputChange"
                  />
                  <div class="drop-zone-content">
                    <i class="fa-solid fa-images drop-icon"></i>
                    <p class="drop-main-text">
                      <strong>Click to browse</strong> or drag and drop your photo here
                    </p>
                    <p class="drop-hint-text">PNG, JPG, WebP up to 5MB (auto-cropped to square)</p>
                  </div>
                </div>
                <div v-if="uploadProcessing" class="upload-progress">
                  <i class="fa-solid fa-circle-notch fa-spin"></i> Optimizing and preparing image...
                </div>
              </div>

              <!-- Tab 2: URL Input -->
              <div v-else-if="photoMode === 'url'" class="tab-pane">
                <div class="input-with-icon">
                  <i class="fa-solid fa-globe"></i>
                  <input
                    type="url"
                    v-model="form.profile_image"
                    placeholder="https://images.unsplash.com/photo-..."
                    class="text-input"
                  />
                </div>
                <small v-if="formPreviewFailed && form.profile_image" class="url-error-msg">
                  <i class="fa-solid fa-triangle-exclamation"></i>
                  This image URL could not be loaded. Your gradient initials will be used.
                </small>
                <small v-else class="url-hint">
                  Paste any public HTTPS image link from Unsplash, Imgur, or your website.
                </small>
              </div>

              <!-- Tab 3: Curated Avatar Presets -->
              <div v-else-if="photoMode === 'presets'" class="tab-pane">
                <div class="presets-grid">
                  <button
                    v-for="(preset, idx) in avatarPresets"
                    :key="idx"
                    type="button"
                    class="preset-card"
                    :class="{ selected: form.profile_image === preset.url }"
                    @click="selectPreset(preset.url)"
                  >
                    <img :src="preset.url" :alt="preset.label" class="preset-img" />
                    <span class="preset-label">{{ preset.label }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CARD 2: Personal Information -->
        <div class="edit-card">
          <div class="card-header">
            <div class="card-icon-wrap user-icon">
              <i class="fa-regular fa-id-card"></i>
            </div>
            <div>
              <h3>Personal Information</h3>
              <p>Update your display name, contact phone number, and personal bio</p>
            </div>
          </div>

          <div class="form-fields-grid">
            <!-- Full Name -->
            <div class="form-field-group">
              <label for="fullname">
                Full Name <span class="required-star">*</span>
              </label>
              <div class="input-with-icon">
                <i class="fa-regular fa-user"></i>
                <input
                  id="fullname"
                  type="text"
                  v-model="form.full_name"
                  placeholder="e.g. John Doe"
                  required
                  class="text-input"
                />
              </div>
              <small v-if="form.full_name && form.full_name.trim().length < 2" class="error-text">
                <i class="fa-solid fa-circle-exclamation"></i> Full name must be at least 2 characters.
              </small>
            </div>

            <!-- Email Address -->
            <div class="form-field-group">
              <label for="email">
                Email Address <span class="required-star">*</span>
              </label>
              <div class="input-with-icon">
                <i class="fa-regular fa-envelope"></i>
                <input
                  id="email"
                  type="email"
                  v-model="form.email"
                  placeholder="you@example.com"
                  required
                  class="text-input"
                />
              </div>
              <small v-if="form.email && !isValidEmail(form.email)" class="error-text">
                <i class="fa-solid fa-circle-exclamation"></i> Please enter a valid email address.
              </small>
            </div>

            <!-- Phone Number -->
            <div class="form-field-group">
              <label for="phone">Phone Number</label>
              <div class="input-with-icon">
                <i class="fa-solid fa-phone"></i>
                <input
                  id="phone"
                  type="tel"
                  v-model="form.phone"
                  placeholder="+855 12 345 678"
                  class="text-input"
                />
              </div>
              <small v-if="form.phone && !isValidPhone(form.phone)" class="error-text">
                <i class="fa-solid fa-circle-exclamation"></i> Please enter a valid phone number.
              </small>
            </div>

            <!-- Bio -->
            <div class="form-field-group full-span">
              <div class="label-with-counter">
                <label for="bio">Professional Bio / About</label>
                <span class="char-counter" :class="{ 'char-warning': form.bio && form.bio.length > 450 }">
                  {{ form.bio ? form.bio.length : 0 }} / 500
                </span>
              </div>
              <textarea
                id="bio"
                ref="bioTextareaRef"
                v-model="form.bio"
                rows="3"
                maxlength="500"
                placeholder="Write a brief professional overview, specializations, or introduction..."
                class="textarea-input"
              ></textarea>
              <small class="field-hint">Brief summary shown on your listings and public agent card.</small>
            </div>
          </div>
        </div>

        <!-- CARD 3: Account Security / Change Password -->
        <div class="edit-card security-card">
          <div class="card-header">
            <div class="card-icon-wrap security-icon">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <h3>Security & Password</h3>
              <p>Keep your account secure with a strong password. Leave blank if you don't wish to change it.</p>
            </div>
          </div>

          <div class="form-fields-grid">
            <!-- Current Password -->
            <div class="form-field-group">
              <label for="cur-pass">
                Current Password <span v-if="form.password" class="required-star">*</span>
              </label>
              <div class="input-with-icon">
                <i class="fa-solid fa-key"></i>
                <input
                  id="cur-pass"
                  :type="showCurPass ? 'text' : 'password'"
                  v-model="form.current_password"
                  placeholder="Enter current password"
                  autocomplete="current-password"
                  class="text-input"
                />
                <button
                  type="button"
                  class="toggle-visibility-btn"
                  @click="showCurPass = !showCurPass"
                  title="Toggle password view"
                >
                  <i :class="showCurPass ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                </button>
              </div>
            </div>

            <!-- New Password -->
            <div class="form-field-group">
              <label for="new-pass">New Password</label>
              <div class="input-with-icon">
                <i class="fa-solid fa-lock"></i>
                <input
                  id="new-pass"
                  :type="showNewPass ? 'text' : 'password'"
                  v-model="form.password"
                  placeholder="At least 8 characters"
                  autocomplete="new-password"
                  class="text-input"
                />
                <button
                  type="button"
                  class="toggle-visibility-btn"
                  @click="showNewPass = !showNewPass"
                  title="Toggle password view"
                >
                  <i :class="showNewPass ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                </button>
              </div>

              <!-- Password Strength Meter -->
              <div v-if="form.password" class="password-meter-wrap">
                <div class="meter-track">
                  <span
                    v-for="step in 4"
                    :key="step"
                    class="meter-segment"
                    :class="pwStrength.score >= step ? pwStrength.tone : ''"
                  ></span>
                </div>
                <div class="meter-info">
                  <span class="meter-label" :class="pwStrength.tone">
                    Strength: {{ pwStrength.label }}
                  </span>
                  <span class="meter-hint">Requires upper, lower, number, special char</span>
                </div>
              </div>
            </div>

            <!-- Confirm New Password -->
            <div class="form-field-group">
              <label for="conf-pass">Confirm New Password</label>
              <div class="input-with-icon">
                <i class="fa-solid fa-lock-open"></i>
                <input
                  id="conf-pass"
                  :type="showConfPass ? 'text' : 'password'"
                  v-model="form.confirm_password"
                  placeholder="Repeat new password"
                  autocomplete="new-password"
                  class="text-input"
                />
                <button
                  type="button"
                  class="toggle-visibility-btn"
                  @click="showConfPass = !showConfPass"
                  title="Toggle password view"
                >
                  <i :class="showConfPass ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
                </button>
              </div>

              <small v-if="form.confirm_password && form.password !== form.confirm_password" class="error-text">
                <i class="fa-solid fa-circle-xmark"></i> Passwords do not match.
              </small>
              <small v-else-if="form.confirm_password && form.password === form.confirm_password" class="success-text">
                <i class="fa-solid fa-circle-check"></i> Passwords match!
              </small>
            </div>
          </div>
        </div>

        <!-- CARD 4: Agent Application (Only for customer accounts) -->
        <div v-if="authStore.user?.role === 'customer' || agentRequestStatus" class="edit-card agent-upgrade-card">
          <div class="card-header">
            <div class="card-icon-wrap agent-icon">
              <i class="fa-solid fa-briefcase"></i>
            </div>
            <div>
              <h3>Agent Partnership</h3>
              <p>Apply to become an approved RealEstatePro agent and list your properties</p>
            </div>
          </div>

          <div class="agent-application-body">
            <div v-if="agentRequestStatus === 'pending'" class="status-banner banner-pending">
              <i class="fa-solid fa-hourglass-half banner-icon"></i>
              <div>
                <strong>Application Under Review</strong>
                <p>Your request to become an agent is being processed by the administration team.</p>
              </div>
            </div>

            <div v-else-if="agentRequestStatus === 'rejected'" class="status-banner banner-rejected">
              <i class="fa-solid fa-circle-xmark banner-icon"></i>
              <div>
                <strong>Application Not Approved</strong>
                <p>Your previous application was declined. You may re-submit with updated details.</p>
              </div>
            </div>

            <div v-else-if="agentRequestStatus === 'approved'" class="status-banner banner-approved">
              <i class="fa-solid fa-circle-check banner-icon"></i>
              <div>
                <strong>Application Approved! 🎉</strong>
                <p>You have full Agent privileges. <router-link to="/agent/dashboard">Go to Agent Dashboard →</router-link></p>
              </div>
            </div>

            <div v-if="!agentRequestStatus || agentRequestStatus === 'rejected'" class="application-action">
              <p>Join our professional broker network to publish listings, manage property tours, and close deals.</p>
              <button
                type="button"
                class="btn btn-secondary apply-btn"
                :disabled="submittingAgentReq"
                @click="submitAgentApplication"
              >
                <i v-if="submittingAgentReq" class="fa-solid fa-circle-notch fa-spin"></i>
                <i v-else class="fa-solid fa-paper-plane"></i>
                {{ submittingAgentReq ? 'Submitting...' : 'Apply for Agent Role' }}
              </button>
            </div>
          </div>
        </div>

        <!-- STICKY ACTION BAR -->
        <div class="form-sticky-footer" :class="{ 'has-changes': isDirty }">
          <div class="footer-status-pill">
            <span v-if="isDirty" class="pill-dirty">
              <i class="fa-solid fa-circle-dot"></i> Unsaved changes
            </span>
            <span v-else class="pill-clean">
              <i class="fa-solid fa-circle-check"></i> Profile is up to date
            </span>
          </div>

          <div class="footer-buttons">
            <button
              v-if="isDirty"
              type="button"
              class="btn btn-ghost discard-btn"
              :disabled="savingLoading"
              @click="resetForm"
            >
              <i class="fa-solid fa-rotate-left"></i> Discard
            </button>
            <button
              type="submit"
              class="btn btn-primary save-btn"
              :disabled="savingLoading || !isDirty"
            >
              <i v-if="savingLoading" class="fa-solid fa-circle-notch fa-spin"></i>
              <i v-else class="fa-solid fa-floppy-disk"></i>
              {{ savingLoading ? 'Saving...' : 'Save Profile Changes' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onBeforeUnmount, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { formatDate } from '@/utils/formatters';
import agentRequestService from '@/services/agentRequestService';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Detect whether view is embedded in AdminLayout vs MainLayout
const isAdminRoute = computed(() => route.path.startsWith('/admin'));

// Form and original state
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

// IMPORTANT: Define resetForm BEFORE watch so immediate invocation does not cause TDZ ReferenceError
function resetForm() {
  Object.assign(form, original, {
    password: '',
    current_password: '',
    confirm_password: ''
  });
  formPreviewFailed.value = false;
  errorAlert.value = '';
}

// Sync form whenever authStore.user changes
watch(
  () => authStore.user,
  (newUser) => {
    if (newUser) {
      Object.assign(original, {
        full_name: newUser.full_name || '',
        email: newUser.email || '',
        phone: newUser.phone || '',
        bio: newUser.bio || '',
        profile_image: newUser.profile_image || ''
      });
      resetForm();
    }
  },
  { immediate: true }
);

// Dirty check
const isDirty = computed(() => {
  return (
    form.full_name !== original.full_name ||
    form.email !== original.email ||
    form.phone !== original.phone ||
    form.bio !== original.bio ||
    form.profile_image !== original.profile_image ||
    form.password !== '' ||
    form.current_password !== '' ||
    form.confirm_password !== ''
  );
});

// Role details
const roleIcons = {
  admin: 'fa-solid fa-user-shield',
  agent: 'fa-solid fa-briefcase',
  customer: 'fa-regular fa-user'
};
const roleLabels = {
  admin: 'System Administrator',
  agent: 'Licensed Real Estate Agent',
  customer: 'Valued Client'
};

const roleIcon = computed(() => roleIcons[authStore.user?.role] || 'fa-regular fa-user');
const roleLabel = computed(() => roleLabels[authStore.user?.role] || 'User');

// Quick links suited for each role
const quickLinks = computed(() => {
  if (authStore.isAdmin) {
    return [
      { to: '/admin/dashboard', icon: 'fa-solid fa-gauge', label: 'Admin Dashboard' },
      { to: '/admin/properties', icon: 'fa-solid fa-building', label: 'All Properties' },
      { to: '/admin/users', icon: 'fa-solid fa-users', label: 'Manage Users' },
      { to: '/admin/inquiries', icon: 'fa-regular fa-comments', label: 'Client Inquiries' }
    ];
  }
  if (authStore.isAgent) {
    return [
      { to: '/agent/dashboard', icon: 'fa-solid fa-chart-line', label: 'Agent Dashboard' },
      { to: '/agent/properties', icon: 'fa-solid fa-building-circle-check', label: 'My Listings' },
      { to: '/properties', icon: 'fa-solid fa-magnifying-glass', label: 'Browse Public' }
    ];
  }
  return [
    { to: '/dashboard', icon: 'fa-solid fa-chart-pie', label: 'Client Dashboard' },
    { to: '/favorites', icon: 'fa-solid fa-heart', label: 'Saved Favorites' },
    { to: '/my-appointments', icon: 'fa-regular fa-calendar-check', label: 'My Bookings' },
    { to: '/properties', icon: 'fa-solid fa-magnifying-glass', label: 'Find Homes' }
  ];
});

// Initials generation
const userInitials = computed(() => {
  const name = authStore.user?.full_name?.trim() || '?';
  const parts = name.split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
});

const formInitials = computed(() => {
  const name = form.full_name?.trim() || '?';
  const parts = name.split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
});

// Profile completion percentage
const completionPct = computed(() => {
  let score = 0;
  if (authStore.user?.full_name) score += 25;
  if (authStore.user?.phone) score += 25;
  if (authStore.user?.bio) score += 25;
  if (authStore.user?.profile_image) score += 25;
  return score;
});

const completionClass = computed(() => {
  if (completionPct.value >= 100) return 'pct-full';
  if (completionPct.value >= 75) return 'pct-high';
  if (completionPct.value >= 50) return 'pct-mid';
  return 'pct-low';
});

// Effective avatar image
const avatarFailed = ref(false);
const formPreviewFailed = ref(false);
const effectiveAvatar = computed(() => {
  return form.profile_image || authStore.user?.profile_image || '';
});

watch(
  () => form.profile_image,
  () => {
    formPreviewFailed.value = false;
    avatarFailed.value = false;
  }
);

// Photo studio options
const photoMode = ref('upload');
const isDraggingFile = ref(false);
const uploadProcessing = ref(false);
const fileInputRef = ref(null);
const photoSectionRef = ref(null);
const bioTextareaRef = ref(null);

const avatarPresets = [
  { label: 'Sarah (Agent)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
  { label: 'David (Director)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80' },
  { label: 'Elena (Manager)', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80' },
  { label: 'Michael (Broker)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' },
  { label: 'Jessica (Consultant)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
  { label: 'Robert (Partner)', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80' }
];

function selectPreset(url) {
  form.profile_image = url;
  formPreviewFailed.value = false;
}

function removeProfilePhoto() {
  form.profile_image = '';
  formPreviewFailed.value = false;
}

function focusPhotoSection() {
  if (photoSectionRef.value) {
    photoSectionRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function focusBioInput() {
  if (bioTextareaRef.value) {
    bioTextareaRef.value.focus();
    bioTextareaRef.value.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// Client-side auto crop and resize to square JPEG
function resizeAndProcessImage(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Please select a valid image file.'));
    }
    if (file.size > 8 * 1024 * 1024) {
      return reject(new Error('File exceeds the 8MB limit.'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image into memory.'));
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxDim = 400;
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;

          canvas.width = Math.min(minDim, maxDim);
          canvas.height = Math.min(minDim, maxDim);

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, canvas.width, canvas.height);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          resolve(dataUrl);
        } catch (err) {
          reject(err);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function handleFileInputChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  await processUploadedFile(file);
}

async function handleFileDrop(e) {
  isDraggingFile.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (!file) return;
  await processUploadedFile(file);
}

async function processUploadedFile(file) {
  uploadProcessing.value = true;
  errorAlert.value = '';
  try {
    const resizedDataUrl = await resizeAndProcessImage(file);
    form.profile_image = resizedDataUrl;
    formPreviewFailed.value = false;
    showToast('Photo uploaded and optimized successfully!', 'success');
  } catch (err) {
    errorAlert.value = err.message || 'Error processing image.';
  } finally {
    uploadProcessing.value = false;
    if (fileInputRef.value) fileInputRef.value.value = '';
  }
}

// Copy to clipboard with confirmation
const emailCopied = ref(false);
let copyTimer = null;
async function copyToClipboard(text, type = 'text') {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
  if (type === 'email') {
    emailCopied.value = true;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      emailCopied.value = false;
    }, 2000);
  }
  showToast('Copied to clipboard!', 'success');
}

// Validation helpers
function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}
function isValidPhone(val) {
  return !val || /^[+]?[\d\s()-]{6,25}$/.test(val);
}

// Password toggles & strength
const showCurPass = ref(false);
const showNewPass = ref(false);
const showConfPass = ref(false);

const pwStrength = computed(() => {
  const pw = form.password;
  if (!pw) return { score: 0, label: 'None', tone: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length < 8) score = Math.min(score, 1);

  if (score <= 1) return { score, label: 'Weak', tone: 'meter-weak' };
  if (score === 2) return { score, label: 'Fair', tone: 'meter-fair' };
  if (score === 3) return { score, label: 'Good', tone: 'meter-good' };
  return { score, label: 'Strong', tone: 'meter-strong' };
});

// Toast system
const toastMessage = ref('');
const toastType = ref('success');
let toastTimer = null;

function showToast(msg, type = 'success') {
  toastMessage.value = msg;
  toastType.value = type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastMessage.value = '';
  }, 4000);
}

// Save profile handler
const savingLoading = ref(false);
const errorAlert = ref('');

async function handleSaveProfile() {
  errorAlert.value = '';

  // Validation
  if (!form.full_name || form.full_name.trim().length < 2) {
    errorAlert.value = 'Full name must be at least 2 characters long.';
    return;
  }
  if (!form.email || !isValidEmail(form.email)) {
    errorAlert.value = 'Please enter a valid email address.';
    return;
  }
  if (form.phone && !isValidPhone(form.phone)) {
    errorAlert.value = 'Please enter a valid phone number format.';
    return;
  }
  if (form.password) {
    if (!form.current_password) {
      errorAlert.value = 'Current password is required to set a new password.';
      return;
    }
    if (form.password !== form.confirm_password) {
      errorAlert.value = 'New password and confirm password do not match.';
      return;
    }
    if (form.password.length < 8) {
      errorAlert.value = 'New password must be at least 8 characters long.';
      return;
    }
  }

  savingLoading.value = true;
  const payload = {
    full_name: form.full_name.trim(),
    email: form.email.trim(),
    phone: form.phone?.trim() || null,
    bio: form.bio?.trim() || null,
    profile_image: form.profile_image || null
  };

  if (form.password) {
    payload.password = form.password;
    payload.current_password = form.current_password;
  }

  try {
    const res = await authStore.updateProfile(payload);
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
      avatarFailed.value = false;
      showToast('Profile updated successfully!', 'success');
    }
  } catch (err) {
    errorAlert.value = err.response?.data?.message || 'Failed to update profile. Please check your credentials.';
  } finally {
    savingLoading.value = false;
  }
}

// Agent Request workflow
const agentRequestStatus = ref(null);
const submittingAgentReq = ref(false);

async function loadAgentRequest() {
  if (authStore.user?.role === 'customer' || authStore.user?.role === 'agent') {
    try {
      const res = await agentRequestService.getMyAgentRequest();
      if (res && res.data) {
        agentRequestStatus.value = res.data.status;
        if (res.data.status === 'approved' && authStore.user?.role === 'customer') {
          await authStore.refreshSession();
        }
      }
    } catch {
      // Non-critical, ignore
    }
  }
}

async function submitAgentApplication() {
  submittingAgentReq.value = true;
  errorAlert.value = '';
  try {
    await agentRequestService.submitAgentRequest();
    agentRequestStatus.value = 'pending';
    showToast('Agent application submitted! Our team will review it shortly.', 'success');
  } catch (err) {
    errorAlert.value = err.response?.data?.message || 'Failed to submit agent application.';
  } finally {
    submittingAgentReq.value = false;
  }
}

// Global Ctrl+S shortcut to save profile
function handleKeyDown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    if (isDirty.value && !savingLoading.value) {
      e.preventDefault();
      handleSaveProfile();
    }
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown);
  try {
    await authStore.fetchProfile();
  } catch {
    // Session token handled by store
  }
  loadAgentRequest();
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
  clearTimeout(toastTimer);
  clearTimeout(copyTimer);
});
</script>

<style scoped>
/* =========================================================
   LAYOUT & CONTAINER
========================================================= */
.profile-page {
  width: 100%;
  box-sizing: border-box;
}

/* In standalone website view */
.profile-page:not(.in-admin) {
  padding-top: 2rem;
  padding-bottom: 4rem;
}

/* In Admin Console */
.profile-page.in-admin {
  padding: 0;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border, #e2e8f0);
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-dark, #0f172a);
  margin: 0 0 0.4rem 0;
  letter-spacing: -0.02em;
}

.page-header p {
  color: var(--text-muted, #64748b);
  margin: 0;
  font-size: 0.95rem;
}

.header-badges {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.role-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
}

.role-admin {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.role-agent {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.role-customer {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  animation: pulse-green 2s infinite;
}

@keyframes pulse-green {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

/* Two-column layout */
.profile-layout {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 1.75rem;
  align-items: start;
}

@media (max-width: 1024px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }
}

/* =========================================================
   LEFT COLUMN: PROFILE SUMMARY CARD
========================================================= */
.profile-summary-card {
  background: var(--surface, #ffffff);
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 16px;
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05);
  overflow: hidden;
  position: sticky;
  top: 92px;
}

.summary-hero-banner {
  position: relative;
  height: 120px;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #38bdf8 100%);
  overflow: hidden;
}

.summary-hero-banner.banner-admin {
  background: linear-gradient(135deg, #312e81 0%, #4f46e5 50%, #818cf8 100%);
}

.summary-hero-banner.banner-agent {
  background: linear-gradient(135deg, #064e3b 0%, #059669 50%, #34d399 100%);
}

.banner-glass {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(1px);
}

.banner-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
}

.c-1 { width: 150px; height: 150px; top: -60px; right: -30px; }
.c-2 { width: 90px; height: 90px; bottom: -30px; left: 15%; }
.c-3 { width: 45px; height: 45px; top: 15px; left: 45%; }

.banner-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 0.3rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #ffffff;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.summary-content {
  padding: 0 1.5rem 1.75rem;
  text-align: center;
  margin-top: -60px;
}

.avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: 0.85rem;
}

.avatar-ring {
  width: 116px;
  height: 116px;
  border-radius: 50%;
  padding: 4px;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.avatar-fallback {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.online-indicator {
  position: absolute;
  bottom: 8px;
  right: 10px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #22c55e;
  border: 3px solid #ffffff;
}

.avatar-quick-edit-btn {
  position: absolute;
  bottom: 4px;
  left: 6px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #0f172a;
  color: #ffffff;
  border: 2px solid #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.avatar-quick-edit-btn:hover {
  background: #2563eb;
  transform: scale(1.1);
}

.user-display-name {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-dark, #0f172a);
  margin: 0 0 0.2rem 0;
  letter-spacing: -0.01em;
}

.user-handle {
  font-size: 0.88rem;
  color: var(--text-muted, #64748b);
  margin: 0 0 1rem 0;
}

.bio-quote-block {
  position: relative;
  background: var(--bg-light, #f8fafc);
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 10px;
  padding: 0.85rem 1rem 0.85rem 1.75rem;
  margin-bottom: 1.25rem;
  text-align: left;
}

.quote-icon {
  position: absolute;
  top: 10px;
  left: 8px;
  color: #94a3b8;
  font-size: 0.75rem;
}

.bio-quote-block p {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.5;
  color: #334155;
  font-style: italic;
  word-break: break-word;
}

.bio-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.75rem 1rem;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  color: #64748b;
  font-size: 0.84rem;
  cursor: pointer;
  margin-bottom: 1.25rem;
  transition: all 0.2s;
}

.bio-placeholder:hover {
  background: #eff6ff;
  border-color: #93c5fd;
  color: #1d4ed8;
}

/* Completion Widget */
.completion-widget {
  background: var(--bg-light, #f8fafc);
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.completion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.completion-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.completion-percent {
  font-size: 0.85rem;
  font-weight: 800;
}

.completion-percent.pct-full { color: #16a34a; }
.completion-percent.pct-high { color: #2563eb; }
.completion-percent.pct-mid { color: #d97706; }
.completion-percent.pct-low { color: #dc2626; }

.completion-bar-track {
  height: 8px;
  background: #e2e8f0;
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.completion-bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.4s ease;
}

.completion-bar-fill.pct-full { background: #22c55e; }
.completion-bar-fill.pct-high { background: #3b82f6; }
.completion-bar-fill.pct-mid { background: #f59e0b; }
.completion-bar-fill.pct-low { background: #ef4444; }

.completion-checklist {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.check-item {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.check-item.done {
  color: #16a34a;
  border-color: #bbf7d0;
  background: #f0fdf4;
}

/* Meta Data List */
.profile-meta-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: left;
  margin-bottom: 1.5rem;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid #f1f5f9;
}

.meta-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  flex-shrink: 0;
}

.meta-data {
  flex: 1;
  min-width: 0;
}

.meta-data label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.04em;
  margin-bottom: 0.15rem;
}

.meta-val {
  display: block;
  font-size: 0.86rem;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-val.role-tag {
  color: #2563eb;
}

.copy-icon-btn {
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.copy-icon-btn:hover {
  background: #f8fafc;
  color: #0f172a;
}

.copy-icon-btn.copied {
  background: #f0fdf4;
  color: #16a34a;
  border-color: #bbf7d0;
}

/* Quick Nav Section */
.quick-nav-section {
  text-align: left;
}

.quick-nav-title {
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
  margin-bottom: 0.6rem;
}

.quick-nav-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.quick-nav-pill {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.6rem 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
  text-decoration: none;
  transition: all 0.2s;
}

.quick-nav-pill:hover {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #2563eb;
  transform: translateY(-1px);
}

/* =========================================================
   RIGHT COLUMN: EDIT FORM & CARDS
========================================================= */
.profile-editor-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Floating Toast */
.floating-toast {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 99999;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  font-size: 0.92rem;
  font-weight: 600;
  box-shadow: 0 12px 30px -4px rgba(15, 23, 42, 0.2);
  max-width: 420px;
}

.toast-success {
  background: #0f172a;
  color: #ffffff;
  border-left: 4px solid #22c55e;
}

.toast-error {
  background: #0f172a;
  color: #ffffff;
  border-left: 4px solid #ef4444;
}

.toast-close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  margin-left: auto;
  font-size: 0.9rem;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s ease;
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

/* Alert Box */
.alert-box {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  font-size: 0.9rem;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.alert-box strong {
  display: block;
  margin-bottom: 0.2rem;
}

.alert-box p {
  margin: 0;
  font-size: 0.85rem;
  color: #7f1d1d;
}

.alert-dismiss {
  background: none;
  border: none;
  color: #991b1b;
  cursor: pointer;
  margin-left: auto;
}

/* Card Generic */
.edit-card {
  background: var(--surface, #ffffff);
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
  transition: border-color 0.2s ease;
}

.edit-card:focus-within {
  border-color: #cbd5e1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border, #f1f5f9);
}

.card-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  flex-shrink: 0;
}

.card-icon-wrap.photo-icon { background: #eff6ff; color: #2563eb; }
.card-icon-wrap.user-icon { background: #f0fdf4; color: #16a34a; }
.card-icon-wrap.security-icon { background: #fef3c7; color: #d97706; }
.card-icon-wrap.agent-icon { background: #f3e8ff; color: #9333ea; }

.card-header h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-dark, #0f172a);
  margin: 0 0 0.25rem 0;
}

.card-header p {
  font-size: 0.85rem;
  color: var(--text-muted, #64748b);
  margin: 0;
}

/* Photo Customizer Body */
.photo-editor-body {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 680px) {
  .photo-editor-body {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }
}

.photo-preview-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
}

.preview-avatar-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  padding: 4px;
  background: #ffffff;
  border: 2px dashed #cbd5e1;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
}

.preview-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.preview-initials {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  font-weight: 800;
}

.preview-caption {
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.remove-photo-btn {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 8px;
  padding: 0.35rem 0.65rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.2s;
}

.remove-photo-btn:hover {
  background: #fca5a5;
  color: #991b1b;
}

/* Photo Controls */
.photo-controls {
  width: 100%;
}

.photo-mode-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  background: #f1f5f9;
  padding: 0.35rem;
  border-radius: 10px;
}

.mode-btn {
  flex: 1;
  padding: 0.55rem 0.75rem;
  border-radius: 7px;
  background: none;
  border: none;
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: all 0.2s;
}

.mode-btn.active {
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
}

.tab-pane {
  min-height: 120px;
}

/* File Drop Zone */
.file-drop-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 1.75rem 1.5rem;
  text-align: center;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
}

.file-drop-zone:hover,
.file-drop-zone.is-dragging {
  border-color: #2563eb;
  background: #eff6ff;
}

.hidden-file-input {
  display: none;
}

.drop-icon {
  font-size: 2rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.drop-main-text {
  font-size: 0.92rem;
  color: #334155;
  margin: 0 0 0.25rem 0;
}

.drop-main-text strong {
  color: #2563eb;
}

.drop-hint-text {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}

.upload-progress {
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: #2563eb;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.url-error-msg {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: #dc2626;
  font-size: 0.8rem;
  margin-top: 0.4rem;
}

.url-hint {
  display: block;
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.4rem;
}

/* Presets Grid */
.presets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.75rem;
}

.preset-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  padding: 0.75rem;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-card:hover {
  border-color: #93c5fd;
  background: #eff6ff;
}

.preset-card.selected {
  border-color: #2563eb;
  background: #eff6ff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.preset-img {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  object-fit: cover;
}

.preset-label {
  font-size: 0.74rem;
  font-weight: 600;
  color: #334155;
  text-align: center;
}

/* Form Fields */
.form-fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

@media (max-width: 640px) {
  .form-fields-grid {
    grid-template-columns: 1fr;
  }
}

.full-span {
  grid-column: 1 / -1;
}

.form-field-group {
  display: flex;
  flex-direction: column;
}

.form-field-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.45rem;
}

.required-star {
  color: #ef4444;
  font-weight: 700;
}

.label-with-counter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.45rem;
}

.char-counter {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
}

.char-counter.char-warning {
  color: #d97706;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon > i:first-child {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  font-size: 0.95rem;
  pointer-events: none;
}

.text-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.65rem;
  background: var(--surface, #ffffff);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  font-size: 0.92rem;
  color: var(--text-dark, #0f172a);
  transition: all 0.2s;
  box-sizing: border-box;
}

.text-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.textarea-input {
  width: 100%;
  padding: 0.85rem 1rem;
  background: var(--surface, #ffffff);
  border: 1px solid var(--border, #cbd5e1);
  border-radius: 10px;
  font-size: 0.92rem;
  color: var(--text-dark, #0f172a);
  font-family: inherit;
  resize: vertical;
  line-height: 1.5;
  box-sizing: border-box;
  transition: all 0.2s;
}

.textarea-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.field-hint {
  font-size: 0.78rem;
  color: #64748b;
  margin-top: 0.35rem;
}

.toggle-visibility-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  font-size: 0.95rem;
}

.toggle-visibility-btn:hover {
  color: #475569;
}

.error-text {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: #dc2626;
  font-weight: 500;
  margin-top: 0.35rem;
}

.success-text {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: #16a34a;
  font-weight: 500;
  margin-top: 0.35rem;
}

/* Password Strength Meter */
.password-meter-wrap {
  margin-top: 0.5rem;
}

.meter-track {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  margin-bottom: 0.35rem;
}

.meter-segment {
  height: 5px;
  background: #e2e8f0;
  border-radius: 9999px;
  transition: background-color 0.3s;
}

.meter-segment.meter-weak { background: #ef4444; }
.meter-segment.meter-fair { background: #f59e0b; }
.meter-segment.meter-good { background: #3b82f6; }
.meter-segment.meter-strong { background: #10b981; }

.meter-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.74rem;
}

.meter-label {
  font-weight: 700;
}
.meter-label.meter-weak { color: #dc2626; }
.meter-label.meter-fair { color: #d97706; }
.meter-label.meter-good { color: #2563eb; }
.meter-label.meter-strong { color: #059669; }

.meter-hint {
  color: #64748b;
}

/* Agent Application Card */
.agent-upgrade-card {
  border-left: 4px solid #a855f7;
}

.status-banner {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.banner-pending {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1e40af;
}

.banner-rejected {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
}

.banner-approved {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
}

.banner-icon {
  font-size: 1.2rem;
  margin-top: 2px;
}

.status-banner strong {
  display: block;
  font-size: 0.95rem;
  margin-bottom: 0.2rem;
}

.status-banner p {
  margin: 0;
  font-size: 0.85rem;
}

.application-action p {
  font-size: 0.9rem;
  color: #475569;
  margin: 0 0 1rem 0;
}

.apply-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

/* STICKY ACTION FOOTER */
.form-sticky-footer {
  position: sticky;
  bottom: 20px;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(12px);
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
  color: #ffffff;
}

.form-sticky-footer.has-changes {
  border: 1px solid #3b82f6;
  box-shadow: 0 12px 35px rgba(37, 99, 235, 0.35);
}

.footer-status-pill {
  font-size: 0.88rem;
  font-weight: 600;
}

.pill-dirty {
  color: #fbbf24;
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.pill-clean {
  color: #4ade80;
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.footer-buttons {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.discard-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.65rem 1.15rem;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;
}

.discard-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.save-btn {
  background: #2563eb;
  color: #ffffff;
  border: none;
  padding: 0.65rem 1.4rem;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.save-btn:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.save-btn:disabled,
.discard-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
