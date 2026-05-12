<script setup>
import { computed, reactive, ref } from 'vue';

import { hashPassword } from '../composables/useSha256';

const emit = defineEmits(['submit']);
const props = defineProps({
  isLoading: {
    default: false,
    type: Boolean
  }
});

const form = reactive({
  password: '',
  username: ''
});
const LOADING_TEXT = 'Please wait...';
const errorMessage = ref('');
const isPreparingSubmit = ref(false);
const isSubmitting = computed(() => isPreparingSubmit.value || props.isLoading);

async function submitForm() {
  errorMessage.value = '';
  isPreparingSubmit.value = true;

  try {
    const passwordHash = await hashPassword(form.password);
    emit('submit', { passwordHash, username: form.username });
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isPreparingSubmit.value = false;
  }
}
</script>

<template>
  <form class="login-form" @submit.prevent="submitForm">
    <label>
      Username
      <input v-model="form.username" autocomplete="username" required type="text" />
    </label>
    <label>
      Password
      <input v-model="form.password" autocomplete="current-password" required type="password" />
    </label>
    <button class="primary-button" :disabled="isSubmitting" type="submit">
      {{ isSubmitting ? LOADING_TEXT : 'Login with Username/Password' }}
    </button>
    <p v-if="isSubmitting" aria-live="polite" class="loading-message">{{ LOADING_TEXT }}</p>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </form>
</template>

<style scoped>
.login-form {
  display: grid;
  gap: 0.9rem;
}

label {
  display: grid;
  gap: 0.35rem;
  color: var(--ink-muted);
  font-weight: 600;
}

input {
  padding: 0.85rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--bg-field);
  color: var(--ink);
}

.primary-button {
  padding: 0.9rem 1rem;
  border: 0;
  border-radius: 999px;
  background: var(--accent-leather);
  color: var(--bg-field);
  cursor: pointer;
  transition: background-color 180ms ease;
}

.primary-button:hover {
  background: var(--accent-leather-deep);
}

.loading-message {
  margin: 0;
  color: var(--ink-muted);
}

.error-message {
  margin: 0;
  color: var(--danger);
}
</style>