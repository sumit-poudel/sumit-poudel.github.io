declare module "astro:actions" {
	type Actions = typeof import("D:/sumit-poudel.github.io/src/actions")["server"];

	export const actions: Actions;
}