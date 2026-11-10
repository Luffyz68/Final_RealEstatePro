<template>
  <header class="navbar">
    <div class="container navbar-container">
      <router-link to="/" class="brand-logo">
        <div class="logo-icon">
          <i class="fa-solid fa-building"></i>
        </div>
        <div class="logo-text">RealEstate<span>Pro</span></div>
      </router-link>

      <nav class="nav-links" :class="{ 'nav-open': mobileMenuOpen }">
        <router-link to="/" class="nav-link" exact-active-class="active">
          Home
        </router-link>
        <router-link to="/properties" class="nav-link" :class="{ active: isPropertiesActive }">
          Properties
        </router-link>
        <router-link to="/properties?listing_type=sale" class="nav-link" :class="{ active: isForSaleActive }">
          For Sale
        </router-link>
        <router-link to="/properties?listing_type=rent" class="nav-link" :class="{ active: isForRentActive }">
          For Rent
        </router-link>
        <router-link to="/about" class="nav-link" exact-active-class="active">
          About
        </router-link>

        <template v-if="authStore.isAuthenticated">
          <router-link v-if="authStore.isAdmin" to="/admin/dashboard" class="nav-link badge-nav admin-badge">
            <i class="fa-solid fa-gauge"></i> Admin Dashboard
          </router-link>
          <router-link v-if="authStore.isAgent" to="/agent/dashboard" class="nav-link badge-nav agent-badge">
            <i class="fa-solid fa-briefcase"></i> Agent Dashboard
          </router-link>
        </template>
      </nav>

      <div class="navbar-actions">
        <template v-if="!authStore.isAuthenticated">
          <router-link to="/login" class="btn btn-outline">
            <i class="fa-regular fa-user"></i> Log In
          </router-link>
          <router-link to="/register" class="btn btn-primary">
            Register
          </router-link>
        </template>

        <template v-else>
          <router-link to="/favorites" class="fav-link" title="Favorites">
            <i class="fa-solid fa-heart"></i>
          </router-link>

          <div ref="dropdownRef" class="user-dropdown-container">
            <button class="user-menu-btn" :aria-expanded="dropdownOpen" @click="dropdownOpen = !dropdownOpen">
              <img :src="authStore.user?.profile_image || defaultAvatar" class="avatar" alt="Avatar" />
              <span class="user-name">{{ authStore.user?.full_name }}</span>
              <i class="fa-solid fa-chevron-down"></i>
            </button>

            <div v-if="dropdownOpen" class="user-dropdown-menu" @click="dropdownOpen = false">
              <div class="dropdown-header">
                <strong>{{ authStore.user?.full_name }}</strong>
                <small>{{ authStore.user?.email }} ({{ authStore.user?.role }})</small>
              </div>

              <router-link to="/profile" class="dropdown-item">
                <i class="fa-regular fa-id-card"></i> My Profile
              </router-link>
              <router-link v-if="authStore.isCustomer" to="/dashboard" class="dropdown-item">
                <i class="fa-solid fa-chart-pie"></i> My Dashboard
              </router-link>
              <router-link v-if="authStore.isCustomer" to="/my-inquiries" class="dropdown-item">
                <i class="fa-regular fa-comment-dots"></i> My Inquiries
              </router-link>
              <router-link v-if="authStore.isCustomer" to="/my-appointments" class="dropdown-item">
                <i class="fa-regular fa-calendar-check"></i> My Appointments
              </router-link>
              <router-link v-if="authStore.isCustomer" to="/my-service-requests" class="dropdown-item">
                <i class="fa-solid fa-wrench"></i> Service Requests
              </router-link>

              <button class="dropdown-item logout-item" @click="handleLogout">
                <i class="fa-solid fa-right-from-bracket"></i> Logout
              </button>
            </div>
          </div>
        </template>

        <button
          class="mobile-toggle"
          :aria-expanded="mobileMenuOpen"
          aria-label="Toggle navigation menu"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <i :class="mobileMenuOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'"></i>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const mobileMenuOpen = ref(false);
const dropdownOpen = ref(false);
const dropdownRef = ref(null);

const defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

const isPropertiesActive = computed(() =>
  route.path.startsWith('/properties') && !route.query.listing_type
);
const isForSaleActive = computed(() =>
  route.path === '/properties' && route.query.listing_type === 'sale'
);
const isForRentActive = computed(() =>
  route.path === '/properties' && route.query.listing_type === 'rent'
);

const closeOnClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    dropdownOpen.value = false;
  }
};

const closeOnEscape = (event) => {
  if (event.key === 'Escape') {
    dropdownOpen.value = false;
    mobileMenuOpen.value = false;
  }
};

watch(() => route.fullPath, () => {
  mobileMenuOpen.value = false;
  dropdownOpen.value = false;
});

onMounted(() => {
  document.addEventListener('click', closeOnClickOutside);
  document.addEventListener('keydown', closeOnEscape);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', closeOnClickOutside);
  document.removeEventListener('keydown', closeOnEscape);
});

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
/* ==========================================
   Base Variables & Navbar Container
========================================== */
.navbar {
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.25s ease;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* ==========================================
   Brand & Logo
========================================== */
.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  flex-shrink: 0;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.brand-logo:hover {
  transform: translateY(-1px);
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 1.15rem;
  box-shadow: 0 6px 14px -3px rgba(37, 99, 235, 0.35);
}

.logo-text {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: #0f172a;
}

.logo-text span {
  color: #2563eb;
}

/* ==========================================
   Nav Links
========================================== */
.nav-links {
  display: flex;
  align-items: center;
  gap: 1.75rem;
}

.nav-link {
  position: relative;
  font-weight: 500;
  font-size: 0.95rem;
  color: #64748b;
  text-decoration: none;
  padding: 0.4rem 0;
  transition: color 0.2s ease;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #2563eb;
  border-radius: 2px;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-link:hover,
.nav-link.active {
  color: #0f172a;
}

.nav-link.active::after,
.nav-link:hover::after {
  width: 100%;
}

/* Role Badges */
.badge-nav {
  padding: 0.4rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s ease;
}

.badge-nav::after {
  display: none;
}

.admin-badge {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid rgba(37, 99, 235, 0.15);
}

.admin-badge:hover {
  background: #dbeafe;
}

.agent-badge {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.agent-badge:hover {
  background: #dcfce7;
}

/* ==========================================
   Navbar Actions & Buttons
========================================== */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.55rem 1.15rem;
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: none;
}

.btn-outline {
  color: #334155;
  background: transparent;
  border: 1px solid #cbd5e1;
}

.btn-outline:hover {
  background: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
}

.btn-primary {
  background: #2563eb;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.btn-primary:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
}

/* Favorites Button */
.fav-link {
  color: #ef4444;
  font-size: 1.15rem;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  transition: all 0.2s ease;
  text-decoration: none;
}

.fav-link:hover {
  transform: scale(1.08);
  background: #fee2e2;
}

/* ==========================================
   User Dropdown Menu
========================================== */
.user-dropdown-container {
  position: relative;
}

.user-menu-btn {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 0.3rem 0.75rem 0.3rem 0.35rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-menu-btn:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-weight: 600;
  font-size: 0.875rem;
  color: #1e293b;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-menu-btn .fa-chevron-down {
  font-size: 0.65rem;
  color: #94a3b8;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-menu-btn[aria-expanded='true'] .fa-chevron-down {
  transform: rotate(180deg);
}

.user-dropdown-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  width: 240px;
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 14px;
  box-shadow: 0 14px 34px -4px rgba(15, 23, 42, 0.12), 0 4px 10px -2px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1100;
  animation: dropdownIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes dropdownIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dropdown-header {
  padding: 0.85rem 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.dropdown-header strong {
  color: #0f172a;
  font-size: 0.875rem;
  line-height: 1.2;
}

.dropdown-header small {
  color: #64748b;
  font-size: 0.75rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1rem;
  color: #334155;
  font-size: 0.875rem;
  font-weight: 500;
  background: transparent;
  border: none;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
  width: 100%;
}

.dropdown-item i {
  color: #94a3b8;
  font-size: 0.95rem;
  transition: color 0.15s ease;
}

.dropdown-item:hover {
  background: #f1f5f9;
  color: #2563eb;
}

.dropdown-item:hover i {
  color: #2563eb;
}

.logout-item {
  color: #ef4444;
  border-top: 1px solid #e2e8f0;
  margin-top: 0.25rem;
}

.logout-item i {
  color: #ef4444;
}

.logout-item:hover {
  background: #fef2f2;
  color: #dc2626;
}

.logout-item:hover i {
  color: #dc2626;
}

/* ==========================================
   Mobile Toggle & Responsive Styles
========================================== */
.mobile-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #334155;
  padding: 0.4rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.mobile-toggle:hover {
  background: #f1f5f9;
}

@media (max-width: 900px) {
  .mobile-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .user-name {
    display: none;
  }

  .nav-links {
    position: absolute;
    top: 72px;
    left: 0;
    width: 100%;
    background: #ffffff;
    flex-direction: column;
    align-items: flex-start;
    padding: 1.25rem 1.5rem;
    gap: 0.5rem;
    border-bottom: 1px solid #e2e8f0;
    box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.08);
    display: none;
  }

  .nav-links.nav-open {
    display: flex;
  }

  .nav-link {
    width: 100%;
    padding: 0.6rem 0;
  }

  .nav-link::after {
    display: none;
  }

  .badge-nav {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>