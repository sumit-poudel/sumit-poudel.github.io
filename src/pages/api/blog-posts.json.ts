import { getCollection } from "astro:content";

const blogEntries = await getCollection("blog");

const posts = blogEntries
	.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
	.map((entry) => ({
		title: entry.data.title,
		content: entry.body,
		summary: entry.data.summary ?? "",
		tags: entry.data.tags ?? [],
		date: entry.data.date.toISOString(),
		path: `/blog/${entry.id}`,
	}));

export async function GET() {
	return new Response(JSON.stringify(posts), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "public, max-age=300",
		},
	});
}
