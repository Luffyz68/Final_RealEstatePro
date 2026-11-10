<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-overlay"></div>
      <div class="container hero-content">
        <h1 class="hero-title">Find a place you'll love to call home</h1>
        <p class="hero-subtitle">
          Explore thousands of premium villas, apartments, condos, and commercial properties across Cambodia.
        </p>

        <!-- Search Bar Card -->
        <div class="search-card">
          <div class="search-tabs">
            <button 
              :class="{ active: searchType === '' }" 
              @click="searchType = ''"
            >All</button>
            <button 
              :class="{ active: searchType === 'sale' }" 
              @click="searchType = 'sale'"
            >For Sale</button>
            <button 
              :class="{ active: searchType === 'rent' }" 
              @click="searchType = 'rent'"
            >For Rent</button>
          </div>

          <div class="search-form">
            <div class="form-group">
              <label><i class="fa-solid fa-magnifying-glass"></i> Keyword</label>
              <input 
                type="text" 
                v-model="searchKeyword" 
                placeholder="City, neighborhood, or villa..." 
              />
            </div>
            <div class="form-group">
              <label><i class="fa-solid fa-house"></i> Type</label>
              <select v-model="selectedType">
                <option value="">All Property Types</option>
                <option value="Villa">Villa</option>
                <option value="Condo">Condo</option>
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
                <option value="Office">Office</option>
              </select>
            </div>
            <div class="form-group">
              <label><i class="fa-solid fa-dollar-sign"></i> Max Price</label>
              <select v-model="maxPrice">
                <option value="">Any Price</option>
                <option value="1000">$1,000 / mo</option>
                <option value="3000">$3,000 / mo</option>
                <option value="300000">$300,000</option>
                <option value="1000000">$1,000,000</option>
              </select>
            </div>
            <button class="btn btn-primary search-btn" @click="handleSearch">
              <i class="fa-solid fa-magnifying-glass"></i> Search
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Property Categories -->
    <section class="section categories-section">
      <div class="container">
        <div class="section-header text-center">
          <span class="sub-title">Explore Categories</span>
          <h2>Find Properties by Type</h2>
        </div>

        <div class="categories-grid">
          <div 
            v-for="cat in categories" 
            :key="cat.name" 
            class="category-card"
            @click="navigateToCategory(cat.name)"
          >
            <div class="cat-icon"><i :class="cat.icon"></i></div>
            <h3>{{ cat.name }}</h3>
            <p>{{ cat.count }} Properties</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Properties Section -->
    <section class="section properties-section bg-surface">
      <div class="container">
        <div class="section-header flex-between">
          <div>
            <span class="sub-title">Featured Listings</span>
            <h2>Latest Exclusive Properties</h2>
          </div>
          <router-link to="/properties" class="btn btn-outline">
            View All Properties <i class="fa-solid fa-arrow-right"></i>
          </router-link>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <i class="fa-solid fa-circle-notch fa-spin"></i> Loading properties...
        </div>

        <!-- Property Grid -->
        <div v-else-if="properties.length > 0" class="properties-grid">
          <div v-for="prop in properties" :key="prop.id" class="property-card">
            <div class="card-image-wrapper">
              <img :src="prop.main_image || placeholderImage" :alt="prop.title" />
              <span class="badge" :class="prop.listing_type === 'sale' ? 'badge-sale' : 'badge-rent'">
                For {{ prop.listing_type === 'sale' ? 'Sale' : 'Rent' }}
              </span>
              <button class="fav-btn" title="Add to favorites">
                <i class="fa-regular fa-heart"></i>
              </button>
            </div>
            <div class="card-body">
              <div class="price-tag">${{ Number(prop.price).toLocaleString() }}<span v-if="prop.listing_type === 'rent'">/mo</span></div>
              <h3 class="card-title">{{ prop.title }}</h3>
              <p class="card-location"><i class="fa-solid fa-location-dot"></i> {{ prop.city }}, {{ prop.province }}</p>
              
              <div class="card-features">
                <span><i class="fa-solid fa-bed"></i> {{ prop.bedrooms }} Beds</span>
                <span><i class="fa-solid fa-bath"></i> {{ prop.bathrooms }} Baths</span>
                <span><i class="fa-solid fa-ruler-combined"></i> {{ prop.area }} {{ prop.area_unit }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <i class="fa-solid fa-building-circle-exclamation"></i>
          <p>No featured properties found at this time.</p>
        </div>
      </div>
    </section>

    <!-- Why Choose Us -->
    <section class="section why-us-section">
      <div class="container">
        <div class="section-header text-center">
          <span class="sub-title">Why Choose RealEstatePro</span>
          <h2>Providing Modern Real Estate Services</h2>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon"><i class="fa-solid fa-shield-halved"></i></div>
            <h3>Verified Property Listings</h3>
            <p>Every property listing is verified by our licensed agents for maximum transparency and security.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon"><i class="fa-solid fa-user-tie"></i></div>
            <h3>Professional Agents</h3>
            <p>Connect directly with top real estate agents across Cambodia to guide your acquisition.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon"><i class="fa-solid fa-handshake-angle"></i></div>
            <h3>Full Service Support</h3>
            <p>From legal consultation to property inspection and valuation, we manage your journey end-to-end.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="cta-section">
      <div class="container cta-content text-center">
        <h2>Ready to find your next property?</h2>
        <p>Browse our extensive database of luxury villas, apartments, and commercial spaces today.</p>
        <router-link to="/properties" class="btn btn-primary btn-lg">
          Explore Properties Now
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import propertyTypeService from '@/services/propertyTypeService';

const router = useRouter();
const searchType = ref('');
const searchKeyword = ref('');
const selectedType = ref('');
const maxPrice = ref('');
const properties = ref([]);
const loading = ref(true);

const placeholderImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';

const categories = ref([]);
const typeIcons = {
  Villa: 'fa-solid fa-house-chimney-window', Apartment: 'fa-solid fa-building',
  Condo: 'fa-solid fa-city', House: 'fa-solid fa-house', Land: 'fa-solid fa-vector-square',
  Office: 'fa-solid fa-briefcase', Shop: 'fa-solid fa-store', Warehouse: 'fa-solid fa-warehouse'
};

const fetchFeaturedProperties = async () => {
  try {
    loading.value = true;
    const res = await api.get('/properties?limit=6');
    if (res.data && res.data.data) {
      properties.value = res.data.data;
    }
  } catch (err) {
    console.error('Failed to fetch properties:', err);
  } finally {
    loading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const result = await propertyTypeService.getPropertyTypes();
    categories.value = (result.data || []).map((type) => ({
      name: type.name,
      count: type.property_count || 0,
      icon: typeIcons[type.name] || 'fa-solid fa-building'
    }));
  } catch { categories.value = []; }
};

const handleSearch = () => {
  const query = {};
  if (searchType.value) query.listing_type = searchType.value;
  if (searchKeyword.value) query.search = searchKeyword.value;
  if (selectedType.value) query.property_type = selectedType.value;
  if (maxPrice.value) query.max_price = maxPrice.value;

  router.push({ path: '/properties', query });
};

const navigateToCategory = (catName) => {
  router.push({ path: '/properties', query: { property_type: catName } });
};

onMounted(() => {
  fetchFeaturedProperties();
  fetchCategories();
});
</script>

<style scoped>
/* Hero Section */
.hero-section {
  position: relative;
  background: url('/images/hero-villa.jpg') center/cover no-repeat;
  padding: 6rem 0 8rem;
  color: #ffffff;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.85) 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 900px;
}

.hero-badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  color: var(--accent-light);
  padding: 0.4rem 1.25rem;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.hero-title {
  font-size: 3.5rem;
  color: #ffffff;
  margin-bottom: 1rem;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: #cbd5e1;
  margin-bottom: 3rem;
}

/* Search Card */
.search-card {
  background: #ffffff;
  border-radius: var(--radius);
  padding: 1.75rem;
  box-shadow: var(--shadow-lg);
  color: var(--text);
  text-align: left;
}

.search-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.75rem;
}

.search-tabs button {
  background: none;
  border: none;
  font-weight: 600;
  color: var(--muted);
  padding: 0.5rem 1.25rem;
  border-radius: var(--radius-sm);
}

.search-tabs button.active {
  background-color: var(--secondary);
  color: #ffffff;
}

.search-form {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr 1fr;
  gap: 1rem;
  align-items: end;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 0.4rem;
}

.search-btn {
  height: 48px;
  width: 100%;
}

/* Sections */
.section {
  padding: 5rem 0;
}

.bg-surface {
  background-color: var(--surface);
}

.section-header {
  margin-bottom: 3rem;
}

.sub-title {
  color: var(--secondary);
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.section-header h2 {
  font-size: 2.25rem;
  margin-top: 0.25rem;
}

.text-center {
  text-align: center;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

/* Categories Grid */
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
}

.category-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 2rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
  border-color: var(--secondary);
}

.cat-icon {
  width: 60px;
  height: 60px;
  background: #eff6ff;
  color: var(--secondary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin: 0 auto 1.25rem;
}

.category-card h3 {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.category-card p {
  color: var(--muted);
  font-size: 0.875rem;
}

/* Properties Grid */
.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 2rem;
}

.property-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
}

.property-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.card-image-wrapper {
  position: relative;
  height: 220px;
}

.card-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-image-wrapper .badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
}

.fav-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
}

.fav-btn:hover {
  color: var(--danger);
  background: #ffffff;
}

.card-body {
  padding: 1.5rem;
}

.price-tag {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--secondary);
  margin-bottom: 0.5rem;
}

.price-tag span {
  font-size: 0.9rem;
  color: var(--muted);
}

.card-title {
  font-size: 1.15rem;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-location {
  color: var(--muted);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.card-features {
  display: flex;
  gap: 1.25rem;
  border-top: 1px solid var(--border);
  padding-top: 1rem;
  font-size: 0.875rem;
  color: var(--muted);
}

.card-features i {
  color: var(--secondary);
}

/* Why Us */
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.feature-card {
  background: var(--surface);
  padding: 2.5rem;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  text-align: center;
}

.feature-icon {
  width: 70px;
  height: 70px;
  background: #fef3c7;
  color: var(--accent);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  margin: 0 auto 1.5rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}

.feature-card p {
  color: var(--muted);
  font-size: 0.95rem;
}

/* CTA */
.cta-section {
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: #ffffff;
  padding: 5rem 0;
}

.cta-content h2 {
  color: #ffffff;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.cta-content p {
  color: #cbd5e1;
  font-size: 1.15rem;
  margin-bottom: 2rem;
}

.btn-lg {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--muted);
  font-size: 1.1rem;
}

@media (max-width: 900px) {
  .search-form {
    grid-template-columns: 1fr 1fr;
  }
  .features-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .search-form {
    grid-template-columns: 1fr;
  }
  .hero-title {
    font-size: 2.2rem;
  }
}
</style>
