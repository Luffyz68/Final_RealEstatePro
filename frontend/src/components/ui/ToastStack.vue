<template>
  <div
    class="toast-stack"
    aria-live="polite"
    aria-relevant="additions removals"
  >
    <TransitionGroup name="toast">
      <article
        v-for="toast in ui.toasts"
        :key="toast.id"
        class="toast"
        :class="`toast--${normalizeType(toast.type)}`"
        :role="toast.type === 'error' ? 'alert' : 'status'"
      >
        <!-- Icon -->
        <div class="toast__icon">
          <i
            :class="iconFor(toast.type)"
            aria-hidden="true"
          ></i>
        </div>

        <!-- Content -->
        <div class="toast__content">
          <strong
            v-if="toast.title"
            class="toast__title"
          >
            {{ toast.title }}
          </strong>

          <p class="toast__message">
            {{ toast.message }}
          </p>
        </div>

        <!-- Close -->
        <button
          type="button"
          class="toast__close"
          aria-label="Dismiss notification"
          @click="ui.dismiss(toast.id)"
        >
          <i
            class="fa-solid fa-xmark"
            aria-hidden="true"
          ></i>
        </button>

        <!-- Auto-dismiss visual indicator -->
        <div
          v-if="toast.duration !== 0"
          class="toast__progress"
          :style="{
            animationDuration: `${toast.duration || 4500}ms`
          }"
        ></div>
      </article>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useUiStore } from '@/stores/uiStore';

const ui = useUiStore();

const normalizeType = (type) => {
  const supported = [
    'success',
    'error',
    'warning',
    'info'
  ];

  return supported.includes(type)
    ? type
    : 'info';
};

const iconFor = (type) => {
  const icons = {
    success: 'fa-solid fa-circle-check',
    error: 'fa-solid fa-circle-exclamation',
    warning: 'fa-solid fa-triangle-exclamation',
    info: 'fa-solid fa-circle-info'
  };

  return icons[normalizeType(type)];
};
</script>

<style scoped>
/* ========================================
   TOAST STACK
======================================== */

.toast-stack {
  position: fixed;

  top: 22px;
  right: 22px;

  z-index: 9999;

  width: min(
    400px,
    calc(100vw - 32px)
  );

  display: flex;
  flex-direction: column;

  gap: 10px;

  pointer-events: none;
}

/* ========================================
   TOAST
======================================== */

.toast {
  --toast-color: #635bff;
  --toast-soft: rgba(99, 91, 255, 0.1);

  position: relative;

  min-height: 74px;

  display: grid;
  grid-template-columns:
    auto minmax(0, 1fr) auto;

  align-items: start;

  gap: 12px;

  padding:
    15px 14px 15px 15px;

  overflow: hidden;

  pointer-events: auto;

  border:
    1px solid #e9ebf0;

  border-radius: 15px;

  background:
    rgba(255, 255, 255, 0.97);

  box-shadow:
    0 16px 45px rgba(16, 24, 40, 0.13),
    0 3px 10px rgba(16, 24, 40, 0.05);

  backdrop-filter:
    blur(14px);

  -webkit-backdrop-filter:
    blur(14px);
}

/* subtle colored side line */

.toast::before {
  content: '';

  position: absolute;

  top: 13px;
  bottom: 13px;
  left: 0;

  width: 3px;

  border-radius:
    0 4px 4px 0;

  background:
    var(--toast-color);
}

/* ========================================
   TYPES
======================================== */

.toast--success {
  --toast-color: #12b76a;
  --toast-soft: rgba(18, 183, 106, 0.1);
}

.toast--error {
  --toast-color: #f04438;
  --toast-soft: rgba(240, 68, 56, 0.1);
}

.toast--warning {
  --toast-color: #f79009;
  --toast-soft: rgba(247, 144, 9, 0.11);
}

.toast--info {
  --toast-color: #635bff;
  --toast-soft: rgba(99, 91, 255, 0.1);
}

/* ========================================
   ICON
======================================== */

.toast__icon {
  width: 38px;
  height: 38px;

  display: grid;
  place-items: center;

  flex-shrink: 0;

  border-radius: 11px;

  color:
    var(--toast-color);

  background:
    var(--toast-soft);

  font-size: 15px;
}

/* ========================================
   CONTENT
======================================== */

.toast__content {
  min-width: 0;

  padding-top: 1px;
}

.toast__title {
  display: block;

  margin-bottom: 3px;

  color: #1d2939;

  font-size: 13px;
  font-weight: 700;

  line-height: 1.35;
}

.toast__message {
  margin: 0;

  color: #667085;

  font-size: 12.5px;
  line-height: 1.55;

  overflow-wrap: anywhere;
}

/* ========================================
   CLOSE
======================================== */

.toast__close {
  width: 30px;
  height: 30px;

  display: grid;
  place-items: center;

  flex-shrink: 0;

  margin-top: -2px;

  padding: 0;

  border: 0;

  border-radius: 8px;

  background: transparent;

  color: #98a2b3;

  cursor: pointer;

  font-size: 12px;

  transition:
    color 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
}

.toast__close:hover {
  color: #344054;

  background: #f2f4f7;
}

.toast__close:active {
  transform: scale(0.92);
}

/* ========================================
   PROGRESS
======================================== */

.toast__progress {
  position: absolute;

  right: 0;
  bottom: 0;
  left: 0;

  height: 2px;

  transform-origin: left;

  background:
    var(--toast-color);

  opacity: 0.55;

  animation:
    toast-progress linear forwards;
}

@keyframes toast-progress {
  from {
    transform: scaleX(1);
  }

  to {
    transform: scaleX(0);
  }
}

/* ========================================
   TRANSITION
======================================== */

.toast-enter-active,
.toast-leave-active,
.toast-move {
  transition:
    opacity 0.28s ease,
    transform 0.28s
      cubic-bezier(.2, .8, .2, 1);
}

.toast-enter-from {
  opacity: 0;

  transform:
    translateX(28px)
    scale(0.97);
}

.toast-leave-to {
  opacity: 0;

  transform:
    translateX(35px)
    scale(0.96);
}

.toast-leave-active {
  position: absolute;

  width: 100%;
}

/* ========================================
   MOBILE
======================================== */

@media (max-width: 600px) {
  .toast-stack {
    top: 12px;
    right: 12px;
    left: 12px;

    width: auto;
  }

  .toast {
    min-height: 68px;

    padding:
      13px;

    gap: 10px;

    border-radius: 13px;
  }

  .toast__icon {
    width: 36px;
    height: 36px;

    border-radius: 10px;
  }

  .toast__message {
    font-size: 12px;
  }
}

/* ========================================
   REDUCED MOTION
======================================== */

@media (
  prefers-reduced-motion:
  reduce
) {
  .toast-enter-active,
  .toast-leave-active,
  .toast-move {
    transition: none;
  }

  .toast__progress {
    animation: none;
  }
}
</style>