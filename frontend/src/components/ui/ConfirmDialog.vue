<template>
  <div v-if="ui.confirmation" class="dialog-backdrop" @click.self="ui.answerConfirmation(false)">
    <section class="dialog" role="alertdialog" aria-modal="true">
      <div class="dialog-icon" :class="{ danger: ui.confirmation.danger }"><i class="fa-solid fa-question"></i></div>
      <h3>{{ ui.confirmation.title }}</h3>
      <p>{{ ui.confirmation.message }}</p>
      <div class="dialog-actions">
        <button class="btn btn-outline" @click="ui.answerConfirmation(false)">Cancel</button>
        <button class="btn" :class="ui.confirmation.danger ? 'btn-danger' : 'btn-primary'" @click="ui.answerConfirmation(true)">{{ ui.confirmation.confirmText }}</button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useUiStore } from '@/stores/uiStore';
const ui = useUiStore();
</script>

<style scoped>
.dialog-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.58);display:grid;place-items:center;padding:1rem;z-index:2900}.dialog{width:min(430px,100%);background:#fff;border-radius:18px;padding:2rem;text-align:center;box-shadow:var(--shadow-lg)}.dialog-icon{margin:0 auto 1rem;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:#dbeafe;color:var(--secondary)}.dialog-icon.danger{background:#fee2e2;color:var(--danger)}.dialog p{color:var(--muted);margin:.75rem 0 1.5rem}.dialog-actions{display:flex;justify-content:center;gap:.75rem}.btn-danger{background:var(--danger);color:#fff}
</style>
