'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
      'كانت المرة الأولى التي لاحظت فيها أن الكلمات لا تُقرأ فقط؛ بل تُصاغ في العقل كمناظر وأصوات وأفكار تتفاعل مع كل لحظة من الوعي.',
      'هذا الكتاب يدعو إلى قراءة بطيئة، متأنية، مفعمة بالاهتمام، حيث تتجسد الأفكار في صورة ملموسة ومباشرة.',
    ],
  },
  {
    id: 'p2',
    label: 'الفصل الأول',
    chapter: 'الفصل الأول',
    title: 'البداية الأولى',
    pageNumber: 2,
    paragraphs: [
      'كل رحلة تبدأ بخطوة صغيرة، وقد تكون هذه الخطوة مجرد فتح كتاب لم نكن نعرف أننا سنجد أنفسنا فيه.',
      'في البداية تبدو الصفحات متشابهة، ثم تبدأ الكلمات في تكوين روابط خفية تجعل القارئ أكثر قربًا من الفكرة.',
      'ومع استمرار القراءة تتحول اللحظة الأولى إلى بداية لمسار طويل من الاكتشاف والتأمل.',
    ],
  },
  {
    id: 'p3',
    label: 'الفصل الأول',
    chapter: 'الفصل الأول',
    title: 'لغة مختلفة',
    pageNumber: 3,
    paragraphs: [
      'للكتاب لغة لا تعتمد على الصوت وحده، وإنما تمتد إلى الصور التي يصنعها العقل أثناء القراءة.',
      'قد تحمل الجملة الواحدة أكثر من معنى، ويتغير فهمها كلما تغيرت تجربة القارئ أو اتسعت معرفته.',
      'ولهذا لا توجد قراءة واحدة ثابتة، بل توجد قراءات متعددة تتشكل مع الزمن.',
    ],
  },
  {
    id: 'p4',
    label: 'الفصل الأول',
    chapter: 'الفصل الأول',
    title: 'لحظة الانتباه',
    pageNumber: 4,
    paragraphs: [
      'يحتاج القارئ أحيانًا إلى التوقف عن متابعة السطور حتى يمنح الفكرة فرصة للاستقرار في ذهنه.',
      'لحظة الانتباه قد تكون قصيرة، لكنها قادرة على تغيير طريقة فهم فقرة كاملة.',
      'فالمعرفة لا تأتي دائمًا من كثرة الصفحات، وإنما من مقدار الحضور الذي نمنحه لكل صفحة.',
    ],
  },
  {
    id: 'p5',
    label: 'الفصل الأول',
    chapter: 'الفصل الأول',
    title: 'بين السطور',
    pageNumber: 5,
    paragraphs: [
      'هناك دائمًا شيء بين السطور لا تقوله الكلمات بشكل مباشر، ولكنه يظهر عندما يمنح القارئ النص وقتًا كافيًا.',
      'قد يكون ذلك الشيء سؤالًا أو شعورًا أو ارتباطًا بتجربة قديمة ظلت محفوظة في الذاكرة.',
      'ولهذا تصبح القراءة حوارًا صامتًا بين ما كتبه المؤلف وما يكتشفه القارئ في داخله.',
    ],
  },
  {
    id: 'p6',
    label: 'الفصل الأول',
    chapter: 'الفصل الأول',
    title: 'طريق الفهم',
    pageNumber: 6,
    paragraphs: [
      'الفهم ليس لحظة واحدة نصل إليها ثم ننتهي، بل طريق يتغير كلما أضفنا معلومة جديدة.',
      'قد نقرأ الصفحة اليوم فنفهم منها معنى، ثم نعود إليها بعد فترة فنجد فيها معنى آخر.',
      'وهذا التغير لا يعني أن القراءة الأولى كانت خاطئة، وإنما يعني أن القارئ نفسه قد تغير.',
    ],
  },
  {
    id: 'p7',
    label: 'الفصل الثاني',
    chapter: 'الفصل الثاني',
    title: 'صوت الصفحة',
    pageNumber: 7,
    paragraphs: [
      'عند الولوج إلى صفحة جديدة، يفتح العقل نافذة جديدة على تفاصيل كانت غامضة في المرة السابقة.',
      'والقراءة الحقيقية لا تعني السرعة، بل تعني التوازن بين الحركة الداخلية والسكينة.',
      'إن كل صفحة تحمل في جوهرها مزيجًا من الهدوء والاندفاع، ومن هنا تكتسب التجربة طابعها الإنساني.',
    ],
  },
  {
    id: 'p8',
    label: 'الفصل الثاني',
    chapter: 'الفصل الثاني',
    title: 'إيقاع القراءة',
    pageNumber: 8,
    paragraphs: [
      'لكل قارئ إيقاع خاص به، فهناك صفحات تحتاج إلى سرعة، وصفحات أخرى تطلب التمهل.',
      'عندما نحاول قراءة كل شيء بالسرعة نفسها نفقد الفروق الدقيقة بين الأفكار.',
      'لذلك يصبح ضبط الإيقاع جزءًا من مهارة القراءة نفسها.',
    ],
  },
  {
    id: 'p9',
    label: 'الفصل الثاني',
    chapter: 'الفصل الثاني',
    title: 'هدوء الكلمات',
    pageNumber: 9,
    paragraphs: [
      'بعض الكلمات لا تحتاج إلى شرح طويل، وإنما تحتاج إلى لحظة هدوء حتى يظهر أثرها.',
      'قد تمر جملة بسيطة دون اهتمام، ثم تعود إلى الذاكرة في وقت آخر لتكشف معنى لم ننتبه إليه.',
      'وهنا يظهر الفرق بين قراءة الكلمات وعيش التجربة التي تحملها الكلمات.',
    ],
  },
  {
    id: 'p10',
    label: 'الفصل الثاني',
    chapter: 'الفصل الثاني',
    title: 'نافذة جديدة',
    pageNumber: 10,
    paragraphs: [
      'كل صفحة جديدة تشبه نافذة تطل على مساحة لم نرها من قبل.',
      'وقد تكون النافذة صغيرة، لكنها تكفي لتغيير المشهد كله إذا نظرنا من خلالها باهتمام.',
      'لهذا تستمر القراءة؛ لأن كل صفحة تمنح العقل زاوية مختلفة للنظر.',
    ],
  },
  {
    id: 'p11',
    label: 'الفصل الثاني',
    chapter: 'الفصل الثاني',
    title: 'التفاصيل الصغيرة',
    pageNumber: 11,
    paragraphs: [
      'أحيانًا يكون أهم ما في النص تفصيلًا صغيرًا مررنا عليه دون انتباه.',
      'التفاصيل تمنح الفكرة شكلها الحقيقي، وتربط المعنى العام بالأشياء الدقيقة.',
      'وحين يتعلم القارئ ملاحظة التفاصيل، تصبح الصفحة أكثر ثراءً واتساعًا.',
    ],
  },
  {
    id: 'p12',
    label: 'الفصل الثاني',
    chapter: 'الفصل الثاني',
    title: 'مسافة بيننا وبين النص',
    pageNumber: 12,
    paragraphs: [
      'يحتاج القارئ أحيانًا إلى مسافة صغيرة بينه وبين النص حتى يستطيع رؤيته بوضوح.',
      'القرب الشديد قد يجعلنا نرى التفاصيل فقط ونفقد الصورة العامة.',
      'أما المسافة المتوازنة فتسمح لنا برؤية الفكرة وتفاصيلها في الوقت نفسه.',
    ],
  },
  {
    id: 'p13',
    label: 'الفصل الثالث',
    chapter: 'الفصل الثالث',
    title: 'الأثر في النفس',
    pageNumber: 13,
    paragraphs: [
      'حين تنتهي جملة من الجمل، لا ينتهي أثرها في الذاكرة، بل يظل يتردد في الداخل كصورة باقية.',
      'وهذا ما يجعل القراءة تجربة ناعمة لكنها عميقة، لا ترتبط فقط بالمعلومة.',
      'فكل كتاب يمكن أن يترك أثرًا مختلفًا بحسب اللحظة التي نقرأه فيها.',
    ],
  },
  {
    id: 'p14',
    label: 'الفصل الثالث',
    chapter: 'الفصل الثالث',
    title: 'ما يبقى',
    pageNumber: 14,
    paragraphs: [
      'بعد إغلاق الكتاب قد لا نتذكر كل الكلمات، لكننا غالبًا نتذكر فكرة أو شعورًا أو مشهدًا.',
      'ما يبقى هو الجزء الذي استطاع أن يجد مكانًا له داخل الذاكرة.',
      'ولهذا لا تقاس قيمة القراءة بعدد الصفحات التي تذكرناها، بل بما غيرته في طريقة نظرنا.',
    ],
  },
  {
    id: 'p15',
    label: 'الفصل الثالث',
    chapter: 'الفصل الثالث',
    title: 'الذاكرة والكتاب',
    pageNumber: 15,
    paragraphs: [
      'ترتبط الكتب بالذاكرة بطريقة مختلفة عن ارتباطها بالمعلومات المجردة.',
      'قد نتذكر أين كنا عندما قرأنا فقرة معينة، أو ما الذي كنا نشعر به في تلك اللحظة.',
      'وهكذا يصبح الكتاب جزءًا من قصة القارئ نفسه وليس مجرد مجموعة من الصفحات.',
    ],
  },
  {
    id: 'p16',
    label: 'الفصل الثالث',
    chapter: 'الفصل الثالث',
    title: 'أثر لا يختفي',
    pageNumber: 16,
    paragraphs: [
      'بعض الأفكار تختفي سريعًا، بينما تستمر أفكار أخرى في العودة إلينا دون دعوة.',
      'غالبًا ما تكون هذه الأفكار مرتبطة بسؤال لم نجد له إجابة كاملة.',
      'وربما تكون قيمة السؤال أحيانًا في أنه يدفعنا إلى الاستمرار في البحث.',
    ],
  },
  {
    id: 'p17',
    label: 'الفصل الثالث',
    chapter: 'الفصل الثالث',
    title: 'إعادة القراءة',
    pageNumber: 17,
    paragraphs: [
      'إعادة القراءة ليست تكرارًا بسيطًا لما حدث من قبل، لأن القارئ يدخل النص بخبرة مختلفة.',
      'قد تظهر في المرة الثانية تفاصيل لم نلاحظها في المرة الأولى.',
      'وكل قراءة جديدة تمنح الكتاب فرصة أخرى للكشف عن طبقاته الخفية.',
    ],
  },
  {
    id: 'p18',
    label: 'الفصل الثالث',
    chapter: 'الفصل الثالث',
    title: 'حين تتغير النظرة',
    pageNumber: 18,
    paragraphs: [
      'أحيانًا لا يتغير الكتاب، وإنما تتغير نظرتنا إليه.',
      'ما كان غامضًا بالأمس قد يصبح واضحًا اليوم نتيجة تجربة مررنا بها أو معرفة اكتسبناها.',
      'وهذا يجعل القراءة علاقة مستمرة بين النص والزمن وتجربة الإنسان.',
    ],
  },
  {
    id: 'p19',
    label: 'الفصل الرابع',
    chapter: 'الفصل الرابع',
    title: 'مسار العصف الذهني',
    pageNumber: 19,
    paragraphs: [
      'الكتاب يمنح القارئ مساحة للتفكير، لا مساحة للتسريع.',
      'التفسير الجيد يأتي غالبًا بعد لحظة صمت تسمح للأفكار بأن تتجاور دون استعجال.',
      'ومن هنا يبدأ العقل في بناء روابط جديدة بين المعلومات المختلفة.',
    ],
  },
  {
    id: 'p20',
    label: 'الفصل الرابع',
    chapter: 'الفصل الرابع',
    title: 'السؤال الأول',
    pageNumber: 20,
    paragraphs: [
      'السؤال هو أحد الأبواب الأساسية التي يدخل منها التفكير.',
      'حين نسأل أنفسنا عن معنى فكرة معينة، فإننا لا نبحث عن جواب فقط، بل نعيد ترتيب ما نعرفه.',
      'وقد يقود سؤال واحد إلى سلسلة طويلة من الأسئلة التي توسع مساحة المعرفة.',
    ],
  },
  {
    id: 'p21',
    label: 'الفصل الرابع',
    chapter: 'الفصل الرابع',
    title: 'ربط الأفكار',
    pageNumber: 21,
    paragraphs: [
      'لا تعيش الأفكار منفصلة عن بعضها، وإنما تتصل في العقل مثل خيوط دقيقة.',
      'قراءة كتاب جديد قد تجعلنا نفهم معلومة قديمة بطريقة مختلفة.',
      'وكلما اتسعت شبكة المعرفة أصبح من الأسهل اكتشاف العلاقات بين الموضوعات.',
    ],
  },
  {
    id: 'p22',
    label: 'الفصل الرابع',
    chapter: 'الفصل الرابع',
    title: 'لحظة الصمت',
    pageNumber: 22,
    paragraphs: [
      'الصمت جزء مهم من التفكير، لأنه يمنح العقل مساحة لمعالجة ما قرأه.',
      'قد تبدو لحظة التوقف وكأنها انقطاع عن القراءة، لكنها في الحقيقة استمرار لها بطريقة مختلفة.',
      'ففي الصمت تتشكل أحيانًا أكثر الأفكار وضوحًا.',
    ],
  },
  {
    id: 'p23',
    label: 'الفصل الرابع',
    chapter: 'الفصل الرابع',
    title: 'الفكرة الجديدة',
    pageNumber: 23,
    paragraphs: [
      'تولد الأفكار الجديدة عندما تلتقي معلومات قديمة بطريقة لم تحدث من قبل.',
      'قد تأتي الفكرة فجأة، لكنها غالبًا تكون نتيجة تراكم طويل من القراءة والملاحظة.',
      'ولهذا فإن الاستمرار في التعلم يفتح احتمالات جديدة للتفكير.',
    ],
  },
  {
    id: 'p24',
    label: 'الفصل الرابع',
    chapter: 'الفصل الرابع',
    title: 'اتساع الرؤية',
    pageNumber: 24,
    paragraphs: [
      'كلما قرأنا أكثر، أصبحنا قادرين على رؤية الموضوع من أكثر من زاوية.',
      'لا يعني ذلك أن كل الآراء متساوية، وإنما يعني أن فهم السياق يحتاج إلى النظر في التفاصيل المختلفة.',
      'والرؤية الواسعة تساعد على بناء فهم أكثر هدوءًا وترابطًا.',
    ],
  },
  {
    id: 'p25',
    label: 'الفصل الخامس',
    chapter: 'الفصل الخامس',
    title: 'الهواء بين الكلمات',
    pageNumber: 25,
    paragraphs: [
      'تتخلل الكلمات فراغات صغيرة تنشط الذاكرة وتمنح المعنى حركته.',
      'لا يكتمل النص بامتلاء الصفحة فقط، بل يحتاج إلى مساحة بين السطر والفكرة.',
      'هذه المساحات تجعل القراءة مشهدًا حيًا لا مجرد تسلسل من المفردات.',
    ],
  },
  {
    id: 'p26',
    label: 'الفصل الخامس',
    chapter: 'الفصل الخامس',
    title: 'إيقاع السطر',
    pageNumber: 26,
    paragraphs: [
      'حتى شكل السطر يمكن أن يؤثر في طريقة القراءة.',
      'عندما تكون المسافات واضحة يصبح الانتقال بين الأفكار أكثر سهولة.',
      'ولهذا فإن تصميم الكتاب ليس منفصلًا عن تجربة القارئ، بل يشارك في تشكيلها.',
    ],
  },
  {
    id: 'p27',
    label: 'الفصل الخامس',
    chapter: 'الفصل الخامس',
    title: 'مساحة للتأمل',
    pageNumber: 27,
    paragraphs: [
      'القارئ يحتاج إلى مساحة ذهنية تشبه الصفحة البيضاء.',
      'في هذه المساحة يستطيع أن يعيد ترتيب الأفكار ويضع كل معلومة في مكانها.',
      'التأمل يمنح المعرفة فرصة للتحول من معلومة عابرة إلى فهم مستقر.',
    ],
  },
  {
    id: 'p28',
    label: 'الفصل الخامس',
    chapter: 'الفصل الخامس',
    title: 'بين فكرة وفكرة',
    pageNumber: 28,
    paragraphs: [
      'قد يكون الانتقال بين فكرتين أهم من كل فكرة منفردة.',
      'فالروابط هي التي تجعل النص وحدة متماسكة بدل أن يكون مجموعة من الجمل المتفرقة.',
      'وحين نلاحظ هذه الروابط يصبح فهم بنية الكتاب أسهل وأكثر وضوحًا.',
    ],
  },
  {
    id: 'p29',
    label: 'الفصل الخامس',
    chapter: 'الفصل الخامس',
    title: 'المشهد الداخلي',
    pageNumber: 29,
    paragraphs: [
      'العالم الذي يبنيه القارئ داخل عقله يختلف من شخص إلى آخر.',
      'قد يقرأ شخصان النص نفسه، لكن كل واحد منهما يرى مشهدًا مختلفًا في خياله.',
      'وهذا الاختلاف جزء طبيعي من جمال القراءة وتنوع التجربة الإنسانية.',
    ],
  },
  {
    id: 'p30',
    label: 'الفصل الخامس',
    chapter: 'الفصل الخامس',
    title: 'الهدوء الذي يصنع المعنى',
    pageNumber: 30,
    paragraphs: [
      'لا تحتاج كل فكرة إلى ضجيج حتى تكون مؤثرة.',
      'أحيانًا تكون أكثر الأفكار قوة هي التي تأتي بهدوء وتظل تعمل داخل العقل بعد انتهاء القراءة.',
      'ولهذا يحتاج القارئ إلى وقت لا يفعل فيه شيئًا سوى التفكير فيما قرأ.',
    ],
  },
  {
    id: 'p31',
    label: 'الفصل السادس',
    chapter: 'الفصل السادس',
    title: 'نقطة الالتقاء',
    pageNumber: 31,
    paragraphs: [
      'هنا تلتقي الذكريات بالتفاصيل، وتُصاغ رؤية جديدة تستفيد من كل ما سبق.',
      'هذه اللحظة هي ما يطمح إليه القارئ: أن يشهد أثر الفكرة على نفسه.',
      'فالقراءة الحقيقية هي اللقاء المتجدد بين النص والقارئ.',
    ],
  },
  {
    id: 'p32',
    label: 'الفصل السادس',
    chapter: 'الفصل السادس',
    title: 'الطريق المشترك',
    pageNumber: 32,
    paragraphs: [
      'قد يبدأ الكتاب من فكرة بسيطة ثم يقود القارئ إلى موضوعات لم يكن يتوقع الوصول إليها.',
      'تتشكل الرحلة تدريجيًا، وكل صفحة تضيف جزءًا جديدًا إلى الصورة.',
      'وفي النهاية يكتشف القارئ أن الطريق نفسه كان جزءًا من الغاية.',
    ],
  },
  {
    id: 'p33',
    label: 'الفصل السادس',
    chapter: 'الفصل السادس',
    title: 'تغير الزوايا',
    pageNumber: 33,
    paragraphs: [
      'الفكرة الواحدة يمكن أن تبدو مختلفة عندما ننظر إليها من زاوية جديدة.',
      'الكتاب يمنحنا فرصة لتجربة هذه الزوايا دون الحاجة إلى مغادرة مكاننا.',
      'وهذا أحد الأسباب التي تجعل القراءة وسيلة قوية لتوسيع التجربة الإنسانية.',
    ],
  },
  {
    id: 'p34',
    label: 'الفصل السادس',
    chapter: 'الفصل السادس',
    title: 'المعنى المتجدد',
    pageNumber: 34,
    paragraphs: [
      'لا يبقى المعنى ثابتًا في جميع اللحظات، لأن علاقتنا به تتغير مع تغير خبراتنا.',
      'قد تصبح كلمة عادية ذات أهمية كبيرة بعد تجربة معينة.',
      'ولهذا فإن الزمن يشارك في صناعة المعنى بقدر ما يشارك النص نفسه.',
    ],
  },
  {
    id: 'p35',
    label: 'الفصل السادس',
    chapter: 'الفصل السادس',
    title: 'التجربة الشخصية',
    pageNumber: 35,
    paragraphs: [
      'لا يستطيع القارئ أن يفصل القراءة تمامًا عن حياته اليومية.',
      'كل تجربة سابقة تصبح عدسة ينظر من خلالها إلى الكلمات والأفكار.',
      'وقد يكون هذا التفاعل الشخصي هو ما يمنح الكتاب تأثيره المختلف من إنسان إلى آخر.',
    ],
  },
  {
    id: 'p36',
    label: 'الفصل السادس',
    chapter: 'الفصل السادس',
    title: 'حين يلتقي النص بالقلب',
    pageNumber: 36,
    paragraphs: [
      'تصل بعض النصوص إلى القارئ لأنها تلامس سؤالًا موجودًا في داخله منذ وقت طويل.',
      'في تلك اللحظة لا يعود الكتاب مجرد مصدر للمعلومات.',
      'يصبح مساحة يكتشف فيها الإنسان شيئًا عن نفسه وعن الطريقة التي يرى بها العالم.',
    ],
  },
  {
    id: 'p37',
    label: 'الفصل السابع',
    chapter: 'الفصل السابع',
    title: 'سورة المتابعة',
    pageNumber: 37,
    paragraphs: [
      'كل قراءة تتطلب متابعة، والاهتمام الحقيقي لا يقف عند أول سطر.',
      'صفحة بعد صفحة يتوسع العالم الداخلي وتزدهر الصور والأفكار.',
      'ويظل القارئ في حالة اتصال مستمر حتى يقرر إغلاق الكتاب.',
    ],
  },
  {
    id: 'p38',
    label: 'الفصل السابع',
    chapter: 'الفصل السابع',
    title: 'الاستمرار',
    pageNumber: 38,
    paragraphs: [
      'الاستمرار أهم من الاندفاع، لأن القراءة الطويلة تحتاج إلى عادة مستقرة.',
      'قد تكون عشر صفحات يوميًا أكثر أثرًا من مئة صفحة تُقرأ مرة واحدة ثم ينقطع القارئ.',
      'العلاقة المستمرة مع الكتاب هي التي تصنع التراكم الحقيقي.',
    ],
  },
  {
    id: 'p39',
    label: 'الفصل السابع',
    chapter: 'الفصل السابع',
    title: 'صفحة بعد صفحة',
    pageNumber: 39,
    paragraphs: [
      'لا يشعر القارئ دائمًا بالتقدم أثناء القراءة، لكن الصفحات المتراكمة تصنع فرقًا واضحًا مع الوقت.',
      'كل صفحة تضيف فكرة أو سؤالًا أو تجربة جديدة.',
      'ومع مرور الأيام يصبح ما كان يبدو قليلًا جزءًا من معرفة واسعة.',
    ],
  },
  {
    id: 'p40',
    label: 'الفصل السابع',
    chapter: 'الفصل السابع',
    title: 'العودة إلى الطريق',
    pageNumber: 40,
    paragraphs: [
      'قد يتوقف القارئ فترة عن كتابه، وهذا لا يعني أن الرحلة انتهت.',
      'العودة إلى الصفحة نفسها بعد انقطاع قد تكون بداية جديدة.',
      'المهم هو استعادة الاتصال بالنص بدل النظر إلى فترة التوقف باعتبارها نهاية.',
    ],
  },
  {
    id: 'p41',
    label: 'الفصل السابع',
    chapter: 'الفصل السابع',
    title: 'مقاومة التشتت',
    pageNumber: 41,
    paragraphs: [
      'التركيز أصبح مهارة تحتاج إلى تدريب مستمر في عالم مليء بالمشتتات.',
      'القراءة تمنح العقل فرصة لتعلم البقاء مع فكرة واحدة لفترة أطول.',
      'ومع الوقت يصبح التركيز أقل صعوبة عندما نمارسه بشكل منتظم.',
    ],
  },
  {
    id: 'p42',
    label: 'الفصل السابع',
    chapter: 'الفصل السابع',
    title: 'وقت خاص للقراءة',
    pageNumber: 42,
    paragraphs: [
      'اختيار وقت ثابت للقراءة يساعد على تحويلها من نشاط عابر إلى عادة.',
      'لا يشترط أن يكون الوقت طويلًا، بل المهم أن يكون واضحًا ومحددًا.',
      'ومع تكرار الوقت نفسه يبدأ العقل في الاستعداد للقراءة تلقائيًا.',
    ],
  },
  {
    id: 'p43',
    label: 'الفصل الثامن',
    chapter: 'الفصل الثامن',
    title: 'المعنى المتحرك',
    pageNumber: 43,
    paragraphs: [
      'الكتاب لا يقدم جوابًا واحدًا، بل يعرض طبقات من الفهم يمكن اكتشافها مع الوقت.',
      'يستطيع القارئ أن يعود إلى النص مرات كثيرة وفي كل مرة يجد شيئًا جديدًا.',
      'وهذه هي إحدى القوى الحقيقية للقراءة: أنها تترك إمكانية دائمة للتوسع.',
    ],
  },
  {
    id: 'p44',
    label: 'الفصل الثامن',
    chapter: 'الفصل الثامن',
    title: 'طبقات الفهم',
    pageNumber: 44,
    paragraphs: [
      'بعض النصوص يمكن فهمها على أكثر من مستوى.',
      'قد يبدأ القارئ بالمعنى المباشر، ثم يكتشف لاحقًا علاقات أعمق بين الأفكار.',
      'كل مستوى جديد لا يلغي السابق، بل يضيف إليه ويجعله أكثر اكتمالًا.',
    ],
  },
  {
    id: 'p45',
    label: 'الفصل الثامن',
    chapter: 'الفصل الثامن',
    title: 'ما وراء الإجابة',
    pageNumber: 45,
    paragraphs: [
      'ليس الهدف من كل كتاب أن يقدم إجابات نهائية.',
      'أحيانًا تكون القيمة الحقيقية في الأسئلة التي يتركها النص خلفه.',
      'السؤال الجيد يمكن أن يستمر في توجيه البحث حتى بعد إغلاق الكتاب.',
    ],
  },
  {
    id: 'p46',
    label: 'الفصل الثامن',
    chapter: 'الفصل الثامن',
    title: 'العودة إلى المعنى',
    pageNumber: 46,
    paragraphs: [
      'عندما نعود إلى فكرة قديمة بعد فترة، نجد أننا نقرأها بعين مختلفة.',
      'التجارب التي مررنا بها تضيف إلى الكلمات معاني لم تكن موجودة في قراءتنا الأولى.',
      'لهذا يمكن للنص الواحد أن يرافق الإنسان في مراحل متعددة من حياته.',
    ],
  },
  {
    id: 'p47',
    label: 'الفصل الثامن',
    chapter: 'الفصل الثامن',
    title: 'المعرفة المتراكمة',
    pageNumber: 47,
    paragraphs: [
      'المعرفة لا تتكون من كتاب واحد، وإنما من مجموعة من التجارب والقراءات والملاحظات.',
      'كل كتاب يضيف قطعة صغيرة إلى الصورة الكبيرة.',
      'ومع مرور الوقت تبدأ القطع في الاتصال لتكوين فهم أكثر ترابطًا.',
    ],
  },
  {
    id: 'p48',
    label: 'الفصل الثامن',
    chapter: 'الفصل الثامن',
    title: 'أفق جديد',
    pageNumber: 48,
    paragraphs: [
      'كل فكرة جديدة يمكن أن تكون بداية لأفق مختلف.',
      'قد تقودنا فقرة واحدة إلى كتاب آخر أو مجال جديد لم نفكر في دراسته.',
      'وهكذا تتحول القراءة إلى شبكة من الطرق المفتوحة التي يمكن اختيار مسارها باستمرار.',
    ],
  },
  {
    id: 'p49',
    label: 'الفصل التاسع',
    chapter: 'الفصل التاسع',
    title: 'الذهاب إلى النهاية',
    pageNumber: 49,
    paragraphs: [
      'وفي نهاية المسار لا تحسم القراءة بمفردها، بل تسهم في بناء داخل جديد.',
      'فالكتاب لا ينتهي عند آخر صفحة، بل يبدأ في الداخل حين نتذكر المعنى ونتبعه في حياتنا.',
      'وهكذا تكتمل الرحلة لا بوصول إلى نهاية، بل بفتح طريق جديد.',
    ],
  },
  {
    id: 'p50',
    label: 'الفصل التاسع',
    chapter: 'الفصل التاسع',
    title: 'آخر صفحة',
    pageNumber: 50,
    paragraphs: [
      'الوصول إلى آخر صفحة يحمل شعورًا مختلفًا عن بداية الكتاب.',
      'نكون قد قطعنا مسافة طويلة، وتغيرت علاقتنا بالنص عما كانت عليه في البداية.',
      'لكن النهاية لا تعني أن أثر الكتاب قد انتهى.',
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
// className="book-page relative h-full w-full overflow-hidden rounded-[5px] border border-[#b99562] bg-[#f3ead3] shadow-[0_70px_110px_rgba(0,0,0,0.42),0_30px_65px_rgba(0,0,0,0.22),inset_55px_20px_55px_-35px_rgba(10,10,0,0.18),inset_-55px_20px_55px_-35px_rgba(20,10,0,0.18)] select-none"    >

className="book-page relative h-full w-full overflow-hidden rounded-[5px] border border-[#b99562] bg-[#f3ead3] shadow-[0_75px_130px_rgba(0,0,0,0.45),0_35px_75px_rgba(0,0,0,0.25),inset_60px_20px_60px_-35px_rgba(10,10,0,0.2),inset_-60px_20px_60px_-35px_rgba(20,10,0,0.2)] select-none" >
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
            <p key={`${page.id}-${paragraph.slice(0, 10)}`} className="text-pretty">
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

  const pages = useMemo(() => (isArabic ? [...DEMO_PAGES].reverse() : DEMO_PAGES), [isArabic]);

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
      isArabic ? bookRef.current.pageFlip().flipPrev() : bookRef.current.pageFlip().flipNext();
    }
  };

  const handleFlipPrev = () => {
    if (bookRef.current) {
      isArabic ? bookRef.current.pageFlip().flipNext() : bookRef.current.pageFlip().flipPrev();
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

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
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
      localStorage.setItem('book-saved-page', String(currentIndex));
      setSavedPage(currentIndex);
    }
  };

  /* =========================
     Progress
  ========================= */

  const currentPageNumber = pages[currentIndex]?.pageNumber ?? 1;

  // const progress = Math.round((currentPageNumber / totalPages) * 100);
const progress = Math.round(
  ((currentIndex + 1) / totalPages) * 100
);
const handleFlip = useCallback((e: any) => {
  setCurrentIndex(e.data);
}, []);
  /* =========================
     Select Page Pair
  ========================= */

  const handleSelectPagePair = (pairIndex: number) => {
    if (bookRef.current) {
      const targetPage = pairIndex * 2;

      bookRef.current.pageFlip().turnToPage(targetPage);
    }
  };


  // ===================

  // const totalPages = pages.length;
  const pageThickness = Math.round(
  ((currentIndex + 1) / totalPages) * 24
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
            {isArabic ? 'قراءة صفحة الكتاب' : 'Turn the pages of the book'}
          </h1>
        </div>

        <div className="mx-auto max-w-[1380px] rounded-[28px] border border-white/10 bg-[#1a1d24]/90 p-4 shadow-[0_30px_60px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-6">
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
                onClick={handleFlipPrev}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-[#f8e8c7] transition hover:border-[#d6b26b]/60 hover:bg-[#d6b26b]/10 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={isArabic ? 'الصفحة السابقة' : 'Previous page'}
                disabled={currentIndex === 0}
              >
                {isArabic ? '›' : '‹'}
              </button>

              <button
                type="button"
                onClick={handleFlipNext}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-[#f8e8c7] transition hover:border-[#d6b26b]/60 hover:bg-[#d6b26b]/10 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={isArabic ? 'الصفحة التالية' : 'Next page'}
                disabled={currentIndex >= totalPages - 1}
              >
                {isArabic ? '‹' : '›'}
              </button>
            </div>
          </div>

          {/* <div className="relative flex items-center justify-center overflow-hidden rounded-[18px] bg-[#151a1f] px-2 pb-3 pt-2 sm:px-4"> */}
          <div
            ref={fullscreenRef}
            className={`book-reader-surface relative flex h-[700px] w-full   items-center justify-center ${
              isFullscreen ? 'bg-[#14181d]' : ''
            }`}
          >
            <div className="flex h-full w-full items-center  justify-center">
              {/* @ts-ignore */}
              <HTMLFlipBook
                width={460}
                height={600}
                size="stretch"
                minWidth={300}
                maxWidth={500}
                minHeight={400}
                maxHeight={600}
                maxShadowOpacity={0.5}
                showCover={false}
                mobileScrollSupport={true}
                ref={bookRef}
                className="demo-book"
                usePortrait={true}
                startPage={0}
                drawShadow={true}
                flippingTime={800}
                onFlip={handleFlip}
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

            <div className="absolute -bottom-5 left z-30 flex gap-2">
              <button
                type="button"
                onClick={handleSavePage}
                className={`flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-sm transition ${
                  savedPage === currentIndex
                    ? 'border-[#d6b26b] bg-[#d6b26b]/20 text-[#f4d79a]'
                    : 'border-white/10 bg-black/40 text-white hover:bg-black/60'
                }`}
                aria-label={isArabic ? 'حفظ الصفحة' : 'Save page'}
              >
                <Bookmark size={22} fill={savedPage === currentIndex ? 'currentColor' : 'none'} />
              </button>

              <button
                type="button"
                onClick={handleFullscreen}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-lg text-white backdrop-blur-sm transition hover:bg-black/60"
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                ⛶
              </button>
            </div>
          </div>

          <div>
            <div className="relative ">
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
                <span>{isArabic ? 'تقدم القراءة' : 'Reading progress'}</span>

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

        </div>
      </div>
    </main>
  );
}

export default BookReader;
