<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import CustomSignupForm from '../components/CustomSignupForm.vue';
import GoogleLoginButton from '../components/GoogleLoginButton.vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const errorMessage = ref('');
const isCustomSubmitting = ref(false);
const isGoogleSubmitting = ref(false);

async function handleCustomSignup(fields) {
  errorMessage.value = '';
  isCustomSubmitting.value = true;

  try {
    await authStore.registerWithCustom(fields.firstName, fields.lastName, fields.username, fields.passwordHash, fields.email);
    await router.push({ name: 'dashboard' });
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isCustomSubmitting.value = false;
  }
}

async function handleGoogleSignup(idToken) {
  errorMessage.value = '';
  isGoogleSubmitting.value = true;

  try {
    await authStore.registerWithGoogle(idToken);
    await router.push({ name: 'dashboard' });
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isGoogleSubmitting.value = false;
  }
}
</script>

<template>
  <main class="login-layout">
    <section class="login-panel">
      <h1>Create Account</h1>
      <p class="intro-copy">
        Sign up to start managing your character sheet and tracking your campaign progress.
      </p>
      <div class="login-actions">
        <GoogleLoginButton :is-loading="isGoogleSubmitting" label="Sign up with Google" @success="handleGoogleSignup" />
        <CustomSignupForm :is-loading="isCustomSubmitting" @submit="handleCustomSignup" />
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
  background:
    radial-gradient(circle at 20% 15%, rgba(179, 139, 77, 0.22), transparent 40%),
    radial-gradient(circle at 85% 85%, rgba(47, 74, 52, 0.2), transparent 38%),
    linear-gradient(180deg, #dcc29a, #efe2c5 52%, #e6d2ac 100%);
}

.login-panel {
  width: min(30rem, 100%);
  box-sizing: border-box;
  padding: 2rem;
  border-radius: 28px;
  border: 1px solid var(--border);
  background: var(--bg-panel);
  backdrop-filter: blur(6px);
  box-shadow: var(--shadow-hard);
}

.eyebrow {
  margin: 0 0 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--accent-forest);
  font-size: 0.8rem;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
  color: var(--ink);
}

.intro-copy {
  color: var(--ink-muted);
}

.login-actions {
  display: grid;
  gap: 1rem;
}

.error-message {
  color: var(--danger);
}

.switch-link {
  margin-top: 1rem;
  text-align: center;
  color: var(--ink-muted);
  font-size: 0.9rem;
}

.switch-link a {
  color: var(--accent-link);
  text-decoration: none;
  font-weight: 600;
}

.switch-link a:hover {
  color: var(--accent-leather);
}

@media (max-width: 600px) {
  .login-layout {
    padding: 1rem;
  }

  .login-panel {
    padding: 1.4rem;
  }
}
</style>
