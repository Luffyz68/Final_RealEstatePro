<template>
  <section
    class="empty-state"
    :class="{ 'empty-state--compact': compact }"
    role="status"
    aria-live="polite"
  >
    <div class="empty-state__icon">
      <i
        :class="icon"
        aria-hidden="true"
      ></i>
    </div>

    <div class="empty-state__content">
      <h3 class="empty-state__title">
        {{ title }}
      </h3>

      <p
        v-if="message"
        class="empty-state__message"
      >
        {{ message }}
      </p>
    </div>

    <div
      v-if="$slots.default"
      class="empty-state__actions"
    >
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'Nothing here yet'
  },

  message: {
    type: String,
    default: 'New items will appear here when they become available.'
  },

  icon: {
    type: String,
    default: 'fa-regular fa-folder-open'
  },

  compact: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.empty-state {
  min-height: 300px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 3rem 2rem;

  text-align: center;

  border: 1px dashed #dfe3ea;
  border-radius: 20px;

  background:
    radial-gradient(
      circle at center top,
      rgba(99, 91, 255, 0.055),
      transparent 55%
    ),
    #ffffff;
}

.empty-state__icon {
  width: 76px;
  height: 76px;

  margin-bottom: 1.25rem;

  display: grid;
  place-items: center;

  border-radius: 22px;

  color: #635bff;

  background:
    linear-gradient(
      135deg,
      rgba(99, 91, 255, 0.12),
      rgba(99, 91, 255, 0.04)
    );

  border: 1px solid rgba(99, 91, 255, 0.12);

  box-shadow:
    0 12px 32px rgba(99, 91, 255, 0.08);

  font-size: 1.8rem;
}

.empty-state__content {
  max-width: 480px;
}

.empty-state__title {
  margin: 0;

  color: #1d2433;

  font-size: 1.08rem;
  font-weight: 750;

  letter-spacing: -0.02em;
}

.empty-state__message {
  margin: 0.55rem 0 0;

  color: #8a94a6;

  font-size: 0.9rem;
  line-height: 1.65;
}

.empty-state__actions {
  margin-top: 1.35rem;

  display: flex;
  align-items: center;
  justify-content: center;

  gap: 0.75rem;

  flex-wrap: wrap;
}

/* Compact mode */

.empty-state--compact {
  min-height: 200px;

  padding: 2rem 1.5rem;

  border-radius: 16px;
}

.empty-state--compact
.empty-state__icon {
  width: 58px;
  height: 58px;

  margin-bottom: 0.9rem;

  border-radius: 16px;

  font-size: 1.35rem;
}

/* Dark parent support */

:global(.dark)
.empty-state {
  background: #151821;

  border-color: #262a35;
}

:global(.dark)
.empty-state__title {
  color: #f4f6fb;
}

:global(.dark)
.empty-state__message {
  color: #7f8899;
}

/* Mobile */

@media (max-width: 600px) {
  .empty-state {
    min-height: 240px;

    padding: 2.25rem 1.25rem;

    border-radius: 16px;
  }

  .empty-state__icon {
    width: 64px;
    height: 64px;

    border-radius: 18px;

    font-size: 1.5rem;
  }

  .empty-state__title {
    font-size: 1rem;
  }

  .empty-state__message {
    font-size: 0.84rem;
  }
}
</style>