'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { BookOpen, Heart, X, ArrowRight } from 'lucide-react';
import { getToken } from '@/services/auth.service';
import { Book, getBookBookmark, setBookBookmark } from '@/services/books.service';

interface BookDetailProps {
  book: Book;
  locale: string;
  onClose: () => void;
}


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


function WoodDefs() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: 'absolute', width: 0, height: 0 }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id="bd-wood-grain" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008 0.12"
            numOctaves="4"
            seed="17"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="32"
            xChannelSelector="R"
            yChannelSelector="G"
            result="grain"
          />
          <feColorMatrix
            in="grain"
            type="matrix"
            values="
              0.45 0 0 0 0.18
              0.28 0 0 0 0.08
              0.14 0 0 0 0.025
              0    0 0 1 0
            "
          />
        </filter>

        <filter id="bd-fine-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.32" numOctaves="3" seed="31" />
          <feColorMatrix
            type="matrix"
            values="
              0.40 0 0 0 0.25
              0.25 0 0 0 0.10
              0.12 0 0 0 0.035
              0    0 0 1 0
            "
          />
        </filter>

        <linearGradient id="bd-wood-base" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#63351e" />
          <stop offset="18%" stopColor="#80502e" />
          <stop offset="38%" stopColor="#9a6238" />
          <stop offset="55%" stopColor="#754322" />
          <stop offset="72%" stopColor="#98603a" />
          <stop offset="100%" stopColor="#66351e" />
        </linearGradient>

        <linearGradient id="bd-wood-base-h" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b97b46" />
          <stop offset="35%" stopColor="#a56a3b" />
          <stop offset="70%" stopColor="#8a5430" />
          <stop offset="100%" stopColor="#6e3f22" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function WoodSurface({ variant = 'panel' }: { variant?: 'panel' | 'plank' }) {
  const [w, h] = variant === 'plank' ? [1200, 60] : [600, 1000];

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        width={w}
        height={h}
        fill={variant === 'plank' ? 'url(#bd-wood-base-h)' : 'url(#bd-wood-base)'}
      />
      <rect
        x="-20"
        y="-20"
        width={w + 40}
        height={h + 40}
        fill="#7a4225"
        filter="url(#bd-wood-grain)"
        opacity="0.85"
      />
      <rect
        x="-20"
        y="-20"
        width={w + 40}
        height={h + 40}
        fill="#6b351d"
        filter="url(#bd-fine-grain)"
        opacity="0.38"
        style={{ mixBlendMode: 'multiply' }}
      />
    </svg>
  );
}

/*  3D Book                                                            */

const FACE: CSSProperties = {
  position: 'absolute',
  backfaceVisibility: 'hidden',
};

function Book3D({ book }: { book: Book }) {
  const palette = SPINE_PALETTES[seedOf(book) % SPINE_PALETTES.length];

  const leather: CSSProperties = {
    backgroundColor: palette.bg,
    backgroundImage:
      'linear-gradient(90deg, rgba(0,0,0,0.18), rgba(255,255,255,0.06) 40%, rgba(0,0,0,0.22))',
  };

  const pagesVertical = `linear-gradient(90deg, ${palette.bg} 0 3px, transparent 3px calc(100% - 3px), ${palette.bg} calc(100% - 3px)), repeating-linear-gradient(90deg, #efe6cf 0 2px, #d9ccae 2px 3px)`;
  const pagesHorizontal = `linear-gradient(180deg, ${palette.bg} 0 3px, transparent 3px calc(100% - 3px), ${palette.bg} calc(100% - 3px)), repeating-linear-gradient(0deg, #efe6cf 0 2px, #d9ccae 2px 3px)`;

  return (
    <div
      className="bd-sway relative"
      style={{
        width: 'var(--bw)',
        height: 'var(--bh)',
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        style={{
          ...FACE,
          width: 'var(--bw)',
          height: 'var(--bh)',
          transform: 'translateZ(calc(var(--bd) / 2))',
          ...leather,
        }}
        className="overflow-hidden rounded-[2px] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.35)]"
      >
        {book.cover_url ? (
          <img src={book.cover_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-4 px-5 text-center"
            style={{ color: palette.fg }}
          >
            <div
              className="absolute inset-3 border"
              style={{ borderColor: `${palette.band}aa` }}
            />
            <BookOpen size={40} strokeWidth={1.4} style={{ color: palette.band }} />
            <span className="line-clamp-4 text-sm font-semibold leading-6">{book.title}</span>
          </div>
        )}

        <div className="pointer-events-none absolute inset-y-0 left-0 w-[7%] bg-gradient-to-r from-black/35 via-white/10 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-black/25" />
      </div>

      <div
        style={{
          ...FACE,
          width: 'var(--bw)',
          height: 'var(--bh)',
          transform: 'rotateY(180deg) translateZ(calc(var(--bd) / 2))',
          ...leather,
        }}
      />

      <div
        style={{
          ...FACE,
          width: 'var(--bd)',
          height: 'var(--bh)',
          left: 'calc((var(--bw) - var(--bd)) / 2)',
          transform: 'rotateY(-90deg) translateZ(calc(var(--bw) / 2))',
          backgroundColor: palette.bg,
        }}
        className="overflow-hidden"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(0,0,0,0.35) 0%, rgba(255,255,255,0.2) 28%, rgba(255,255,255,0.05) 55%, rgba(0,0,0,0.42) 100%)',
          }}
        />
        <div
          className="absolute inset-x-0 top-[5%] h-[3px]"
          style={{ backgroundColor: palette.band, opacity: 0.9 }}
        />
        <div
          className="absolute inset-x-0 top-[7.5%] h-px"
          style={{ backgroundColor: palette.band, opacity: 0.6 }}
        />
        <div
          className="absolute inset-x-[18%] bottom-[16%] top-[13%] flex items-center justify-center"
          style={{ border: `1px solid ${palette.band}99` }}
        >
          <span
            className="max-h-full overflow-hidden text-ellipsis whitespace-nowrap py-2 text-[13px] font-semibold leading-none"
            style={{
              writingMode: 'vertical-rl',
              color: palette.fg,
              textShadow: '0 1px 0 rgba(0,0,0,0.3)',
            }}
          >
            {book.title}
          </span>
        </div>
        <div
          className="absolute inset-x-0 bottom-[5%] h-[3px]"
          style={{ backgroundColor: palette.band, opacity: 0.9 }}
        />
        <div
          className="absolute inset-x-0 bottom-[7.5%] h-px"
          style={{ backgroundColor: palette.band, opacity: 0.6 }}
        />
        <div
          className="absolute bottom-[10%] left-1/2 h-2 w-2 -translate-x-1/2 rotate-45"
          style={{ backgroundColor: palette.band, opacity: 0.85 }}
        />
      </div>

      <div
        style={{
          ...FACE,
          width: 'var(--bd)',
          height: 'var(--bh)',
          left: 'calc((var(--bw) - var(--bd)) / 2)',
          transform: 'rotateY(90deg) translateZ(calc(var(--bw) / 2))',
          background: pagesVertical,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/20" />
      </div>

      {/* TOP */}
      <div
        style={{
          ...FACE,
          width: 'var(--bw)',
          height: 'var(--bd)',
          top: 'calc((var(--bh) - var(--bd)) / 2)',
          transform: 'rotateX(90deg) translateZ(calc(var(--bh) / 2))',
          background: pagesHorizontal,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/10" />
      </div>

      <div
        style={{
          ...FACE,
          width: 'var(--bw)',
          height: 'var(--bd)',
          top: 'calc((var(--bh) - var(--bd)) / 2)',
          transform: 'rotateX(-90deg) translateZ(calc(var(--bh) / 2))',
          backgroundColor: '#3a2412',
        }}
      />
    </div>
  );
}


export function BookDetail({ book, locale, onClose }: BookDetailProps) {
  const isArabic = locale === 'ar';
  const [favorited, setFavorited] = useState(false);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setChecking(false);
      return;
    }

    let active = true;

    getBookBookmark(token, book.id)
      .then((value) => {
        if (active) setFavorited(value);
      })
      .catch(() => {
        if (active) {
          setError(isArabic ? 'تعذر التحقق من المفضلة.' : 'Could not check favorite status.');
        }
      })
      .finally(() => {
        if (active) setChecking(false);
      });

    return () => {
      active = false;
    };
  }, [book.id, isArabic]);

  const toggleFavorite = async () => {
    const token = getToken();

    if (!token) {
      setError(
        isArabic
          ? 'سجّل الدخول لحفظ الكتاب في المفضلة.'
          : 'Sign in to save this book to favorites.',
      );
      return;
    }

    setSaving(true);
    setError('');

    try {
      await setBookBookmark(token, book.id, !favorited);
      setFavorited((value) => !value);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : isArabic
            ? 'تعذر تحديث المفضلة.'
            : 'Could not update favorites.',
      );
    } finally {
      setSaving(false);
    }
  };

  const stageVars = {
    perspective: '1400px',
    perspectiveOrigin: '50% 28%',
    '--bw': 'clamp(150px, 19vw, 230px)',
    '--bh': 'calc(var(--bw) * 1.5)',
    '--bd': 'calc(var(--bw) * 0.2)',
  } as CSSProperties;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1c0f07]/70 p-3 backdrop-blur-[3px] sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <WoodDefs />

      <style>{`
        @keyframes bd-sway {
          0%, 100% { transform: rotateX(-6deg) rotateY(20deg); }
          50% { transform: rotateX(-6deg) rotateY(38deg); }
        }
        .bd-sway { animation: bd-sway 8s ease-in-out infinite; }
        .bd-stage:hover .bd-sway { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .bd-sway { animation: none; transform: rotateX(-6deg) rotateY(28deg); }
        }
      `}</style>

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-detail-title"
        dir={isArabic ? 'rtl' : 'ltr'}
        className="relative max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-[10px] border-2 border-[#2a1508] p-3 shadow-[0_30px_80px_rgba(10,5,2,0.7)] sm:p-4"
      >
        <WoodSurface variant="panel" />
        <div className="pointer-events-none absolute inset-[5px] rounded-[8px] border border-[#e0b77b]/45" />
        <div className="pointer-events-none absolute inset-0 rounded-[8px] shadow-[inset_0_0_0_1px_rgba(224,183,123,0.25),inset_0_2px_6px_rgba(255,220,170,0.2),inset_0_-3px_8px_rgba(20,8,2,0.45)]" />

        <button
          type="button"
          onClick={onClose}
          aria-label={isArabic ? 'إغلاق' : 'Close'}
          className="absolute end-6 top-6 z-30 grid h-10 w-10 place-items-center rounded-full border-2 border-[#c8a77b] bg-[#f8f1e5] text-[#70451f] shadow-[0_3px_8px_rgba(20,8,2,0.5)] transition hover:bg-white hover:text-[#2f1808]"
        >
          <X size={18} />
        </button>

        <div className="relative grid overflow-hidden rounded-[4px] border-2 border-[#2a1508] shadow-[0_0_0_1px_rgba(224,183,123,0.35)] md:min-h-[600px] md:grid-cols-[.95fr_1.05fr]">
          <div className="relative flex min-h-[470px] flex-col overflow-hidden bg-[#3b2210] md:min-h-[600px]">
            <WoodSurface variant="panel" />
            <div className="pointer-events-none absolute inset-0 bg-[#24120a]/50" />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, transparent 0px, transparent 118px, rgba(15,6,2,0.4) 118px, rgba(15,6,2,0.4) 120px)',
              }}
            />

            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 42%, rgba(255,214,150,0.3) 0%, rgba(255,214,150,0.08) 45%, transparent 70%)',
              }}
            />

            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-[16px]"
              style={{
                background: 'linear-gradient(90deg, #8a5630, #3f220f)',
                clipPath: 'polygon(0 0, 100% 3%, 100% 97%, 0 100%)',
              }}
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-[16px]"
              style={{
                background: 'linear-gradient(270deg, #8a5630, #3f220f)',
                clipPath: 'polygon(0 3%, 100% 0, 100% 100%, 0 97%)',
              }}
            />

            <div className="pointer-events-none absolute bottom-[40px] start-6 flex items-end gap-px opacity-60">
              {[
                ['#2f4a3c', 118, 22],
                ['#6b2a2a', 132, 26],
                ['#ddd1b5', 108, 20],
                ['#26384f', 124, 24],
              ].map(([color, height, width], i) => (
                <div
                  key={i}
                  className="rounded-t-[2px] shadow-[2px_0_4px_rgba(10,4,1,0.5)]"
                  style={{
                    backgroundColor: color as string,
                    height: height as number,
                    width: width as number,
                    backgroundImage:
                      'linear-gradient(90deg, rgba(0,0,0,0.35), rgba(255,255,255,0.16) 30%, rgba(0,0,0,0.4))',
                  }}
                />
              ))}
            </div>
            <div className="pointer-events-none absolute bottom-[40px] end-6 flex items-end gap-px opacity-60">
              {[
                ['#8a5a30', 126, 24],
                ['#3f6f6c', 112, 22],
                ['#4a2f1c', 134, 26],
              ].map(([color, height, width], i) => (
                <div
                  key={i}
                  className="rounded-t-[2px] shadow-[2px_0_4px_rgba(10,4,1,0.5)]"
                  style={{
                    backgroundColor: color as string,
                    height: height as number,
                    width: width as number,
                    backgroundImage:
                      'linear-gradient(90deg, rgba(0,0,0,0.35), rgba(255,255,255,0.16) 30%, rgba(0,0,0,0.4))',
                  }}
                />
              ))}
            </div>

            <div className="bd-stage relative z-10 flex flex-1 items-end justify-center px-6 pb-[12px] pt-16">
              <div className="relative flex items-end justify-center" style={stageVars}>
                <div
                  className="pointer-events-none absolute bottom-0 left-1/2 h-[22px] -translate-x-1/2 rounded-[50%] bg-black/60 blur-[10px]"
                  style={{ width: 'calc(var(--bw) * 1.15)' }}
                />
                <Book3D book={book} />
              </div>
            </div>

            <div
              className="pointer-events-none absolute inset-x-[10px] bottom-[26px] z-[1] h-[16px]"
              style={{
                background: 'linear-gradient(0deg, #c8935a 0%, #b27c47 60%, #8f5c32 100%)',
                clipPath: 'polygon(2% 0, 98% 0, 100% 100%, 0 100%)',
              }}
            />

            <div
              className="relative z-20 h-[26px] shadow-[0_-4px_10px_rgba(20,8,2,0.5),inset_0_-3px_4px_rgba(20,8,2,0.5)]"
            >
              <WoodSurface variant="plank" />
              <div className="absolute inset-x-0 top-0 h-[3px] bg-[#e6b87d]/80" />
              <div className="absolute inset-x-0 top-[3px] h-[6px] bg-gradient-to-b from-white/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-[8px] bg-gradient-to-t from-black/45 to-transparent" />
            </div>
          </div>

          <div
            className="relative flex flex-col p-7 sm:p-9 md:p-10"
            style={{
              background:
                'radial-gradient(ellipse at 50% 0%, #faf3e3 0%, #f2e8d0 60%, #ebdfc4 100%)',
              boxShadow: 'inset 0 0 40px rgba(110,80,40,0.18)',
            }}
          >
            <div className="pointer-events-none absolute inset-3 rounded-[3px] border border-[#cdb68a]/70" />

            <div className="relative flex flex-1 flex-col">
              {book.category_name && (
                <div className="mb-4">
                  <span className="inline-flex rounded-full border border-[#3d230d]/70 bg-gradient-to-b from-[#8a5630] to-[#6a3c1e] px-4 py-1.5 text-xs font-semibold text-[#fbeed9] shadow-[inset_0_0_0_1px_rgba(224,183,123,0.4),0_2px_4px_rgba(30,15,5,0.35)]">
                    {book.category_name}
                  </span>
                </div>
              )}

              <h2
                id="book-detail-title"
                className="max-w-xl pe-10 text-3xl font-bold leading-tight text-[#2f1808] [text-shadow:0_1px_0_rgba(255,255,255,0.6)] sm:text-4xl"
              >
                {book.title}
              </h2>

              <p className="mt-3 text-sm font-medium text-[#7a6648]">{book.author_display_name}</p>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#a98a55]/70 to-[#a98a55]/70" />
                <div className="h-2 w-2 rotate-45 border border-[#8a6b3a] bg-[#d8b06a]" />
                <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#a98a55]/70 to-[#a98a55]/70" />
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold text-[#5a3519]">
                  {isArabic ? 'عن الكتاب' : 'About the book'}
                </h3>

                <p className="max-h-[220px] overflow-y-auto whitespace-pre-wrap pe-2 text-[15px] leading-8 text-[#5a4a35]">
                  {book.description ||
                    (isArabic ? 'لا يوجد وصف لهذا الكتاب.' : 'No description for this book.')}
                </p>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-3">
                {[
                  { icon: <BookOpen size={17} />, label: isArabic ? 'كتاب' : 'Book' },
                  { icon: <Heart size={17} />, label: isArabic ? 'المفضلة' : 'Favorite' },
                  {
                    icon: <span className="block text-base leading-none">✦</span>,
                    label: isArabic ? 'مكتبتك' : 'Library',
                  },
                ].map((tile, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-[#cdb68a] bg-[#f7efdb] px-3 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                  >
                    <span className="mx-auto mb-2 grid h-8 w-8 place-items-center rounded-full border border-[#3d230d]/60 bg-gradient-to-b from-[#8a5630] to-[#6a3c1e] text-[#f3dcb4] shadow-[inset_0_0_0_1px_rgba(224,183,123,0.35)]">
                      {tile.icon}
                    </span>
                    <span className="text-[11px] font-medium text-[#6b5a3f]">{tile.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-7">
                {error && (
                  <p
                    role="alert"
                    className="mb-4 rounded-lg border border-[#a4483a]/25 bg-[#a4483a]/10 px-4 py-3 text-sm text-[#9d3a2f]"
                  >
                    {error}
                  </p>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={`/${locale}/books/${book.id}`}
                    onClick={onClose}
                    className="group flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#8a6430] bg-gradient-to-b from-[#e2bd7d] to-[#b98a43] px-5 text-sm font-bold text-[#2f1808] shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_4px_10px_rgba(90,55,20,0.35)] transition hover:brightness-105"
                  >
                    <BookOpen size={18} />

                    {isArabic ? 'اقرأ الكتاب' : 'Read book'}

                    <ArrowRight
                      size={16}
                      className={`${isArabic ? 'rotate-180' : ''} transition-transform group-hover:translate-x-1`}
                    />
                  </Link>

                  <button
                    type="button"
                    onClick={toggleFavorite}
                    disabled={checking || saving}
                    aria-pressed={favorited}
                    className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      favorited
                        ? 'border-[#7a2a22] bg-gradient-to-b from-[#a4483a] to-[#7d2f26] text-[#fbeed9] shadow-[0_3px_8px_rgba(80,25,18,0.4)]'
                        : 'border-[#3d230d]/80 bg-gradient-to-b from-[#8a5630] to-[#6a3c1e] text-[#fbeed9] shadow-[inset_0_0_0_1px_rgba(224,183,123,0.4),0_3px_6px_rgba(30,15,5,0.4)] hover:brightness-110'
                    }`}
                  >
                    <Heart size={18} fill={favorited ? 'currentColor' : 'none'} />

                    {saving
                      ? isArabic
                        ? 'جارٍ الحفظ...'
                        : 'Saving...'
                      : favorited
                        ? isArabic
                          ? 'إزالة من المفضلة'
                          : 'Remove favorite'
                        : isArabic
                          ? 'حفظ في المفضلة'
                          : 'Save to favorites'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
