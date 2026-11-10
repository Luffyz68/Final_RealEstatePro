<template>
  <footer class="footer">
    <div class="container footer-content">
      <div class="footer-col brand-col">
        <div class="brand-logo">
          <div class="logo-icon"><i class="fa-solid fa-building"></i></div>
          <div class="logo-text">RealEstate<span>Pro</span></div>
        </div>
        <p class="brand-desc">
          Your premier real estate service management platform. Connecting buyers, sellers, and property professionals with ease.
        </p>
      </div>

      <div class="footer-col">
        <h4>Quick Links</h4>
        <ul>
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/properties">Properties</router-link></li>
          <li><router-link to="/properties?listing_type=sale">For Sale</router-link></li>
          <li><router-link to="/properties?listing_type=rent">For Rent</router-link></li>
          <li><router-link to="/about">About Us</router-link></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Property Types</h4>
        <ul>
          <li><router-link to="/properties?property_type=Villa">Luxury Villas</router-link></li>
          <li><router-link to="/properties?property_type=Apartment">Apartments</router-link></li>
          <li><router-link to="/properties?property_type=Condo">Condominiums</router-link></li>
          <li><router-link to="/properties?property_type=Office">Commercial Offices</router-link></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Contact Us</h4>
        <ul class="contact-list">
          <li><i class="fa-solid fa-location-dot"></i> Street 278, BKK1, Phnom Penh</li>
          <li><i class="fa-solid fa-phone"></i> +855 (0) 23 888 999</li>
          <li><i class="fa-solid fa-envelope"></i> info@realestatepro.com</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container flex-between">
        <p>&copy; 2026 RealEstatePro. All rights reserved.</p>
        <p>Built with Vue 3 & Express.js</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--primary);
  color: #94a3b8;
  padding-top: 4rem;
  margin-top: auto;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 3rem;
  padding-bottom: 3rem;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 1rem;
}

.logo-icon {
  width: 38px;
  height: 38px;
  background: var(--secondary);
  color: #ffffff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text span {
  color: var(--secondary);
}

.brand-desc {
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-links a {
  width: 36px;
  height: 36px;
  background-color: var(--primary-light);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.social-links a:hover {
  background-color: var(--secondary);
  transform: translateY(-2px);
}

.footer-col h4 {
  color: #ffffff;
  font-size: 1.1rem;
  margin-bottom: 1.25rem;
}

.footer-col ul {
  list-style: none;
}

.footer-col li {
  margin-bottom: 0.75rem;
}

.footer-col a {
  color: #94a3b8;
  font-size: 0.95rem;
}

.footer-col a:hover {
  color: #ffffff;
}

.contact-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.95rem;
}

.contact-list i {
  color: var(--secondary);
}

.footer-bottom {
  border-top: 1px solid var(--primary-light);
  padding: 1.5rem 0;
  font-size: 0.875rem;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 900px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 600px) {
  .footer-content {
    grid-template-columns: 1fr;
  }
  .flex-between {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>
