function textLength(text: string): number {
	return Array.from(text).length;
}

function splitTextNode(node: Text, limit: number): Node[] {
	const text = node.textContent ?? '';
	if (textLength(text) <= limit) return [document.createTextNode(text)];

	const tokens = text.match(/\s+|[^\s]+/gu) ?? [text];
	const chunks: string[] = [];
	let current = '';

	for (const token of tokens) {
		const tokenLength = textLength(token);
		if (tokenLength > limit) {
			if (current) chunks.push(current);
			current = '';
			const characters = Array.from(token);
			for (let offset = 0; offset < characters.length; offset += limit) {
				chunks.push(characters.slice(offset, offset + limit).join(''));
			}
			continue;
		}
		if (textLength(current) + tokenLength > limit) {
			chunks.push(current);
			current = '';
		}
		current += token;
	}
	if (current) chunks.push(current);
	return chunks.map((chunk) => document.createTextNode(chunk));
}

function splitNode(node: Node, limit: number): Node[] {
	if (node.nodeType === Node.TEXT_NODE) return splitTextNode(node as Text, limit);
	if (!(node instanceof HTMLElement)) return [node.cloneNode(true)];

	const chunks: HTMLElement[] = [];
	let current = node.cloneNode(false) as HTMLElement;
	let currentLength = 0;

	for (const child of Array.from(node.childNodes)) {
		for (const childChunk of splitNode(child, limit)) {
			const childLength = textLength(childChunk.textContent ?? '');
			if (current.childNodes.length > 0 && currentLength + childLength > limit) {
				chunks.push(current);
				current = node.cloneNode(false) as HTMLElement;
				currentLength = 0;
			}
			current.appendChild(childChunk);
			currentLength += childLength;
		}
	}
	if (current.childNodes.length > 0 || chunks.length === 0) chunks.push(current);
	return chunks;
}

export function paginateHtmlByTextLimit(content: string, limit: number): string[] {
	const parsed = new DOMParser().parseFromString(content, 'text/html');
	const parts = Array.from(parsed.body.childNodes).flatMap((node) => splitNode(node, limit));
	const pages: string[] = [];
	let currentParts: Node[] = [];
	let currentLength = 0;

	const flush = () => {
		if (currentParts.length === 0) return;
		const wrapper = document.createElement('div');
		currentParts.forEach((part) => wrapper.appendChild(part));
		pages.push(wrapper.innerHTML);
		currentParts = [];
		currentLength = 0;
	};

	for (const part of parts) {
		const partLength = textLength(part.textContent ?? '');
		if (currentParts.length > 0 && currentLength + partLength > limit) flush();
		currentParts.push(part);
		currentLength += partLength;
	}
	flush();
	return pages.length > 0 ? pages : [''];
}
