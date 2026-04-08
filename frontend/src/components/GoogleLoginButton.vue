<script setup>
import { onMounted } from 'vue';

const emit = defineEmits(['success']);

const CLIENT_ID = 'REPLACE_WITH_GOOGLE_CLIENT_ID';
const GOOGLE_SCRIPT_SOURCE = 'https://accounts.google.com/gsi/client';

function loadGoogleScript() {
  return new Promise((resolve) => {
    const existingScript = document.querySelector(`script[src="${GOOGLE_SCRIPT_SOURCE}"]`);

    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_SCRIPT_SOURCE;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    document.head.appendChild(script);
  });
}

function initializeGoogleButton() {
  if (!window.google?.accounts?.id) {
    return;
  }

  window.google.accounts.id.initialize({
    callback: (response) => emit('success', response.credential),
    client_id: CLIENT_ID
  });
}

function promptGoogleLogin() {
  if (window.google?.accounts?.id) {
    window.google.accounts.id.prompt();
  }
}

onMounted(async () => {
  await loadGoogleScript();
  initializeGoogleButton();
});
</script>

<template>
  <button class="secondary-button" type="button" @click="promptGoogleLogin">
    Login with Google
  </button>
</template>

<style scoped>
.secondary-button {
  width: 100%;
  padding: 0.9rem 1rem;
  border-radius: 999px;
  border: 1px solid #1f2937;
  background: transparent;
  color: #1f2937;
  font-size: 1rem;
  cursor: pointer;
}
</style>