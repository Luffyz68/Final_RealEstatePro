<template>
  <div class="layout-wrapper">
    <!-- Accessibility: quick keyboard jump past header -->
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <Navbar />

    <main id="main-content" class="main-content" tabindex="-1">
      <router-view v-slot="{ Component, route }">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import Navbar from '@/components/layout/Navbar.vue';
import Footer from '@/components/layout/Footer.vue';
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport height fix for mobile browsers */
  background-color: #f8fafc;
  color: #0f172a;
}

.main-content {
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  width: 100%;
  outline: none;
}

/* Accessibility skip-link */
.skip-link {
  position: absolute;
  top: -100px;
  left: 1.5rem;
  z-index: 9999;
  padding: 0.75rem 1.25rem;
  background: #2563eb;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: 8px;
  text-decoration: none;
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
  transition: top 0.2s ease;
}

.skip-link:focus {
  top: 1.25rem;
}

/* Page Transition Effects */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
