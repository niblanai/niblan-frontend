export const PAPER_TEXTURES = [
	{
		id: 'old-paper-texture-3-2-624x468.jpg',
		name: { ar: 'ورق قديم كلاسيكي', en: 'Classic aged paper' },
		spread: true,
	},
	{
		id: 'old-paper-texture-6-1.jpg',
		name: { ar: 'ورق معتّق', en: 'Aged paper' },
		spread: true,
	},
	{
		id: 'old-paper-texture-stain1-1024x718.jpg',
		name: { ar: 'ورق ببقع خفيفة', en: 'Lightly stained paper' },
		spread: true,
	},
	{
		id: 'simple-old-paper-texture-3-1024x745.jpg',
		name: { ar: 'ورق قديم بسيط', en: 'Simple old paper' },
		spread: true,
	},
	{
		id: 'nordwood-themes-R53t-Tg6J4c-unsplash.jpg',
		name: { ar: 'ورق طبيعي', en: 'Natural paper' },
		spread: false,
	},
] as const;

export type PaperTextureId = (typeof PAPER_TEXTURES)[number]['id'];

export const DEFAULT_PAPER_TEXTURE_ID: PaperTextureId = 'old-paper-texture-3-2-624x468.jpg';

export function getPaperTextureUrl(textureId?: string): string {
	const texture = PAPER_TEXTURES.find((item) => item.id === textureId);
	return `/paper_texture/${texture?.id ?? DEFAULT_PAPER_TEXTURE_ID}`;
}

export function getPaperTextureStyle(textureId?: string, pageSide: 'left' | 'right' = 'right') {
	const texture = PAPER_TEXTURES.find((item) => item.id === textureId);
	const isSpread = texture?.spread ?? false;
	const backgroundSize = isSpread ? '100% 100%, 200% 100%' : '100% 100%, cover';
	const backgroundPosition = isSpread
		? `center, ${pageSide} center`
		: 'center, center';
	return {
		backgroundColor: '#f3ead3',
		backgroundImage: `linear-gradient(rgba(243, 234, 211, 0.1), rgba(243, 234, 211, 0.1)), url("${getPaperTextureUrl(textureId)}")`,
		backgroundPosition,
		backgroundRepeat: 'no-repeat, no-repeat',
		backgroundSize,
	};
}
