<script setup>
import { computed } from 'vue';

const ROLE_DM = 'DM';

const props = defineProps({
  character: {
    required: true,
    type: Object
  },
  currentUser: {
    required: true,
    type: Object
  }
});

const emit = defineEmits(['edit']);

const canEdit = computed(() => {
  const isDm = props.currentUser.role === ROLE_DM;
  const isOwner = props.currentUser.userId === props.character.userId;

  return isDm || isOwner;
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
    </dl>
    <p class="description">{{ character.description }}</p>
  </article>
</template>

<style scoped>
.character-card {
  padding: 1.25rem;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
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
  color: #475569;
}

.secondary-button {
  padding: 0.65rem 0.9rem;
  border-radius: 999px;
  border: 1px solid #1f2937;
  background: transparent;
}
</style>