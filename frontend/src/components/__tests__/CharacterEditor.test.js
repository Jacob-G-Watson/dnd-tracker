import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";

import CharacterEditor from "../CharacterEditor.vue";

describe("CharacterEditor", () => {
	describe("given a character is being edited", () => {
		it("when the form is submitted then it emits the normalized updates payload", async () => {
			const wrapper = mount(CharacterEditor, {
				props: {
					character: {
						characterId: "c001",
						class: "Rogue",
						description: "Quiet wanderer",
						name: "Thorne",
						race: "Elf",
						sessions: 5,
					},
				},
			});

			await wrapper.find('input[type="number"]').setValue("6");
			await wrapper.find("form").trigger("submit.prevent");

			expect(wrapper.emitted("save")[0][0]).toEqual({
				characterId: "c001",
				updates: {
					class: "Rogue",
					description: "Quiet wanderer",
					name: "Thorne",
					race: "Elf",
					sessions: 6,
				},
			});
		});
	});
});
