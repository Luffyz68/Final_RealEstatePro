<template>
  <div class="properties-page container section">
    <div class="page-header text-center">
      <h1>Browse Properties</h1>
      <p>Discover real estate listings for sale and rent across Cambodia</p>
    </div>

    <!-- Yellow Background Shapes -->
    <div class="bg-shape shape-1"></div>
    <div class="bg-shape shape-2"></div>

    <div class="properties-layout">
      <!-- Sidebar Filters -->
      <aside class="filter-sidebar">
        <div class="filter-card">
          <h3><i class="fa-solid fa-sliders"></i> Filter Properties</h3>

          <!-- Search Keyword -->
          <div class="filter-group">
            <label>Search Keyword</label>
            <input 
              type="text" 
              v-model="filters.search" 
              placeholder="Villa, BKK1, etc..." 
              @input="debouncedSearch"
            />
          </div>

          <!-- Listing Type -->
          <div class="filter-group">
            <label>Listing Type</label>
            <select v-model="filters.listing_type" @change="applyFilters">
              <option value="">All Listings</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>

          <!-- Property Type -->
          <div class="filter-group">
            <label>Property Type</label>
            <select v-model="filters.property_type" @change="applyFilters">
              <option value="">All Types</option>
              <option v-for="type in propertyTypes" :key="type.id" :value="type.name">{{ type.name }}</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Location</label>
            <select v-model="filters.city" @change="applyFilters">
              <option value="">All Cities</option>
              <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
            </select>
          </div>

          <!-- Price Range -->
          <div class="filter-group">
            <label>Price Range ($)</label>
            <div class="range-inputs">
              <input type="number" v-model="filters.min_price" placeholder="Min" @change="applyFilters" />
              <span>-</span>
              <input type="number" v-model="filters.max_price" placeholder="Max" @change="applyFilters" />
            </div>
          </div>

          <div class="filter-group">
            <label>Min Bathrooms</label>
            <select v-model="filters.min_bathrooms" @change="applyFilters">
              <option value="">Any</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Availability</label>
            <select v-model="filters.status" @change="applyFilters">
              <option value="">All Statuses</option><option value="available">Available</option><option value="pending">Pending</option><option value="sold">Sold</option><option value="rented">Rented</option>
            </select>
          </div>

          <!-- Bedrooms -->
          <div class="filter-group">
            <label>Min Bedrooms</label>
            <select v-model="filters.min_bedrooms" @change="applyFilters">
              <option value="">Any</option>
              <option value="1">1+ Beds</option>
              <option value="2">2+ Beds</option>
              <option value="3">3+ Beds</option>
              <option value="4">4+ Beds</option>
              <option value="5">5+ Beds</option>
            </select>
          </div>

          <button class="btn btn-outline btn-block" @click="resetFilters">
            Reset Filters
          </button>
        </div>
      </aside>

      <!-- Main Results Column -->
      <main class="results-main">
        <!-- Top Toolbar -->
        <div class="toolbar flex-between">
          <div class="results-count">
            Showing <strong>{{ properties.length }}</strong> of <strong>{{ pagination.total }}</strong> properties
          </div>

          <div class="sort-control">
            <label>Sort By:</label>
            <select v-model="sortOption" @change="applyFilters">
              <option value="created_at-DESC">Newest First</option>
              <option value="price-ASC">Price: Low to High</option>
              <option value="price-DESC">Price: High to Low</option>
              <option value="area-DESC">Area: Large to Small</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-grid">
          <div v-for="i in 6" :key="i" class="skeleton-card"></div>
        </div>

        <!-- Results Grid -->
        <div v-else-if="properties.length > 0" class="properties-grid">
          <div v-for="prop in properties" :key="prop.id" class="property-card" @click="goToDetail(prop.id)">
            <div class="card-image-wrapper">
              <img :src="prop.main_image || placeholderImage" :alt="prop.title" />
              <div class="badge-group">
                <span class="badge" :class="prop.listing_type === 'sale' ? 'badge-sale' : 'badge-rent'">
                  For {{ prop.listing_type === 'sale' ? 'Sale' : 'Rent' }}
                </span>
                <span v-if="prop.property_type_name || prop.property_type" class="badge badge-type">
                  {{ prop.property_type_name || prop.property_type }}
                </span>
              </div>
              <button 
                class="fav-btn" 
                :class="{ active: favoriteStore.isFavorite(prop.id) }"
                @click.stop="toggleFav(prop.id)"
                :title="favoriteStore.isFavorite(prop.id) ? 'Remove from favorites' : 'Add to favorites'"
              >
                <i :class="favoriteStore.isFavorite(prop.id) ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
              </button>
            </div>
            <div class="card-body">
              <div class="price-tag">${{ Number(prop.price).toLocaleString() }}<span v-if="prop.listing_type === 'rent'" class="price-period">/mo</span></div>
              <h3 class="card-title" :title="prop.title">{{ prop.title }}</h3>
              <p class="card-location"><i class="fa-solid fa-location-dot"></i> {{ prop.city }}, {{ prop.province }}</p>
              
              <div class="card-features">
                <span class="feature-item"><i class="fa-solid fa-bed"></i> {{ prop.bedrooms }} Beds</span>
                <span class="feature-item"><i class="fa-solid fa-bath"></i> {{ prop.bathrooms }} Baths</span>
                <span class="feature-item"><i class="fa-solid fa-ruler-combined"></i> {{ prop.area }} {{ prop.area_unit }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <i class="fa-solid fa-building-circle-exclamation empty-icon"></i>
          <h3>No properties match your filter criteria</h3>
          <p>Try resetting your filters or adjusting your price and location requirements.</p>
          <button class="btn btn-primary" @click="resetFilters">Reset All Filters</button>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="pagination-wrapper">
          <button 
            class="btn btn-outline" 
            :disabled="pagination.page <= 1"
            @click="changePage(pagination.page - 1)"
          >
            <i class="fa-solid fa-chevron-left"></i> Previous
          </button>
          
          <span class="page-indicator">Page {{ pagination.page }} of {{ pagination.totalPages }}</span>

          <button 
            class="btn btn-outline" 
            :disabled="pagination.page >= pagination.totalPages"
            @click="changePage(pagination.page + 1)"
          >
            Next <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import propertyService from '@/services/propertyService';
import { useFavoriteStore } from '@/stores/favoriteStore';
import { useAuthStore } from '@/stores/authStore';
import propertyTypeService from '@/services/propertyTypeService';
import locationService from '@/services/locationService';
import { compactQuery } from '@/utils/formatters';

const route = useRoute();
const router = useRouter();
const favoriteStore = useFavoriteStore();
const authStore = useAuthStore();

const properties = ref([]);
const propertyTypes = ref([]);
const cities = ref([]);
const loading = ref(true);
const sortOption = ref('created_at-DESC');
const placeholderImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';

const pagination = reactive({
  page: 1,
  limit: 8,
  total: 0,
  totalPages: 1
});

const filters = reactive({
  search: route.query.search || '',
  listing_type: route.query.listing_type || '',
  property_type: route.query.property_type || '',
  min_price: route.query.min_price || '',
  max_price: route.query.max_price || '',
  min_bedrooms: route.query.min_bedrooms || '',
  min_bathrooms: route.query.min_bathrooms || '',
  city: route.query.city || '',
  status: route.query.status || ''
});

let searchTimeout = null;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 400);
};

const fetchProperties = async () => {
  loading.value = true;
  try {
    const [sortField, sortOrder] = sortOption.value.split('-');
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      sort: sortField,
      order: sortOrder,
      ...filters
    };
    // Clean empty values
    Object.keys(params).forEach(key => (!params[key]) && delete params[key]);

    const res = await propertyService.getProperties(params);
    if (res && res.data) {
      properties.value = res.data;
      if (res.pagination) {
        pagination.page = res.pagination.page;
        pagination.total = res.pagination.total;
        pagination.totalPages = res.pagination.totalPages;
      }
    }
  } catch (err) {
    console.error('Failed to load properties:', err);
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  pagination.page = 1;
  router.replace({ query: compactQuery({ ...filters }) });
  fetchProperties();
};

const resetFilters = () => {
  filters.search = '';
  filters.listing_type = '';
  filters.property_type = '';
  filters.min_price = '';
  filters.max_price = '';
  filters.min_bedrooms = '';
  filters.min_bathrooms = '';
  filters.city = '';
  filters.status = '';
  sortOption.value = 'created_at-DESC';
  applyFilters();
};

const changePage = (newPage) => {
  pagination.page = newPage;
  fetchProperties();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const goToDetail = (id) => {
  router.push(`/properties/${id}`);
};

const toggleFav = async (propertyId) => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  await favoriteStore.toggleFavorite(propertyId);
};

onMounted(async () => {
  if (authStore.isAuthenticated) {
    favoriteStore.fetchFavorites();
  }
  try {
    const [typesResult, locationsResult] = await Promise.all([propertyTypeService.getPropertyTypes(), locationService.getLocations()]);
    propertyTypes.value = typesResult.data || [];
    cities.value = [...new Set((locationsResult.data || []).map((item) => item.city))].sort();
  } catch { propertyTypes.value = []; cities.value = []; }
  fetchProperties();
});

watch(() => route.query, (newQuery) => {
  for (const key of Object.keys(filters)) filters[key] = newQuery[key] || '';
  fetchProperties();
});
</script>

<style scoped>
.properties-page {
  position: relative;
  z-index: 1;
}

/* Background Shapes */
.bg-shape {
  position: absolute;
  border-radius: 50%;
  z-index: -1;
  filter: blur(80px);
  opacity: 0.6;
}
.shape-1 {
  width: 400px;
  height: 400px;
  background: var(--accent); /* Yellow */
  top: 50px;
  left: -100px;
}
.shape-2 {
  width: 300px;
  height: 300px;
  background: var(--secondary); /* Primary gold */
  bottom: 20%;
  right: -50px;
  opacity: 0.4;
}

.page-header {
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 2;
}
.page-header h1 {
  font-size: 2.4rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.page-header p {
  color: var(--muted);
  font-size: 1.05rem;
}

.properties-layout {
  display: grid;
  grid-template-columns: 290px 1fr;
  gap: 2rem;
  align-items: start;
  position: relative;
  z-index: 2;
}

.filter-sidebar {
  position: sticky;
  top: 90px;
}

.filter-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: var(--radius-lg, 16px);
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.filter-card h3 {
  font-size: 1.15rem;
  font-weight: 700;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--text);
}

.filter-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 0.4rem;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toolbar {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  padding: 1rem 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: var(--radius-lg, 16px);
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
}

.sort-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
}

.sort-control select {
  width: auto;
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.5);
}

/* 2-Column Property Grid */
.properties-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.property-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-lg, 16px);
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease, border-color 0.3s ease;
  display: flex;
  flex-direction: column;
}

.property-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
  border-color: var(--secondary);
}

.card-image-wrapper {
  position: relative;
  height: 220px;
  overflow: hidden;
}

.card-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.property-card:hover .card-image-wrapper img {
  transform: scale(1.06);
}

.badge-group {
  position: absolute;
  top: 0.85rem;
  left: 0.85rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge-group .badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.badge-type {
  background: rgba(15, 23, 42, 0.75);
  color: #ffffff;
}

.fav-btn {
  position: absolute;
  top: 0.85rem;
  right: 0.85rem;
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
}

.fav-btn:hover {
  transform: scale(1.1);
  background: #ffffff;
  color: var(--danger, #ef4444);
}

.fav-btn.active {
  color: var(--danger, #ef4444);
  background: #ffffff;
}

.card-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.price-tag {
  font-family: var(--font-heading);
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--primary, #2563eb);
  margin-bottom: 0.35rem;
}

.price-period {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--muted);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 0.35rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text);
}

.card-location {
  color: var(--muted);
  font-size: 0.85rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.card-features {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border-top: 1px solid var(--border);
  padding-top: 0.85rem;
  margin-top: auto;
}

.feature-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--muted);
  background: var(--bg-body, #f8fafc);
  padding: 0.35rem 0.65rem;
  border-radius: 8px;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--surface);
  border: 1px dashed var(--border);
  border-radius: var(--radius-lg, 16px);
}

.empty-icon {
  font-size: 3.5rem;
  color: var(--muted);
  margin-bottom: 1rem;
}

.pagination-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2.5rem;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.skeleton-card {
  height: 360px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: var(--radius-lg, 16px);
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (max-width: 960px) {
  .properties-layout {
    grid-template-columns: 1fr;
  }
  .filter-sidebar {
    position: static;
  }
}

@media (max-width: 640px) {
  .properties-grid,
  .loading-grid {
    grid-template-columns: 1fr;
  }
}
</style>
