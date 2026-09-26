export const SITE = {
	name: 'sumit-poudel',
	owner: 'Sumit Poudel',
	locale: 'en_US',
	lang: 'en',
	tagline: 'Go and web engineer, open source maintainer, and Arch/CachyOS user writing about Neovim, Go and the tools he breaks along the way.',
	socialImage: {
		path: '/social-image.png',
		width: 943,
		height: 943,
		alt: 'Sumit Poudel — Go and web engineer, open source maintainer, Arch/CachyOS user',
	},
} as const;

export const AUTHOR = {
	name: 'Sumit Poudel',
	alternateName: 'b0sc',
	jobTitle: 'Go and Web Engineer',
	url: '/about/',
	email: 'sumitpoudel.me@gmail.com',
	sameAs: [
		'https://github.com/sumit-poudel',
		'https://x.com/sum_itpoudel',
		'https://instagram.com/super.user.d0',
		'https://www.facebook.com/super.user.d0',
	],
	knowsAbout: [
		'Neovim',
		'Go',
		'TypeScript',
		'Astro',
		'Tailwind CSS',
		'Linux',
		'Arch Linux',
		'CachyOS',
		'Hyprland',
		'Language Servers',
	],
} as const;

export function personSchema(site: URL) {
	return {
		'@type': 'Person',
		'@id': new URL('/about/', site).href + '#person',
		name: AUTHOR.name,
		alternateName: AUTHOR.alternateName,
		jobTitle: AUTHOR.jobTitle,
		url: new URL(AUTHOR.url, site).href,
		email: `mailto:${AUTHOR.email}`,
		sameAs: [...AUTHOR.sameAs],
		knowsAbout: [...AUTHOR.knowsAbout],
	};
}

export function websiteSchema(site: URL) {
	return {
		'@type': 'WebSite',
		'@id': site.href + '#website',
		url: site.href,
		name: SITE.owner,
		description: SITE.tagline,
		inLanguage: SITE.lang,
		author: { '@id': new URL('/about/', site).href + '#person' },
		publisher: { '@id': new URL('/about/', site).href + '#person' },
	};
}

export function breadcrumbSchema(site: URL, trail: { name: string; path: string }[]) {
	return {
		'@type': 'BreadcrumbList',
		itemListElement: trail.map((crumb, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: crumb.name,
			item: new URL(crumb.path, site).href,
		})),
	};
}
