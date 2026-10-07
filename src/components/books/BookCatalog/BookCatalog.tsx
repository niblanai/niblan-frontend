'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { Amiri } from 'next/font/google';

import { Book, BookCategory, getBookCategories, getPublicBooks } from '@/services/books.service';
import { BookDetail } from '../BookDetail';
import { BookShelf3D } from './BookShelf3D';


const BOOKS_PER_BAY = 12;
const USE_FBX_BOOKSHELF_EXPERIMENT = true;

const SHOW_MS = 1000;

const BAY_TEXTURE = '/books-design/shelf-bay.webp';
const PAPER_EDGE_TEXTURE = '/books-design/paper-edge.jpg';
const catalogArabic = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-catalog-amiri',
});

const LEATHER_MATERIALS = [
  '/books-design/Leather1.webp',
  '/books-design/Leather2.webp',
  '/books-design/Leather3.webp',
  '/books-design/Leather4.webp',
  '/books-design/leather5.webp',
  '/books-design/leather6.webp',
];

const CLOTH_MATERIALS = [
  '/books-design/hessian1.webp',
  '/books-design/hessian2.webp',
  '/books-design/hessian3.webp',
  '/books-design/hessian4.webp',
  '/books-design/hessian5.webp',
];

const SPINE_STYLES = ['classic', 'minimal', 'cloth'] as const;
type SpineStyle = (typeof SPINE_STYLES)[number];

const SPINE_PALETTES = [
  { bg: '#2f4a3c', fg: '#f1e3c0', band: '#c8a45c' },
  { bg: '#6b2a2a', fg: '#f3e2c4', band: '#d1a55f' },
  { bg: '#26384f', fg: '#eadfc6', band: '#c9a563' },
  { bg: '#ddd1b5', fg: '#3b2a17', band: '#8a6b3a' },
  { bg: '#3f6f6c', fg: '#f0e6cd', band: '#d3b070' },
  { bg: '#8a5a30', fg: '#f6e6c8', band: '#e0bd80' },
  { bg: '#4a2f1c', fg: '#ead9b8', band: '#b9925a' },
  { bg: '#e9dfc8', fg: '#3a2b18', band: '#9a7a45' },
  { bg: '#6c6a3a', fg: '#f2e8c9', band: '#d2b878' },
  { bg: '#1f1f24', fg: '#e7d29d', band: '#c9a35a' },
];

function seedOf(book: Book) {
  const s = String(book.id);
  let h = 7;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function chunk<T>(items: T[], size: number) {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

type Dims = {
  w: number;
  h: number;
  d: number;
  offsetX: number;
  offsetY: number;
  offsetZ: number;
  rotation: number;
  gap: number;
  palette: (typeof SPINE_PALETTES)[number];
  material: string;
  isCloth: boolean;
  spineStyle: SpineStyle;
  doubleBand: boolean;
};

function getDims(book: Book, faceOut: boolean): Dims {
  const seed = seedOf(book);
  const h = 184 + ((seed >>> 3) % 22);
  const leans = (seed >>> 11) % 6 === 0;
  const isCloth = seed % 20 >= 11;
  const materials = isCloth ? CLOTH_MATERIALS : LEATHER_MATERIALS;
  return {
    w: faceOut ? 100 : 33 + (seed % 16),
    h,
    d: faceOut ? 18 : Math.round(h * 0.6),
    offsetX: faceOut ? 0 : ((seed >>> 5) % 3) - 1,
    offsetY: faceOut ? 0 : ((seed >>> 9) % 7) - 3,
    offsetZ: faceOut ? 0 : (seed >>> 13) % 5,
    rotation: faceOut || !leans ? 0 : ((seed >>> 15) % 2 === 0 ? -1 : 1) * (1 + ((seed >>> 17) % 21) / 10),
    gap: faceOut
      ? 0
      : (seed >>> 19) % 5 === 0
        ? 24 + ((seed >>> 23) % 9)
        : 8 + ((seed >>> 19) % 9),
    palette: SPINE_PALETTES[seed % SPINE_PALETTES.length],
    material: materials[Math.floor(seed / 7) % materials.length],
    isCloth,
    spineStyle: SPINE_STYLES[(seed >>> 8) % SPINE_STYLES.length],
    doubleBand: (seed >>> 7) % 3 === 0,
  };
}

type ShelfItem = { book: Book; index: number };
type ShelfGroup = { faceOut: boolean; items: ShelfItem[] };

function groupShelf(books: Book[], offset: number): ShelfGroup[] {
  const groups: ShelfGroup[] = [];
  let lastFaceOutIndex = Number.NEGATIVE_INFINITY;

  books.forEach((book, i) => {
    const index = offset + i;
    const isFaceOutCandidate = Boolean(book.cover_url) && seedOf(book) % 7 === 0;
    const faceOut = isFaceOutCandidate && i - lastFaceOutIndex >= 7;
    if (faceOut) lastFaceOutIndex = i;
    const last = groups[groups.length - 1];

    if (last && !faceOut && !last.faceOut) {
      last.items.push({ book, index });
    } else {
      groups.push({ faceOut, items: [{ book, index }] });
    }
  });

  return groups;
}

/*  Ornaments + engraved plank   */

function Fleur({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 48 24"
      className={`h-5 w-10 shrink-0 ${flip ? '-scale-x-100' : ''}`}
      fill="none"
      stroke="#2b1306"
      strokeWidth="1.6"
      strokeLinecap="round"
      style={{ filter: 'drop-shadow(0 1px 0 rgba(255,222,176,0.5))', opacity: 0.92 }}
      aria-hidden="true"
    >
      <path d="M3 12 H17" />
      <path d="M17 12 C21 2 32 2 36 12 C32 22 21 22 17 12Z" />
      <path d="M36 12 H45" />
      <circle cx="26.5" cy="12" r="2" fill="#2b1306" />
    </svg>
  );
}

const ENGRAVED_TEXT: CSSProperties = {
  color: '#2b1306',
  opacity: 0.95,
  textShadow:
    '0 1px 0 rgba(255,222,176,0.55), 0 -1px 1px rgba(0,0,0,0.65), 0 0 2px rgba(0,0,0,0.35)',
};

function EngravedLine() {
  return (
    <span
      className="hidden h-[3px] min-w-0 flex-1 sm:block"
      style={{
        borderTop: '1px solid rgba(30,12,3,0.75)',
        borderBottom: '1px solid rgba(255,222,176,0.4)',
        opacity: 0.9,
      }}
      aria-hidden="true"
    />
  );
}

function Plank({ title, height = 34 }: { title?: string; height?: number }) {
  return (
    <div
      className="catalog-title-plank relative z-20"
      style={{
        height,
        boxShadow: '0 5px 10px rgba(15,7,3,0.42), inset 0 -1px rgba(255,235,200,0.72)',
      }}
    >
      {title && (
        <div className="absolute inset-0 flex select-none items-center justify-center gap-3 px-6">
          <EngravedLine />
          <Fleur />
          <span
            className="min-w-0 max-w-[60%] truncate text-[18px] font-extrabold tracking-wide"
            style={ENGRAVED_TEXT}
          >
            {title}
          </span>
          <Fleur flip />
          <EngravedLine />
        </div>
      )}
    </div>
  );
}

function ShelfBoard() {
  return <div className="catalog-front pointer-events-none relative z-20" aria-hidden="true" />;
}

/*  3D book primitives                                                 */

function Cuboid({
  w,
  h,
  d,
  leftStyle,
  rightStyle,
  leftChildren,
  rightChildren,
  topStyle,
  className = '',
  style,
  innerClassName = '',
  innerStyle,
  children,
}: {
  w: number;
  h: number;
  d: number;
  leftStyle: CSSProperties;
  rightStyle: CSSProperties;
  leftChildren?: ReactNode;
  rightChildren?: ReactNode;
  topStyle: CSSProperties;
  className?: string;
  style?: CSSProperties;
  innerClassName?: string;
  innerStyle?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      className={`relative ${className}`}
      style={{ width: w, height: h, transformStyle: 'preserve-3d', ...style }}
    >
      <div
        className={`absolute inset-0 ${innerClassName}`}
        style={{ transformStyle: 'preserve-3d', ...innerStyle }}
      >
        {children}

        {/* TOP */}
        <div
          className="absolute left-0"
          style={{
            bottom: '100%',
            width: w,
            height: d,
            transformOrigin: 'center bottom',
            transform: 'rotateX(90deg)',
            ...topStyle,
          }}
        />

        {/* LEFT COVER */}
        <div
          className="absolute top-0 overflow-hidden"
          style={{
            right: '100%',
            width: d,
            height: h,
            transformOrigin: 'right',
            transform: 'rotateY(-90deg)',
            ...leftStyle,
          }}
        >
          {leftChildren}
        </div>

        {/* RIGHT COVER */}
        <div
          className="absolute top-0 overflow-hidden"
          style={{
            left: '100%',
            width: d,
            height: h,
            transformOrigin: 'left',
            transform: 'rotateY(90deg)',
            ...rightStyle,
          }}
        >
          {rightChildren}
        </div>
      </div>
    </div>
  );
}

function BookBody({
  book,
  faceOut,
  coverRight,
  dims,
  className,
  style,
  innerClassName,
  innerStyle,
}: {
  book: Book;
  faceOut: boolean;
  coverRight: boolean;
  dims: Dims;
  className?: string;
  style?: CSSProperties;
  innerClassName?: string;
  innerStyle?: CSSProperties;
}) {
  const { w, h, d, palette, doubleBand, material, isCloth, spineStyle } = dims;

  const pagesSide: CSSProperties = {
    backgroundColor: '#e7ddc5',
    backgroundImage: `linear-gradient(0deg, rgba(151,112,59,0.16), transparent 24%, rgba(255,248,221,0.24)), repeating-linear-gradient(180deg, rgba(117,85,45,0.18) 0 1px, transparent 1px 3px), url("${PAPER_EDGE_TEXTURE}")`,
    backgroundBlendMode: 'multiply, multiply, soft-light',
    backgroundSize: '100% 100%, 100% 100%, 100% 100%',
  };

  const leatherSide: CSSProperties = {
    backgroundColor: palette.bg,
    backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.45), rgba(255,255,255,0.12) 48%, rgba(0,0,0,0.42)), url("${material}")`,
    backgroundBlendMode: 'soft-light, multiply',
    backgroundSize: '100% 100%, 280px 280px',
  };

  const topStyle: CSSProperties = faceOut
    ? pagesSide
    : {
        ...pagesSide,
        backgroundImage: `linear-gradient(0deg, ${palette.bg} 0 3px, transparent 3px), linear-gradient(90deg, ${palette.bg} 0 3px, transparent 3px calc(100% - 3px), ${palette.bg} calc(100% - 3px)), ${pagesSide.backgroundImage}`,
      };
  const titleCharacters = Array.from(book.title);
  const titleFontSize = Math.max(7, Math.min(14, (h * 0.66) / Math.max(1, titleCharacters.length * 0.58)));
  const maxTitleCharacters = Math.max(1, Math.floor((h * 0.66) / (titleFontSize * 0.6)));
  const visibleTitle = titleCharacters.length > maxTitleCharacters
    ? `${titleCharacters.slice(0, Math.max(1, maxTitleCharacters - 1)).join('')}…`
    : book.title;
  const spineStyleBackground: CSSProperties = {
    backgroundColor: palette.bg,
    backgroundImage: `linear-gradient(180deg, rgba(255,232,190,0.28) 0%, transparent 24%, rgba(0,0,0,0.16) 100%), linear-gradient(90deg, rgba(0,0,0,0.48) 0%, rgba(255,255,255,0.2) 22%, rgba(255,255,255,0.08) 50%, rgba(0,0,0,0.42) 100%), url("${material}")`,
    backgroundBlendMode: `screen, soft-light, ${isCloth ? 'multiply' : 'overlay'}`,
    backgroundSize: '100% 100%, 100% 100%, 280px 280px',
    boxShadow: 'inset 0 0 0 1px rgba(15,7,3,0.46), inset 1px 0 rgba(255,236,196,0.52)',
  };

  const coverFace = (
    <div className="absolute inset-0">
      {book.cover_url ? (
        <img src={book.cover_url} alt="" className="h-full w-full object-cover" />
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center"
          style={{ backgroundColor: palette.bg, color: palette.fg }}
        >
          <div className="absolute inset-2 border" style={{ borderColor: `${palette.band}99` }} />
          <BookOpen size={26} strokeWidth={1.5} style={{ color: palette.band }} />
          <span className="line-clamp-4 text-[11px] font-semibold leading-4">{book.title}</span>
        </div>
      )}

      <div
        className={`pointer-events-none absolute inset-y-0 w-[10%] ${
          coverRight
            ? 'left-0 bg-gradient-to-r from-black/40 via-white/10 to-transparent'
            : 'right-0 bg-gradient-to-l from-black/40 via-white/10 to-transparent'
        }`}
      />
      <div className="catalog-faceout-gloss pointer-events-none absolute inset-0" />
    </div>
  );

  return (
    <Cuboid
      w={w}
      h={h}
      d={d}
      className={className}
      style={style}
      innerClassName={innerClassName}
      innerStyle={innerStyle}
      topStyle={topStyle}
      leftStyle={faceOut ? pagesSide : coverRight ? leatherSide : {}}
      rightStyle={faceOut ? pagesSide : coverRight ? {} : leatherSide}
      leftChildren={!faceOut && !coverRight ? coverFace : undefined}
      rightChildren={!faceOut && coverRight ? coverFace : undefined}
    >
      {faceOut ? (
        <div className="absolute inset-0 overflow-hidden rounded-[1px] border border-black/40">
          <img src={book.cover_url} alt="" className="h-full w-full object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/25" />
          <div
            className={`catalog-faceout-hinge pointer-events-none absolute inset-y-0 w-[6px] ${
              coverRight ? 'left-0' : 'right-0'
            }`}
          />
          <div className="catalog-faceout-pages pointer-events-none absolute inset-y-[4px] right-0 w-[2px]" />
        </div>
      ) : (
        <div
          className={`catalog-spine catalog-spine--${spineStyle} absolute inset-0 overflow-hidden rounded-t-[2px]`}
          style={spineStyleBackground}
        >
          <div className="catalog-spine-rim pointer-events-none absolute inset-y-0 left-0 w-px" />
          {spineStyle === 'classic' && (
            <>
              <span className="catalog-spine-band absolute inset-x-0 top-[5%] h-[2px]" style={{ backgroundColor: palette.band }} />
              <span className="catalog-spine-band absolute inset-x-0 top-[8%] h-px" style={{ backgroundColor: palette.band }} />
              {doubleBand && <span className="catalog-spine-band absolute inset-x-0 top-[13%] h-[2px]" style={{ backgroundColor: palette.band }} />}
              <span className="catalog-spine-band absolute inset-x-0 bottom-[7%] h-[2px]" style={{ backgroundColor: palette.band }} />
              <span className="catalog-spine-band absolute inset-x-0 bottom-[10%] h-px" style={{ backgroundColor: palette.band }} />
            </>
          )}
          {spineStyle === 'minimal' && (
            <>
              <span className="catalog-spine-band absolute inset-x-0 top-[8%] h-[3px]" style={{ backgroundColor: palette.band }} />
              <span className="catalog-spine-band absolute inset-x-0 bottom-[8%] h-[3px]" style={{ backgroundColor: palette.band }} />
            </>
          )}
          {spineStyle === 'cloth' && (
            <span
              className="catalog-spine-label-frame pointer-events-none absolute inset-x-[4px] bottom-[12%] top-[12%]"
              style={{ borderColor: `${palette.band}cc` }}
            />
          )}

          <div
            className={`catalog-spine-title-box absolute inset-x-[4px] bottom-[15%] top-[15%] flex items-center justify-center ${
              spineStyle === 'minimal' ? 'rounded-[1px] border' : ''
            }`}
            style={{
              borderColor: spineStyle === 'minimal' ? `${palette.band}bb` : undefined,
              backgroundColor: spineStyle === 'minimal' ? 'rgba(10,5,2,0.12)' : undefined,
            }}
          >
            <span
              className="catalog-gold-title max-h-[66%] max-w-full overflow-hidden py-1 font-semibold leading-none"
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                fontFamily: 'var(--font-catalog-amiri), serif',
                fontSize: `${titleFontSize}px`,
              }}
            >
              {visibleTitle}
            </span>
          </div>
          {spineStyle !== 'minimal' && (
            <span
              className="absolute bottom-[4%] left-1/2 h-[6px] w-[6px] -translate-x-1/2 rotate-45"
              style={{
                backgroundColor: palette.band,
                boxShadow: 'inset 1px 1px rgba(255,235,183,0.6), 0 1px 1px rgba(0,0,0,0.6)',
              }}
            />
          )}
        </div>
      )}
    </Cuboid>
  );
}


type PullHandler = (book: Book, rect: { left: number; top: number }, faceOut: boolean) => void;
type HoverHandler = (book: Book | null, el?: HTMLElement) => void;

function BookItem({
  book,
  faceOut,
  bookScale,
  isArabic,
  hidden,
  lastBook,
  onPull,
  onHover,
}: {
  book: Book;
  faceOut: boolean;
  bookScale: number;
  isArabic: boolean;
  hidden: boolean;
  lastBook: boolean;
  onPull: PullHandler;
  onHover: HoverHandler;
}) {
  const [portraitCoverReady, setPortraitCoverReady] = useState(false);
  const showFaceOut = faceOut && portraitCoverReady;
  const dims = useMemo(() => getDims(book, showFaceOut), [book, showFaceOut]);
  const displayDims = useMemo(
    () => ({
      ...dims,
      w: dims.w * bookScale,
      h: dims.h * bookScale,
      d: dims.d * bookScale,
      offsetX: dims.offsetX * bookScale,
      offsetY: dims.offsetY * bookScale,
      offsetZ: dims.offsetZ * bookScale,
      gap: dims.gap * bookScale,
    }),
    [bookScale, dims],
  );
  const { w, h, offsetX, offsetY, offsetZ, rotation, gap } = displayDims;
  const label = isArabic ? `تفاصيل ${book.title}` : `Details for ${book.title}`;

  const coverRight = !isArabic;
  const ref = useRef<HTMLDivElement>(null);
  const activationTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (activationTimerRef.current !== null) {
        window.clearTimeout(activationTimerRef.current);
      }
    },
    [],
  );

  const activate = () => {
    if (hidden || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    onHover(null);
    onPull(book, { left: rect.left, top: rect.top }, showFaceOut);
  };

  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activate();
    }
  };

  const fwdHover = showFaceOut
    ? 'group-hover:[--fwd:18px] group-focus-visible:[--fwd:18px]'
    : 'group-hover:[--fwd:30px] group-focus-visible:[--fwd:30px]';

  const liftHover = 'group-hover:[--lift:-3px] group-focus-visible:[--lift:-3px]';

  const fanHover = showFaceOut
    ? ''
    : coverRight
      ? 'group-hover:[--ry:-45deg] group-focus-visible:[--ry:-45deg]'
      : 'group-hover:[--ry:45deg] group-focus-visible:[--ry:45deg]';

  return (
    <>
      {faceOut && book.cover_url && (
        <img
          key={book.cover_url}
          src={book.cover_url}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute h-px w-px opacity-0"
          onLoad={(event) => {
            const { naturalWidth, naturalHeight } = event.currentTarget;
            const aspectRatio = naturalWidth / naturalHeight;
            setPortraitCoverReady(aspectRatio >= 0.55 && aspectRatio <= 0.8);
          }}
          onError={() => setPortraitCoverReady(false)}
        />
      )}
      <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={(event: ReactMouseEvent<HTMLDivElement>) => {
        if (activationTimerRef.current !== null) {
          window.clearTimeout(activationTimerRef.current);
          activationTimerRef.current = null;
        }
        if (event.detail > 1) return;
        activationTimerRef.current = window.setTimeout(() => {
          activationTimerRef.current = null;
          activate();
        }, 240);
      }}
      onKeyDown={handleKey}
      onMouseEnter={(event) => onHover(book, event.currentTarget)}
      onMouseLeave={() => onHover(null)}
      onFocus={(event) => onHover(book, event.currentTarget)}
      onBlur={() => onHover(null)}
      className={`catalog-book-item group relative shrink-0 cursor-pointer self-end outline-none ${
        hidden ? 'invisible' : ''
      }`}
      style={{
        width: w,
        height: h,
        marginInlineEnd: lastBook ? 0 : gap,
        ['--catalog-shadow-height' as string]: `${h * (showFaceOut ? 0.95 : 0.72)}px`,
        ['--catalog-wall-shift' as string]: `${showFaceOut ? 15 : 9}px`,
        transformStyle: 'preserve-3d',
      }}
      data-face-out={showFaceOut || undefined}
    >
      <div
        className="catalog-wall-shadow pointer-events-none absolute"
        aria-hidden="true"
      />
      <div
        className="catalog-contact-shadow pointer-events-none absolute"
        aria-hidden="true"
      />

      <BookBody
        book={book}
        faceOut={showFaceOut}
        coverRight={coverRight}
        dims={displayDims}
        className={`relative z-[1] transition-transform duration-[450ms] ease-out [--fwd:0px] [--lift:0px] ${liftHover} ${fwdHover}`}
        style={{
          transform: `perspective(1000px) translate3d(calc(${offsetX}px), calc(var(--lift) + ${offsetY}px), calc(var(--fwd) + ${offsetZ}px)) rotateZ(${rotation}deg)`,
          transformOrigin: 'center bottom',
          filter: 'drop-shadow(0 1px 0 rgba(255,231,190,0.18))',
        }}
        innerClassName={`transition-transform duration-500 ease-out [--ry:0deg] ${fanHover}`}
        innerStyle={{
          transform: 'rotateY(var(--ry))',
          transformOrigin: coverRight ? 'left center' : 'right center',
        }}
      />

      <div className="pointer-events-none absolute -inset-px rounded-[2px] ring-0 group-focus-visible:ring-2 group-focus-visible:ring-[#e0b77b]" />
      </div>
    </>
  );
}

type PulledState = { book: Book; rect: { left: number; top: number }; faceOut: boolean };

function PulledBook({
  pulled,
  isArabic,
  onOpen,
  onCancel,
}: {
  pulled: PulledState;
  isArabic: boolean;
  onOpen: (book: Book) => void;
  onCancel: () => void;
}) {
  const { book, rect, faceOut } = pulled;
  const dims = useMemo(() => getDims(book, faceOut), [book, faceOut]);
  const { w, h, d } = dims;
  const coverRight = !isArabic;

  const [phase, setPhase] = useState(0);
  const callbacks = useRef({ onOpen, onCancel });
  callbacks.current = { onOpen, onCancel };

  const geo = useMemo(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const faceW = faceOut ? w : d;
    const scale = Math.min(3, (vh * 0.58) / h, (vw * 0.82) / faceW);
    const cx = vw / 2;
    const cy = vh * 0.44;

    return {
      faceW,
      scale,
      cx,
      cy,
      dx: cx - (rect.left + w / 2),
      dy: cy - (rect.top + h / 2),
    };
  }, [faceOut, w, h, d, rect.left, rect.top]);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase(1), 40),
      window.setTimeout(() => setPhase(2), 520),
      window.setTimeout(() => setPhase(3), 1650),
      window.setTimeout(() => callbacks.current.onOpen(book), 1650 + SHOW_MS),
    ];

    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') callbacks.current.onCancel();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener('keydown', onKey);
    };
  }, [book]);

  const rot = faceOut ? 0 : coverRight ? -90 : 90;
  const fan = faceOut ? 0 : coverRight ? -48 : 48;

  let move: string;
  let fanDeg = 0;
  let ms = 450;

  if (phase <= 0) {
    move = `translate3d(0px, ${faceOut ? -10 : -30}px, ${faceOut ? 30 : 90}px) scale(1) rotateY(0deg)`;
    fanDeg = fan;
  } else if (phase === 1) {
    move = 'translate3d(0px, -36px, 150px) scale(1) rotateY(0deg)';
  } else {
    move = `translate3d(${geo.dx}px, ${geo.dy}px, 0px) scale(${geo.scale}) rotateY(${rot}deg)`;
    ms = 1100;
  }

  const shown = phase >= 3;

  return (
    <div className="fixed inset-0 z-[60]">
      <style>{`@keyframes nb-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@media (prefers-reduced-motion: reduce){.nb-float{animation:none!important}}`}</style>

      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-500"
        style={{ opacity: phase >= 1 ? 1 : 0 }}
        onClick={onCancel}
      />

      <div
        className="pointer-events-none absolute transition-opacity duration-700"
        style={{
          left: geo.cx - geo.faceW * geo.scale * 0.45,
          top: geo.cy + (h * geo.scale) / 2 + 16,
          width: geo.faceW * geo.scale * 0.9,
          height: 26,
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55), transparent 70%)',
          opacity: shown ? 1 : 0,
        }}
      />

      <div
        className={shown ? 'cursor-pointer' : ''}
        onClick={() => shown && onOpen(book)}
        style={{
          position: 'absolute',
          left: rect.left,
          top: rect.top,
          width: w,
          height: h,
          perspective: 1100,
          perspectiveOrigin: `${geo.cx - rect.left}px ${geo.cy - rect.top}px`,
        }}
      >
        <div
          className="nb-float"
          style={{
            transformStyle: 'preserve-3d',
            animation: shown ? 'nb-float 3.4s ease-in-out infinite' : undefined,
          }}
        >
          <div
            style={{
              width: w,
              height: h,
              transformStyle: 'preserve-3d',
              transformOrigin: `${w / 2}px ${h / 2}px ${-d / 2}px`,
              transform: move,
              transition: `transform ${ms}ms cubic-bezier(0.22, 0.8, 0.3, 1)`,
            }}
          >
            <BookBody
              book={book}
              faceOut={faceOut}
              coverRight={coverRight}
              dims={dims}
              innerStyle={{
                transform: `rotateY(${fanDeg}deg)`,
                transformOrigin: coverRight ? 'left center' : 'right center',
                transition: 'transform 450ms ease-out',
              }}
            />
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute left-1/2 w-[min(90vw,420px)] -translate-x-1/2 text-center transition-opacity duration-700"
        style={{ top: geo.cy + (h * geo.scale) / 2 + 44, opacity: shown ? 1 : 0 }}
      >
        <p className="truncate text-lg font-bold text-white">{book.title}</p>
        <p className="mt-1 truncate text-sm text-white/70">{book.author_display_name}</p>
        {/* <div className="mx-auto mt-3 h-[3px] w-40 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-[#e0b77b]"
            style={{
              width: shown ? '100%' : '0%',
              transition: `width ${SHOW_MS}ms linear`,
            }}
          />
        </div> */}
      </div>
    </div>
  );
}


function Bay({
  books,
  baseIndex,
  isArabic,
  pulledId,
  onPull,
  onHover,
  className = '',
}: {
  books: Book[];
  baseIndex: number;
  isArabic: boolean;
  pulledId: string | null;
  onPull: PullHandler;
  onHover: HoverHandler;
  className?: string;
}) {
  const bayRef = useRef<HTMLDivElement>(null);
  const [bookScale, setBookScale] = useState(1);
  const groups = groupShelf(books, baseIndex);

  useEffect(() => {
    const bay = bayRef.current;
    if (!bay) return;

    const updateBookScale = () => {
      const targetHeight = bay.clientHeight * 0.7;
      setBookScale(Math.min(1, targetHeight / 205));
    };
    const observer = new ResizeObserver(updateBookScale);
    observer.observe(bay);
    updateBookScale();

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={bayRef}
      className={`catalog-bay relative overflow-hidden ${className}`}
      style={{
        backgroundImage: `url("${BAY_TEXTURE}")`,
      }}
    >
      <div
        className="catalog-books absolute bottom-[3%] left-[8%] right-[8%] top-[25%] z-10 flex items-end overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div
          className="flex h-full min-w-full shrink-0 items-end"
          style={{ transformStyle: 'preserve-3d', direction: isArabic ? 'rtl' : 'ltr' }}
        >
            {groups.map((group, groupIndex) => (
              <div key={groupIndex} className="contents" style={{ transformStyle: 'preserve-3d' }}>
              {group.items.map(({ book }, itemIndex) => (
                <BookItem
                  key={book.id}
                  book={book}
                  faceOut={group.faceOut}
                  bookScale={bookScale}
                  isArabic={isArabic}
                  hidden={pulledId === String(book.id)}
                  lastBook={itemIndex === group.items.length - 1 && groupIndex === groups.length - 1}
                  onPull={onPull}
                  onHover={onHover}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryCase({
  id,
  name,
  books,
  isArabic,
  pulledId,
  onPull,
  onHover,
  last,
  focused,
}: {
  id: string;
  name: string;
  books: Book[];
  isArabic: boolean;
  pulledId: string | null;
  onPull: PullHandler;
  onHover: HoverHandler;
  last: boolean;
  focused: boolean;
}) {
  const rows = useMemo(() => chunk(chunk(books, BOOKS_PER_BAY), 2), [books]);

  return (
    <section id={id} className={`catalog-case relative scroll-mt-[88px]${focused ? ' is-zoomed-category' : ''}`}>
      <span className="catalog-case-post catalog-case-post--start" aria-hidden="true" />
      <span className="catalog-case-post catalog-case-post--end" aria-hidden="true" />
      <Plank title={name} height={34} />

      {rows.map((pair, rowIndex) => (
        <div key={rowIndex}>
          <div className="catalog-row relative mx-[1.15%]">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {pair.map((bayBooks, bayIndex) => (
                <div key={bayIndex} className="min-w-0">
                  <Bay
                    books={bayBooks}
                    baseIndex={(rowIndex * 2 + bayIndex) * BOOKS_PER_BAY}
                    isArabic={isArabic}
                    pulledId={pulledId}
                    onPull={onPull}
                    onHover={onHover}
                  />
                </div>
              ))}

              {pair.length === 1 && (
                <div className="hidden min-w-0 md:block">
                  <Bay
                    books={[]}
                    baseIndex={0}
                    isArabic={isArabic}
                    pulledId={pulledId}
                    onPull={onPull}
                    onHover={onHover}
                  />
                </div>
              )}
            </div>
            <span className="catalog-center-post absolute inset-y-0 left-1/2 hidden -translate-x-1/2 md:block" aria-hidden="true" />
            <ShelfBoard />
          </div>
        </div>
      ))}

      {last && <div className="catalog-case-bottom" aria-hidden="true" />}
    </section>
  );
}


export function BookCatalog({
  locale = 'ar',
  initialCategorySlug,
}: {
  locale?: string;
  initialCategorySlug?: string;
}) {
  const isArabic = locale === 'ar';

  const [books, setBooks] = useState<Book[]>([]);
  const [bookCategories, setBookCategories] = useState<BookCategory[]>([]);
  const [catalogueBooks, setCatalogueBooks] = useState<{ slug: string; books: Book[] } | null>(null);
  const [catalogueLoadError, setCatalogueLoadError] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [pulled, setPulled] = useState<PulledState | null>(null);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [active, setActive] = useState(-1); // -1 = جميع الكتب
  const [libraryZoomed, setLibraryZoomed] = useState(false);
  const [zoomedCategoryIndex, setZoomedCategoryIndex] = useState<number | null>(null);
  const [tip, setTip] = useState<{ title: string; author: string; x: number; y: number } | null>(
    null,
  );

  const navRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lockRef = useRef(0);
  const initialCategoryAppliedRef = useRef(false);
  const catalogueRootPath = `/${locale}/books`;
  const setCataloguePath = useCallback((slug?: string, replace = false) => {
    const path = slug
      ? `${catalogueRootPath}/catalogue/${encodeURIComponent(slug)}`
      : catalogueRootPath;
    if (window.location.pathname === path) return;
    if (replace) window.history.replaceState({ catalogueSlug: slug ?? null }, '', path);
    else window.history.pushState({ catalogueSlug: slug ?? null }, '', path);
  }, [catalogueRootPath]);

  useEffect(() => {
    let isActive = true;

    Promise.all([getPublicBooks(), getBookCategories()])
      .then(([items, categories]) => {
        if (!isActive) return;
        setBooks(items);
        setBookCategories(categories);
      })
      .catch((cause: unknown) => {
        if (isActive) setError(cause instanceof Error ? cause.message : 'Request failed');
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const hide = () => setTip(null);
    window.addEventListener('scroll', hide, true);
    return () => window.removeEventListener('scroll', hide, true);
  }, []);

  useEffect(() => {
    if (!libraryZoomed && zoomedCategoryIndex === null) return;
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLibraryZoomed(false);
        setZoomedCategoryIndex(null);
        setCataloguePath(undefined);
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [libraryZoomed, zoomedCategoryIndex, setCataloguePath]);

  const handleHover = useCallback<HoverHandler>((book, el) => {
    if (!book || !el) {
      setTip(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    setTip({
      title: book.title,
      author: book.author_display_name,
      x: rect.left + rect.width / 2,
      y: rect.bottom,
    });
  }, []);

  const handlePull = useCallback<PullHandler>((book, rect, faceOut) => {
    setPulled({ book, rect, faceOut });
  }, []);

  const handleOpen = useCallback((book: Book) => {
    setPulled(null);
    setSelectedBook(book);
  }, []);

  const handleCancel = useCallback(() => setPulled(null), []);

  const visibleBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    if (!normalizedQuery) return books;

    return books.filter((book) =>
      `
        ${book.title}
        ${book.author_display_name}
        ${book.description ?? ''}
        ${book.category_name ?? ''}
      `
        .toLocaleLowerCase()
        .includes(normalizedQuery),
    );
  }, [books, query]);
  const popularityStatsUnavailable = visibleBooks.some((book) => (
    typeof book.view_count !== 'number' || typeof book.average_rating !== 'number'
  ));

  const sections = useMemo(() => {
    const fallback = isArabic ? 'أخرى' : 'Other';
    const map = new Map<string, Book[]>();

    visibleBooks.forEach((book) => {
      const name = book.category_name?.trim() || fallback;
      const list = map.get(name);
      if (list) list.push(book);
      else map.set(name, [book]);
    });

    const categoriesById = new Map(bookCategories.map((category) => [category.id, category]));
    return Array.from(map, ([name, items]) => {
      const category = items[0]?.category_id ? categoriesById.get(items[0].category_id) : undefined;
      return {
        name,
        items,
        categoryId: category?.id ?? '',
        slug: category?.slug ?? '',
      };
    });
  }, [visibleBooks, isArabic, bookCategories]);

  const navItems = useMemo(
    () => [
      { id: 'library-top', name: isArabic ? 'جميع الكتب' : 'All Books', count: visibleBooks.length, slug: '' },
      ...sections.map((section, i) => ({
        id: `cat-${i}`,
        name: section.name,
        count: section.items.length,
        slug: section.slug,
      })),
    ],
    [sections, visibleBooks.length, isArabic],
  );

  const goTo = (id: string, index: number, slug?: string) => {
    lockRef.current = Date.now() + 1100;
    setActive(index);
    setLibraryZoomed(false);
    setZoomedCategoryIndex(index >= 0 ? index : null);
    setCataloguePath(index >= 0 ? slug : undefined);
    if (index < 0) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    if (loading || initialCategoryAppliedRef.current) return;
    initialCategoryAppliedRef.current = true;
    const requestedSlug = initialCategorySlug
      ?? window.location.pathname.match(/\/books\/catalogue\/([^/]+)\/?$/)?.[1];
    if (!requestedSlug) return;
    let decodedSlug = requestedSlug;
    try {
      decodedSlug = decodeURIComponent(requestedSlug);
    } catch {
      setCataloguePath(undefined, true);
      return;
    }
    const index = sections.findIndex((section) => section.slug === decodedSlug);
    if (index < 0) {
      setCataloguePath(undefined, true);
      return;
    }
    setActive(index);
    setZoomedCategoryIndex(index);
    setLibraryZoomed(false);
  }, [loading, initialCategorySlug, sections, setCataloguePath]);

  useEffect(() => {
    const syncFromPath = () => {
      const rawSlug = window.location.pathname.match(/\/books\/catalogue\/([^/]+)\/?$/)?.[1];
      if (!rawSlug) {
        setActive(-1);
        setZoomedCategoryIndex(null);
        setLibraryZoomed(false);
        return;
      }
      let slug = rawSlug;
      try {
        slug = decodeURIComponent(rawSlug);
      } catch {
        setCataloguePath(undefined, true);
        return;
      }
      const index = sections.findIndex((section) => section.slug === slug);
      if (index >= 0) {
        setActive(index);
        setZoomedCategoryIndex(index);
        setLibraryZoomed(false);
      } else if (bookCategories.length) {
        setCataloguePath(undefined, true);
      }
    };
    window.addEventListener('popstate', syncFromPath);
    return () => window.removeEventListener('popstate', syncFromPath);
  }, [sections, bookCategories.length, locale, setCataloguePath]);

  useEffect(() => {
    const section = zoomedCategoryIndex === null ? undefined : sections[zoomedCategoryIndex];
    if (!section?.slug || !section.categoryId) {
      setCatalogueBooks(null);
      setCatalogueLoadError('');
      return;
    }

    let isActive = true;
    setCatalogueBooks(null);
    setCatalogueLoadError('');
    getPublicBooks(section.slug)
      .then((items) => {
        if (!isActive) return;
        if (items.some((book) => book.category_id !== section.categoryId)) {
          throw new Error('The books API returned records outside this catalogue. Deploy the catalogue-slug filter on the backend.');
        }
        setCatalogueBooks({ slug: section.slug, books: items });
      })
      .catch((cause: unknown) => {
        if (!isActive) return;
        console.error(`Could not load catalogue "${section.slug}" from the books API.`, cause);
        setCatalogueLoadError(isArabic
          ? 'الخادم لم يُحدّث بعد لدعم تحميل الكتب برابط القسم؛ تظهر الكتب المحفوظة لهذا القسم.'
          : 'The backend needs the catalogue-slug update; showing this section’s locally loaded books.');
      });
    return () => {
      isActive = false;
    };
  }, [isArabic, sections, zoomedCategoryIndex]);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      if (Date.now() < lockRef.current) return;

      let current = -1;
      sections.forEach((_, i) => {
        const el = document.getElementById(`cat-${i}`);
        if (el && el.getBoundingClientRect().top <= 140) current = i;
      });
      setActive(current);
    };

    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [sections]);

  useEffect(() => {
    const box = navRef.current;
    const btn = box?.children[active + 1] as HTMLElement | undefined;
    if (!box || !btn) return;

    const b = box.getBoundingClientRect();
    const r = btn.getBoundingClientRect();
    box.scrollBy({ left: r.left + r.width / 2 - (b.left + b.width / 2), behavior: 'smooth' });
  }, [active, navItems.length]);

  const openSearch = () => {
    setSearchOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 60);
  };

  const closeSearch = () => {
    setQuery('');
    setSearchOpen(false);
  };

  const pulledId = pulled ? String(pulled.book.id) : null;

  return (
    <main dir={isArabic ? 'rtl' : 'ltr'} className={`${catalogArabic.variable} catalog-scene-root relative isolate min-h-screen text-[#f0e1ca]`}>
      <div className="catalog-room-backdrop" aria-hidden="true" />
      {(libraryZoomed || zoomedCategoryIndex !== null) && (
        <button
          type="button"
          className="catalog-zoom-backdrop fixed inset-0 z-[55] cursor-zoom-out"
          aria-label={isArabic ? 'إغلاق تكبير المكتبة' : 'Close library zoom'}
          onClick={() => {
            setLibraryZoomed(false);
            setZoomedCategoryIndex(null);
            setCataloguePath(undefined);
          }}
        />
      )}
      {!loading && !error && (
   <nav
  aria-label={isArabic ? 'التصنيفات' : 'Categories'}
  className={`
    sticky top-0 ${libraryZoomed || zoomedCategoryIndex !== null ? 'z-[70]' : 'z-40'}
    overflow-hidden
    border-b border-white/10
    shadow-[0_8px_28px_rgba(8,4,2,0.4)]
  `}
>
  <div className="catalog-nav-surface pointer-events-none absolute inset-0" aria-hidden="true" />

  <div
    className="
      pointer-events-none
      absolute inset-0
      bg-gradient-to-b from-white/[0.06] via-transparent to-black/20
    "
  />

  <div
    className="
      pointer-events-none
      absolute inset-x-0 bottom-0
      h-px
      bg-[#d8b788]/40
    "
  />

  <div
    className="
      relative z-10
      mx-auto
      flex max-w-[1500px]
      items-center
      px-3 py-2
      sm:px-5
    "
  >

    <div className="relative w-10 shrink-0 sm:w-[180px] sm:pl-2">
      <div
        className={`catalog-search-shell flex h-10 items-center overflow-hidden rounded-full border transition-all duration-300 ease-out ${
          searchOpen
            ? `catalog-search-shell--open absolute ${isArabic ? 'right-0' : 'left-0'} top-0 z-50 w-[min(260px,calc(100vw-24px))] sm:static sm:z-auto sm:w-full`
            : 'catalog-search-shell--closed relative ml-auto w-10'
        }`}
      >
        <button
          type="button"
          onClick={
            searchOpen
              ? () => inputRef.current?.focus()
              : openSearch
          }
          aria-label={isArabic ? 'بحث' : 'Search'}
          aria-expanded={searchOpen}
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center

            text-[#f2e6d6]
          `}
        >
          <Search size={17} strokeWidth={2.2} />
        </button>

        <input
          ref={inputRef}
          value={query}
          tabIndex={searchOpen ? 0 : -1}
          onChange={(event) => setQuery(event.target.value)}
          onBlur={() => {
            if (!query.trim()) {
              setSearchOpen(false);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              closeSearch();
            }
          }}
          className={`
            min-w-0
            flex-1
            bg-transparent
            text-xs
            text-[#f2e6d6]
            outline-none

            placeholder:text-[#c3b19b]

            ${
              searchOpen
                ? `
                  opacity-100
                `
                : `
                  pointer-events-none
                  w-0
                  opacity-0
                `
            }
          `}
          placeholder={
            isArabic
              ? 'ابحث عن كتاب أو كاتب...'
              : 'Search for a book or author...'
          }
          aria-label={
            isArabic
              ? 'البحث في الكتب'
              : 'Search books'
          }
        />

        {searchOpen && (
          <button
            type="button"
            onClick={closeSearch}
            aria-label={
              isArabic
                ? 'إغلاق البحث'
                : 'Close search'
            }
            className="
              flex
              h-10
              w-8
              shrink-0
              items-center
              justify-center
              text-[#e8d4b8]
              transition-colors
              hover:text-white
            "
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>

    <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden pe-2">
      <div
        ref={navRef}
        className="
          flex
          flex-1
          min-w-0
          items-center
          gap-2
          overflow-x-auto
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {navItems.map((item, i) => {
          const isActive = active === i - 1;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(item.id, i - 1, item.slug)}
              aria-current={isActive ? 'true' : undefined}
              className={`catalog-category-tab ${isActive ? 'is-active' : ''}`}
            >

              {i === 0 ? (
                <BookOpen
                  size={16}
                  strokeWidth={2}
                  className="
                    shrink-0
                    drop-shadow-[0_1px_1px_rgba(30,10,2,0.7)]
                  "
                />
              ) : (
                <span
                  className="
                    h-1.5
                    w-1.5
                    shrink-0
                    rotate-45
                    bg-current
                    opacity-70
                  "
                />
              )}

              <span
                className="max-w-[130px] truncate tracking-wide"
              >
                {item.name}
              </span>

              <span
                className="catalog-category-tab__count"
              >
                {item.count}
              </span>

            </button>
          );
        })}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => {
            const index = Math.max(-1, active - 1);
            const item = navItems[index + 1];
            if (item) goTo(item.id, index, item.slug);
          }}
          disabled={active <= -1}
          aria-label={isArabic ? 'التصنيف السابق' : 'Previous category'}
          title={isArabic ? 'التصنيف السابق' : 'Previous category'}
          className="catalog-category-arrow"
        >
          {isArabic ? <ChevronRight size={19} /> : <ChevronLeft size={19} />}
        </button>
        <button
          type="button"
          onClick={() => {
            const index = Math.min(navItems.length - 2, active + 1);
            const item = navItems[index + 1];
            if (item) goTo(item.id, index, item.slug);
          }}
          disabled={active >= navItems.length - 2}
          aria-label={isArabic ? 'التصنيف التالي' : 'Next category'}
          title={isArabic ? 'التصنيف التالي' : 'Next category'}
          className="catalog-category-arrow"
        >
          {isArabic ? <ChevronLeft size={19} /> : <ChevronRight size={19} />}
        </button>
      </div>
    </div>


  </div>
</nav>
      )}

      <section
        id="library-top"
        className="relative min-w-0 scroll-mt-[88px] p-0"
        style={{
          background: 'transparent',
        }}
      >
        {loading && (
          <div className="relative z-10 flex min-h-[500px] items-center justify-center">
            <div className="rounded-md border border-[#c8a77b] bg-[#f4ecdc] px-10 py-10 text-center shadow-lg">
              <BookOpen
                size={38}
                className="mx-auto mb-4 animate-pulse text-[#a17b3e]"
              />
              <p className="text-sm text-[#81796b]">
                {isArabic ? 'جارٍ تحميل المكتبة...' : 'Loading library...'}
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="relative z-10 flex min-h-[500px] items-center justify-center">
            <div className="rounded-md border border-[#c8a77b] bg-[#f4ecdc] px-10 py-10 text-center shadow-lg">
              <p className="text-sm text-[#a45d4c]">
                {isArabic ? 'تعذر تحميل الكتب.' : 'Could not load books.'}
              </p>
              <p className="mt-2 text-xs text-[#8b8274]">
                {isArabic
                  ? 'تحقق من اتصال الخادم وحاول مرة أخرى.'
                  : 'Check the server connection and try again.'}
              </p>
            </div>
          </div>
        )}

        {!loading && !error && visibleBooks.length === 0 && (
          <div className="relative z-10 flex min-h-[500px] items-center justify-center">
            <div className="rounded-md border border-[#c8a77b] bg-[#f4ecdc] px-10 py-10 text-center shadow-lg">
              <BookOpen
                size={48}
                className="mx-auto mb-5 text-[#b8aa93]"
              />
              <h2 className="text-lg font-semibold text-[#4a4032]">
                {query
                  ? isArabic
                    ? 'لا توجد نتائج'
                    : 'No results'
                  : isArabic
                    ? 'لا توجد كتب'
                    : 'No books'}
              </h2>

              <p className="mt-2 text-sm text-[#8b8274]">
                {query
                  ? isArabic
                    ? 'جربي البحث بكلمة أخرى.'
                    : 'Try searching for something else.'
                  : isArabic
                    ? 'لا توجد كتب منشورة حاليًا.'
                    : 'There are no published books yet.'}
              </p>
            </div>
          </div>
        )}

        {!loading && !error && visibleBooks.length > 0 && (
          <div
            key={USE_FBX_BOOKSHELF_EXPERIMENT ? 'fbx-bookshelf' : zoomedCategoryIndex !== null ? `category-${zoomedCategoryIndex}` : libraryZoomed ? 'library' : 'default'}
            className={`catalog-library-content relative z-10 w-full${USE_FBX_BOOKSHELF_EXPERIMENT ? ' catalog-library-content--3d' : ''}${libraryZoomed ? ' catalog-library-content--zoomed' : ''}${zoomedCategoryIndex !== null ? ' catalog-library-content--category-zoomed' : ''}`}
            onDoubleClick={(event) => {
              const target = event.target as HTMLElement;
              if (target.closest('.catalog-book-item') || (target.closest('.catalog-3d-stage') && target.dataset.bookClick === 'true')) return;
              setActive(-1);
              setZoomedCategoryIndex(null);
              setLibraryZoomed((zoomed) => !zoomed);
              setCataloguePath(undefined);
            }}
          >
            {(libraryZoomed || zoomedCategoryIndex !== null) && (
            <button
              type="button"
              className="catalog-zoom-close absolute right-2 top-2 z-[70] rounded-full px-3 py-1.5 text-xs font-semibold"
              onClick={() => {
                setLibraryZoomed(false);
                setZoomedCategoryIndex(null);
                setCataloguePath(undefined);
              }}
              >
                {isArabic ? 'إغلاق التكبير' : 'Close zoom'}
              </button>
            )}
            {USE_FBX_BOOKSHELF_EXPERIMENT ? (
              <BookShelf3D
                sections={sections.map(({ name, items, slug }, index) => {
                  const sectionBooks = index === zoomedCategoryIndex && catalogueBooks?.slug === slug
                    ? catalogueBooks.books
                    : items;
                  const orderedBooks = [...sectionBooks].sort((left, right) => (
                    (Number(right.view_count) || 0) - (Number(left.view_count) || 0)
                    || (Number(right.average_rating) || 0) - (Number(left.average_rating) || 0)
                  ));
                  return {
                    name,
                    books: zoomedCategoryIndex === null ? orderedBooks.slice(0, 15) : orderedBooks,
                  };
                })}
                selectedCategory={zoomedCategoryIndex}
                locale={locale}
                onSelectBook={handleOpen}
              />
            ) : (
              <>
                {sections.map((section, i) => (
                  <CategoryCase
                    key={section.name}
                    id={`cat-${i}`}
                    name={section.name}
                    books={section.items}
                    isArabic={isArabic}
                    pulledId={pulledId}
                    onPull={handlePull}
                    onHover={handleHover}
                    last={i === sections.length - 1}
                    focused={zoomedCategoryIndex === i}
                  />
                ))}
                <span className="catalog-frame-post catalog-frame-post--start" aria-hidden="true" />
                <span className="catalog-frame-post catalog-frame-post--end" aria-hidden="true" />
                <span className="catalog-frame-base" aria-hidden="true" />
              </>
            )}
            {catalogueLoadError && zoomedCategoryIndex !== null && (
              <div className="catalog-3d-catalogue-warning" role="alert">
                {catalogueLoadError}
              </div>
            )}
            {!catalogueLoadError && popularityStatsUnavailable && (
              <div className="catalog-3d-catalogue-warning" role="status">
                {isArabic
                  ? 'إحصاءات القراءة والتقييم غير متاحة بعد؛ حدّث الباك إند وطبّق ترحيل شعبية الكتب.'
                  : 'Read and rating statistics are unavailable. Deploy the backend update and apply the book popularity migration.'}
              </div>
            )}
          </div>
        )}
      </section>

      {tip && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2"
          style={{ left: tip.x, top: tip.y + 12 }}
        >
          <div className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-[#3a3a3a]" />
          <div className="relative max-w-[230px] rounded-md bg-[#3a3a3a] px-3 py-2 text-center shadow-xl">
            <p className="truncate text-xs font-semibold text-white">{tip.title}</p>
            <p className="mt-0.5 truncate text-[10px] text-white/70">{tip.author}</p>
          </div>
        </div>
      )}

      {/* الكتاب المسحوب من الرف */}
      {pulled && (
        <PulledBook
          pulled={pulled}
          isArabic={isArabic}
          onOpen={handleOpen}
          onCancel={handleCancel}
        />
      )}

      {selectedBook && (
        <BookDetail book={selectedBook} locale={locale} onClose={() => setSelectedBook(null)} />
      )}
    </main>
  );
}