<template>
  <div class="auth-page">
    <div class="ambient-blob blob-1"></div>
    <div class="ambient-blob blob-2"></div>

    <div class="container flex-center">
      <div class="auth-card glass-card">
        <div class="auth-header text-center">
          <div class="logo-icon glass-icon">
            <i class="fa-solid fa-building"></i>
          </div>
          <h2>Create an Account</h2>
          <p>Join RealEstatePro to browse and save properties</p>
        </div>

        <div v-if="errorMessage" class="alert alert-danger glass-alert">
          <i class="fa-solid fa-circle-exclamation"></i> {{ errorMessage }}
        </div>

        <form @submit.prevent="handleRegister" class="auth-form" autocomplete="off">
          <div class="form-group">
            <label><i class="fa-regular fa-user"></i> Full Name</label>
            <input 
              type="text" 
              v-model="full_name" 
              placeholder="Enter your full name" 
              autocomplete="off"
              required 
            />
          </div>

          <div class="form-group">
            <label><i class="fa-regular fa-envelope"></i> Email Address</label>
            <input 
              type="email" 
              v-model="email" 
              placeholder="Enter your email address" 
              autocomplete="off"
              required 
            />
          </div>

          <div class="form-group">
            <label><i class="fa-solid fa-phone"></i> Phone Number</label>
            <input 
              type="tel" 
              v-model="phone" 
              placeholder="Enter your phone number" 
              autocomplete="off"
            />
          </div>

          <div class="form-group">
            <label><i class="fa-solid fa-lock"></i> Password</label>
            <div class="password-input-wrapper">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                v-model="password" 
                minlength="8"
                pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}"
                title="At least 8 characters with uppercase, lowercase, and a number"
                placeholder="Enter your password" 
                autocomplete="new-password"
                required 
              />
              <button 
                type="button" 
                class="password-toggle-btn" 
                @click="showPassword = !showPassword"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                :title="showPassword ? 'Hide password' : 'Show password'"
              >
                <i :class="showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label><i class="fa-solid fa-lock"></i> Confirm Password</label>
            <div class="password-input-wrapper">
              <input 
                :type="showConfirmPassword ? 'text' : 'password'" 
                v-model="confirmPassword" 
                minlength="8"
                placeholder="Re-enter your password" 
                autocomplete="new-password"
                required 
              />
              <button 
                type="button" 
                class="password-toggle-btn" 
                @click="showConfirmPassword = !showConfirmPassword"
                :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
                :title="showConfirmPassword ? 'Hide password' : 'Show password'"
              >
                <i :class="showConfirmPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block glass-btn" :disabled="loading">
            <span v-if="loading"><i class="fa-solid fa-circle-notch fa-spin"></i> Creating Account...</span>
            <span v-else>Register</span>
          </button>
        </form>

        <div class="auth-footer text-center">
          <p>Already have an account? <router-link to="/login">Log In</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const router = useRouter();

const full_name = ref('');
const email = ref('');
const phone = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');

const handleRegister = async () => {
  errorMessage.value = '';

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.';
    return;
  }

  loading.value = true;
  try {
    const res = await authStore.register({
      full_name: full_name.value,
      email: email.value,
      phone: phone.value,
      password: password.value
    });
    if (res && res.success) {
      router.push('/');
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Registration failed.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-page {
  position: relative;
  min-height: 88vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  overflow: hidden;
  background: radial-gradient(circle at 50% 30%, #f1f5f9 0%, #e2e8f0 100%);
}

.ambient-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0.55;
  pointer-events: none;
}

.blob-1 {
  width: 320px;
  height: 320px;
  background: #3b82f6;
  top: 10%;
  left: 20%;
  animation: floatBlob 12s ease-in-out infinite alternate;
}

.blob-2 {
  width: 280px;
  height: 280px;
  background: #f59e0b;
  bottom: 10%;
  right: 20%;
  animation: floatBlob 10s ease-in-out infinite alternate-reverse;
}

@keyframes floatBlob {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(30px, 40px) scale(1.1); }
}

.glass-card {
  position: relative;
  z-index: 10;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.6);
  width: 100%;
  max-width: 480px;
  padding: 2.75rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.glass-card:hover {
  box-shadow: 0 25px 50px -12px rgba(37, 99, 235, 0.18), 0 0 0 1px rgba(37, 99, 235, 0.2);
}

.glass-icon {
  width: 54px;
  height: 54px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin: 0 auto 1.25rem;
  box-shadow: 0 8px 20px -4px rgba(37, 99, 235, 0.4);
}

.auth-header h2 {
  font-size: 1.85rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.35rem;
  letter-spacing: -0.02em;
}

.auth-header p {
  color: #64748b;
  font-size: 0.95rem;
  margin-bottom: 1.75rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 0.45rem;
}

.form-group input {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #cbd5e1;
  padding: 0.8rem 1rem;
  font-size: 0.95rem;
  transition: all 0.25s ease;
}

.form-group input:focus {
  background: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper input {
  width: 100%;
  padding-right: 2.75rem;
}

.password-toggle-btn {
  position: absolute;
  right: 0.75rem;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.password-toggle-btn:hover {
  color: #2563eb;
}

.glass-alert {
  background: rgba(254, 242, 242, 0.9);
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  margin-bottom: 1.25rem;
}

.glass-btn {
  border-radius: 12px;
  padding: 0.9rem;
  font-size: 1rem;
  font-weight: 700;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff;
  box-shadow: 0 6px 18px -2px rgba(37, 99, 235, 0.35);
  transition: all 0.25s ease;
  margin-top: 0.5rem;
}

.glass-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px -4px rgba(37, 99, 235, 0.45);
}

.btn-block {
  width: 100%;
}

.auth-footer {
  margin-top: 1.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
  font-size: 0.95rem;
  color: #64748b;
}

.auth-footer a {
  font-weight: 700;
  color: #2563eb;
}
</style>
