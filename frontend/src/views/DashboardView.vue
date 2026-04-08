<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import CharacterCard from '../components/CharacterCard.vue';
import CharacterCreateForm from '../components/CharacterCreateForm.vue';
import CharacterEditor from '../components/CharacterEditor.vue';
import { useAuthStore } from '../stores/auth';
import { useCharactersStore } from '../stores/characters';

const authStore = useAuthStore();
const charactersStore = useCharactersStore();
const router = useRouter();
const selectedCharacter = ref(null);

const displayName = computed(() => {
  if (!authStore.user) {
    return '';
  }

  return `${authStore.user.firstName} ${authStore.user.lastName}`.trim();
});

async function loadCharacters() {
  await charactersStore.fetchCharacters();
}

async function saveCharacter({ characterId, updates }) {
  await charactersStore.updateCharacter(characterId, updates);
  selectedCharacter.value = null;
}

async function createCharacter(character) {
  await charactersStore.createCharacter(character);
}

async function logout() {
  authStore.logout();
  await router.push({ name: 'login' });
}

onMounted(loadCharacters);
</script>

<template>
  <main class="dashboard-layout">
    <header class="dashboard-header">
      <div>
        <p class="eyebrow">{{ authStore.user?.role }}</p>
        <h1>{{ displayName }}</h1>
      </div>
      <button class="secondary-button" type="button" @click="logout">Logout</button>
    </header>

    <section class="dashboard-grid">
      <CharacterCreateForm @create="createCharacter" />
      <section class="list-panel">
        <div class="panel-header">
          <h2>Characters</h2>
          <p v-if="charactersStore.isLoading">Loading...</p>
        </div>
        <p v-if="charactersStore.error" class="error-message">{{ charactersStore.error }}</p>
        <div class="card-grid">
          <CharacterCard
            v-for="character in charactersStore.characters"
            :key="character.characterId"
            :character="character"
            :current-user="authStore.user"
            @edit="selectedCharacter = $event"
          />
        </div>
      </section>
      <section v-if="selectedCharacter" class="list-panel">
        <h2>Edit Character</h2>
        <CharacterEditor :character="selectedCharacter" @save="saveCharacter" />
      </section>
    </section>
  </main>
</template>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(180deg, #eff6ff, #f8fafc 35%);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.dashboard-grid {
  display: grid;
  gap: 1.5rem;
}

.list-panel {
  padding: 1.25rem;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 1rem;
}

.secondary-button {
  padding: 0.75rem 1rem;
  border-radius: 999px;
  border: 1px solid #1f2937;
  background: #ffffff;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.75rem;
  color: #0f766e;
}

h1,
h2,
p {
  margin-top: 0;
}

.error-message {
  color: #b91c1c;
}
</style>