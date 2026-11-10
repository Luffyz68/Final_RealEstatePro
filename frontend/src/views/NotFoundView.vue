<template>
  <div class="not-found-page container text-center section">
    <div class="error-code">404</div>
    <h2>Page Not Found</h2>
    <p>The page or property you are looking for does not exist or has been moved.</p>
    <router-link to="/" class="btn btn-primary" style="margin-top: 1.5rem;">
      Back to Home
    </router-link>
  </div>
</template>

<style scoped>
.not-found-page {
  padding: 8rem 0;
}
.error-code {
  font-family: var(--font-heading);
  font-size: 6rem;
  font-weight: 800;
  color: var(--secondary);
}
</style>
