import { getCollection, render } from 'astro:content';
import { AUTHOR, SITE } from '../consts';

const site = new URL(import.meta.env.SITE);

const posts = (await getCollection('blog')).sort(
	(a, b) => b.data.date.valueOf() - a.data.date.valueOf()
);

function escapeXml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function cdata(value: string): string {
	return `<![CDATA[${value.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

const items = await Promise.all(
	posts.map(async (post) => {
		await render(post);
		const url = new URL(`/blog/${post.id}`, site).href;
		const html = post.rendered?.html ?? '';
		return `    <item>
      <title>${escapeXml(post.data.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${post.data.date.toUTCString()}</pubDate>
      <description>${cdata(post.data.summary ?? '')}</description>
      <author>${cdata(`${AUTHOR.email} (${AUTHOR.name})`)}</author>
      <content:encoded>${cdata(html)}</content:encoded>
${(post.data.tags ?? [])
	.map((tag) => `      <category>${escapeXml(tag)}</category>`)
	.join('\n')}${post.data.tags?.length ? '\n' : ''}    </item>`;
	})
);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(`${AUTHOR.name} — blog`)}</title>
    <link>${site.href}</link>
    <description>${escapeXml(SITE.tagline)}</description>
    <language>${SITE.lang}</language>
    <lastBuildDate>${(posts[0]?.data.date ?? new Date()).toUTCString()}</lastBuildDate>
    <atom:link href="${new URL('/rss.xml', site).href}" rel="self" type="application/rss+xml" />
${items.join('\n')}
  </channel>
</rss>
`;

export function GET() {
	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600',
		},
	});
}
