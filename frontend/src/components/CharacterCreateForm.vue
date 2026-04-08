<script setup>
import { reactive } from 'vue';

const emit = defineEmits(['create']);

const form = reactive({
  class: '',
  description: '',
  name: '',
  race: '',
  sessions: 0
});

async function createCharacter() {
  await emit('create', {
    class: form.class,
    description: form.description,
    name: form.name,
    race: form.race,
    sessions: Number(form.sessions)
  });

  Object.assign(form, {
    class: '',
    description: '',
    name: '',
    race: '',
    sessions: 0
  });
}
</script>

<template>
  <form class="editor-form" @submit.prevent="createCharacter">
    <h2>Create Character</h2>
    <input v-model="form.name" placeholder="Name" required type="text" />
    <input v-model="form.class" placeholder="Class" required type="text" />
    <input v-model="form.race" placeholder="Race" required type="text" />
    <input v-model="form.sessions" min="0" placeholder="Sessions" required type="number" />
    <textarea v-model="form.description" placeholder="Description" rows="4" />
    <button class="primary-button" type="submit">Create</button>
  </form>
</template>

<style scoped>
.editor-form {
  display: grid;
  gap: 0.75rem;
  padding: 1.25rem;
  border-radius: 24px;
  background: #f8fafc;
}

h2 {
  margin: 0;
}

input,
textarea {
  padding: 0.8rem 0.9rem;
  border-radius: 14px;
  border: 1px solid #cbd5e1;
}

.primary-button {
  padding: 0.9rem 1rem;
  border: 0;
  border-radius: 999px;
  background: #0f766e;
  color: #ffffff;
}
</style>