import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import CharacterCard from "../CharacterCard.vue";

function buildCharacterCard(currentUser) {
	return mount(CharacterCard, {
		props: {
			character: {
				characterId: "c001",
				class: "Rogue",
				description: "Quiet wanderer",
				level: 5,
				name: "Thorne",
				race: "Elf",
				sessions: 5,
				userId: "u001",
			},
			currentUser,
		},
	});
}

describe("CharacterCard", () => {
	describe("given the current user owns the character", () => {
		it("when rendered then the edit button is visible", () => {
			const wrapper = buildCharacterCard({ role: "player", userId: "u001" });

			expect(wrapper.text()).toContain("Edit");
		});
	});

	describe("given the current user is a different player", () => {
		it("when rendered then the edit button is hidden", () => {
			const wrapper = buildCharacterCard({ role: "player", userId: "u002" });

			expect(wrapper.text()).not.toContain("Edit");
		});
	});

	describe("given the current user is a dm", () => {
		it("when rendered then the edit button is visible", () => {
			const wrapper = buildCharacterCard({ role: "DM", userId: "u999" });

			expect(wrapper.text()).toContain("Edit");
		});
	});
});
