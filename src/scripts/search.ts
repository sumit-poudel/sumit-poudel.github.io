interface BlogPost {
	title: string;
	content: string;
	summary: string;
	tags: string[];
	date: string;
	path: string;
}

type SuggestionKind = "post" | "tag" | "word" | "history" | "command";
type PaletteMode = "search" | "command";

interface Suggestion {
	kind: SuggestionKind;
	label: string;
	value: string;
	detail: string;
	score: number;
	path?: string;
}

interface PaletteItem {
	suggestion: Suggestion | null;
	post: BlogPost | null;
}

interface ParsedQuery {
	raw: string;
	terms: string[];
	tag: string | null;
	text: string;
}

const HISTORY_KEY = "nvim-blog-search-history";
const MAX_HISTORY = 8;
const MAX_SUGGESTIONS = 6;
const MAX_RESULTS = 12;

const COMMANDS: { name: string; detail: string }[] = [
	{ name: "blog", detail: "browse all posts" },
	{ name: "projects", detail: "browse builds & write-ups" },
	{ name: "about", detail: "stack & bio" },
	{ name: "contact", detail: "email & socials" },
	{ name: "h", detail: "open the help page" },
	{ name: "q", detail: "exit" },
];

let blogPosts: BlogPost[] = [];
let searchHistory: string[] = [];
let currentQuery = "";
let paletteMode: PaletteMode = "search";
let items: PaletteItem[] = [];
let activeIndex = 0;

function resultsEl(): HTMLElement | null {
	return document.getElementById("search-results");
}

function isVisible(): boolean {
	const results = resultsEl();
	return !!results && !results.classList.contains("hidden");
}

function loadHistory() {
	try {
		const stored = localStorage.getItem(HISTORY_KEY);
		const parsed = stored ? JSON.parse(stored) : [];
		searchHistory = Array.isArray(parsed)
			? parsed.filter((value): value is string => typeof value === "string")
			: [];
	} catch {
		searchHistory = [];
	}
}

function recordHistory(query: string) {
	const trimmed = query.trim();
	if (!trimmed) return;
	searchHistory = [trimmed, ...searchHistory.filter((entry) => entry !== trimmed)].slice(
		0,
		MAX_HISTORY,
	);
	try {
		localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory));
	} catch {
		return;
	}
}

async function fetchBlogPosts() {
	try {
		const response = await fetch("/api/blog-posts.json");
		if (!response.ok) {
			throw new Error(`Request failed with status ${response.status}`);
		}
		const posts = await response.json();
		blogPosts = Array.isArray(posts) ? posts : [];
	} catch (error) {
		console.error("Failed to load blog posts for search:", error);
	}
}

function fuzzyMatch(needle: string, haystack: string): number {
	if (!needle) return 0;
	const n = needle.toLowerCase();
	const h = haystack.toLowerCase();
	let score = 0;
	let cursor = 0;
	let streak = 0;
	let first = -1;

	for (let i = 0; i < n.length; i++) {
		const found = h.indexOf(n[i], cursor);
		if (found === -1) return -1;
		if (first === -1) first = found;
		if (found === cursor && i > 0) {
			streak += 1;
			score += 5 + streak * 2;
		} else {
			streak = 0;
			score += 2;
		}
		score -= Math.min(found - cursor, 6);
		cursor = found + 1;
	}

	if (first === 0) score += 25;
	if (h === n) score += 120;
	if (/\s/.test(n) && h.includes(n)) score += 40;
	score += Math.round((1 - n.length / Math.max(h.length, n.length)) * 20);
	return score;
}

function stripMarkdown(markdown: string): string {
	return markdown
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/`([^`]*)`/g, "$1")
		.replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/^\s{0,3}#{1,6}\s+/gm, "")
		.replace(/^\s{0,3}>\s?/gm, "")
		.replace(/^\s{0,3}[-*+]\s+/gm, "")
		.replace(/[*_~]/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

function formatDate(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "";
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

function recencyScore(iso: string): number {
	const date = new Date(iso).getTime();
	if (Number.isNaN(date)) return 0;
	const days = (Date.now() - date) / 86_400_000;
	return Math.max(0, 20 - days / 30);
}

function titleWords(title: string): string[] {
	const words = title
		.toLowerCase()
		.split(/[^a-z0-9+#.]+/)
		.filter((word) => word.length >= 3);
	return [...new Set(words)];
}

function uniqueTags(): { tag: string; count: number }[] {
	const counts = new Map<string, number>();
	for (const post of blogPosts) {
		for (const tag of post.tags) {
			const key = tag.toLowerCase();
			counts.set(key, (counts.get(key) ?? 0) + 1);
		}
	}
	return [...counts.entries()]
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => a.tag.localeCompare(b.tag));
}

function parseQuery(raw: string): ParsedQuery {
	const terms: string[] = [];
	let tag: string | null = null;

	for (const token of raw.trim().split(/\s+/)) {
		if (!token) continue;
		const match = /^(?:#|tag:)(.+)$/i.exec(token);
		if (match) {
			tag = match[1].toLowerCase();
		} else {
			terms.push(token.toLowerCase());
		}
	}

	return { raw: raw.trim(), terms, tag, text: terms.join(" ") };
}

function scoreTerm(term: string, post: BlogPost): number {
	let best = -1;

	const titleScore = fuzzyMatch(term, post.title);
	if (titleScore >= 0) best = Math.max(best, titleScore * 3);

	for (const tag of post.tags) {
		const tagScore = fuzzyMatch(term, tag);
		if (tagScore >= 0) best = Math.max(best, tagScore * 2 + 25);
	}

	if (post.summary) {
		const summaryScore = fuzzyMatch(term, post.summary);
		if (summaryScore >= 0) best = Math.max(best, summaryScore);
	}

	if (best < 0) {
		const index = post.content.toLowerCase().indexOf(term);
		if (index === -1) return -1;
		best = 20 + Math.min(index / 400, 15);
	}

	return best;
}

function buildResults(parsed: ParsedQuery): BlogPost[] {
	if (blogPosts.length === 0) return [];

	const scored: { post: BlogPost; score: number }[] = [];

	for (const post of blogPosts) {
		if (
			parsed.tag &&
			!post.tags.some(
				(tag) =>
					tag.toLowerCase() === parsed.tag ||
					tag.toLowerCase().startsWith(parsed.tag!),
			)
		) {
			continue;
		}

		if (parsed.terms.length === 0) {
			scored.push({ post, score: recencyScore(post.date) });
			continue;
		}

		let total = 0;
		let matchedAll = true;

		for (const term of parsed.terms) {
			const termScore = scoreTerm(term, post);
			if (termScore < 0) {
				matchedAll = false;
				break;
			}
			total += termScore;
		}

		if (matchedAll) scored.push({ post, score: total + recencyScore(post.date) });
	}

	return scored
		.sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date))
		.slice(0, MAX_RESULTS)
		.map((entry) => entry.post);
}

function buildSuggestions(parsed: ParsedQuery, hideHistory: boolean): Suggestion[] {
	if (blogPosts.length === 0) return [];
	const query = parsed.text;

	if (!query && !parsed.tag) {
		return searchHistory.map((entry) => ({
			kind: "history" as const,
			label: entry,
			value: entry,
			detail: "recent search",
			score: 0,
		}));
	}

	const collected: Suggestion[] = [];
	const tagQuery = parsed.text || parsed.tag || "";
	const wordQuery = parsed.terms.length ? parsed.terms[parsed.terms.length - 1] : "";

	for (const { tag, count } of uniqueTags()) {
		const value = `tag:${tag}`;
		if (value === parsed.raw) continue;
		const score = fuzzyMatch(tagQuery, tag);
		if (score < 0) continue;
		collected.push({
			kind: "tag",
			label: `#${tag}`,
			value,
			detail: `${count} post${count === 1 ? "" : "s"}`,
			score: score + 30,
		});
	}

	for (const post of blogPosts) {
		const titleScore = query ? fuzzyMatch(query, post.title) : -1;
		if (titleScore >= 0) {
			collected.push({
				kind: "post",
				label: post.title,
				value: post.title,
				detail: formatDate(post.date) || post.summary,
				score: titleScore + 20,
				path: post.path,
			});
		}

		if (!wordQuery) continue;
		for (const word of titleWords(post.title)) {
			if (word === wordQuery || post.title === parsed.raw) continue;
			const wordScore = fuzzyMatch(wordQuery, word);
			if (wordScore < 0) continue;
			collected.push({
				kind: "word",
				label: word,
				value: post.title,
				detail: post.title,
				score: wordScore + (word.startsWith(wordQuery) ? 20 : -15),
			});
		}
	}

	for (const entry of searchHistory) {
		if (entry === query || entry === parsed.raw || hideHistory) continue;
		const score = fuzzyMatch(query, entry);
		if (score < 0) continue;
		collected.push({
			kind: "history",
			label: entry,
			value: entry,
			detail: "recent search",
			score: score - 25,
		});
	}

	const best = new Map<string, Suggestion>();
	for (const suggestion of collected) {
		const key = `${suggestion.kind}:${suggestion.label}:${suggestion.value}`;
		const existing = best.get(key);
		if (!existing || existing.score < suggestion.score) {
			best.set(key, suggestion);
		}
	}

	return [...best.values()].sort((a, b) => b.score - a.score).slice(0, MAX_SUGGESTIONS);
}

function appendHighlighted(target: HTMLElement, text: string, terms: string[]): void {
	const lower = text.toLowerCase();
	let index = -1;
	let length = 0;

	for (const term of terms) {
		const found = lower.indexOf(term);
		if (found !== -1 && (index === -1 || found < index)) {
			index = found;
			length = term.length;
		}
	}

	if (index === -1 || length === 0) {
		target.textContent = text;
		return;
	}

	const before = document.createElement("span");
	before.textContent = text.slice(0, index);
	const match = document.createElement("span");
	match.className = "text-nvim-blue";
	match.textContent = text.slice(index, index + length);
	const after = document.createElement("span");
	after.textContent = text.slice(index + length);

	target.replaceChildren(before, match, after);
}

function buildSnippet(post: BlogPost, terms: string[]): string {
	const source = stripMarkdown(post.content || post.summary);
	const lower = source.toLowerCase();
	let index = -1;

	for (const term of terms) {
		const found = lower.indexOf(term);
		if (found !== -1 && (index === -1 || found < index)) index = found;
	}

	const start = index > 40 ? index - 40 : 0;
	const body = source.slice(start, start + 150).trim();
	return `${start > 0 ? "…" : ""}${body}…`;
}

function sectionLabel(text: string): HTMLElement {
	const label = document.createElement("p");
	label.className = "px-2 pt-1 pb-0.5 text-xs uppercase tracking-wide text-nvim-gray";
	label.textContent = text;
	return label;
}

function buildCommandSuggestions(query: string): Suggestion[] {
	const collected: Suggestion[] = [];

	for (const command of COMMANDS) {
		const value = `:${command.name}`;
		if (value === `:${query}`) continue;
		const score = query ? fuzzyMatch(query, command.name) : 0;
		if (score < 0) continue;
		collected.push({
			kind: "command",
			label: value,
			value,
			detail: command.detail,
			score: score + (command.name.startsWith(query) ? 30 : 0),
		});
	}

	return collected.sort((a, b) => b.score - a.score).slice(0, MAX_SUGGESTIONS);
}

function hintRow(mode: PaletteMode): HTMLElement {
	const hints =
		mode === "command"
			? ["Tab complete", "j/k move", "Enter run", "Esc cancel"]
			: ["Tab complete", "j/k move", "Enter open", "Esc close"];
	const row = document.createElement("p");
	row.className =
		"flex flex-wrap gap-x-3 border-t border-nvim-gray/40 px-2 py-1 text-xs text-nvim-gray";
	for (const hint of hints) {
		const [key, ...rest] = hint.split(" ");
		const item = document.createElement("span");
		const keySpan = document.createElement("span");
		keySpan.className = "text-nvim-blue";
		keySpan.textContent = key;
		item.append(keySpan, ` ${rest.join(" ")}`);
		row.append(item);
	}
	return row;
}

function buildRow(index: number, kind: SuggestionKind | "result"): HTMLButtonElement {
	const row = document.createElement("button");
	row.type = "button";
	row.dataset.searchIndex = String(index);
	row.dataset.searchKind = kind;
	row.className = "flex w-full flex-col gap-0.5 px-2 py-1 text-left hover:bg-nvim-blue/10";
	return row;
}

function renderSuggestions(
	fragment: DocumentFragment,
	suggestions: Suggestion[],
	terms: string[],
): void {
	if (suggestions.length === 0) return;
	fragment.append(sectionLabel("suggestions"));

	suggestions.forEach((suggestion, index) => {
		const row = buildRow(index, suggestion.kind);
		row.classList.add("flex-row", "items-baseline", "gap-2");

		const label = document.createElement("span");
		label.className =
			suggestion.kind === "tag"
				? "text-nvim-blue"
				: suggestion.kind === "history"
					? "italic text-nvim-gray"
					: suggestion.kind === "command"
						? "font-bold"
						: "";
		appendHighlighted(label, suggestion.label, terms);
		row.append(label);

		const detail = document.createElement("span");
		detail.className = "ml-auto shrink-0 text-xs text-nvim-gray";
		detail.textContent = suggestion.detail;
		row.append(detail);

		fragment.append(row);
	});
}

function renderResults(
	fragment: DocumentFragment,
	results: BlogPost[],
	terms: string[],
	indexOffset: number,
): void {
	if (results.length === 0) {
		const empty = document.createElement("p");
		empty.className = "px-2 py-1 text-nvim-gray";
		empty.textContent = currentQuery
			? `No results for "${currentQuery}"`
			: "No posts found";
		fragment.append(empty);
		return;
	}

	if (currentQuery.trim()) fragment.append(sectionLabel("results"));

	results.forEach((post, offset) => {
		const row = buildRow(indexOffset + offset, "result");

		const title = document.createElement("span");
		title.className = "font-bold text-nvim-blue";
		appendHighlighted(title, post.title, terms);
		row.append(title);

		const snippet = buildSnippet(post, terms);
		if (snippet) {
			const preview = document.createElement("span");
			preview.className = "text-xs";
			appendHighlighted(preview, snippet, terms);
			row.append(preview);
		}

		const meta = document.createElement("span");
		meta.className = "flex flex-wrap gap-x-2 text-xs text-nvim-gray";
		const date = formatDate(post.date);
		if (date) {
			const dateSpan = document.createElement("span");
			dateSpan.textContent = date;
			meta.append(dateSpan);
		}
		for (const tag of post.tags) {
			const tagSpan = document.createElement("span");
			tagSpan.className = "text-nvim-blue/70";
			tagSpan.textContent = `#${tag}`;
			meta.append(tagSpan);
		}
		if (meta.childElementCount > 0) row.append(meta);

		fragment.append(row);
	});
}

function highlightActive(): void {
	document.querySelectorAll<HTMLElement>("[data-search-index]").forEach((node) => {
		const isActive = Number(node.dataset.searchIndex) === activeIndex;
		node.classList.toggle("active", isActive);
		if (isActive) {
			node.scrollIntoView({ behavior: "smooth", block: "nearest" });
		}
	});
}

function render(): void {
	const results = resultsEl();
	if (!results) return;

	const fragment = document.createDocumentFragment();

	if (paletteMode === "command") {
		const suggestions = buildCommandSuggestions(currentQuery);
		items = suggestions.map(
			(suggestion): PaletteItem => ({ suggestion, post: null }),
		);
		activeIndex = Math.min(activeIndex, Math.max(items.length - 1, 0));
		renderSuggestions(fragment, suggestions, currentQuery ? [currentQuery] : []);
		if (items.length > 0) fragment.append(hintRow("command"));
		results.replaceChildren(fragment);
		results.classList.remove("hidden");
		highlightActive();
		return;
	}

	const parsed = parseQuery(currentQuery);
	const posts = buildResults(parsed);
	const suggestions = buildSuggestions(parsed, posts.length > 0);

	items = [
		...suggestions.map((suggestion): PaletteItem => ({ suggestion, post: null })),
		...posts.map((post): PaletteItem => ({ suggestion: null, post })),
	];
	activeIndex = Math.min(activeIndex, Math.max(items.length - 1, 0));

	renderSuggestions(fragment, suggestions, parsed.terms);
	renderResults(fragment, posts, parsed.terms, suggestions.length);
	if (items.length > 0) fragment.append(hintRow("search"));
	results.replaceChildren(fragment);

	results.classList.remove("hidden");
	highlightActive();
}

function moveCursor(direction: number): void {
	if (items.length === 0) return;
	activeIndex = (activeIndex + direction + items.length) % items.length;
	highlightActive();
}

function applySuggestion(value: string): void {
	if (!value.startsWith(":")) recordHistory(value);
	if (window.setCommandLine) {
		window.setCommandLine(value);
		return;
	}
	refreshPalette(value);
	window.updateStatusBar?.(undefined, `/${value}`);
}

function completeActive(): boolean {
	const item = items[activeIndex];
	if (!item?.suggestion) return false;
	applySuggestion(item.suggestion.value);
	return true;
}

function activateActive(): boolean {
	const item = items[activeIndex];
	if (!item) return false;

	if (item.suggestion) {
		if (item.suggestion.kind === "post" && item.suggestion.path) {
			recordHistory(currentQuery || item.suggestion.value);
			window.location.href = item.suggestion.path;
			return true;
		}
		return completeActive();
	}

	if (item.post) {
		recordHistory(currentQuery || item.post.title);
		window.location.href = item.post.path;
		return true;
	}

	return false;
}

function refreshPalette(commandBuffer: string): void {
	if (commandBuffer.startsWith("/")) {
		paletteMode = "search";
		currentQuery = commandBuffer.slice(1);
	} else if (commandBuffer.startsWith(":")) {
		paletteMode = "command";
		currentQuery = commandBuffer.slice(1);
	} else {
		closePalette();
		return;
	}
	activeIndex = 0;
	render();
}

function performSearch(query: string): void {
	refreshPalette(query.startsWith("/") ? query : `/${query}`);
}

function closePalette(): void {
	const results = resultsEl();
	currentQuery = "";
	items = [];
	activeIndex = 0;
	results?.classList.add("hidden");
	if (results) results.replaceChildren();
}

document.addEventListener("DOMContentLoaded", () => {
	loadHistory();
	fetchBlogPosts().then(() => {
		if (isVisible()) render();
	});
});

resultsEl()?.addEventListener("mousedown", (event) => {
	const node = (event.target as HTMLElement).closest<HTMLElement>(
		"[data-search-index]",
	);
	if (!node) return;
	event.preventDefault();
	activeIndex = Number(node.dataset.searchIndex);
	activateActive();
});

// Own scoped key handler: navigation.ts's global keydown listener asks
// handleSearchKey() first and skips its own vim-mode handling when this
// returns true, so j/k/Tab/Enter drive the suggestions while every other
// printable key still gets typed into the status bar command line. Going
// through navigation.ts instead of a second document listener keeps the
// behaviour independent of which <script> happens to load first.
function handleSearchKey(key: string): boolean {
	if (!isVisible()) return false;

	switch (key) {
		case "j":
		case "ArrowDown":
			if (items.length === 0) return false;
			moveCursor(1);
			return true;
		case "k":
		case "ArrowUp":
			if (items.length === 0) return false;
			moveCursor(-1);
			return true;
		case "Tab":
			completeActive();
			return true;
		case "Enter":
			return activateActive();
		default:
			return false;
	}
}

window.performSearch = performSearch;
window.refreshPalette = refreshPalette;
window.closeSearchPalette = closePalette;
window.handleSearchKey = handleSearchKey;
