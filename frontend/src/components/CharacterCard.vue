<script setup>
import { computed } from 'vue';
import { getLevelFromSessions } from '../utils/sessionLevels';

const ROLE_DM = 'DM';

const props = defineProps({
  character: {
    required: true,
    type: Object
  },
  currentUser: {
    required: true,
    type: Object,
    default: null,
    validator: (v) => v === null || typeof v === 'object'
  }
});

const emit = defineEmits(['edit']);

const canEdit = computed(() => {
  if (!props.currentUser) return false;
  const isDm = props.currentUser.role === ROLE_DM;
  const isOwner = props.currentUser.userId === props.character.userId;

  return isDm || isOwner;
});

const characterLevel = computed(() => {
  return getLevelFromSessions(props.character.sessions);
});
</script>

<template>
  <article class="character-card">
    <div class="header-row">
      <div>
        <h3>{{ character.name }}</h3>
        <p>{{ character.race }} {{ character.class }}</p>
      </div>
      <button v-if="canEdit" class="secondary-button" type="button" @click="emit('edit', character)">
        Edit
      </button>
    </div>
    <dl class="details-grid">
      <div>
        <dt>Sessions</dt>
        <dd>{{ character.sessions }}</dd>
      </div>
      <div>
        <dt>Level</dt>
        <dd>{{ characterLevel }}</dd>
      </div>
    </dl>
    <p class="description">{{ character.description }}</p>
  </article>
</template>

<style scoped>
.character-card {
  padding: 1.25rem;
  border-radius: 24px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  box-shadow: var(--shadow-soft);
}

.header-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: start;
}

h3,
p,
dt,
dd {
  margin: 0;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
  margin: 1rem 0;
}

.description {
  color: var(--ink-muted);
}

.secondary-button {
  padding: 0.65rem 0.9rem;
  border-radius: 999px;
  border: 1px solid var(--accent-brass);
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  transition: background-color 180ms ease, border-color 180ms ease;
}

.secondary-button:hover {
  background: rgba(179, 139, 77, 0.14);
  border-color: var(--accent-leather);
}
</style>