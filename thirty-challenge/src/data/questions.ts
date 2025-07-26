import type { Question, SegmentCode } from '../types/game';

// Sample questions for each segment
export const sampleQuestions: Record<SegmentCode, Question[]> = {
  WSHA: [
    {
      id: 'wsha-1',
      text: 'اذكر أندية كرة القدم الإنجليزية',
      answers: ['مانشستر يونايتد', 'ليفربول', 'تشيلسي', 'أرسنال', 'مانشستر سيتي', 'توتنهام'],
      segmentCode: 'WSHA',
      difficulty: 'easy'
    },
    {
      id: 'wsha-2',
      text: 'اذكر دول في قارة آسيا',
      answers: ['السعودية', 'اليابان', 'الصين', 'الهند', 'كوريا الجنوبية', 'تايلاند'],
      segmentCode: 'WSHA',
      difficulty: 'easy'
    },
    {
      id: 'wsha-3',
      text: 'اذكر أنواع الفواكه',
      answers: ['تفاح', 'برتقال', 'موز', 'عنب', 'فراولة', 'مانجو', 'أناناس'],
      segmentCode: 'WSHA',
      difficulty: 'easy'
    }
  ],

  AUCT: [
    {
      id: 'auct-1',
      text: 'اذكر لاعبين فازوا بجائزة الكرة الذهبية',
      answers: ['ميسي', 'رونالدو', 'مودريتش', 'كاكا', 'رونالدينيو', 'زيدان', 'فيغو', 'ريفالدو'],
      segmentCode: 'AUCT',
      difficulty: 'medium'
    },
    {
      id: 'auct-2',
      text: 'اذكر عواصم دول عربية',
      answers: ['الرياض', 'القاهرة', 'بغداد', 'دمشق', 'عمان', 'بيروت', 'تونس', 'الجزائر'],
      segmentCode: 'AUCT',
      difficulty: 'medium'
    },
    {
      id: 'auct-3',
      text: 'اذكر أفلام عربية مشهورة',
      answers: ['الرسالة', 'عمر المختار', 'الناصر صلاح الدين', 'وجدة', 'كفرناحوم', 'بلدي الحبيب'],
      segmentCode: 'AUCT',
      difficulty: 'medium'
    }
  ],

  BELL: [
    {
      id: 'bell-1',
      text: 'ما هي عاصمة فرنسا؟',
      answers: ['باريس'],
      correctAnswer: 'باريس',
      segmentCode: 'BELL',
      difficulty: 'easy'
    },
    {
      id: 'bell-2',
      text: 'كم عدد أيام السنة الميلادية؟',
      answers: ['365'],
      correctAnswer: '365',
      segmentCode: 'BELL',
      difficulty: 'easy'
    },
    {
      id: 'bell-3',
      text: 'ما هو أكبر محيط في العالم؟',
      answers: ['المحيط الهادئ'],
      correctAnswer: 'المحيط الهادئ',
      segmentCode: 'BELL',
      difficulty: 'medium'
    },
    {
      id: 'bell-4',
      text: 'من هو أول رائد فضاء في التاريخ؟',
      answers: ['يوري غاغارين'],
      correctAnswer: 'يوري غاغارين',
      segmentCode: 'BELL',
      difficulty: 'hard'
    }
  ],

  SING: [
    {
      id: 'sing-1',
      text: 'ما هو الاسم الحقيقي للملك فهد بن عبد العزيز؟',
      answers: ['فهد بن عبد العزيز بن عبد الرحمن آل سعود'],
      correctAnswer: 'فهد بن عبد العزيز بن عبد الرحمن آل سعود',
      segmentCode: 'SING',
      difficulty: 'hard'
    },
    {
      id: 'sing-2',
      text: 'في أي عام تم تأسيس الأمم المتحدة؟',
      answers: ['1945'],
      correctAnswer: '1945',
      segmentCode: 'SING',
      difficulty: 'hard'
    },
    {
      id: 'sing-3',
      text: 'ما هو أطول نهر في العالم؟',
      answers: ['نهر النيل'],
      correctAnswer: 'نهر النيل',
      segmentCode: 'SING',
      difficulty: 'hard'
    },
    {
      id: 'sing-4',
      text: 'من هو مؤلف رواية "مئة عام من العزلة"؟',
      answers: ['غابرييل غارسيا ماركيز'],
      correctAnswer: 'غابرييل غارسيا ماركيز',
      segmentCode: 'SING',
      difficulty: 'hard'
    }
  ],

  REMO: [
    {
      id: 'remo-1',
      text: 'من هو هذا الشخص؟',
      answers: ['طبيب'],
      correctAnswer: 'طبيب',
      segmentCode: 'REMO',
      difficulty: 'medium'
    },
    {
      id: 'remo-2',
      text: 'ما هي هذه المهنة؟',
      answers: ['مهندس'],
      correctAnswer: 'مهندس',
      segmentCode: 'REMO',
      difficulty: 'medium'
    },
    {
      id: 'remo-3',
      text: 'اكتشف المهنة من الأدلة',
      answers: ['معلم'],
      correctAnswer: 'معلم',
      segmentCode: 'REMO',
      difficulty: 'medium'
    }
  ]
};

// Career clues for REMO segment
export const careerClues: Record<string, string[]> = {
  'طبيب': [
    'يعمل في المستشفى',
    'يساعد المرضى',
    'يصف الأدوية',
    'درس الطب في الجامعة',
    'يرتدي المعطف الأبيض'
  ],
  'مهندس': [
    'يصمم المباني والجسور',
    'يستخدم برامج الكمبيوتر',
    'درس الهندسة',
    'يعمل مع الخرائط والمخططات',
    'يشرف على المشاريع الإنشائية'
  ],
  'معلم': [
    'يعمل في المدرسة',
    'يشرح الدروس للطلاب',
    'يصحح الواجبات',
    'يستخدم السبورة',
    'يعلم المواد الدراسية'
  ]
};

// Function to get random questions for a segment
export function getQuestionsForSegment(segmentCode: SegmentCode, count: number): Question[] {
  const questions = sampleQuestions[segmentCode];
  if (!questions || questions.length === 0) return [];
  
  // Shuffle and return the requested number of questions
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// Function to get career clues for REMO segment
export function getCareerClues(career: string): string[] {
  return careerClues[career] || [];
}