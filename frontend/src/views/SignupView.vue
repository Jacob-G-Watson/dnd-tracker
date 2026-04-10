<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import CustomSignupForm from '../components/CustomSignupForm.vue';
import GoogleLoginButton from '../components/GoogleLoginButton.vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const errorMessage = ref('');

async function handleCustomSignup(fields) {
  errorMessage.value = '';

  try {
    await authStore.registerWithCustom(fields.firstName, fields.lastName, fields.username, fields.passwordHash);
    await router.push({ name: 'dashboard' });
  } catch (error) {
    errorMessage.value = error.message;
  }
}

async function handleGoogleSignup(idToken) {
  errorMessage.value = '';

  try {
    await authStore.registerWithGoogle(idToken);
    await router.push({ name: 'dashboard' });
  } catch (error) {
    errorMessage.value = error.message;
  }
}
</script>

<template>
  <main class="login-layout">
    <section class="login-panel">
      <p class="eyebrow">Serverless campaign management</p>
      <h1>Create Account</h1>
      <p class="intro-copy">
        Sign up to start managing your character sheet and tracking your campaign progress.
      </p>
      <div class="login-actions">
        <GoogleLoginButton label="Sign up with Google" @success="handleGoogleSignup" />
        <CustomSignupForm @submit="handleCustomSignup" />
      </div>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      <p class="switch-link">Already have an account? <RouterLink :to="{ name: 'login' }">Log in</RouterLink></p>
    </section>
  </main>
</template>

<style scoped>
.login-layout {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
  background: radial-gradient(circle at top, #fef3c7, #e0f2fe 40%, #f8fafc 100%);
}

.login-panel {
  width: min(30rem, 100%);
  padding: 2rem;
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(18px);
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.12);
}

.eyebrow {
  margin: 0 0 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #0f766e;
  font-size: 0.8rem;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
}

.intro-copy {
  color: #475569;
}

.login-actions {
  display: grid;
  gap: 1rem;
}

.error-message {
  color: #b91c1c;
}

.switch-link {
  margin-top: 1rem;
  text-align: center;
  color: #475569;
  font-size: 0.9rem;
}

.switch-link a {
  color: #1d4ed8;
  text-decoration: none;
  font-weight: 600;
}
</style>
