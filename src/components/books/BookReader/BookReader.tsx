'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ReaderControls } from './ReaderControls';
import { Bookmark } from 'lucide-react';

type DemoPage = {
  id: string;
  label: string;
  chapter: string;
  title: string;
  paragraphs: string[];
  pageNumber: number;
};

const DEMO_PAGES: DemoPage[] = [
  {
    id: 'p1',
    label: 'الفصل الأول',
    chapter: 'الفصل الأول',
    title: 'أبواب النور',
    pageNumber: 1,
    paragraphs: [
      'بدأت رحلتي في مفاهيم القراءة الحديثة حين اكتشفت أن الفهم الحقيقي لا يبدأ من الحفظ، بل من التوقف عند الجملة التي تفتح بابًا جديدًا.',
      'كانت المرة الأولى التي لاحظت فيها أن الكلمات لا تُقرأ فقط؛ بل تُصاغ في العقل كمناظر، وأصوات، وأفكار تتفاعل مع كل لحظة من الوعي.',
      'هذا الكتاب يدعو إلى قراءة بطيئة، متأنية، مفعمة بالاهتمام، حيث تتجسد الأفكار في صورة ملموسة ومباشرة.',
    ],
  },
  {
    id: 'p2',
    label: 'الفصل الثاني',
    chapter: 'الفصل الثاني',
    title: 'صوت الصفحة',
    pageNumber: 2,
    paragraphs: [
      'عند الولوج إلى صفحة جديدة، يفتح العقل نافذة جديدة؛ نافذة على تفاصيل كانت غامضة في المرة السابقة، وتتحول إلى أبعاد أكثر وضوحًا.',
      'والقراءة الحقيقية لا تعني السرعة، بل تعني التوازن بين الحركة الداخلية والسكينة، بين الاستمرار والانتباه إلى الارتعاش الدقيق داخل النص.',
      'إن كل صفحة تحمل في جوهرها مزيجًا من الهدوء والاندفاع، ومن هنا تكتسب التجربة طابعها الكينوني والإنساني في آنٍ واحد.',
    ],
  },
  {
    id: 'p3',
    label: 'الفصل الثالث',
    chapter: 'الفصل الثالث',
    title: 'الأثر في النفس',
    pageNumber: 3,
    paragraphs: [
      'حين تنتهي جملة من الجمل، لا ينتهي أثرها في الذاكرة فحسب، بل يظل يتردد في داخلك كحفيف أمل أو صورة باقية لا تبرح المكان.',
      'وهذا ما يجعل القراءة تجربة ناعمة لكنها عميقة، لا ترتبط فقط بالمعلومة، بل بالتحول الذي تتركه في الوجدان والخيال.',
      'فكل كتاب يفتح بابًا من الحكمة ويترك فيه أثرًا لا يكفي وصفه بل يحتاج إلى إعادة القراءة من جديد.',
    ],
  },
  {
    id: 'p4',
    label: 'الفصل الرابع',
    chapter: 'الفصل الرابع',
    title: 'مسار العصف الذهني',
    pageNumber: 4,
    paragraphs: [
      'الكتاب يمنح القارئ مساحة للتفكير، لا مساحة للتسريع؛ مساحة تُجبره على التوقف في اللحظة المناسبة، لأن التفسير الجيد يأتي غالبًا بعد لحظة صمت.',
      'ويتحول هذا النوع من القراءة إلى مرآة تحمل في داخلها الأسئلة نفسها التي كانت خافتة في بداية الطريق.',
      'وهكذا تتسع الرؤية وتتجلى الدقائق، وتصبح الجملة الواحدة بمثابة نقطة انطلاق نحو فهم أوسع.',
    ],
  },
  {
    id: 'p5',
    label: 'الفصل الخامس',
    chapter: 'الفصل الخامس',
    title: 'الهواء بين الكلمات',
    pageNumber: 5,
    paragraphs: [
      'تتخلل الكلمات فراغات صغيرة تنشط الذاكرة وتمنح المعنى حركته. لا يكتمل النص إلا بوجود مساحة بين السطر والسطر، والتوقف بين الفكرة والفكرة.',
      'وهذه المساحات هي ما يجعل القراءة مشهدًا حيًا، لا مجرد تسلسل من المفردات أو العبارات.',
      'إن العوالم الداخلية لا تُبنى من كلمات فقط؛ بل تُبنى من الهدوء الذي يرافق كل كلمة وموقعها في النص.',
    ],
  },
  {
    id: 'p6',
    label: 'الفصل السادس',
    chapter: 'الفصل السادس',
    title: 'نقطة الالتقاء',
    pageNumber: 6,
    paragraphs: [
      'هنا تلتقي الذكريات بالتفاصيل، وتُصاغ رؤيا جديدة لا تشبه ما قبلها، لكنها تستقي من نفس الطاقة التي كانت تحركها في البداية.',
      'هذه اللحظة هي ما يطمح إليه القارئ: أن يشهد أثر الفكرة على نفسه، وأن يرى كيف تتغير الزوايا من جديد بمجرد أن تفتح صفحة أخرى.',
      'فالحكمة تُعَبّر، لا تُقْرَأ فقط، لأن القراءة الحقيقية هي اللقاء المتجدد بين النص والقلب.',
    ],
  },
  {
    id: 'p7',
    label: 'الفصل السابع',
    chapter: 'الفصل السابع',
    title: 'سورة المتابعة',
    pageNumber: 7,
    paragraphs: [
      'كل قراءة تتطلب متابعة، والاهتمام الحقيقي لا يقف عند أول سطر، بل يواصل التحرك داخل الصفحة حتى يلتقط المعنى من أضلاعه المتعددة.',
      'صفحة بعد صفحة، يتوسع العالم الداخلي، وتزدهر الصور، وكأن النص يفتح معاً مرآة أخرى لكيفية رؤية الحياة.',
      'وهكذا يظل القارئ في حالة اتصال مستمر، لا ينقطع إلا عندما تُغلق الصفحة ويبدأ شغف التجديد من جديد.',
    ],
  },
  {
    id: 'p8',
    label: 'الفصل الثامن',
    chapter: 'الفصل الثامن',
    title: 'المعنى المتحرك',
    pageNumber: 8,
    paragraphs: [
      'الكتاب لا يقدّم جوابًا واحدًا، بل يعرض طبقات من الفهم تتحدّث بلغة واحدة هي اللغة المعيارية للحياة نفسها.',
      'يستطيع القارئ أن يعود إلى النص مرات كثيرة، في كل مرة يجد أن شيئًا جديدًا قد ظهر من ورائه، كأن المعنى لا يكتمل إلا بمرور الزمن.',
      'وهذه هي القوة الحقيقية للقراءة: أن تترك فيك إمكانية التوسع، لا مجرد انطباع سريع يختفي في اليوم التالي.',
    ],
  },
  {
    id: 'p9',
    label: 'الفصل التاسع',
    chapter: 'الفصل التاسع',
    title: 'الذهاب إلى النهاية',
    pageNumber: 9,
    paragraphs: [
      'وفي نهاية المسار، لا تحسم القراءة بمفردها؛ بل تُسهم في بناء داخل جديد، يفتح للمتلقي بابًا من الحكمة والخبرة.',
      'فالكتاب لا ينتهي عند آخر صفحة، بل يبدأ في الداخل؛ حين تتذكر المعنى، وتتبعه في حياتك، وتعيد تصميم الفكر تجاه ما كان غامضًا من قبل.',
      'وهكذا تكتمل الرحلة، لا بوصول إلى نهاية، بل بفتح طريق جديد للقراءة والعودة مجددًا.',
    ],
  },
];

/* =========================
   Book Page
========================= */

const BookPage = React.forwardRef<
  HTMLDivElement,
  {
    page: DemoPage;
    isArabic: boolean;
    isZooming: boolean;
  }
>(({ page, isArabic, isZooming }, ref) => {
  return (
    <article
      ref={ref}
      className="book-page relative h-full w-full overflow-hidden rounded-[10px] border border-[#926e3d]/40 bg-[#f3ead3] shadow-[0_12px_20px_rgba(0,0,0,0.2),inset_0_0_0_1px_rgba(54,29,8,0.08)] select-none"
    >
      <div className="page-texture pointer-events-none absolute inset-0 opacity-90" />

      <div
        className={`relative z-10 flex h-full w-full flex-col p-5 transition-transform duration-300 ease-out sm:p-7 ${
          isZooming
            ? isArabic
              ? 'scale-[1.1] origin-right'
              : 'scale-[1.1] origin-left'
            : 'scale-100'
        }`}
      >
        <div className="mb-2 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.22em] text-[#5d4631]">
          <span>{page.label}</span>
          <span>{page.pageNumber}</span>
        </div>

        <div className="mb-3 border-b border-[#8c6f46]/30 pb-2 text-right text-[12px] font-semibold text-[#4c3728]">
          {page.chapter}
        </div>

        <h2 className="mb-4 text-right text-[26px] font-semibold leading-tight text-[#2a1f17]">
          {page.title}
        </h2>

        <div className="flex-1 space-y-4 text-right text-[13px] leading-7 text-[#2d231c]">
          {page.paragraphs.map((paragraph) => (
            <p
              key={`${page.id}-${paragraph.slice(0, 10)}`}
              className="text-pretty"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] tracking-[0.16em] text-[#5a4031]">
          <span>{isArabic ? 'نِبلان' : 'NIBLAN'}</span>
          <span>{page.pageNumber}</span>
        </div>
      </div>
    </article>
  );
});

BookPage.displayName = 'BookPage';

/* =========================
   Book Reader
========================= */

export function BookReader({ locale = 'ar' }: { locale?: string }) {
  const isArabic = locale === 'ar';

  const bookRef = useRef<any>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [savedPage, setSavedPage] = useState<number | null>(null);
  const [zoomingPage, setZoomingPage] = useState<number | null>(null);

  const pages = useMemo(
    () => (isArabic ? [...DEMO_PAGES].reverse() : DEMO_PAGES),
    [isArabic]
  );

  const totalPages = pages.length;

  const pagePairs = useMemo(
    () =>
      Array.from({ length: Math.ceil(totalPages / 2) }, (_, index) => {
        const leftIdx = index * 2;
        const rightIdx = leftIdx + 1;

        return {
          left: pages[leftIdx],
          right: pages[rightIdx] ?? pages[leftIdx],
          pairIndex: index,
        };
      }),
    [pages, totalPages]
  );

  /* =========================
     Navigation
  ========================= */

  const handleFlipNext = () => {
    if (bookRef.current) {
      isArabic
        ? bookRef.current.pageFlip().flipPrev()
        : bookRef.current.pageFlip().flipNext();
    }
  };

  const handleFlipPrev = () => {
    if (bookRef.current) {
      isArabic
        ? bookRef.current.pageFlip().flipNext()
        : bookRef.current.pageFlip().flipPrev();
    }
  };

  /* =========================
     Fullscreen
  ========================= */

  const handleFullscreen = async () => {
    if (!fullscreenRef.current) return;

    if (!document.fullscreenElement) {
      await fullscreenRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener(
      'fullscreenchange',
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        'fullscreenchange',
        handleFullscreenChange
      );
    };
  }, []);

  /* =========================
     Saved Page
  ========================= */

  useEffect(() => {
    const saved = localStorage.getItem('book-saved-page');

    if (saved !== null) {
      setSavedPage(Number(saved));
    }
  }, []);

  const handleSavePage = () => {
    if (savedPage === currentIndex) {
      localStorage.removeItem('book-saved-page');
      setSavedPage(null);
    } else {
      localStorage.setItem(
        'book-saved-page',
        String(currentIndex)
      );
      setSavedPage(currentIndex);
    }
  };

  /* =========================
     Progress
  ========================= */

  const currentPageNumber =
    pages[currentIndex]?.pageNumber ?? 1;

  const progress = Math.round(
    (currentPageNumber / totalPages) * 100
  );

  /* =========================
     Select Page Pair
  ========================= */

  const handleSelectPagePair = (pairIndex: number) => {
    if (bookRef.current) {
      const targetPage = pairIndex * 2;

      bookRef.current.pageFlip().turnToPage(targetPage);
    }
  };

  /* =========================
     Flip + Temporary Zoom
  ========================= */

  const onFlip = useCallback(
    (e: { data: number }) => {
      setCurrentIndex(e.data);

      /*
        Arabic:
        الصفحة الجديدة المطلوبة تكون على اليمين.

        English:
        الصفحة الجديدة المطلوبة تكون على الشمال.
      */
      const targetPageIndex = isArabic
        ? e.data
        : e.data + 1;

      setZoomingPage(targetPageIndex);

      const timer = setTimeout(() => {
        setZoomingPage(null);
      }, 400);

      return () => clearTimeout(timer);
    },
    [isArabic]
  );

  return (
    <main
      className="min-h-screen bg-[#14181d] px-4 py-6 text-[#f5ebd7] sm:px-6 lg:px-8"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#d2b57e] opacity-80 sm:text-xs">
            {isArabic ? 'قراءة مميزة' : 'Premium reader'}
          </p>

          <h1 className="mt-3 text-2xl font-semibold text-[#f7f0e1] sm:text-4xl">
            {isArabic
              ? 'قراءة صفحة الكتاب'
              : 'Turn the pages of the book'}
          </h1>
        </div>

        <div className="mx-auto max-w-[1180px] rounded-[28px] border border-white/10 bg-[#1a1d24]/90 p-4 shadow-[0_30px_60px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4 text-xs text-[#e9d9b8]">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d3ab62]/60 bg-[#2b2118] text-sm text-[#f4d79a]">
                {isArabic ? 'ب' : 'B'}
              </span>

              <span className="font-medium">
                {isArabic ? 'نِبلان' : 'NIBLAN'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleFlipPrev}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-[#f8e8c7] transition hover:border-[#d6b26b]/60 hover:bg-[#d6b26b]/10 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={
                  isArabic
                    ? 'الصفحة السابقة'
                    : 'Previous page'
                }
                disabled={currentIndex === 0}
              >
                {isArabic ? '›' : '‹'}
              </button>

              <button
                type="button"
                onClick={handleFlipNext}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-[#f8e8c7] transition hover:border-[#d6b26b]/60 hover:bg-[#d6b26b]/10 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={
                  isArabic
                    ? 'الصفحة التالية'
                    : 'Next page'
                }
                disabled={currentIndex >= totalPages - 1}
              >
                {isArabic ? '‹' : '›'}
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center overflow-hidden rounded-[18px] bg-[#151a1f] px-2 pb-3 pt-2 sm:px-4">
            <div
              ref={fullscreenRef}
              className={`book-reader-surface relative flex h-[540px] w-full max-w-[1100px] items-center justify-center ${
                isFullscreen ? 'bg-[#14181d]' : ''
              }`}
            >
              <div className="book-surface absolute inset-0 rounded-[20px] bg-[radial-gradient(circle_at_top,_rgba(249,200,122,0.18),transparent_55%),linear-gradient(135deg,#161b21_0%,#0f1419_100%)]" />

              <div className="book-container absolute inset-x-[4%] inset-y-[3%]">
                <div className="book-frame absolute inset-0 rounded-[18px] border border-[#7a5a2d]/40 bg-[#291c10] shadow-[inset_0_0_30px_rgba(0,0,0,0.38),0_28px_70px_rgba(0,0,0,0.45)]" />

                <div className="book-shade pointer-events-none absolute inset-0 z-10 rounded-[18px] shadow-[inset_0_0_30px_rgba(0,0,0,0.2)]" />

                <div className="page-stack absolute inset-[2%_7%_4%_7%] flex items-center justify-center rounded-[10px]">
                  {/* @ts-ignore */}
                  <HTMLFlipBook
                    width={460}
                    height={500}
                    size="stretch"
                    minWidth={300}
                    maxWidth={500}
                    minHeight={400}
                    maxHeight={600}
                    maxShadowOpacity={0.5}
                    showCover={false}
                    mobileScrollSupport={true}
                    onFlip={onFlip}
                    ref={bookRef}
                    className="demo-book"
                    usePortrait={true}
                    startPage={0}
                    drawShadow={true}
                    flippingTime={800}
                  >
                    {pages.map((page, index) => (
                      <BookPage
                        key={page.id}
                        page={page}
                        isArabic={isArabic}
                        isZooming={index === zoomingPage}
                      />
                    ))}
                  </HTMLFlipBook>
                </div>
              </div>

              <div className="absolute bottom-2 left-1/2 z-30 flex -translate-x-1/2 gap-2">
                <button
                  type="button"
                  onClick={handleSavePage}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-sm transition ${
                    savedPage === currentIndex
                      ? 'border-[#d6b26b] bg-[#d6b26b]/20 text-[#f4d79a]'
                      : 'border-white/10 bg-black/40 text-white hover:bg-black/60'
                  }`}
                  aria-label={
                    isArabic
                      ? 'حفظ الصفحة'
                      : 'Save page'
                  }
                >
                  <Bookmark
                    size={18}
                    fill={
                      savedPage === currentIndex
                        ? 'currentColor'
                        : 'none'
                    }
                  />
                </button>

                <button
                  type="button"
                  onClick={handleFullscreen}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-lg text-white backdrop-blur-sm transition hover:bg-black/60"
                  aria-label={
                    isFullscreen
                      ? 'Exit fullscreen'
                      : 'Fullscreen'
                  }
                >
                  ⛶
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="relative">
              <ReaderControls
                currentIndex={currentIndex}
                totalPages={totalPages}
                onPrevious={handleFlipPrev}
                onNext={handleFlipNext}
                locale={locale}
              />
            </div>

            <div className="mt-3 px-4">
              <div className="mb-2 flex items-center justify-between text-xs text-[#e9d9b8]">
                <span>
                  {isArabic
                    ? 'تقدم القراءة'
                    : 'Reading progress'}
                </span>

                <span>{progress}%</span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#d6b26b] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pagePairs.map((pair) => {
              const activePairIndex =
                Math.floor(currentIndex / 2);

              const isSelected =
                pair.pairIndex === activePairIndex;

              return (
                <button
                  key={`${pair.left.id}-${pair.right.id}`}
                  type="button"
                  onClick={() =>
                    handleSelectPagePair(pair.pairIndex)
                  }
                  className={`group w-full rounded-[16px] border p-3 text-right shadow-[0_16px_30px_rgba(0,0,0,0.15)] transition ${
                    isSelected
                      ? 'border-[#d8b871] bg-[#1f2329]'
                      : 'border-white/10 bg-[#171b20] hover:border-[#d4b06a]/40 hover:bg-[#1a1f28]'
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-[#d9c39a]">
                    <span>{pair.pairIndex + 1}</span>

                    <span>
                      {isArabic ? 'الصفحة' : 'Page'}
                    </span>
                  </div>

                  <div className="relative mx-auto h-[120px] max-w-[290px] overflow-hidden rounded-[10px] border border-[#806841]/40 bg-[#f0e3b9] shadow-inner shadow-[#774d1c]/10">
                    <div className="absolute inset-y-0 left-1/2 z-10 w-[14px] -translate-x-1/2 bg-[linear-gradient(90deg,#251d19,#825d2d,#e7cf9f,#825d2d,#1f1d1b)] shadow-[0_0_12px_rgba(0,0,0,0.18)]" />

                    <div className="absolute inset-y-2 left-[7%] w-[39%] rounded-[8px] bg-[#f3e9cf] ring-1 ring-black/5">
                      <div className="flex h-full flex-col justify-between p-3 text-[8px] text-[#31281d]">
                        <div className="flex items-center justify-between font-medium uppercase">
                          <span>{pair.left.label}</span>

                          <span>
                            {pair.left.pageNumber}
                          </span>
                        </div>

                        <div className="text-right text-[11px] font-semibold">
                          {pair.left.title}
                        </div>
                      </div>
                    </div>

                    <div className="absolute inset-y-2 right-[7%] w-[39%] rounded-[8px] bg-[#f8f0dc] ring-1 ring-black/5">
                      <div className="flex h-full flex-col justify-between p-3 text-[8px] text-[#31281d]">
                        <div className="flex items-center justify-between font-medium uppercase">
                          <span>{pair.right.label}</span>

                          <span>
                            {pair.right.pageNumber}
                          </span>
                        </div>

                        <div className="text-right text-[11px] font-semibold">
                          {pair.right.title}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

export default BookReader;