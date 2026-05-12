<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import CharacterCard from '../components/CharacterCard.vue';
import CharacterCreateForm from '../components/CharacterCreateForm.vue';
import CharacterEditor from '../components/CharacterEditor.vue';
import { useAuthStore } from '../stores/auth';
import { useCharactersStore } from '../stores/characters';
import { isDungeonMasterUser } from '../utils/roles';

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

const isDungeonMaster = computed(() => isDungeonMasterUser(authStore.user));

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

async function openDungeonMasterDirectory() {
  await router.push({ name: 'dungeonMaster' });
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
      <div class="header-actions">
        <button
          v-if="isDungeonMaster"
          class="secondary-button"
          type="button"
          @click="openDungeonMasterDirectory"
        >
          Player Directory
        </button>
        <button class="secondary-button" type="button" @click="logout">Logout</button>
      </div>
    </header>

    <section class="dashboard-grid">
      <section class="list-panel">
        <div class="panel-header">
          <h2>Characters</h2>
          <p v-if="charactersStore.isLoading">Loading...</p>
        </div>
        <p v-if="charactersStore.error" class="error-message">{{ charactersStore.error }}</p>
        <div class="card-grid">
          <template
            v-for="character in charactersStore.characters"
            :key="character.characterId"
          >
            <CharacterEditor
              v-if="selectedCharacter?.characterId === character.characterId"
              :character="selectedCharacter"
              @save="saveCharacter"
              @cancel="selectedCharacter = null"
            />
            <CharacterCard
              v-else
              :character="character"
              :current-user="authStore.user"
              @edit="selectedCharacter = $event"
            />
          </template>
        </div>
      </section>
      <CharacterCreateForm @create="createCharacter" />
    </section>
  </main>
</template>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  padding: 2rem;
  background:
    radial-gradient(circle at 15% 8%, rgba(179, 139, 77, 0.2), transparent 35%),
    linear-gradient(180deg, #e8d4af, #efe2c5 40%);
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

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.list-panel {
  padding: 1.25rem;
  border-radius: 24px;
  border: 1px solid var(--border);
  background: var(--bg-panel);
  box-shadow: var(--shadow-soft);
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
  border: 1px solid var(--accent-brass);
  background: var(--bg-field);
  color: var(--ink);
  cursor: pointer;
  transition: background-color 180ms ease, border-color 180ms ease;
}

.secondary-button:hover {
  background: var(--bg-card);
  border-color: var(--accent-leather);
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 0.75rem;
  color: var(--accent-forest);
}

h1,
h2,
p {
  margin-top: 0;
}

h1,
h2 {
  color: var(--ink);
}

.error-message {
  color: var(--danger);
}
</style>