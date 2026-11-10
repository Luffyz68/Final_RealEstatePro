<template>
  <div class="agent-layout">
    <!-- Mobile Overlay -->
    <div
      v-if="sidebarOpen"
      class="sidebar-overlay"
      @click="sidebarOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside
      class="sidebar"
      :class="{ 'sidebar-open': sidebarOpen }"
    >
      <!-- Brand -->
      <div class="sidebar-header">
        <router-link to="/agent/dashboard" class="brand">
          <div class="logo-icon">
            <i class="fa-solid fa-building"></i>
          </div>

          <div class="logo-text">
            <div class="brand-name">
              RealEstate<span>Pro</span>
            </div>
            <small>Agent Portal</small>
          </div>
        </router-link>

        <button
          class="mobile-close"
          type="button"
          aria-label="Close sidebar"
          @click="sidebarOpen = false"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Profile -->
      <router-link to="/agent/profile" class="agent-profile" style="text-decoration: none;" title="Edit Profile">
        <img
          :src="authStore.user?.profile_image || defaultAvatar"
          class="profile-avatar"
          alt="Agent profile"
          @error="handleImageError"
        />

        <div class="profile-info">
          <strong>{{ authStore.user?.full_name || 'Agent' }}</strong>
          <span>Real Estate Agent</span>
        </div>

        <span class="online-indicator"></span>
      </router-link>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <p class="nav-label">MAIN MENU</p>

        <router-link
          to="/agent/dashboard"
          class="nav-item"
          active-class="active"
          @click="closeMobileSidebar"
        >
          <span class="nav-icon">
            <i class="fa-solid fa-chart-pie"></i>
          </span>
          <span class="nav-text">Dashboard</span>
        </router-link>

        <router-link
          to="/agent/properties"
          class="nav-item"
          active-class="active"
          @click="closeMobileSidebar"
        >
          <span class="nav-icon">
            <i class="fa-solid fa-house"></i>
          </span>
          <span class="nav-text">My Properties</span>
        </router-link>

        <router-link
          to="/agent/inquiries"
          class="nav-item"
          active-class="active"
          @click="closeMobileSidebar"
        >
          <span class="nav-icon">
            <i class="fa-regular fa-comment-dots"></i>
          </span>
          <span class="nav-text">Property Inquiries</span>
        </router-link>

        <router-link
          to="/agent/appointments"
          class="nav-item"
          active-class="active"
          @click="closeMobileSidebar"
        >
          <span class="nav-icon">
            <i class="fa-regular fa-calendar-check"></i>
          </span>
          <span class="nav-text">Appointments</span>
        </router-link>

        <router-link
          to="/agent/profile"
          class="nav-item"
          active-class="active"
          @click="closeMobileSidebar"
        >
          <span class="nav-icon">
            <i class="fa-solid fa-user-pen"></i>
          </span>
          <span class="nav-text">My Profile</span>
        </router-link>
      </nav>

      <!-- Footer -->
      <div class="sidebar-footer">
        <router-link to="/" class="website-btn">
          <i class="fa-solid fa-arrow-up-right-from-square"></i>
          <span>View Website</span>
        </router-link>

        <button
          type="button"
          class="logout-btn"
          @click="handleLogout"
        >
          <i class="fa-solid fa-right-from-bracket"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div class="agent-main">
      <!-- Header -->
      <header class="top-header">
        <div class="header-left">
          <button
            class="menu-btn"
            type="button"
            aria-label="Open sidebar"
            @click="sidebarOpen = true"
          >
            <i class="fa-solid fa-bars"></i>
          </button>

          <div>
            <p class="header-label">AGENT PORTAL</p>
            <h1>Agent Workspace</h1>
          </div>
        </div>

        <div class="header-actions">
          <!-- Notification -->
          <button
            type="button"
            class="header-icon-btn"
            aria-label="Notifications"
          >
            <i class="fa-regular fa-bell"></i>
            <span class="notification-dot"></span>
          </button>

          <!-- User -->
          <div class="user-badge">
            <img
              :src="authStore.user?.profile_image || defaultAvatar"
              class="avatar"
              alt="Agent avatar"
              @error="handleImageError"
            />

            <div class="user-info">
              <strong>{{ authStore.user?.full_name || 'Agent' }}</strong>
              <span>Agent</span>
            </div>

            <i class="fa-solid fa-chevron-down user-arrow"></i>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="page-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const router = useRouter();

const sidebarOpen = ref(false);

const defaultAvatar =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80';

const closeMobileSidebar = () => {
  sidebarOpen.value = false;
};

const handleImageError = (event) => {
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
/* =========================
   LAYOUT
========================= */

.agent-layout {
  min-height: 100vh;
  background: #f5f7fb;
  color: #0f172a;
}

/* =========================
   SIDEBAR
========================= */

.sidebar {
  width: 275px;
  height: 100vh;

  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;

  display: flex;
  flex-direction: column;

  background:
    linear-gradient(
      180deg,
      #0f172a 0%,
      #111c32 55%,
      #0b1220 100%
    );

  color: #ffffff;

  border-right: 1px solid rgba(255, 255, 255, 0.06);

  box-shadow:
    10px 0 40px rgba(15, 23, 42, 0.08);

  transition: transform 0.3s ease;
}

/* =========================
   BRAND
========================= */

.sidebar-header {
  min-height: 88px;

  padding: 1.35rem;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.brand {
  display: flex;
  align-items: center;

  gap: 0.85rem;

  color: #ffffff;
  text-decoration: none;
}

.logo-icon {
  width: 44px;
  height: 44px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 13px;

  font-size: 1.15rem;

  color: #ffffff;

  background:
    linear-gradient(
      135deg,
      #2563eb,
      #3b82f6
    );

  box-shadow:
    0 8px 25px rgba(37, 99, 235, 0.3);
}

.logo-text {
  line-height: 1.1;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.brand-name span {
  color: #60a5fa;
}

.logo-text small {
  display: block;

  margin-top: 0.35rem;

  color: #64748b;

  font-size: 0.63rem;
  font-weight: 700;

  letter-spacing: 0.15em;

  text-transform: uppercase;
}

.mobile-close {
  display: none;

  width: 36px;
  height: 36px;

  border: 0;
  border-radius: 9px;

  background: rgba(255, 255, 255, 0.07);

  color: #cbd5e1;

  cursor: pointer;

  font-size: 1rem;
}

/* =========================
   AGENT PROFILE
========================= */

.agent-profile {
  position: relative;

  margin: 1.2rem 1rem 0;

  padding: 1rem;

  display: flex;
  align-items: center;

  gap: 0.75rem;

  border: 1px solid rgba(255, 255, 255, 0.07);

  border-radius: 14px;

  background: rgba(255, 255, 255, 0.045);
}

.profile-avatar {
  width: 43px;
  height: 43px;

  border-radius: 12px;

  object-fit: cover;

  border: 2px solid rgba(255, 255, 255, 0.15);
}

.profile-info {
  min-width: 0;

  display: flex;
  flex-direction: column;

  gap: 0.2rem;
}

.profile-info strong {
  overflow: hidden;

  color: #f8fafc;

  font-size: 0.9rem;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-info span {
  color: #64748b;

  font-size: 0.72rem;
}

.online-indicator {
  position: absolute;

  right: 14px;

  width: 8px;
  height: 8px;

  border-radius: 50%;

  background: #22c55e;

  box-shadow:
    0 0 0 3px rgba(34, 197, 94, 0.12);
}

/* =========================
   NAVIGATION
========================= */

.sidebar-nav {
  flex: 1;

  padding: 1.4rem 1rem;

  overflow-y: auto;

  scrollbar-width: thin;
}

.nav-label {
  margin: 0 0 0.65rem 0.8rem;

  color: #475569;

  font-size: 0.64rem;
  font-weight: 800;

  letter-spacing: 0.14em;
}

.nav-item {
  position: relative;

  min-height: 48px;

  margin-bottom: 0.35rem;

  padding: 0.65rem 0.75rem;

  display: flex;
  align-items: center;

  gap: 0.85rem;

  border-radius: 11px;

  color: #94a3b8;

  text-decoration: none;

  font-size: 0.9rem;
  font-weight: 550;

  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.nav-item::before {
  content: '';

  position: absolute;

  left: -1rem;

  width: 3px;
  height: 24px;

  border-radius: 0 5px 5px 0;

  background: #3b82f6;

  opacity: 0;

  transform: scaleY(0);

  transition: 0.2s ease;
}

.nav-icon {
  width: 34px;
  height: 34px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 9px;

  background: rgba(255, 255, 255, 0.04);

  font-size: 0.95rem;

  transition: 0.2s ease;
}

.nav-item:hover {
  color: #ffffff;

  background: rgba(255, 255, 255, 0.05);

  transform: translateX(3px);
}

.nav-item.active {
  color: #ffffff;

  background:
    linear-gradient(
      90deg,
      rgba(37, 99, 235, 0.22),
      rgba(37, 99, 235, 0.08)
    );
}

.nav-item.active::before {
  opacity: 1;
  transform: scaleY(1);
}

.nav-item.active .nav-icon {
  color: #60a5fa;

  background: rgba(59, 130, 246, 0.15);
}

/* =========================
   SIDEBAR FOOTER
========================= */

.sidebar-footer {
  padding: 1rem;

  display: flex;
  flex-direction: column;

  gap: 0.55rem;

  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.website-btn,
.logout-btn {
  width: 100%;
  min-height: 44px;

  padding: 0 0.9rem;

  display: flex;
  align-items: center;

  gap: 0.75rem;

  border-radius: 10px;

  font-size: 0.86rem;
  font-weight: 600;

  cursor: pointer;

  transition: 0.2s ease;
}

.website-btn {
  color: #cbd5e1;

  text-decoration: none;

  border: 1px solid rgba(255, 255, 255, 0.08);

  background: rgba(255, 255, 255, 0.035);
}

.website-btn:hover {
  color: #ffffff;

  background: rgba(255, 255, 255, 0.07);
}

.logout-btn {
  color: #f87171;

  border: 1px solid rgba(239, 68, 68, 0.12);

  background: rgba(239, 68, 68, 0.06);
}

.logout-btn:hover {
  color: #ffffff;

  border-color: #ef4444;

  background: #ef4444;
}

/* =========================
   MAIN
========================= */

.agent-main {
  min-height: 100vh;

  margin-left: 275px;

  display: flex;
  flex-direction: column;

  transition: margin 0.3s ease;
}

/* =========================
   HEADER
========================= */

.top-header {
  height: 80px;

  position: sticky;
  top: 0;

  z-index: 100;

  padding: 0 2rem;

  display: flex;
  align-items: center;
  justify-content: space-between;

  background: rgba(255, 255, 255, 0.96);

  border-bottom: 1px solid #e8edf5;

  backdrop-filter: blur(12px);
}

.header-left {
  display: flex;
  align-items: center;

  gap: 1rem;
}

.header-label {
  margin: 0 0 0.15rem;

  color: #94a3b8;

  font-size: 0.63rem;
  font-weight: 800;

  letter-spacing: 0.12em;
}

.top-header h1 {
  margin: 0;

  color: #0f172a;

  font-size: 1.25rem;
  font-weight: 750;

  letter-spacing: -0.025em;
}

.menu-btn {
  display: none;

  width: 42px;
  height: 42px;

  border: 1px solid #e2e8f0;
  border-radius: 11px;

  background: #ffffff;

  color: #475569;

  cursor: pointer;
}

.header-actions {
  display: flex;
  align-items: center;

  gap: 0.75rem;
}

.header-icon-btn {
  position: relative;

  width: 42px;
  height: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  border: 1px solid #e2e8f0;
  border-radius: 12px;

  background: #ffffff;

  color: #64748b;

  cursor: pointer;

  font-size: 1rem;

  transition: 0.2s ease;
}

.header-icon-btn:hover {
  color: #2563eb;

  border-color: #bfdbfe;

  background: #eff6ff;
}

.notification-dot {
  position: absolute;

  top: 8px;
  right: 8px;

  width: 7px;
  height: 7px;

  border: 2px solid #ffffff;
  border-radius: 50%;

  background: #ef4444;
}

/* =========================
   USER BADGE
========================= */

.user-badge {
  min-height: 48px;

  padding: 0.35rem 0.55rem;

  display: flex;
  align-items: center;

  gap: 0.65rem;

  border: 1px solid #e2e8f0;
  border-radius: 13px;

  background: #ffffff;

  cursor: pointer;
}

.avatar {
  width: 37px;
  height: 37px;

  border-radius: 10px;

  object-fit: cover;
}

.user-info {
  min-width: 110px;

  display: flex;
  flex-direction: column;

  gap: 0.1rem;
}

.user-info strong {
  color: #1e293b;

  font-size: 0.82rem;
  font-weight: 650;
}

.user-info span {
  color: #94a3b8;

  font-size: 0.68rem;
}

.user-arrow {
  padding: 0 0.35rem;

  color: #94a3b8;

  font-size: 0.65rem;
}

/* =========================
   CONTENT
========================= */

.page-content {
  flex: 1;

  width: 100%;

  padding: 2rem;

  box-sizing: border-box;
}

/* =========================
   OVERLAY
========================= */

.sidebar-overlay {
  display: none;
}

/* =========================
   TABLET
========================= */

@media (max-width: 1100px) {
  .page-content {
    padding: 1.5rem;
  }

  .top-header {
    padding: 0 1.5rem;
  }
}

/* =========================
   MOBILE
========================= */

@media (max-width: 900px) {
  .sidebar {
    width: 275px;

    transform: translateX(-100%);
  }

  .sidebar.sidebar-open {
    transform: translateX(0);
  }

  .agent-main {
    margin-left: 0;
  }

  .menu-btn,
  .mobile-close {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sidebar-overlay {
    display: block;

    position: fixed;

    inset: 0;

    z-index: 999;

    background: rgba(15, 23, 42, 0.45);

    backdrop-filter: blur(2px);
  }
}

/* =========================
   SMALL MOBILE
========================= */

@media (max-width: 600px) {
  .top-header {
    height: 70px;

    padding: 0 1rem;
  }

  .page-content {
    padding: 1rem;
  }

  .header-label {
    display: none;
  }

  .top-header h1 {
    font-size: 1.05rem;
  }

  .user-info,
  .user-arrow {
    display: none;
  }

  .user-badge {
    min-height: auto;

    padding: 0.25rem;

    border: none;
  }

  .avatar {
    width: 39px;
    height: 39px;

    border-radius: 50%;
  }

  .header-actions {
    gap: 0.4rem;
  }

  .header-icon-btn {
    width: 39px;
    height: 39px;
  }
}
</style>