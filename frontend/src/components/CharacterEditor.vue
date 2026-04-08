<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
  character: {
    required: true,
    type: Object
  }
});

const emit = defineEmits(['save']);

const form = reactive(buildFormState(props.character));

watch(
  () => props.character,
  (nextCharacter) => {
    Object.assign(form, buildFormState(nextCharacter));
  },
  { deep: true }
);

function buildFormState(character) {
  return {
    class: character.class,
    description: character.description,
    name: character.name,
    race: character.race,
    sessions: Number(character.sessions)
  };
}

function saveCharacter() {
    emit('save', {
      characterId: props.character.characterId,
      updates: {
        class: form.class,
        description: form.description,
        name: form.name,
        race: form.race,
        sessions: Number(form.sessions)
      }
    });
}
</script>

<template>
  <form class="editor-form" @submit.prevent="saveCharacter">
    <input v-model="form.name" required type="text" />
    <input v-model="form.class" required type="text" />
    <input v-model="form.race" required type="text" />
    <input v-model="form.sessions" min="0" required type="number" />
    <textarea v-model="form.description" rows="4" />
    <button class="primary-button" type="submit">Save Character</button>
  </form>
</template>

<style scoped>
.editor-form {
  display: grid;
  gap: 0.75rem;
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
  background: #1d4ed8;
  color: #ffffff;
}
</style>