const DEFAULT_ALT = '';

function walk(node, apply) {
	if (!node || typeof node !== 'object') return;
	if (Array.isArray(node)) {
		for (const child of node) walk(child, apply);
		return;
	}
	if (node.type === 'element') apply(node);
	if (Array.isArray(node.children)) {
		for (const child of node.children) walk(child, apply);
	}
}

function rehypeImageAttributes() {
	return (tree) => {
		walk(tree, (node) => {
			if (node.tagName !== 'img') return;
			const properties = node.properties ?? (node.properties = {});
			if (properties.loading === undefined) properties.loading = 'lazy';
			if (properties.decoding === undefined) properties.decoding = 'async';
			if (properties.alt === undefined) properties.alt = DEFAULT_ALT;
		});
	};
}

export default rehypeImageAttributes;
