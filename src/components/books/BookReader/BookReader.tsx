'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { ReaderControls } from './ReaderControls';

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

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function BookReader({ locale = 'ar' }: { locale?: string }) {
  const isArabic = locale === 'ar';
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragState, setDragState] = useState({
    active: false,
    startX: 0,
    direction: 1 as 1 | -1,
    progress: 0,
  });

  const totalPages = DEMO_PAGES.length;
  const currentPage = DEMO_PAGES[currentIndex];
  const nextPage = DEMO_PAGES[currentIndex + 1] ?? DEMO_PAGES[currentIndex];
  const previousPage = DEMO_PAGES[currentIndex - 1] ?? DEMO_PAGES[currentIndex];

  const pagePairs = useMemo(
    () =>
      Array.from({ length: totalPages }, (_, index) => ({
        left: DEMO_PAGES[index],
        right: DEMO_PAGES[index + 1] ?? DEMO_PAGES[index],
      })),
    [totalPages],
  );

  const turnPage = useCallback(
    (direction: 1 | -1) => {
      setCurrentIndex((previous) => clamp(previous + direction, 0, totalPages - 1));
    },
    [totalPages],
  );

  const beginDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const localX = event.clientX - rect.left;
    const nearRight = localX > rect.width * 0.72;
    const nearLeft = localX < rect.width * 0.28;
    const direction = nearRight ? 1 : nearLeft ? -1 : 0;

    if (direction === 0) return;
    if ((direction === 1 && currentIndex >= totalPages - 1) || (direction === -1 && currentIndex <= 0)) return;

    setDragState({ active: true, startX: event.clientX, direction, progress: 0 });
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const updateDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.active) return;

    const delta = event.clientX - dragState.startX;
    const travel = Math.abs(delta);
    const progress = clamp(travel / 430, 0, 1);

    setDragState((previous) => ({ ...previous, progress }));
  };

  const endDrag = () => {
    if (!dragState.active) return;

    const shouldTurn = dragState.progress > 0.42;
    if (shouldTurn) turnPage(dragState.direction);

    setDragState({ active: false, startX: 0, direction: dragState.direction, progress: 0 });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'PageDown') turnPage(1);
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') turnPage(-1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [turnPage]);

  const turningPage = dragState.active ? (dragState.direction === 1 ? nextPage : previousPage) : currentPage;
  const leftPage = dragState.active ? (dragState.direction === 1 ? currentPage : previousPage) : currentPage;
  const rightPage = dragState.active ? (dragState.direction === 1 ? nextPage : currentPage) : nextPage;

  const flipRotation = dragState.active ? dragState.progress * 170 : 0;
  const flipTranslate = dragState.active ? dragState.progress * 18 : 0;
  const overlayTransform = dragState.active
    ? dragState.direction === 1
      ? `translateX(${flipTranslate}px) rotateY(${-flipRotation}deg)`
      : `translateX(${-flipTranslate}px) rotateY(${flipRotation}deg)`
    : 'translateX(0px) rotateY(0deg)';

  const overlayTransformOrigin = dragState.active && dragState.direction === 1 ? 'left center' : 'right center';

  return (
    <main className="min-h-screen bg-[#14181d] px-4 py-6 text-[#f5ebd7] sm:px-6 lg:px-8" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#d2b57e] opacity-80 sm:text-xs">
            {isArabic ? 'قراءة مميزة' : 'Premium reader'}
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-[#f7f0e1] sm:text-4xl">
            {isArabic ? 'قراءة صفحة الكتاب' : 'Turn the pages of the book'}
          </h1>
        </div>

        <div className="mx-auto max-w-[1180px] rounded-[28px] border border-white/10 bg-[#1a1d24]/90 p-4 shadow-[0_30px_60px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4 text-xs text-[#e9d9b8]">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d3ab62]/60 bg-[#2b2118] text-sm text-[#f4d79a]">
                {isArabic ? 'ب' : 'B'}
              </span>
              <span className="font-medium">{isArabic ? 'نِبلان' : 'NIBLAN'}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => turnPage(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-[#f8e8c7] transition hover:border-[#d6b26b]/60 hover:bg-[#d6b26b]/10 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={isArabic ? 'الصفحة السابقة' : 'Previous page'}
                disabled={currentIndex === 0}
              >
                {isArabic ? '›' : '‹'}
              </button>
              <button
                type="button"
                onClick={() => turnPage(1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-[#f8e8c7] transition hover:border-[#d6b26b]/60 hover:bg-[#d6b26b]/10 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={isArabic ? 'الصفحة التالية' : 'Next page'}
                disabled={currentIndex >= totalPages - 1}
              >
                {isArabic ? '‹' : '›'}
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center overflow-hidden rounded-[18px] bg-[#151a1f] px-2 pb-3 pt-2 sm:px-4">
            <div
              ref={containerRef}
              className="book-reader-surface relative h-[540px] w-full max-w-[1100px] cursor-grab select-none touch-pan-y active:cursor-grabbing"
              onPointerDown={beginDrag}
              onPointerMove={updateDrag}
              onPointerUp={endDrag}
              onPointerLeave={endDrag}
              aria-label={isArabic ? 'منطقة قراءة الكتاب' : 'Book reading area'}
            >
              <div className="book-surface absolute inset-0 rounded-[20px] bg-[radial-gradient(circle_at_top,_rgba(249,200,122,0.18),transparent_55%),linear-gradient(135deg,#161b21_0%,#0f1419_100%)]" />

              <div className="book-container absolute inset-x-[4%] inset-y-[3%]">
                <div className="book-frame absolute inset-0 rounded-[18px] border border-[#7a5a2d]/40 bg-[#291c10] shadow-[inset_0_0_30px_rgba(0,0,0,0.38),0_28px_70px_rgba(0,0,0,0.45)]" />
                <div className="book-spine absolute left-1/2 top-2 h-[calc(100%-1rem)] w-[18px] -translate-x-1/2 rounded-full bg-[linear-gradient(90deg,#25201d_0%,#7a5a24_18%,#e2c88f_50%,#7a5a24_82%,#1a1714_100%)] shadow-[0_0_20px_rgba(0,0,0,0.28)]" />
                <div className="book-shade absolute inset-0 rounded-[18px] shadow-[inset_0_0_30px_rgba(0,0,0,0.2)]" />

                <div className="page-stack absolute inset-[2%_7%_4%_7%] rounded-[10px]">
                  <article
                    className="book-page absolute inset-y-0 left-[2%] w-[47%] overflow-hidden rounded-[10px] border border-[#926e3d]/40 bg-[#f3ead3] shadow-[0_12px_20px_rgba(0,0,0,0.2),inset_0_0_0_1px_rgba(54,29,8,0.08)]"
                    style={{ opacity: 1, pointerEvents: 'auto' }}
                  >
                    <div className="page-texture absolute inset-0 opacity-90" />
                    <div className="relative z-10 flex h-full flex-col p-5 sm:p-7">
                      <div className="mb-2 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.22em] text-[#5d4631]">
                        <span>{leftPage.label}</span>
                        <span>{leftPage.pageNumber}</span>
                      </div>
                      <div className="mb-3 border-b border-[#8c6f46]/30 pb-2 text-right text-[12px] font-semibold text-[#4c3728]">
                        {leftPage.chapter}
                      </div>
                      <h2 className="mb-4 text-right text-[26px] font-semibold leading-tight text-[#2a1f17]">
                        {leftPage.title}
                      </h2>
                      <div className="flex-1 space-y-4 text-right text-[13px] leading-7 text-[#2d231c]">
                        {leftPage.paragraphs.map((paragraph) => (
                          <p key={`${leftPage.id}-${paragraph.slice(0, 10)}`} className="text-pretty">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[10px] tracking-[0.16em] text-[#5a4031]">
                        <span>{isArabic ? 'نِبلان' : 'NIBLAN'}</span>
                        <span>{leftPage.pageNumber}</span>
                      </div>
                    </div>
                  </article>

                  <article
                    className="book-page absolute inset-y-0 right-[2%] w-[47%] overflow-hidden rounded-[10px] border border-[#8f6d40]/40 bg-[#f5ead3] shadow-[0_12px_20px_rgba(0,0,0,0.22),inset_0_0_0_1px_rgba(54,29,8,0.08)]"
                    style={{ opacity: 1, pointerEvents: 'auto' }}
                  >
                    <div className="page-texture absolute inset-0 opacity-90" />
                    <div className="relative z-10 flex h-full flex-col p-5 sm:p-7">
                      <div className="mb-2 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.22em] text-[#5d4631]">
                        <span>{rightPage.label}</span>
                        <span>{rightPage.pageNumber}</span>
                      </div>
                      <div className="mb-3 border-b border-[#8c6f46]/30 pb-2 text-right text-[12px] font-semibold text-[#4c3728]">
                        {rightPage.chapter}
                      </div>
                      <h2 className="mb-4 text-right text-[26px] font-semibold leading-tight text-[#2a1f17]">
                        {rightPage.title}
                      </h2>
                      <div className="flex-1 space-y-4 text-right text-[13px] leading-7 text-[#2d231c]">
                        {rightPage.paragraphs.map((paragraph) => (
                          <p key={`${rightPage.id}-${paragraph.slice(0, 10)}`} className="text-pretty">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[10px] tracking-[0.16em] text-[#5a4031]">
                        <span>{isArabic ? 'نِبلان' : 'NIBLAN'}</span>
                        <span>{rightPage.pageNumber}</span>
                      </div>
                    </div>
                  </article>

                  {dragState.active && (
                    <article
                      className="page-turning absolute inset-y-[1.25%] right-[2%] w-[47%] overflow-hidden rounded-[10px] border border-[#8d6d3d]/40 bg-[#f5ead4] shadow-[0_20px_35px_rgba(0,0,0,0.35)]"
                      style={{
                        transform: overlayTransform,
                        transformOrigin: overlayTransformOrigin,
                        opacity: 0.98,
                        boxShadow: '0 18px 30px rgba(0,0,0,0.32)',
                        zIndex: 30,
                      }}
                    >
                      <div className="page-texture absolute inset-0 opacity-95" />
                      <div className="absolute inset-y-0 left-0 w-5 bg-[linear-gradient(90deg,rgba(75,46,16,0.12),rgba(75,46,16,0.0))]" />
                      <div className="relative z-10 flex h-full flex-col p-5 sm:p-7">
                        <div className="mb-2 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.22em] text-[#5d4631]">
                          <span>{turningPage.label}</span>
                          <span>{turningPage.pageNumber}</span>
                        </div>
                        <div className="mb-3 border-b border-[#8c6f46]/30 pb-2 text-right text-[12px] font-semibold text-[#4c3728]">
                          {turningPage.chapter}
                        </div>
                        <h2 className="mb-4 text-right text-[26px] font-semibold leading-tight text-[#2a1f17]">
                          {turningPage.title}
                        </h2>
                        <div className="flex-1 space-y-4 text-right text-[13px] leading-7 text-[#2d231c]">
                          {turningPage.paragraphs.map((paragraph) => (
                            <p key={`${turningPage.id}-${paragraph.slice(0, 10)}`} className="text-pretty">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between text-[10px] tracking-[0.16em] text-[#5a4031]">
                          <span>{isArabic ? 'نِبلان' : 'NIBLAN'}</span>
                          <span>{turningPage.pageNumber}</span>
                        </div>
                      </div>
                    </article>
                  )}
                </div>
              </div>
            </div>
          </div>

          <ReaderControls currentIndex={currentIndex} totalPages={totalPages} onPrevious={() => turnPage(-1)} onNext={() => turnPage(1)} locale={locale} />

          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pagePairs.map((pair, index) => {
              const isSelected = index === currentIndex;
              return (
                <button
                  key={`${pair.left.id}-${pair.right.id}`}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={`group w-full rounded-[16px] border p-3 text-right shadow-[0_16px_30px_rgba(0,0,0,0.15)] transition ${
                    isSelected ? 'border-[#d8b871] bg-[#1f2329]' : 'border-white/10 bg-[#171b20] hover:border-[#d4b06a]/40 hover:bg-[#1a1f28]'
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-[#d9c39a]">
                    <span>{index + 1}</span>
                    <span>{isArabic ? 'الصفحة' : 'Page'}</span>
                  </div>
                  <div className="relative mx-auto h-[120px] max-w-[290px] overflow-hidden rounded-[10px] border border-[#806841]/40 bg-[#f0e3b9] shadow-inner shadow-[#774d1c]/10">
                    <div className="absolute inset-y-0 left-1/2 w-[14px] -translate-x-1/2 bg-[linear-gradient(90deg,#251d19,#825d2d,#e7cf9f,#825d2d,#1f1d1b)] shadow-[0_0_12px_rgba(0,0,0,0.18)]" />
                    <div className="absolute inset-y-2 left-[7%] w-[39%] rounded-[8px] bg-[#f3e9cf] ring-1 ring-black/5">
                      <div className="flex h-full flex-col justify-between p-3 text-[8px] text-[#31281d]">
                        <div className="flex items-center justify-between font-medium uppercase">
                          <span>{pair.left.label}</span>
                          <span>{pair.left.pageNumber}</span>
                        </div>
                        <div className="text-right text-[11px] font-semibold">{pair.left.title}</div>
                      </div>
                    </div>
                    <div className="absolute inset-y-2 right-[7%] w-[39%] rounded-[8px] bg-[#f8f0dc] ring-1 ring-black/5">
                      <div className="flex h-full flex-col justify-between p-3 text-[8px] text-[#31281d]">
                        <div className="flex items-center justify-between font-medium uppercase">
                          <span>{pair.right.label}</span>
                          <span>{pair.right.pageNumber}</span>
                        </div>
                        <div className="text-right text-[11px] font-semibold">{pair.right.title}</div>
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
