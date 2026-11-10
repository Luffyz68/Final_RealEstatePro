<template>
  <div class="admin-shell">
    <!-- Mobile overlay -->
    <Transition name="fade">
      <button
        v-if="sidebarOpen"
        class="mobile-overlay"
        type="button"
        aria-label="Close sidebar"
        @click="sidebarOpen = false"
      />
    </Transition>

    <!-- =========================
         SIDEBAR
    ========================== -->
    <aside
      class="sidebar"
      :class="{ 'sidebar--open': sidebarOpen }"
    >
      <!-- Brand -->
      <div class="sidebar-brand">
        <router-link
          to="/admin/dashboard"
          class="brand"
          @click="sidebarOpen = false"
        >
          <div class="brand-mark">
            <i class="fa-solid fa-building"></i>
          </div>

          <div class="brand-copy">
            <div class="brand-title">
              RealEstate<span>Pro</span>
            </div>
            <div class="brand-subtitle">ADMIN CONSOLE</div>
          </div>
        </router-link>

        <button
          class="sidebar-close"
          type="button"
          aria-label="Close menu"
          @click="sidebarOpen = false"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Admin mini profile -->
      <router-link
        to="/admin/profile"
        class="admin-card"
        title="Edit Admin Profile"
      >
        <div class="admin-avatar-wrap">
          <img
            :src="authStore.user?.profile_image || defaultAvatar"
            class="admin-avatar"
            alt="Administrator"
            @error="handleAvatarError"
          />
          <span class="status-dot"></span>
        </div>

        <div class="admin-card-info">
          <strong>
            {{ authStore.user?.full_name || 'Administrator' }}
          </strong>

          <span>
            <i class="fa-solid fa-shield-halved"></i>
            {{ authStore.user?.role === 'admin' ? 'Administrator' : (authStore.user?.role || 'User') }}
          </span>
        </div>

        <span
          class="admin-more"
          title="Edit Profile"
        >
          <i class="fa-solid fa-user-pen"></i>
        </span>
      </router-link>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <div class="nav-group">
          <div class="nav-heading">OVERVIEW</div>

          <router-link
            to="/admin/dashboard"
            class="nav-link"
            active-class="active"
          >
            <span class="nav-icon">
              <i class="fa-solid fa-grip"></i>
            </span>

            <span class="nav-text">Dashboard</span>
          </router-link>
        </div>

        <div class="nav-group">
          <div class="nav-heading">PROPERTY MANAGEMENT</div>

          <router-link
            to="/admin/properties"
            class="nav-link"
            active-class="active"
          >
            <span class="nav-icon">
              <i class="fa-solid fa-house-chimney"></i>
            </span>

            <span class="nav-text">Properties</span>

            <span class="nav-chevron">
              <i class="fa-solid fa-chevron-right"></i>
            </span>
          </router-link>

          <router-link
            to="/admin/property-types"
            class="nav-link"
            active-class="active"
          >
            <span class="nav-icon">
              <i class="fa-solid fa-shapes"></i>
            </span>

            <span class="nav-text">Property Types</span>

            <span class="nav-chevron">
              <i class="fa-solid fa-chevron-right"></i>
            </span>
          </router-link>

          <router-link
            to="/admin/locations"
            class="nav-link"
            active-class="active"
          >
            <span class="nav-icon">
              <i class="fa-solid fa-location-dot"></i>
            </span>

            <span class="nav-text">Locations</span>

            <span class="nav-chevron">
              <i class="fa-solid fa-chevron-right"></i>
            </span>
          </router-link>
        </div>

        <div class="nav-group">
          <div class="nav-heading">PEOPLE</div>

          <router-link
            to="/admin/users"
            class="nav-link"
            active-class="active"
          >
            <span class="nav-icon">
              <i class="fa-solid fa-users"></i>
            </span>

            <span class="nav-text">Users & Agents</span>

            <span class="nav-chevron">
              <i class="fa-solid fa-chevron-right"></i>
            </span>
          </router-link>
        </div>

        <div class="nav-group">
          <div class="nav-heading">OPERATIONS</div>

          <router-link
            to="/admin/inquiries"
            class="nav-link"
            active-class="active"
          >
            <span class="nav-icon">
              <i class="fa-regular fa-comments"></i>
            </span>

            <span class="nav-text">Inquiries</span>

            <span class="nav-chevron">
              <i class="fa-solid fa-chevron-right"></i>
            </span>
          </router-link>

          <router-link
            to="/admin/appointments"
            class="nav-link"
            active-class="active"
          >
            <span class="nav-icon">
              <i class="fa-regular fa-calendar-check"></i>
            </span>

            <span class="nav-text">Appointments</span>

            <span class="nav-chevron">
              <i class="fa-solid fa-chevron-right"></i>
            </span>
          </router-link>

          <router-link
            to="/admin/service-requests"
            class="nav-link"
            active-class="active"
          >
            <span class="nav-icon">
              <i class="fa-solid fa-screwdriver-wrench"></i>
            </span>

            <span class="nav-text">Service Requests</span>

            <span class="nav-chevron">
              <i class="fa-solid fa-chevron-right"></i>
            </span>
          </router-link>
        </div>

        <div class="nav-group">
          <div class="nav-heading">ACCOUNT</div>

          <router-link
            to="/admin/profile"
            class="nav-link"
            active-class="active"
          >
            <span class="nav-icon">
              <i class="fa-solid fa-user-gear"></i>
            </span>

            <span class="nav-text">Admin Profile</span>

            <span class="nav-chevron">
              <i class="fa-solid fa-chevron-right"></i>
            </span>
          </router-link>
        </div>
      </nav>

      <!-- Bottom actions -->
      <div class="sidebar-bottom">
        <router-link
          to="/"
          class="sidebar-action sidebar-action--website"
        >
          <span>
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
            View Website
          </span>

          <i class="fa-solid fa-chevron-right"></i>
        </router-link>

        <button
          class="sidebar-action sidebar-action--logout"
          type="button"
          @click="handleLogout"
        >
          <span>
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
            Sign Out
          </span>
        </button>
      </div>
    </aside>

    <!-- =========================
         MAIN AREA
    ========================== -->
    <div class="main-area">
      <!-- Topbar -->
      <header class="topbar">
        <div class="topbar-left">
          <button
            class="menu-button"
            type="button"
            aria-label="Open sidebar"
            @click="sidebarOpen = true"
          >
            <i class="fa-solid fa-bars-staggered"></i>
          </button>

          <div class="page-heading">
            <div class="breadcrumb">
              <span>Admin</span>
              <i class="fa-solid fa-chevron-right"></i>
              <span class="breadcrumb-current">
                {{ currentPageTitle }}
              </span>
            </div>

            <h1>{{ currentPageTitle }}</h1>
          </div>
        </div>

        <div class="topbar-right">
          <!-- Search -->
          <div class="topbar-search">
            <i class="fa-solid fa-magnifying-glass"></i>

            <input
              ref="searchInput"
              type="text"
              v-model="searchQuery"
              placeholder="Search properties, users..."
              aria-label="Search"
              @keydown.enter="handleSearch"
            />

            <span class="search-shortcut" @click="searchInput?.focus()">⌘ K</span>
          </div>

          <!-- Quick Add -->
          <router-link
            to="/admin/properties"
            class="quick-add"
          >
            <i class="fa-solid fa-plus"></i>
            <span>Add Property</span>
          </router-link>

          <!-- Notification -->
          <div class="notification-container" style="position: relative;">
            <button
              class="icon-button"
              type="button"
              aria-label="Notifications"
              :aria-expanded="notificationsOpen"
              @click="notificationsOpen = !notificationsOpen"
            >
              <i class="fa-regular fa-bell"></i>
              <span class="notification-indicator"></span>
            </button>

            <div v-if="notificationsOpen" class="notifications-dropdown" @click="notificationsOpen = false">
              <div class="notifications-header">
                <strong>Admin Quick Shortcuts</strong>
              </div>
              <router-link to="/admin/properties?status=pending" class="notification-item">
                <i class="fa-solid fa-building text-primary"></i>
                <div>
                  <strong>Pending Properties</strong>
                  <small>Review new property submissions</small>
                </div>
              </router-link>
              <router-link to="/admin/inquiries" class="notification-item">
                <i class="fa-regular fa-comment-dots text-secondary"></i>
                <div>
                  <strong>Inquiries</strong>
                  <small>Check customer messages</small>
                </div>
              </router-link>
              <router-link to="/admin/appointments" class="notification-item">
                <i class="fa-regular fa-calendar-check text-success"></i>
                <div>
                  <strong>Appointments</strong>
                  <small>Review tour bookings</small>
                </div>
              </router-link>
              <router-link to="/admin/service-requests" class="notification-item">
                <i class="fa-solid fa-wrench text-warning"></i>
                <div>
                  <strong>Service Requests</strong>
                  <small>Customer maintenance requests</small>
                </div>
              </router-link>
            </div>
          </div>

          <!-- User -->
          <router-link
            to="/admin/profile"
            class="top-user"
            title="Edit Admin Profile"
          >
            <img
              :src="authStore.user?.profile_image || defaultAvatar"
              alt="Admin"
              @error="handleAvatarError"
            />

            <div class="top-user-info">
              <strong>
                {{ authStore.user?.full_name || 'Administrator' }}
              </strong>
              <span>Administrator</span>
            </div>

            <i class="fa-solid fa-chevron-right top-user-arrow"></i>
          </router-link>
        </div>
      </header>

      <!-- Content -->
      <main class="content-wrapper">
        <div class="content-inner">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const sidebarOpen = ref(false);
const notificationsOpen = ref(false);
const searchInput = ref(null);
const searchQuery = ref('');

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/admin/properties', query: { search: searchQuery.value.trim() } });
  }
};

const handleKeydown = (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    searchInput.value?.focus();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown);
});

const defaultAvatar =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

const pageTitles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/properties': 'Properties',
  '/admin/users': 'Users & Agents',
  '/admin/property-types': 'Property Types',
  '/admin/locations': 'Locations',
  '/admin/inquiries': 'Inquiries',
  '/admin/appointments': 'Appointments',
  '/admin/service-requests': 'Service Requests',
  '/admin/profile': 'Admin Profile'
};

const currentPageTitle = computed(() => {
  const exact = pageTitles[route.path];

  if (exact) return exact;

  const match = Object.keys(pageTitles).find(path =>
    route.path.startsWith(path)
  );

  return match
    ? pageTitles[match]
    : 'Administrator Control Center';
});

watch(
  () => route.fullPath,
  () => {
    sidebarOpen.value = false;
  }
);

const handleAvatarError = event => {
  if (!event?.target) return;

  if (event.target.src !== defaultAvatar) {
    event.target.src = defaultAvatar;
  }
};

const handleLogout = async () => {
  await authStore.logout();
  await router.replace('/login');
};
</script>

<style scoped>
/* =========================================================
   DESIGN TOKENS
========================================================= */

.admin-shell {
  --sidebar-width: 282px;

  --bg-page: #f6f7fb;
  --bg-card: #ffffff;

  --sidebar-bg: #11131a;
  --sidebar-bg-soft: #191c25;
  --sidebar-border: rgba(255, 255, 255, 0.07);

  --primary: #635bff;
  --primary-dark: #5148e5;
  --primary-soft: rgba(99, 91, 255, 0.14);

  --text-primary: #171a23;
  --text-secondary: #697386;
  --text-muted: #98a2b3;

  --border: #e8eaf0;

  --danger: #f04438;

  min-height: 100vh;

  background:
    radial-gradient(
      circle at 80% 0%,
      rgba(99, 91, 255, 0.045),
      transparent 28%
    ),
    var(--bg-page);

  color: var(--text-primary);

  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

/* =========================================================
   SIDEBAR
========================================================= */

.sidebar {
  position: fixed;

  inset:
    0 auto 0 0;

  z-index: 1000;

  width: var(--sidebar-width);

  display: flex;
  flex-direction: column;

  background:
    linear-gradient(
      180deg,
      #12141c 0%,
      #0e1016 100%
    );

  border-right:
    1px solid var(--sidebar-border);

  box-shadow:
    10px 0 40px rgba(15, 23, 42, 0.05);

  transition:
    transform 0.28s cubic-bezier(.4, 0, .2, 1);
}

/* =========================================================
   BRAND
========================================================= */

.sidebar-brand {
  height: 86px;

  padding:
    0 20px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  flex-shrink: 0;
}

.brand {
  display: flex;
  align-items: center;

  gap: 12px;

  color: #fff;

  text-decoration: none;
}

.brand-mark {
  width: 42px;
  height: 42px;

  display: grid;
  place-items: center;

  border-radius: 12px;

  color: #fff;

  font-size: 17px;

  background:
    linear-gradient(
      135deg,
      #7367ff,
      #5148e5
    );

  box-shadow:
    0 8px 28px rgba(99, 91, 255, 0.35);
}

.brand-copy {
  display: flex;
  flex-direction: column;

  gap: 3px;
}

.brand-title {
  color: #f8fafc;

  font-size: 18px;
  font-weight: 800;

  letter-spacing: -0.04em;
}

.brand-title span {
  color: #8f88ff;
}

.brand-subtitle {
  color: #5f6675;

  font-size: 9px;
  font-weight: 800;

  letter-spacing: 0.18em;
}

.sidebar-close {
  display: none;

  width: 34px;
  height: 34px;

  border: 0;
  border-radius: 9px;

  background: rgba(255, 255, 255, 0.05);

  color: #9ba3b4;

  cursor: pointer;
}

/* =========================================================
   ADMIN PROFILE
========================================================= */

.admin-card {
  margin:
    4px 14px
    12px;

  padding: 12px;

  display: flex;
  align-items: center;

  gap: 10px;

  background:
    rgba(255, 255, 255, 0.035);

  border:
    1px solid rgba(255, 255, 255, 0.055);

  border-radius: 14px;
}

.admin-avatar-wrap {
  position: relative;

  flex-shrink: 0;
}

.admin-avatar {
  width: 40px;
  height: 40px;

  display: block;

  border-radius: 11px;

  object-fit: cover;
}

.status-dot {
  position: absolute;

  right: -2px;
  bottom: -2px;

  width: 10px;
  height: 10px;

  border:
    2px solid #171a22;

  border-radius: 50%;

  background: #12b76a;
}

.admin-card-info {
  min-width: 0;

  flex: 1;

  display: flex;
  flex-direction: column;

  gap: 3px;
}

.admin-card-info strong {
  overflow: hidden;

  color: #edf0f7;

  font-size: 12.5px;
  font-weight: 650;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.admin-card-info span {
  display: flex;
  align-items: center;

  gap: 4px;

  color: #646b7c;

  font-size: 10px;
}

.admin-more {
  width: 28px;
  height: 28px;

  display: grid;
  place-items: center;

  flex-shrink: 0;

  border: 0;
  border-radius: 7px;

  background: transparent;

  color: #5d6473;

  cursor: pointer;

  transition: 0.2s ease;
}

.admin-more:hover {
  background: rgba(255, 255, 255, 0.05);

  color: #ffffff;
}

/* =========================================================
   NAVIGATION
========================================================= */

.sidebar-nav {
  flex: 1;

  padding:
    8px 14px 18px;

  overflow-y: auto;

  scrollbar-width: none;
}

.sidebar-nav::-webkit-scrollbar {
  display: none;
}

.nav-group {
  margin-bottom: 20px;
}

.nav-heading {
  padding:
    0 10px;

  margin-bottom: 7px;

  color: #424856;

  font-size: 9.5px;
  font-weight: 800;

  letter-spacing: 0.13em;
}

.nav-link {
  position: relative;

  min-height: 44px;

  margin-bottom: 3px;

  padding:
    0 11px;

  display: flex;
  align-items: center;

  gap: 10px;

  color: #818898;

  text-decoration: none;

  border-radius: 10px;

  font-size: 13px;
  font-weight: 520;

  transition:
    color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;
}

.nav-link:hover {
  color: #e8ebf4;

  background:
    rgba(255, 255, 255, 0.038);
}

.nav-link.active {
  color: #ffffff;

  background:
    linear-gradient(
      90deg,
      rgba(99, 91, 255, 0.18),
      rgba(99, 91, 255, 0.07)
    );

  box-shadow:
    inset 0 0 0 1px
    rgba(99, 91, 255, 0.1);
}

.nav-link.active::before {
  content: '';

  position: absolute;

  left: 0;

  width: 3px;
  height: 20px;

  border-radius:
    0 4px 4px 0;

  background: #7c73ff;

  box-shadow:
    0 0 12px rgba(99, 91, 255, 0.6);
}

.nav-icon {
  width: 27px;
  height: 27px;

  display: grid;
  place-items: center;

  flex-shrink: 0;

  border-radius: 8px;

  color: #747b8b;

  font-size: 12px;

  transition: 0.2s ease;
}

.nav-link.active .nav-icon {
  color: #aaa5ff;

  background:
    rgba(99, 91, 255, 0.12);
}

.nav-text {
  flex: 1;
}

.nav-chevron {
  color: #414754;

  font-size: 8px;

  opacity: 0;

  transform: translateX(-4px);

  transition: 0.2s ease;
}

.nav-link:hover .nav-chevron,
.nav-link.active .nav-chevron {
  opacity: 1;

  transform: translateX(0);
}

/* =========================================================
   SIDEBAR BOTTOM
========================================================= */

.sidebar-bottom {
  padding:
    14px;

  flex-shrink: 0;

  border-top:
    1px solid rgba(255, 255, 255, 0.055);
}

.sidebar-action {
  width: 100%;
  min-height: 42px;

  padding:
    0 11px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border-radius: 9px;

  font-family: inherit;
  font-size: 12px;
  font-weight: 600;

  box-sizing: border-box;

  transition: 0.2s ease;
}

.sidebar-action span {
  display: flex;
  align-items: center;

  gap: 9px;
}

.sidebar-action--website {
  margin-bottom: 6px;

  color: #858d9d;

  text-decoration: none;

  background:
    rgba(255, 255, 255, 0.025);

  border:
    1px solid rgba(255, 255, 255, 0.05);
}

.sidebar-action--website:hover {
  color: #fff;

  background:
    rgba(255, 255, 255, 0.055);
}

.sidebar-action--logout {
  color: #f97066;

  border: 0;

  background: transparent;

  cursor: pointer;
}

.sidebar-action--logout:hover {
  background:
    rgba(240, 68, 56, 0.08);
}

/* =========================================================
   MAIN AREA
========================================================= */

.main-area {
  min-height: 100vh;

  margin-left:
    var(--sidebar-width);

  display: flex;
  flex-direction: column;

  min-width: 0;
}

/* =========================================================
   TOPBAR
========================================================= */

.topbar {
  position: sticky;

  top: 0;

  z-index: 100;

  min-height: 82px;

  padding:
    0 28px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 20px;

  background:
    rgba(255, 255, 255, 0.9);

  border-bottom:
    1px solid rgba(230, 232, 239, 0.9);

  backdrop-filter:
    blur(16px);

  -webkit-backdrop-filter:
    blur(16px);
}

.topbar-left {
  min-width: 0;

  display: flex;
  align-items: center;

  gap: 12px;
}

.menu-button {
  display: none;

  width: 40px;
  height: 40px;

  place-items: center;

  flex-shrink: 0;

  border:
    1px solid var(--border);

  border-radius: 10px;

  background: #fff;

  color: #4b5565;

  cursor: pointer;
}

.page-heading {
  min-width: 0;
}

.breadcrumb {
  margin-bottom: 4px;

  display: flex;
  align-items: center;

  gap: 6px;

  color: #a0a7b4;

  font-size: 10px;
  font-weight: 600;
}

.breadcrumb i {
  font-size: 6px;
}

.breadcrumb-current {
  color: #697386;
}

.page-heading h1 {
  margin: 0;

  overflow: hidden;

  color: #171a23;

  font-size: 20px;
  font-weight: 750;

  letter-spacing: -0.035em;

  white-space: nowrap;
  text-overflow: ellipsis;
}

/* =========================================================
   TOPBAR RIGHT
========================================================= */

.topbar-right {
  display: flex;
  align-items: center;

  gap: 9px;
}

.topbar-search {
  width: 245px;
  height: 42px;

  padding:
    0 10px 0 13px;

  display: flex;
  align-items: center;

  gap: 9px;

  border:
    1px solid #e6e8ee;

  border-radius: 11px;

  background: #fafbfc;

  transition:
    border 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.topbar-search:focus-within {
  background: #fff;

  border-color:
    rgba(99, 91, 255, 0.45);

  box-shadow:
    0 0 0 3px rgba(99, 91, 255, 0.08);
}

.topbar-search > i {
  color: #a0a7b4;

  font-size: 12px;
}

.topbar-search input {
  min-width: 0;

  flex: 1;

  border: 0;
  outline: 0;

  background: transparent;

  color: #303542;

  font-family: inherit;
  font-size: 12px;
}

.topbar-search input::placeholder {
  color: #a8aeba;
}

.search-shortcut {
  padding:
    3px 5px;

  color: #98a2b3;

  font-size: 9px;
  font-weight: 700;

  border:
    1px solid #e3e5ea;

  border-radius: 5px;

  background: #ffffff;
}

.quick-add {
  height: 42px;

  padding:
    0 14px;

  display: flex;
  align-items: center;

  gap: 8px;

  border-radius: 10px;

  color: #ffffff;

  text-decoration: none;

  font-size: 12px;
  font-weight: 650;

  background:
    linear-gradient(
      135deg,
      #635bff,
      #554cf2
    );

  box-shadow:
    0 8px 20px rgba(99, 91, 255, 0.18);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.quick-add:hover {
  transform: translateY(-1px);

  box-shadow:
    0 10px 24px rgba(99, 91, 255, 0.26);
}

.icon-button {
  position: relative;

  width: 42px;
  height: 42px;

  display: grid;
  place-items: center;

  border:
    1px solid #e6e8ee;

  border-radius: 10px;

  background: #ffffff;

  color: #667085;

  cursor: pointer;

  transition: 0.2s ease;
}

.icon-button:hover {
  color: var(--primary);

  background: #fafaff;

  border-color:
    rgba(99, 91, 255, 0.28);
}

.notification-indicator {
  position: absolute;

  top: 8px;
  right: 8px;

  width: 6px;
  height: 6px;

  border:
    2px solid #ffffff;

  border-radius: 50%;

  background: #f04438;
}

.notifications-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 280px;
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 1000;
  animation: dropdownIn 0.2s ease;
}

.notifications-header {
  padding: 0.85rem 1rem;
  background: #f8fafc;
  border-bottom: 1px solid var(--border);
  font-size: 0.825rem;
  color: var(--primary);
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: var(--text);
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s ease;
}

.notification-item:hover {
  background: #f8fafc;
}

.notification-item i {
  font-size: 1.1rem;
  width: 24px;
  text-align: center;
}

.notification-item strong {
  display: block;
  font-size: 0.85rem;
  color: var(--primary);
}

.notification-item small {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* =========================================================
   TOP USER
========================================================= */

.top-user {
  min-height: 44px;

  padding:
    3px 6px;

  display: flex;
  align-items: center;

  gap: 9px;

  border: 0;
  border-radius: 11px;

  background: transparent;

  cursor: pointer;

  transition: 0.2s ease;
}

.top-user:hover {
  background: #f7f8fa;
}

.top-user img {
  width: 36px;
  height: 36px;

  border-radius: 10px;

  object-fit: cover;
}

.top-user-info {
  min-width: 105px;

  display: flex;
  flex-direction: column;

  align-items: flex-start;

  gap: 1px;
}

.top-user-info strong {
  max-width: 140px;

  overflow: hidden;

  color: #344054;

  font-size: 11.5px;
  font-weight: 650;

  white-space: nowrap;
  text-overflow: ellipsis;
}

.top-user-info span {
  color: #98a2b3;

  font-size: 9.5px;
}

.top-user-arrow {
  margin-right: 3px;

  color: #98a2b3;

  font-size: 8px;
}

/* =========================================================
   PAGE CONTENT
========================================================= */

.content-wrapper {
  flex: 1;

  width: 100%;

  padding:
    28px;

  box-sizing: border-box;
}

.content-inner {
  width: 100%;

  max-width: 1600px;

  margin:
    0 auto;
}

/* =========================================================
   MOBILE OVERLAY
========================================================= */

.mobile-overlay {
  display: none;
}

/* =========================================================
   TRANSITION
========================================================= */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* =========================================================
   LAPTOP
========================================================= */

@media (max-width: 1250px) {
  .topbar-search {
    width: 200px;
  }

  .quick-add span {
    display: none;
  }

  .quick-add {
    width: 42px;

    padding: 0;

    justify-content: center;
  }
}

/* =========================================================
   TABLET / MOBILE SIDEBAR
========================================================= */

@media (max-width: 980px) {
  .sidebar {
    transform:
      translateX(-100%);
  }

  .sidebar--open {
    transform:
      translateX(0);
  }

  .main-area {
    margin-left: 0;
  }

  .sidebar-close {
    display: grid;
    place-items: center;
  }

  .menu-button {
    display: grid;
  }

  .mobile-overlay {
    position: fixed;

    inset: 0;

    z-index: 999;

    display: block;

    border: 0;

    background:
      rgba(17, 24, 39, 0.44);

    backdrop-filter:
      blur(2px);
  }
}

/* =========================================================
   TABLET
========================================================= */

@media (max-width: 820px) {
  .topbar {
    padding:
      0 18px;
  }

  .topbar-search {
    display: none;
  }

  .content-wrapper {
    padding:
      20px;
  }
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 620px) {
  .topbar {
    min-height: 70px;

    padding:
      0 14px;
  }

  .breadcrumb {
    display: none;
  }

  .page-heading h1 {
    max-width: 150px;

    font-size: 17px;
  }

  .top-user-info,
  .top-user-arrow {
    display: none;
  }

  .top-user {
    padding: 0;
  }

  .top-user img {
    width: 38px;
    height: 38px;

    border-radius: 50%;
  }

  .quick-add {
    width: 38px;
    height: 38px;
  }

  .icon-button {
    width: 38px;
    height: 38px;
  }

  .content-wrapper {
    padding:
      15px;
  }
}

/* =========================================================
   SMALL MOBILE
========================================================= */

@media (max-width: 390px) {
  .sidebar {
    width: min(
      var(--sidebar-width),
      88vw
    );
  }

  .page-heading h1 {
    max-width: 115px;
  }

  .topbar-right {
    gap: 5px;
  }
}
</style>