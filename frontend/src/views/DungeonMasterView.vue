<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { useAuthStore } from "../stores/auth";
import { useCharactersStore } from "../stores/characters";
import { getLevelFromSessions } from "../utils/sessionLevels";

const authStore = useAuthStore();
const charactersStore = useCharactersStore();
const router = useRouter();

const searchQuery = ref("");
const selectedUserId = ref("");

const filteredUsers = computed(() => {
	const query = searchQuery.value.trim().toLowerCase();

	if (!query) {
		return charactersStore.directoryUsers;
	}

	return charactersStore.directoryUsers.filter((user) => {
		const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim().toLowerCase();
		const username = String(user.username || "").toLowerCase();
		return fullName.includes(query) || username.includes(query);
	});
});

const selectedUser = computed(() => {
	if (!selectedUserId.value) {
		return null;
	}

	return charactersStore.directoryUsers.find((user) => user.userId === selectedUserId.value) || null;
});

const selectedUserDisplayName = computed(() => {
	if (!selectedUser.value) {
		return "";
	}

	const firstName = selectedUser.value.firstName || "";
	const lastName = selectedUser.value.lastName || "";
	const fullName = `${firstName} ${lastName}`.trim();

	return fullName || "Unnamed Player";
});

function getRoleLabel(role) {
	return role === "dungeonMaster" ? "Dungeon Master" : "Player";
}

function getCharacterLevel(character) {
	return getLevelFromSessions(character.sessions);
}

async function loadUsers() {
	await charactersStore.fetchDirectoryUsers();
}

async function selectUser(userId) {
	selectedUserId.value = userId;
	await charactersStore.fetchUserCharacters(userId);
}

async function goBack() {
	charactersStore.resetDirectoryState();
	await router.push({ name: "dashboard" });
}

onMounted(loadUsers);
</script>

<template>
	<main class="directory-layout">
		<header class="directory-header">
			<div>
				<p class="eyebrow">dungeonMaster</p>
				<h1>Player Directory</h1>
				<p class="subtitle">Search all users and inspect their characters.</p>
			</div>
			<button class="secondary-button" type="button" @click="goBack">Back to Dashboard</button>
		</header>

		<p v-if="charactersStore.directoryError" class="error-message">{{ charactersStore.directoryError }}</p>

		<section class="directory-grid">
			<section class="panel users-panel">
				<div class="panel-header">
					<h2>Users</h2>
					<p v-if="charactersStore.isDirectoryUsersLoading">Loading...</p>
				</div>
				<input
					v-model="searchQuery"
					class="search-input"
					placeholder="Search by name or username"
					type="search"
				/>
				<ul v-if="filteredUsers.length" class="users-list">
					<li v-for="user in filteredUsers" :key="user.userId">
						<button
							class="user-row"
							:class="{ active: selectedUserId === user.userId }"
							type="button"
							@click="selectUser(user.userId)"
						>
							<span class="user-name">{{ `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed Player' }}</span>
							<span class="user-role">{{ getRoleLabel(user.role) }}</span>
							<span class="user-username">@{{ user.username || 'no-username' }}</span>
						</button>
					</li>
				</ul>
				<p v-else class="empty-text">No users match your search.</p>
			</section>

			<section class="panel characters-panel">
				<div class="panel-header">
					<h2 v-if="selectedUser">Characters: {{ selectedUserDisplayName }}</h2>
					<h2 v-else>Characters</h2>
					<p v-if="charactersStore.isDirectoryCharactersLoading">Loading...</p>
				</div>
				<p v-if="!selectedUser" class="empty-text">Select a user to view their characters.</p>
				<ul v-else-if="charactersStore.selectedUserCharacters.length" class="characters-list">
					<li v-for="character in charactersStore.selectedUserCharacters" :key="character.characterId" class="character-row">
						<div>
							<p class="character-name">{{ character.name || 'Unnamed Character' }}</p>
							<p class="character-meta">{{ character.race }} {{ character.class }}</p>
						</div>
						<div class="level-pill">Lvl {{ getCharacterLevel(character) }}</div>
					</li>
				</ul>
				<p v-else class="empty-text">This user does not have any characters yet.</p>
			</section>
		</section>
	</main>
</template>

<style scoped>
.directory-layout {
	min-height: 100vh;
	padding: 2rem;
	background:
		radial-gradient(circle at 12% 6%, rgba(46, 104, 73, 0.12), transparent 30%),
		linear-gradient(180deg, #efe2c5, #e5d2ab 45%);
}

.directory-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 1rem;
	margin-bottom: 1.5rem;
}

.subtitle {
	margin: 0.4rem 0 0;
	color: var(--ink-muted);
}

.directory-grid {
	display: grid;
	grid-template-columns: minmax(18rem, 24rem) minmax(0, 1fr);
	gap: 1rem;
}

.panel {
	padding: 1rem;
	border-radius: 24px;
	border: 1px solid var(--border);
	background: var(--bg-panel);
	box-shadow: var(--shadow-soft);
}

.panel-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 0.75rem;
}

.search-input {
	width: 100%;
	padding: 0.8rem 0.9rem;
	border-radius: 14px;
	border: 1px solid var(--border);
	background: var(--bg-field);
	color: var(--ink);
	margin: 0.6rem 0 0.8rem;
}

.users-list,
.characters-list {
	list-style: none;
	padding: 0;
	margin: 0;
	display: grid;
	gap: 0.55rem;
}

.user-row {
	width: 100%;
	text-align: left;
	display: grid;
	gap: 0.2rem;
	padding: 0.75rem;
	border-radius: 14px;
	border: 1px solid var(--border);
	background: var(--bg-card);
	cursor: pointer;
	transition: border-color 160ms ease, transform 160ms ease;
}

.user-row:hover,
.user-row.active {
	border-color: var(--accent-leather);
	transform: translateY(-1px);
}

.user-name {
	font-weight: 700;
	color: var(--ink);
}

.user-username {
	font-size: 0.85rem;
	color: var(--ink-muted);
}

.user-role {
	font-size: 0.78rem;
	font-weight: 700;
	letter-spacing: 0.06em;
	text-transform: uppercase;
	color: var(--accent-forest);
}

.character-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
	padding: 0.8rem;
	border-radius: 14px;
	border: 1px solid var(--border);
	background: var(--bg-card);
}

.character-name {
	margin: 0;
	font-weight: 700;
}

.character-meta {
	margin: 0.2rem 0 0;
	color: var(--ink-muted);
	font-size: 0.92rem;
}

.level-pill {
	border-radius: 999px;
	padding: 0.35rem 0.7rem;
	border: 1px solid var(--accent-brass);
	background: rgba(179, 139, 77, 0.15);
	font-weight: 700;
}

.secondary-button {
	padding: 0.75rem 1rem;
	border-radius: 999px;
	border: 1px solid var(--accent-brass);
	background: var(--bg-field);
	color: var(--ink);
	cursor: pointer;
}

.secondary-button:hover {
	background: var(--bg-card);
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

.error-message {
	color: var(--danger);
}

.empty-text {
	margin: 0.35rem 0;
	color: var(--ink-muted);
}

@media (max-width: 960px) {
	.directory-layout {
		padding: 1rem;
	}

	.directory-grid {
		grid-template-columns: 1fr;
	}

	.directory-header {
		align-items: stretch;
		flex-direction: column;
	}
}
</style>
