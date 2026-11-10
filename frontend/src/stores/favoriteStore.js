import { defineStore } from 'pinia';
import favoriteService from '@/services/favoriteService';

export const useFavoriteStore = defineStore('favorite', {
  state: () => ({
    favorites: [],
    loading: false
  }),

  getters: {
    favoriteIds: (state) => state.favorites.map((f) => f.id || f.property_id)
  },

  actions: {
    async fetchFavorites() {
      this.loading = true;
      try {
        const res = await favoriteService.getFavorites();
        if (res.success && res.data) {
          this.favorites = res.data;
        }
      } catch (err) {
        console.error('Failed to fetch favorites:', err);
      } finally {
        this.loading = false;
      }
    },

    isFavorite(propertyId) {
      return this.favorites.some((f) => (f.id === propertyId) || (f.property_id === propertyId));
    },

    async toggleFavorite(propertyId) {
      if (this.isFavorite(propertyId)) {
        await favoriteService.removeFavorite(propertyId);
        this.favorites = this.favorites.filter((f) => f.id !== propertyId && f.property_id !== propertyId);
      } else {
        await favoriteService.addFavorite(propertyId);
        await this.fetchFavorites();
      }
    }
  }
});
