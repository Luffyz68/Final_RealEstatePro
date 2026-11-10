<template>
  <div class="favorites-page container section">
    <div class="page-header">
      <h1>My Saved Properties</h1>
      <p>Properties you have favorited for easy access</p>
    </div>

    <div v-if="loading" class="loading-state text-center">
      <i class="fa-solid fa-circle-notch fa-spin"></i> Loading saved properties...
    </div>

    <div v-else-if="favoriteStore.favorites.length > 0" class="properties-grid">
      <div v-for="prop in favoriteStore.favorites" :key="prop.favorite_id" class="property-card" @click="goToDetail(prop.id)">
        <div class="card-image-wrapper">
          <img :src="prop.main_image || placeholderImage" :alt="prop.title" />
          <span class="badge" :class="prop.listing_type === 'sale' ? 'badge-sale' : 'badge-rent'">
            For {{ prop.listing_type === 'sale' ? 'Sale' : 'Rent' }}
          </span>
          <button class="fav-btn active" title="Remove from favorites" @click.stop="removeFav(prop.id)">
            <i class="fa-solid fa-heart"></i>
          </button>
        </div>
        <div class="card-body">
          <div class="price-tag">${{ Number(prop.price).toLocaleString() }}<span v-if="prop.listing_type === 'rent'">/mo</span></div>
          <h3 class="card-title">{{ prop.title }}</h3>
          <p class="card-location"><i class="fa-solid fa-location-dot"></i> {{ prop.city }}, {{ prop.province }}</p>
        </div>
      </div>
    </div>

    <div v-else class="empty-state text-center">
      <i class="fa-regular fa-heart empty-icon"></i>
      <h3>No saved properties yet</h3>
      <p>Click the heart icon on any property listing to save it to your favorites.</p>
      <router-link to="/properties" class="btn btn-primary" style="margin-top: 1rem;">
        Explore Properties
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useFavoriteStore } from '@/stores/favoriteStore';

const favoriteStore = useFavoriteStore();
const router = useRouter();
const loading = ref(true);
const placeholderImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';

const goToDetail = (id) => {
  router.push(`/properties/${id}`);
};

const removeFav = async (id) => {
  await favoriteStore.toggleFavorite(id);
};

onMounted(async () => {
  loading.value = true;
  await favoriteStore.fetchFavorites();
  loading.value = false;
});
</script>

<style scoped>
.page-header { margin-bottom: 2.5rem; }
.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}
.property-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
}
.card-image-wrapper { position: relative; height: 180px; }
.card-image-wrapper img { width: 100%; height: 100%; object-fit: cover; }
.card-image-wrapper .badge { position: absolute; top: 1rem; left: 1rem; }
.fav-btn {
  position: absolute; top: 1rem; right: 1rem;
  width: 36px; height: 36px; background: #ffffff;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  color: var(--danger);
}
.card-body { padding: 1.25rem; }
.price-tag { font-family: var(--font-heading); font-size: 1.3rem; font-weight: 800; color: var(--secondary); margin-bottom: 0.4rem; }
.card-title { font-size: 1.05rem; margin-bottom: 0.4rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-location { color: var(--muted); font-size: 0.85rem; }
.empty-state { padding: 5rem 2rem; background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius); }
.empty-icon { font-size: 4rem; color: var(--muted); margin-bottom: 1rem; }
</style>
