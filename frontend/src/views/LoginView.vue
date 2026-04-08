<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import CustomLoginForm from '../components/CustomLoginForm.vue';
import GoogleLoginButton from '../components/GoogleLoginButton.vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const errorMessage = ref('');

async function handleCustomLogin(credentials) {
  errorMessage.value = '';

  try {
    await authStore.loginWithCustom(credentials.username, credentials.passwordHash);
    await router.push({ name: 'dashboard' });
  } catch (error) {
    errorMessage.value = error.message;
  }
}

async function handleGoogleLogin(idToken) {
  errorMessage.value = '';

  try {
    await authStore.loginWithGoogle(idToken);
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
      <h1>D&amp;D Character Tracker</h1>
      <p class="intro-copy">
        Login to manage your character sheet, session count, and party progress without exposing the backing Google Sheet.
      </p>
      <div class="login-actions">
        <GoogleLoginButton @success="handleGoogleLogin" />
        <CustomLoginForm @submit="handleCustomLogin" />
      </div>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
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
</style>