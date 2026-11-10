<template>
  <div class="about-view">
    <!-- Hero -->
    <section class="hero-section">
      <div class="hero-overlay"></div>
      <div class="container hero-content text-center">
        <span class="hero-badge"><i class="fa-solid fa-building"></i> About RealEstatePro</span>
        <h1 class="hero-title">Cambodia's Modern Property Platform</h1>
        <p class="hero-subtitle">
          We connect buyers, renters, and property professionals through one
          streamlined, secure, and transparent service management platform.
        </p>
      </div>
    </section>

    <!-- Live stats band -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div v-for="stat in stats" :key="stat.label" class="stat-card">
            <div class="stat-icon"><i :class="stat.icon"></i></div>
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Our story -->
    <section class="section story-section">
      <div class="container story-grid">
        <div class="story-media">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80"
            alt="Modern city buildings in Phnom Penh"
          />
          <div class="media-badge">
            <i class="fa-solid fa-location-dot"></i>
            <div>
              <strong>Based in Phnom Penh</strong>
              <span>Serving all of Cambodia</span>
            </div>
          </div>
        </div>

        <div class="story-text">
          <span class="sub-title">Our Story</span>
          <h2>Real Estate, Simplified for Everyone</h2>
          <p>
            RealEstatePro was built to solve a simple problem: finding, listing, and
            managing property in Cambodia was fragmented and slow. Buyers scrolled
            through scattered listings, agents juggled inquiries by phone, and
            administrators had no unified view of the market.
          </p>
          <p>
            Our platform brings everything together — verified listings with rich
            galleries and amenities, direct inquiry and viewing-appointment
            workflows, service requests, favorites, and role-based dashboards for
            customers, agents, and administrators.
          </p>
          <ul class="story-checklist">
            <li><i class="fa-solid fa-circle-check"></i> Verified listings reviewed by professional agents</li>
            <li><i class="fa-solid fa-circle-check"></i> End-to-end inquiry, appointment &amp; service workflows</li>
            <li><i class="fa-solid fa-circle-check"></i> Secure JWT authentication with role-based access</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Mission / Vision / Values -->
    <section class="section mvv-section bg-surface">
      <div class="container">
        <div class="section-header text-center">
          <span class="sub-title">What Drives Us</span>
          <h2>Mission, Vision &amp; Values</h2>
        </div>
        <div class="mvv-grid">
          <div class="mvv-card">
            <div class="mvv-icon mission"><i class="fa-solid fa-bullseye"></i></div>
            <h3>Our Mission</h3>
            <p>
              Make every property transaction in Cambodia fast, transparent, and
              trustworthy by giving buyers, renters, and professionals one
              reliable platform to meet and do business.
            </p>
          </div>
          <div class="mvv-card">
            <div class="mvv-icon vision"><i class="fa-solid fa-eye"></i></div>
            <h3>Our Vision</h3>
            <p>
              To become the most trusted digital real-estate ecosystem in the
              Kingdom — where every home, office, and investment opportunity is
              discoverable in a few clicks.
            </p>
          </div>
          <div class="mvv-card">
            <div class="mvv-icon values"><i class="fa-solid fa-heart"></i></div>
            <h3>Our Values</h3>
            <p>
              Transparency in every listing, security in every transaction, and
              respect for every user — from first-time renters to seasoned
              investors.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- What the platform offers -->
    <section class="section offers-section">
      <div class="container">
        <div class="section-header text-center">
          <span class="sub-title">The Platform</span>
          <h2>One System, Three Experiences</h2>
        </div>

        <div class="offers-grid">
          <div class="offer-card">
            <div class="offer-top customer">
              <i class="fa-solid fa-house-user"></i>
            </div>
            <h3>For Customers</h3>
            <ul>
              <li><i class="fa-solid fa-magnifying-glass"></i> Search by keyword, location, type, price, beds &amp; baths</li>
              <li><i class="fa-regular fa-heart"></i> Save favorite properties to a personal list</li>
              <li><i class="fa-regular fa-comment-dots"></i> Send inquiries and request viewings</li>
              <li><i class="fa-solid fa-wrench"></i> Request property services and track their status</li>
            </ul>
            <router-link to="/register" class="offer-link">
              Create free account <i class="fa-solid fa-arrow-right"></i>
            </router-link>
          </div>

          <div class="offer-card">
            <div class="offer-top agent">
              <i class="fa-solid fa-user-tie"></i>
            </div>
            <h3>For Agents</h3>
            <ul>
              <li><i class="fa-solid fa-building"></i> Publish listings with galleries and amenities</li>
              <li><i class="fa-solid fa-chart-line"></i> Track listing performance on a live dashboard</li>
              <li><i class="fa-regular fa-calendar-check"></i> Manage appointments and inquiries in one place</li>
              <li><i class="fa-solid fa-shield-halved"></i> Ownership-aware access to your own records</li>
            </ul>
            <router-link to="/register" class="offer-link">
              Start listing <i class="fa-solid fa-arrow-right"></i>
            </router-link>
          </div>

          <div class="offer-card">
            <div class="offer-top admin">
              <i class="fa-solid fa-user-shield"></i>
            </div>
            <h3>For Administrators</h3>
            <ul>
              <li><i class="fa-solid fa-gauge"></i> Live statistics and market distribution charts</li>
              <li><i class="fa-solid fa-users"></i> Manage users, agents, types, and locations</li>
              <li><i class="fa-solid fa-list-check"></i> Oversee inquiry, appointment &amp; service workflows</li>
              <li><i class="fa-solid fa-database"></i> Safe, idempotent database migrations</li>
            </ul>
            <router-link to="/login" class="offer-link">
              Admin sign-in <i class="fa-solid fa-arrow-right"></i>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Us -->
    <section class="section benefits-section bg-surface">
      <div class="container">
        <div class="section-header text-center">
          <span class="sub-title">Why Choose Us</span>
          <h2>The RealEstatePro Advantage</h2>
        </div>
        <div class="benefits-grid">
          <div v-for="benefit in benefits" :key="benefit.title" class="benefit-chip">
            <i :class="benefit.icon"></i>
            <div>
              <strong>{{ benefit.title }}</strong>
              <span>{{ benefit.desc }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact + CTA -->
    <section class="section contact-section">
      <div class="container">
        <div class="section-header text-center">
          <span class="sub-title">Get in Touch</span>
          <h2>Talk to Our Team</h2>
        </div>
        <div class="contact-grid">
          <div class="contact-card">
            <div class="contact-icon"><i class="fa-solid fa-location-dot"></i></div>
            <h3>Head Office</h3>
            <p>Street 278, BKK1, Phnom Penh, Cambodia</p>
          </div>
          <div class="contact-card">
            <div class="contact-icon"><i class="fa-solid fa-phone"></i></div>
            <h3>Phone</h3>
            <p>+855 (0) 23 888 999</p>
          </div>
          <div class="contact-card">
            <div class="contact-icon"><i class="fa-solid fa-envelope"></i></div>
            <h3>Email</h3>
            <p>info@realestatepro.com</p>
          </div>
          <div class="contact-card">
            <div class="contact-icon"><i class="fa-regular fa-clock"></i></div>
            <h3>Office Hours</h3>
            <p>Mon – Sat, 8:00 AM – 6:00 PM</p>
          </div>
        </div>

        <div class="cta-box">
          <h2>Ready to explore?</h2>
          <p>Browse hundreds of verified listings across Cambodia — no obligation.</p>
          <div class="cta-actions">
            <router-link to="/properties" class="btn btn-primary btn-lg">
              <i class="fa-solid fa-magnifying-glass"></i> Browse Properties
            </router-link>
            <router-link to="/register" class="btn btn-outline-light btn-lg">
              <i class="fa-regular fa-user"></i> Join Free
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';
import propertyTypeService from '@/services/propertyTypeService';
import locationService from '@/services/locationService';

const stats = ref([
  { icon: 'fa-solid fa-building', value: '—', label: 'Properties Listed' },
  { icon: 'fa-solid fa-map-location-dot', value: '—', label: 'Locations Covered' },
  { icon: 'fa-solid fa-layer-group', value: '—', label: 'Property Types' },
  { icon: 'fa-solid fa-user-tie', value: '—', label: 'Professional Agents' }
]);

const benefits = [
  { icon: 'fa-solid fa-check-double', title: 'Verified Listings', desc: 'Every property is rigorously checked' },
  { icon: 'fa-solid fa-handshake', title: 'Trusted Agents', desc: 'Work with certified professionals' },
  { icon: 'fa-solid fa-lock', title: 'Secure Platform', desc: 'Your data and inquiries are protected' },
  { icon: 'fa-solid fa-bolt', title: 'Fast Processes', desc: 'Streamlined booking and services' },
  { icon: 'fa-solid fa-headset', title: '24/7 Support', desc: 'We are always here to help you' },
  { icon: 'fa-solid fa-money-bill-trend-up', title: 'Market Insights', desc: 'Get the best value for your investment' }
];

const fetchStats = async () => {
  try {
    const [propsRes, typesRes, locRes] = await Promise.all([
      api.get('/properties?limit=1'),
      propertyTypeService.getPropertyTypes(),
      locationService.getLocations()
    ]);

    const totalProperties = propsRes.data?.pagination?.total;
    if (totalProperties !== undefined) stats.value[0].value = totalProperties;
    if (Array.isArray(locRes.data)) stats.value[1].value = locRes.data.length;
    if (Array.isArray(typesRes.data)) stats.value[2].value = typesRes.data.length;

    // Agent count: locations response carries no agents; derive from property data instead
    const agentRes = await api.get('/properties?limit=100');
    const uniqueAgents = new Set(
      (agentRes.data?.data || []).map((p) => p.agent_id).filter(Boolean)
    );
    stats.value[3].value = uniqueAgents.size;
  } catch {
    // Stats stay as em-dashes if the API is unreachable
  }
};

onMounted(fetchStats);
</script>

<style scoped>
/* ============ Hero ============ */
.hero-section {
  position: relative;
  background: url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80') center/cover no-repeat;
  padding: 6rem 0;
  color: #ffffff;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.78) 0%, rgba(29, 78, 216, 0.55) 100%);
}

.hero-content { position: relative; z-index: 2; max-width: 860px; }

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
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

.hero-title { font-size: 3.2rem; color: #ffffff; margin-bottom: 1rem; }

.hero-subtitle { font-size: 1.2rem; color: #cbd5e1; }

/* ============ Stats band ============ */
.stats-section {
  background: linear-gradient(120deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%);
  padding: 2.5rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.stat-card {
  text-align: center;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--radius);
  padding: 1.75rem 1rem;
  backdrop-filter: blur(4px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 0.75rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
}

.stat-value {
  display: block;
  font-family: var(--font-heading);
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1.1;
}

.stat-label { font-size: 0.85rem; color: #dbeafe; }

/* ============ Sections ============ */
.section { padding: 5rem 0; }
.bg-surface { background-color: var(--surface); }

.section-header { margin-bottom: 3rem; }

.sub-title {
  color: var(--secondary);
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.section-header h2 { font-size: 2.25rem; margin-top: 0.25rem; }
.text-center { text-align: center; }

/* ============ Story ============ */
.story-grid {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 4rem;
  align-items: center;
}

.story-media { position: relative; }

.story-media img {
  width: 100%;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: block;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.media-badge {
  position: absolute;
  bottom: -1.25rem;
  left: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  padding: 0.85rem 1.25rem;
}

.media-badge i {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: #eff6ff;
  color: var(--secondary);
  display: grid;
  place-items: center;
  font-size: 1rem;
}

.media-badge strong { display: block; font-size: 0.9rem; color: var(--primary); }
.media-badge span { font-size: 0.8rem; color: var(--muted); }

.story-text h2 { font-size: 2rem; margin: 0.25rem 0 1.25rem; }
.story-text p { color: var(--muted); margin-bottom: 1rem; }

.story-checklist { list-style: none; margin-top: 1.5rem; }

.story-checklist li {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text);
}

.story-checklist i { color: var(--success); font-size: 1.05rem; }

/* ============ Mission / Vision / Values ============ */
.mvv-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.mvv-card {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 2.5rem 2rem;
  text-align: center;
  transition: var(--transition);
}

.mvv-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }

.mvv-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.25rem;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.mvv-icon.mission { background: #eff6ff; color: var(--secondary); }
.mvv-icon.vision { background: #fef3c7; color: var(--accent); }
.mvv-icon.values { background: #fef2f2; color: var(--danger); }

.mvv-card h3 { font-size: 1.2rem; margin-bottom: 0.75rem; }
.mvv-card p { color: var(--muted); font-size: 0.95rem; }

/* ============ Offers ============ */
.offers-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.offer-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: var(--transition);
}

.offer-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }

.offer-top {
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: #ffffff;
}

.offer-top.customer { background: linear-gradient(135deg, #2563eb, #1d4ed8); }
.offer-top.agent { background: linear-gradient(135deg, #c6922d, #a16207); }
.offer-top.admin { background: linear-gradient(135deg, #0f172a, #1e293b); }

.offer-card h3 { padding: 1.5rem 1.75rem 0.75rem; font-size: 1.2rem; }

.offer-card ul {
  list-style: none;
  padding: 0 1.75rem 1.5rem;
  flex: 1;
}

.offer-card li {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  color: var(--muted);
  font-size: 0.9rem;
  margin-bottom: 0.7rem;
}

.offer-card li i { color: var(--secondary); margin-top: 0.2rem; }

.offer-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 1.75rem 1.75rem;
  font-weight: 700;
  font-size: 0.9rem;
}

.offer-link:hover { gap: 0.85rem; }

/* ============ Benefits ============ */
.benefits-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.benefit-chip {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.1rem 1.35rem;
  transition: var(--transition);
}

.benefit-chip:hover { border-color: var(--secondary); transform: translateY(-2px); }

.benefit-chip i { font-size: 1.6rem; color: var(--secondary); width: 36px; text-align: center; }

.benefit-chip strong { display: block; font-size: 0.95rem; color: var(--primary); }
.benefit-chip span { font-size: 0.8rem; color: var(--muted); }

/* ============ Contact ============ */
.contact-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 4rem;
}

.contact-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 2rem 1.5rem;
  text-align: center;
  transition: var(--transition);
}

.contact-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }

.contact-icon {
  width: 52px;
  height: 52px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: #eff6ff;
  color: var(--secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.contact-card h3 { font-size: 1.05rem; margin-bottom: 0.35rem; }
.contact-card p { color: var(--muted); font-size: 0.9rem; }

/* ============ CTA ============ */
.cta-box {
  background: linear-gradient(120deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%);
  border-radius: var(--radius-lg);
  text-align: center;
  color: #ffffff;
  padding: 4rem 2rem;
  position: relative;
  overflow: hidden;
}

.cta-box h2 { color: #ffffff; font-size: 2.2rem; margin-bottom: 0.75rem; }
.cta-box p { color: #dbeafe; font-size: 1.1rem; margin-bottom: 2rem; }

.cta-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.cta-actions .btn { min-width: 200px; }

.btn-lg { padding: 1rem 2rem; font-size: 1.05rem; }

.btn-outline-light {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.45);
  color: #ffffff;
}

.btn-outline-light:hover {
  background: rgba(255, 255, 255, 0.22);
  border-color: #ffffff;
  color: #ffffff;
}

/* ============ Responsive ============ */
@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .contact-grid { grid-template-columns: repeat(2, 1fr); }
  .benefits-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 900px) {
  .story-grid { grid-template-columns: 1fr; gap: 3rem; }
  .mvv-grid, .offers-grid { grid-template-columns: 1fr; }
  .hero-title { font-size: 2.3rem; }
}

@media (max-width: 600px) {
  .stats-grid, .contact-grid, .benefits-grid { grid-template-columns: 1fr; }
  .section { padding: 3.5rem 0; }
  .cta-actions .btn { width: 100%; }
}
</style>
