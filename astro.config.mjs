import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import rehypeImageAttributes from './src/plugins/rehype-image-attributes.mjs';

const SITE_URL = 'https://www.sumit-poudel.com.np';

const LASTMOD = {
	'/blog/hackathon-journey/': '2025-10-05',
	'/blog/hyprland/': '2025-09-26',
	'/blog/owte/': '2025-09-25',
};

const EXCLUDED = ['/404/', '/exited/'];

export default defineConfig({
	site: SITE_URL,
	markdown: {
		rehypePlugins: [rehypeImageAttributes],
	},
	integrations: [
		sitemap({
			filter: (page) => !EXCLUDED.includes(new URL(page).pathname),
			serialize(item) {
				const path = new URL(item.url).pathname;
				// Only lastmod is worth emitting: Google states it ignores
				// changefreq and priority, but does use lastmod to schedule recrawls.
				return {
					...item,
					lastmod: LASTMOD[path] ?? new Date().toISOString(),
				};
			},
		}),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
