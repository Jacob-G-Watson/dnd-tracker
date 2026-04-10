import { createRouter, createWebHashHistory } from "vue-router";

import { useAuthStore } from "../stores/auth";
import DashboardView from "../views/DashboardView.vue";
import LoginView from "../views/LoginView.vue";
import SignupView from "../views/SignupView.vue";

export function createAppRouter(pinia) {
	const router = createRouter({
		history: createWebHashHistory(),
		routes: [
			{
				path: "/",
				redirect: "/login",
			},
			{
				path: "/login",
				name: "login",
				component: LoginView,
			},
			{
				path: "/signup",
				name: "signup",
				component: SignupView,
			},
			{
				path: "/dashboard",
				name: "dashboard",
				component: DashboardView,
			},
		],
	});

	router.beforeEach((to) => {
		const authStore = useAuthStore(pinia);
		const isAuthenticated = Boolean(authStore.user && authStore.user.userId);

		if (to.name === "dashboard" && !isAuthenticated) {
			return { name: "login" };
		}

		if ((to.name === "login" || to.name === "signup") && isAuthenticated) {
			return { name: "dashboard" };
		}

		return true;
	});

	return router;
}
