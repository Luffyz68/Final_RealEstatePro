<template>
  <div v-if="type === 'skeleton'" class="skeleton-container">
    <div v-for="i in count" :key="i" class="skeleton-item"></div>
  </div>
  <div v-else class="state">
    <span class="spinner"></span>
    <p>{{ label }}</p>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, default: 'Loading…' },
  type: { type: String, default: 'spinner' }, // 'spinner' | 'skeleton'
  count: { type: Number, default: 3 }
});
</script>

<style scoped>
.state {
  min-height: 180px;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 0.75rem;
  color: var(--muted);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border);
  border-top-color: var(--secondary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.skeleton-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  width: 100%;
}

.skeleton-item {
  height: 220px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  border-radius: var(--radius);
  animation: shimmer 1.5s infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
