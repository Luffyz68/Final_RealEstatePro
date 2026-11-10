<template>
  <transition name="bar-fade">
    <div v-if="visible" class="route-progress" role="progressbar" aria-label="Page is loading">
      <div class="route-progress-track">
        <span class="route-progress-bar"></span>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from 'vue';
import { useUiStore } from '@/stores/uiStore';

const uiStore = useUiStore();
const visible = ref(false);

// Grace period keeps the bar on screen briefly so quick navigations still feel smooth
const HIDE_DELAY_MS = 350;
// Safety net: never leave the bar visible longer than this
const WATCHDOG_MS = 4000;

let hideTimer = null;
let watchdogTimer = null;

watch(() => uiStore.routeLoading, (loading) => {
  if (loading) {
    clearTimeout(hideTimer);
    visible.value = true;
    clearTimeout(watchdogTimer);
    watchdogTimer = setTimeout(() => { visible.value = false; }, WATCHDOG_MS);
  } else {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { visible.value = false; }, HIDE_DELAY_MS);
  }
}, { immediate: true });

onBeforeUnmount(() => {
  clearTimeout(hideTimer);
  clearTimeout(watchdogTimer);
});
</script>

<style scoped>
.route-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  z-index: 3000;
  pointer-events: none;
}

.route-progress-track {
  position: relative;
  width: 100%;
  height: 100%;
  background: rgba(37, 99, 235, 0.12);
  overflow: hidden;
}

.route-progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 42%;
  border-radius: 0 3px 3px 0;
  background: linear-gradient(90deg, #1d4ed8 0%, #2563eb 55%, #60a5fa 100%);
  box-shadow: 0 0 10px rgba(37, 99, 235, 0.75);
  animation: barSlide 1.05s ease-in-out infinite;
}

@keyframes barSlide {
  0% { left: -42%; }
  100% { left: 100%; }
}

.bar-fade-enter-active,
.bar-fade-leave-active {
  transition: opacity 0.25s ease;
}

.bar-fade-enter-from,
.bar-fade-leave-to {
  opacity: 0;
}
</style>
