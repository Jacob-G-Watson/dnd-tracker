<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
  character: {
    required: true,
    type: Object
  }
});

const emit = defineEmits(['save', 'cancel']);

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

function cancelEdit() {
  emit('cancel');
}
</script>

<template>
  <form class="editor-form" @submit.prevent="saveCharacter">
    <label class="field">
      <span class="field-label">Name</span>
      <input v-model="form.name" required type="text" />
    </label>
    <label class="field">
      <span class="field-label">Class</span>
      <input v-model="form.class" required type="text" />
    </label>
    <label class="field">
      <span class="field-label">Race</span>
      <input v-model="form.race" required type="text" />
    </label>
    <label class="field">
      <span class="field-label">Sessions</span>
      <input v-model="form.sessions" min="0" required type="number" />
    </label>
    <label class="field">
      <span class="field-label">Description</span>
      <textarea v-model="form.description" rows="4" />
    </label>
    <div class="button-group">
      <button class="primary-button" type="submit">Save Character</button>
      <button class="cancel-button" type="button" @click="cancelEdit">Cancel</button>
    </div>
  </form>
</template>

<style scoped>
.editor-form {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: rgba(251, 244, 227, 0.75);
}

.field {
  display: grid;
  gap: 0.25rem;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ink-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-left: 0.25rem;
}

input,
textarea {
  padding: 0.8rem 0.9rem;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--bg-field);
  color: var(--ink);
}

.button-group {
  display: flex;
  gap: 0.5rem;
}

.primary-button {
  padding: 0.9rem 1rem;
  border: 0;
  border-radius: 999px;
  background: var(--accent-leather);
  color: var(--bg-field);
  flex: 1;
  cursor: pointer;
  transition: background-color 180ms ease;
}

.primary-button:hover {
  background: var(--accent-leather-deep);
}

.cancel-button {
  padding: 0.9rem 1rem;
  border: 1px solid var(--accent-brass);
  border-radius: 999px;
  background: var(--bg-field);
  color: var(--ink);
  flex: 1;
  cursor: pointer;
  transition: background-color 180ms ease, border-color 180ms ease;
}

.cancel-button:hover {
  background: var(--bg-card);
  border-color: var(--accent-leather);
}
</style>