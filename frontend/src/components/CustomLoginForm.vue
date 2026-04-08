<script setup>
import { reactive, ref } from 'vue';

import { hashPassword } from '../composables/useSha256';

const emit = defineEmits(['submit']);

const form = reactive({
  password: '',
  username: ''
});
const errorMessage = ref('');
const isSubmitting = ref(false);

async function submitForm() {
  errorMessage.value = '';
  isSubmitting.value = true;

  try {
    const passwordHash = await hashPassword(form.password);
    await emit('submit', { passwordHash, username: form.username });
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isSubmitting.value = false;
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
      Login with Username/Password
    </button>
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
  color: #334155;
  font-weight: 600;
}

input {
  padding: 0.85rem 1rem;
  border-radius: 14px;
  border: 1px solid #cbd5e1;
}

.primary-button {
  padding: 0.9rem 1rem;
  border: 0;
  border-radius: 999px;
  background: #1d4ed8;
  color: #ffffff;
  cursor: pointer;
}

.error-message {
  margin: 0;
  color: #b91c1c;
}
</style>