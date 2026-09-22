type ReaderControlsProps = {
  currentIndex: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  locale?: string;
};

export function ReaderControls({
  currentIndex,
  totalPages,
  onPrevious,
  onNext,
  locale = 'ar',
}: ReaderControlsProps) {
  const isArabic = locale === 'ar';

  return (
    <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-[14px] border border-white/10 bg-[#141a22] px-4 py-3 text-[#f3e7ca] sm:flex-row">
      <div className="flex items-center gap-2 text-sm">
        <button
          type="button"
          onClick={onPrevious}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg transition hover:border-[#d4b06a]/40 hover:bg-[#d4b06a]/10 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={isArabic ? 'الصفحة السابقة' : 'Previous page'}
          disabled={currentIndex === 0}
        >
          {isArabic ? '‹' : '‹'}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg transition hover:border-[#d4b06a]/40 hover:bg-[#d4b06a]/10 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label={isArabic ? 'الصفحة التالية' : 'Next page'}
          disabled={currentIndex >= totalPages - 1}
        >
          {isArabic ? '›' : '›'}
        </button>
      </div>

      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#d9c39a]">
        <span>{isArabic ? 'الصفحة' : 'PAGE'}</span>
        <span className="rounded-full border border-[#d6b26b]/40 bg-[#d6b26b]/10 px-3 py-1 text-sm font-medium text-[#f9f0d6]">
          {currentIndex + 1} / {totalPages}
        </span>
      </div>
    </div>
  );
}

export default ReaderControls;
