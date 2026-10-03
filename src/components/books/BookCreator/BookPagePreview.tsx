'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DragEvent, PointerEvent as ReactPointerEvent } from 'react';
import { PiBookOpenText } from 'react-icons/pi';
import { getPaperTextureStyle } from '@/lib/books/paperTextures';
import { sanitizeBookHtml } from '@/lib/books/sanitizeBookHtml';

type ImageSelection = {
  source: string;
  left: number;
  top: number;
  width: number;
  height: number;
};

type ResizeSession = {
  source: string;
  image: HTMLImageElement;
  directionX: number;
  directionY: number;
  startX: number;
  startY: number;
  startWidth: number;
  contentWidth: number;
  aspectRatio: number;
};

interface BookPagePreviewProps {
  locale: string;
  paperTextureID: string;
  chapterLabel: string;
  chapterTitle: string;
  showChapterHeading: boolean;
  pageNumber: number;
  content: string;
  hasContent: boolean;
  freeWrite: boolean;
  previewPageIndex: number;
  previewPageCount: number;
  uploadingImage: boolean;
  onPreviewPageChange: (index: number) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onImageResize: (source: string, widthPercent: number) => void;
}

export default function BookPagePreview({
  locale,
  paperTextureID,
  chapterLabel,
  chapterTitle,
  showChapterHeading,
  pageNumber,
  content,
  hasContent,
  freeWrite,
  previewPageIndex,
  previewPageCount,
  uploadingImage,
  onPreviewPageChange,
  onDrop,
  onImageResize,
}: BookPagePreviewProps) {
  const isArabic = locale === 'ar';
  const pageSide = pageNumber % 2 === 1 ? 'right' : 'left';
  const pageRef = useRef<HTMLDivElement>(null);
  const resizeSession = useRef<ResizeSession | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageSelection | null>(null);

  const updateSelection = useCallback((source: string | null) => {
    const page = pageRef.current;
    const image = source
      ? Array.from(page?.querySelectorAll('img') ?? []).find((candidate) => candidate.getAttribute('src') === source)
      : undefined;
    if (!page || !image) {
      setSelectedImage(null);
      return;
    }
    const pageBounds = page.getBoundingClientRect();
    const imageBounds = image.getBoundingClientRect();
    setSelectedImage({
      source,
      left: imageBounds.left - pageBounds.left,
      top: imageBounds.top - pageBounds.top,
      width: imageBounds.width,
      height: imageBounds.height,
    });
  }, []);

  useEffect(() => {
    updateSelection(selectedImage?.source ?? null);
  }, [content, selectedImage?.source, updateSelection]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const session = resizeSession.current;
      if (!session) return;
      const dx = session.directionX * (event.clientX - session.startX);
      const dy = session.directionY * (event.clientY - session.startY) * session.aspectRatio;
      const delta = session.directionX && session.directionY ? (dx + dy) / 2 : dx + dy;
      const minWidth = Math.min(72, session.contentWidth * 0.2);
      const maxWidth = session.contentWidth * 0.65;
      const width = Math.max(minWidth, Math.min(maxWidth, session.startWidth + delta));
      session.image.style.width = `${(width / session.contentWidth) * 100}%`;
      updateSelection(session.source);
    };
    const handlePointerUp = () => {
      const session = resizeSession.current;
      if (!session) return;
      const page = pageRef.current;
      const contentWidth = page?.querySelector('.book-content')?.clientWidth ?? session.contentWidth;
      const widthPercent = Math.max(
        20,
        Math.min(65, (session.image.getBoundingClientRect().width / contentWidth) * 100)
      );
      resizeSession.current = null;
      onImageResize(session.source, Number(widthPercent.toFixed(1)));
      updateSelection(session.source);
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [onImageResize, updateSelection]);

  const startResize = (
    event: ReactPointerEvent<HTMLButtonElement>,
    directionX: number,
    directionY: number
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const image = Array.from(pageRef.current?.querySelectorAll('img') ?? []).find(
      (candidate) => candidate.getAttribute('src') === selectedImage?.source
    );
    const content = pageRef.current?.querySelector('.book-content');
    if (!image || !content || !selectedImage) return;
    const contentWidth = content.clientWidth;
    const bounds = image.getBoundingClientRect();
    resizeSession.current = {
      source: selectedImage.source,
      image,
      directionX,
      directionY,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: bounds.width,
      contentWidth,
      aspectRatio: bounds.width / Math.max(bounds.height, 1),
    };
  };

  const resizeHandles = [
    ['top-left', -1, -1, 'left-0 top-0'],
    ['top', 0, -1, 'left-1/2 top-0'],
    ['top-right', 1, -1, 'right-0 top-0'],
    ['right', 1, 0, 'right-0 top-1/2'],
    ['bottom-right', 1, 1, 'bottom-0 right-0'],
    ['bottom', 0, 1, 'bottom-0 left-1/2'],
    ['bottom-left', -1, 1, 'bottom-0 left-0'],
    ['left', -1, 0, 'left-0 top-1/2'],
  ] as const;

  return (
    <aside className="min-w-0 rounded-xl border border-[#e5ddd1] bg-[#fffdf9] p-4 shadow-lg">
      <div className="flex items-center gap-2">
        <PiBookOpenText size={25} className="text-[#5f4738]" />
        <h2 className="text-base font-semibold text-[#292929]">{isArabic ? 'معاينة الصفحة' : 'Page preview'}</h2>
      </div>
      <div
        ref={pageRef}
        className="book-page-preview relative mx-auto mt-4 aspect-[10/13] w-full overflow-hidden rounded-md border border-[#b99562] p-4 shadow-md"
        style={{ backgroundColor: '#f3ead3' }}
        onDragStartCapture={(event) => {
          if (event.target instanceof HTMLImageElement) {
            const source = event.target.getAttribute('src');
            if (source) event.dataTransfer.setData('text/plain', source);
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
        onClick={(event) => {
          const image = (event.target as HTMLElement).closest('img');
          updateSelection(image?.getAttribute('src') ?? null);
        }}
        aria-label={isArabic ? 'معاينة محتوى الصفحة' : 'Page content preview'}
      >
        <div className="pointer-events-none absolute inset-0" style={getPaperTextureStyle(paperTextureID, pageSide)} />
        <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex justify-between border-b border-[#8c6f46]/30 pb-1.5 text-[7px] text-[#5d4631]">
          <span>{chapterLabel}</span>
          <span>
            {freeWrite
              ? (isArabic ? `صفحة ${previewPageIndex + 1} من ${previewPageCount}` : `Page ${previewPageIndex + 1} of ${previewPageCount}`)
              : (isArabic ? `صفحة ${pageNumber}` : `Page ${pageNumber}`)}
          </span>
        </div>
        <div
          dir={isArabic ? 'rtl' : 'ltr'}
          className="relative z-10 mt-6 h-[calc(100%-2rem)] overflow-hidden text-right text-[7px] leading-[14px] text-[#302d27]"
        >
          <div className="mb-2 border-b border-[#8c6f46]/30 pb-1 text-[6px] font-semibold text-[#4c3728]">
            {chapterTitle || (isArabic ? 'عنوان الفصل' : 'Chapter title')}
          </div>
          {showChapterHeading && (
            <h2 className="mb-1 text-[14px] font-semibold leading-tight text-[#2a1f17]">
              {chapterTitle || (isArabic ? 'عنوان الفصل' : 'Chapter title')}
            </h2>
          )}
          <div
            className="book-content leading-[14px] text-[#302d27] [&_img]:cursor-grab [&_img]:object-contain [&_img]:active:cursor-grabbing"
            dangerouslySetInnerHTML={{ __html: sanitizeBookHtml(content) }}
          />
        </div>
        {selectedImage && (
          <div
            className="pointer-events-none absolute z-30 border border-blue-500"
            style={{
              left: selectedImage.left,
              top: selectedImage.top,
              width: selectedImage.width,
              height: selectedImage.height,
            }}
          >
            {resizeHandles.map(([name, directionX, directionY, position]) => (
              <button
                key={name}
                type="button"
                aria-label={isArabic ? `تغيير حجم الصورة ${name}` : `Resize image ${name}`}
                className={`pointer-events-auto absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-700 bg-white touch-none ${position}`}
                onPointerDown={(event) => startResize(event, directionX, directionY)}
              />
            ))}
          </div>
        )}
        {!hasContent && (
          <p className="pointer-events-none absolute inset-0 grid place-items-center px-8 text-center text-xs text-[#8a8172]">
            {isArabic ? 'سيظهر هنا محتوى الصفحة أثناء الكتابة' : 'Page content appears here as you write'}
          </p>
        )}
        <span className="pointer-events-none absolute bottom-3 start-4 z-20 text-[9px] text-[#806451]">
          {isArabic ? 'اختر الصورة واسحب إحدى النقاط الثماني لتغيير حجمها' : 'Select an image and drag one of its eight handles to resize it'}
        </span>
      </div>
      {freeWrite && previewPageCount > 1 && (
        <div className="mt-2 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={previewPageIndex === 0}
            onClick={() => onPreviewPageChange(Math.max(0, previewPageIndex - 1))}
            className="rounded border border-[#d6cebd] px-2 py-1 text-xs disabled:opacity-40"
          >
            {isArabic ? 'السابقة' : 'Previous'}
          </button>
          <span className="text-xs text-[#716b60]">{isArabic ? 'صفحات تلقائية للمعاينة' : 'Auto-generated preview pages'}</span>
          <button
            type="button"
            disabled={previewPageIndex >= previewPageCount - 1}
            onClick={() => onPreviewPageChange(Math.min(previewPageCount - 1, previewPageIndex + 1))}
            className="rounded border border-[#d6cebd] px-2 py-1 text-xs disabled:opacity-40"
          >
            {isArabic ? 'التالية' : 'Next'}
          </button>
        </div>
      )}
      <p className="mt-2 text-center text-xs leading-5 text-[#81796b]">
        {uploadingImage
          ? (isArabic ? 'جارٍ رفع صورة الصفحة...' : 'Uploading page image...')
          : (isArabic ? 'تتحدث المعاينة فور الكتابة. اسحب الصورة لتغيير موضعها، واستخدم نقاط التحكم الثماني لتغيير حجمها.' : 'Live preview. Drag images to reposition; use the eight handles to resize.')}
      </p>
    </aside>
  );
}
