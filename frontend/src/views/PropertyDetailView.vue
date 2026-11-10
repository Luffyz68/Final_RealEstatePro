<template>
  <div class="property-detail-page container section">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="fa-solid fa-circle-notch fa-spin"></i> Loading property details...
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state text-center">
      <h2>{{ error }}</h2>
      <router-link to="/properties" class="btn btn-primary" style="margin-top: 1rem;">
        Back to Properties
      </router-link>
    </div>

    <div v-else-if="property" class="detail-container">
      <!-- Breadcrumb Navigation -->
      <div class="breadcrumb">
        <router-link to="/">Home</router-link> &gt; 
        <router-link to="/properties">Properties</router-link> &gt; 
        <span>{{ property.title }}</span>
      </div>

      <!-- Title & Price Header -->
      <div class="detail-header flex-between">
        <div>
          <div class="header-badges">
            <span class="badge" :class="property.listing_type === 'sale' ? 'badge-sale' : 'badge-rent'">
              For {{ property.listing_type === 'sale' ? 'Sale' : 'Rent' }}
            </span>
            <span class="type-badge">{{ property.property_type_name }}</span>
            <span class="status-badge" :class="'status-' + property.status.toLowerCase()">{{ property.status }}</span>
          </div>
          <h1>{{ property.title }}</h1>
          <p class="location-text"><i class="fa-solid fa-location-dot"></i> {{ property.address }}, {{ property.commune }}, {{ property.city }}, {{ property.province }}</p>
        </div>

        <div class="header-price text-right">
          <div class="price">${{ Number(property.price).toLocaleString() }}<span v-if="property.listing_type === 'rent'">/mo</span></div>
          <button 
            class="btn btn-outline fav-btn-lg" 
            :class="{ favorited: favoriteStore.isFavorite(property.id) }"
            @click="toggleFav"
          >
            <i :class="favoriteStore.isFavorite(property.id) ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
            {{ favoriteStore.isFavorite(property.id) ? 'Saved to Favorites' : 'Add to Favorites' }}
          </button>
        </div>
      </div>

      <!-- Image Gallery -->
      <div class="gallery-section">
        <div class="main-image-wrapper">
          <img :src="activeImage || property.main_image || placeholderImage" :alt="property.title" />
        </div>

        <div v-if="galleryImages.length > 0" class="thumbnails-grid">
          <div 
            class="thumb-item" 
            :class="{ active: activeImage === (property.main_image || placeholderImage) }"
            @click="activeImage = property.main_image || placeholderImage"
          >
            <img :src="property.main_image || placeholderImage" alt="Main Thumb" />
          </div>
          <div 
            v-for="img in galleryImages" 
            :key="img.id" 
            class="thumb-item"
            :class="{ active: activeImage === img.image_url }"
            @click="activeImage = img.image_url"
          >
            <img :src="img.image_url" :alt="'Gallery Image ' + img.id" />
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="content-grid">
        <!-- Main Description & Specs -->
        <div class="main-info">
          <!-- Overview Cards -->
          <div class="specs-card">
            <div class="spec-item">
              <i class="fa-solid fa-bed"></i>
              <div>
                <small>Bedrooms</small>
                <strong>{{ property.bedrooms }} Beds</strong>
              </div>
            </div>
            <div class="spec-item">
              <i class="fa-solid fa-bath"></i>
              <div>
                <small>Bathrooms</small>
                <strong>{{ property.bathrooms }} Baths</strong>
              </div>
            </div>
            <div class="spec-item">
              <i class="fa-solid fa-ruler-combined"></i>
              <div>
                <small>Property Area</small>
                <strong>{{ property.area }} {{ property.area_unit }}</strong>
              </div>
            </div>
            <div class="spec-item">
              <i class="fa-solid fa-building"></i>
              <div>
                <small>Property Type</small>
                <strong>{{ property.property_type_name }}</strong>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="description-card">
            <h3>Property Description</h3>
            <p>{{ property.description || 'No detailed description provided for this property listing.' }}</p>
          </div>
          <div v-if="amenities.length" class="description-card"><h3>Amenities</h3><div class="amenity-list"><span v-for="amenity in amenities" :key="amenity"><i class="fa-solid fa-check"></i>{{ amenity }}</span></div></div>
        </div>

        <!-- Sidebar Forms & Agent Info -->
        <div class="sidebar-info">
          <!-- Agent Card -->
          <div class="agent-card">
            <div class="agent-header flex-center">
              <img :src="property.agent_image || defaultAgentAvatar" alt="Agent" class="agent-avatar" />
              <div>
                <h4>{{ property.agent_name }}</h4>
                <p class="role">Listing Agent</p>
              </div>
            </div>
            <div class="agent-contacts">
              <a v-if="property.agent_phone" :href="'tel:' + property.agent_phone" class="btn btn-outline btn-block">
                <i class="fa-solid fa-phone"></i> {{ property.agent_phone }}
              </a>
              <a :href="'mailto:' + property.agent_email" class="btn btn-outline btn-block">
                <i class="fa-regular fa-envelope"></i> Email Agent
              </a>
            </div>
          </div>

          <!-- Send Inquiry Form -->
          <div class="form-card">
            <h3><i class="fa-regular fa-paper-plane"></i> Send Property Inquiry</h3>
            
            <div v-if="inquirySuccess" class="alert alert-success">
              <i class="fa-solid fa-circle-check"></i> {{ inquirySuccess }}
            </div>

            <form @submit.prevent="submitInquiry">
              <div class="form-group">
                <label>Your Name</label>
                <input type="text" v-model="inquiryForm.name" required />
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" v-model="inquiryForm.email" required />
              </div>
              <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" v-model="inquiryForm.phone" required />
              </div>
              <div class="form-group">
                <label>Message</label>
                <textarea v-model="inquiryForm.message" rows="3" required></textarea>
              </div>

              <button type="submit" class="btn btn-primary btn-block" :disabled="submittingInquiry">
                <span v-if="submittingInquiry"><i class="fa-solid fa-circle-notch fa-spin"></i> Sending...</span>
                <span v-else>Submit Inquiry</span>
              </button>
            </form>
          </div>

          <!-- Request Viewing Appointment Form -->
          <div class="form-card highlight-card">
            <h3><i class="fa-regular fa-calendar-check"></i> Book Private Viewing</h3>

            <div v-if="apptSuccess" class="alert alert-success">
              <i class="fa-solid fa-circle-check"></i> {{ apptSuccess }}
            </div>

            <form @submit.prevent="submitAppointment">
              <div class="form-group">
                <label>Preferred Date</label>
                <input type="date" v-model="apptForm.date" :min="today" required />
              </div>
              <div class="form-group">
                <label>Preferred Time</label>
                <input type="time" v-model="apptForm.time" required />
              </div>
              <div class="form-group">
                <label>Special Requests</label>
                <textarea v-model="apptForm.message" rows="2" placeholder="e.g. Prefer afternoon tour..."></textarea>
              </div>

              <button type="submit" class="btn btn-dark btn-block" :disabled="submittingAppt">
                <span v-if="submittingAppt"><i class="fa-solid fa-circle-notch fa-spin"></i> Booking...</span>
                <span v-else>Request Appointment</span>
              </button>
            </form>
          </div>
        </div>
      </div>
      <section v-if="relatedProperties.length" class="related-section"><div class="section-heading"><span>YOU MAY ALSO LIKE</span><h2>Related properties</h2></div><div class="related-grid"><router-link v-for="item in relatedProperties" :key="item.id" :to="`/properties/${item.id}`" class="related-card"><img :src="item.main_image || placeholderImage" :alt="item.title" /><div><strong>{{ item.title }}</strong><p>{{ item.city }}, {{ item.province }}</p><span>${{ Number(item.price).toLocaleString() }}{{ item.listing_type === 'rent' ? '/mo' : '' }}</span></div></router-link></div></section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import propertyService from '@/services/propertyService';
import inquiryService from '@/services/inquiryService';
import appointmentService from '@/services/appointmentService';
import { useFavoriteStore } from '@/stores/favoriteStore';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

const route = useRoute();
const router = useRouter();
const favoriteStore = useFavoriteStore();
const authStore = useAuthStore();
const ui = useUiStore();

const property = ref(null);
const galleryImages = ref([]);
const activeImage = ref(null);
const loading = ref(true);
const error = ref('');
const relatedProperties = ref([]);
const today = new Date().toISOString().slice(0, 10);
const amenities = computed(() => String(property.value?.amenities || '').split(',').map((item) => item.trim()).filter(Boolean));

const placeholderImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';
const defaultAgentAvatar = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80';

const inquiryForm = reactive({
  name: authStore.user?.full_name || '',
  email: authStore.user?.email || '',
  phone: authStore.user?.phone || '',
  message: 'Hello, I am interested in scheduling a viewing for this property.'
});
const submittingInquiry = ref(false);
const inquirySuccess = ref('');

const apptForm = reactive({
  date: '',
  time: '10:00',
  message: ''
});
const submittingAppt = ref(false);
const apptSuccess = ref('');

const fetchPropertyDetail = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await propertyService.getProperty(route.params.id);
    if (res && res.data) {
      property.value = res.data;
      galleryImages.value = res.data.images || [];
      activeImage.value = res.data.main_image || placeholderImage;
      try {
        const related = await propertyService.getProperties({ property_type_id: res.data.property_type_id, limit: 4 });
        relatedProperties.value = (related.data || []).filter((item) => item.id !== res.data.id).slice(0, 3);
      } catch { relatedProperties.value = []; }
    }
  } catch (err) {
    error.value = 'Property not found or deleted.';
  } finally {
    loading.value = false;
  }
};

const toggleFav = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  await favoriteStore.toggleFavorite(property.value.id);
};

const submitInquiry = async () => {
  submittingInquiry.value = true;
  inquirySuccess.value = '';
  try {
    await inquiryService.createInquiry({
      property_id: property.value.id,
      name: inquiryForm.name,
      email: inquiryForm.email,
      phone: inquiryForm.phone,
      message: inquiryForm.message
    });
    inquirySuccess.value = 'Inquiry sent successfully! An agent will contact you shortly.';
    ui.notify(inquirySuccess.value);
  } catch (err) {
    ui.notify(err.response?.data?.message || 'Failed to send inquiry.', 'error');
  } finally {
    submittingInquiry.value = false;
  }
};

const submitAppointment = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  submittingAppt.value = true;
  apptSuccess.value = '';
  try {
    await appointmentService.createAppointment({
      property_id: property.value.id,
      appointment_date: apptForm.date,
      appointment_time: apptForm.time,
      message: apptForm.message
    });
    apptSuccess.value = 'Appointment requested! Check status in My Appointments.';
    ui.notify(apptSuccess.value);
  } catch (err) {
    ui.notify(err.response?.data?.message || 'Failed to request appointment.', 'error');
  } finally {
    submittingAppt.value = false;
  }
};

onMounted(() => {
  if (authStore.isAuthenticated) {
    favoriteStore.fetchFavorites();
  }
  fetchPropertyDetail();
});
</script>

<style scoped>
.breadcrumb {
  font-size: 0.9rem;
  color: var(--muted);
  margin-bottom: 1.5rem;
}

.header-badges {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.type-badge {
  background: #f1f5f9;
  color: var(--primary);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
}
.status-available { background: #dcfce7; color: #166534; }
.status-sold { background: #fee2e2; color: #991b1b; }
.status-rented { background: #fef3c7; color: #92400e; }

.detail-header h1 {
  font-size: 2.25rem;
  margin-bottom: 0.25rem;
}

.location-text {
  color: var(--muted);
  font-size: 1rem;
}

.header-price .price {
  font-family: var(--font-heading);
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--secondary);
}

.fav-btn-lg.favorited {
  background: var(--danger);
  color: #ffffff;
  border-color: var(--danger);
}

.gallery-section {
  margin: 2rem 0;
}

.main-image-wrapper {
  height: 450px;
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 1rem;
}

.main-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnails-grid {
  display: flex;
  gap: 1rem;
}

.thumb-item {
  width: 100px;
  height: 70px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
}

.thumb-item.active {
  border-color: var(--secondary);
}

.thumb-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 2.5rem;
}

.specs-card {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.spec-item i {
  font-size: 1.75rem;
  color: var(--secondary);
}

.spec-item small {
  color: var(--muted);
  display: block;
}

.description-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 2rem;
}

.description-card h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.sidebar-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.agent-card, .form-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.75rem;
}

.agent-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 1rem;
}

.agent-contacts {
  margin-top: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-card h3 {
  font-size: 1.15rem;
  margin-bottom: 1.25rem;
}

.highlight-card {
  background: #f8fafc;
  border-color: var(--secondary);
}

.alert-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}
.amenity-list{display:flex;flex-wrap:wrap;gap:.65rem;margin-top:1rem}.amenity-list span{display:flex;align-items:center;gap:.4rem;padding:.55rem .8rem;border-radius:999px;background:#eff6ff;color:#1e40af;font-size:.86rem;font-weight:600}.related-section{margin-top:3rem}.section-heading span{color:var(--secondary);font-size:.75rem;letter-spacing:.12em;font-weight:800}.related-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-top:1rem}.related-card{overflow:hidden;background:#fff;border:1px solid var(--border);border-radius:14px;color:var(--text)}.related-card img{width:100%;height:150px;object-fit:cover}.related-card>div{padding:1rem}.related-card p{font-size:.83rem;color:var(--muted);margin:.35rem 0}.related-card span{font-weight:800;color:var(--secondary)}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  .specs-card {
    grid-template-columns: repeat(2, 1fr);
  }
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .related-grid{grid-template-columns:1fr}
}
</style>
