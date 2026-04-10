<script setup>
import { reactive, ref } from 'vue';

import { hashPassword } from '../composables/useSha256';

const emit = defineEmits(['submit']);

const form = reactive({
  confirmPassword: '',
  firstName: '',
  lastName: '',
  password: '',
  username: ''
});
const errorMessage = ref('');
const isSubmitting = ref(false);

async function submitForm() {
  errorMessage.value = '';

  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'Passwords do not match';
    return;
  }

  isSubmitting.value = true;

  try {
    const passwordHash = await hashPassword(form.password);
    await emit('submit', {
      firstName: form.firstName,
      lastName: form.lastName,
      passwordHash,
      username: form.username
    });
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <form class="signup-form" @submit.prevent="submitForm">
    <div class="name-row">
      <label>
        First Name
        <input v-model="form.firstName" autocomplete="given-name" required type="text" />
      </label>
      <label>
        Last Name
        <input v-model="form.lastName" autocomplete="family-name" required type="text" />
      </label>
    </div>
    <label>
      Username
      <input v-model="form.username" autocomplete="username" required type="text" />
    </label>
    <label>
      Password
      <input v-model="form.password" autocomplete="new-password" required type="password" />
    </label>
    <label>
      Confirm Password
      <input v-model="form.confirmPassword" autocomplete="new-password" required type="password" />
    </label>
    <button class="primary-button" :disabled="isSubmitting" type="submit">
      Sign Up with Username/Password
    </button>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </form>
</template>

<style scoped>
.signup-form {
  display: grid;
  gap: 0.9rem;
}

.name-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
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
