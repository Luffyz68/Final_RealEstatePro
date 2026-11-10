import { defineStore } from 'pinia';

let nextToastId = 1;

export const useUiStore = defineStore('ui', {
  state: () => ({
    toasts: [],
    confirmation: null,
    routeLoading: false
  }),
  actions: {
    setRouteLoading(value) {
      this.routeLoading = value;
    },
    notify(message, type = 'success') {
      const id = nextToastId++;
      this.toasts.push({ id, message, type });
      window.setTimeout(() => this.dismiss(id), 4200);
    },
    dismiss(id) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id);
    },
    confirm({ title = 'Please confirm', message, confirmText = 'Confirm', danger = false }) {
      return new Promise((resolve) => {
        this.confirmation = { title, message, confirmText, danger, resolve };
      });
    },
    answerConfirmation(value) {
      if (this.confirmation?.resolve) this.confirmation.resolve(value);
      this.confirmation = null;
    }
  }
});
