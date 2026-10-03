import DOMPurify from 'isomorphic-dompurify';

export function sanitizeBookHtml(content: string): string {
	return DOMPurify.sanitize(content, {
		ADD_ATTR: ['data-float', 'style'],
	});
}
