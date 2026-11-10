<template>
  <transition name="splash">
    <div v-if="!leaving" class="app-splash" role="status" aria-label="Loading RealEstatePro">
      <span class="splash-shape shape-1"></span>
      <span class="splash-shape shape-2"></span>

      <div class="splash-inner">
        <div class="splash-logo">
          <i class="fa-solid fa-building"></i>
        </div>
        <div class="splash-brand">RealEstate<span>Pro</span></div>
        <div class="splash-tagline">Find a place you'll love</div>

        <div class="splash-dots" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const MIN_SPLASH_MS = 900;
const LEAVE_ANIMATION_MS = 500;

const router = useRouter();
const leaving = ref(false);
const emit = defineEmits(['finish']);

onMounted(async () => {
  const minimumWait = new Promise((resolve) => { setTimeout(resolve, MIN_SPLASH_MS); });
  await Promise.all([router.isReady(), minimumWait]);

  leaving.value = true;
  setTimeout(() => emit('finish'), LEAVE_ANIMATION_MS);
});
</script>

<style scoped>
.app-splash {
  position: fixed;
  inset: 0;
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  overflow: hidden;
}

/* Soft decorative circles matching the profile banner */
.splash-shape {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.shape-1 {
  width: 320px;
  height: 320px;
  top: -120px;
  right: -80px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.10) 0%, rgba(37, 99, 235, 0) 70%);
}

.shape-2 {
  width: 260px;
  height: 260px;
  bottom: -100px;
  left: -60px;
  background: radial-gradient(circle, rgba(198, 146, 45, 0.10) 0%, rgba(198, 146, 45, 0) 70%);
}

.splash-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  animation: splashRise 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.splash-logo {
  width: 68px;
  height: 68px;
  border-radius: 18px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.9rem;
  box-shadow: 0 14px 32px -8px rgba(37, 99, 235, 0.5);
  animation: logoPulse 1.5s ease-in-out infinite;
}

.splash-brand {
  font-family: 'Outfit', sans-serif;
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: #0f172a;
}

.splash-brand span { color: #2563eb; }

.splash-tagline {
  font-size: 0.9rem;
  color: #64748b;
  letter-spacing: 0.02em;
}

.splash-dots {
  display: flex;
  gap: 0.45rem;
  margin-top: 0.5rem;
}

.splash-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2563eb;
  animation: dotBounce 1.2s ease-in-out infinite;
}

.splash-dots span:nth-child(2) { animation-delay: 0.15s; }
.splash-dots span:nth-child(3) { animation-delay: 0.3s; }

@keyframes logoPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.07); }
}

@keyframes dotBounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
  40% { transform: translateY(-7px); opacity: 1; }
}

@keyframes splashRise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Exit animation */
.splash-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.splash-leave-to {
  opacity: 0;
  transform: scale(1.04);
}
</style>
