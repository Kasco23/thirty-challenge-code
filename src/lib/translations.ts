export type Language = 'en' | 'ar';

export interface Translations {
  // Landing Page
  welcome: string;
  startChallenge: string;
  createSession: string;
  joinSession: string;
  createSessionDesc: string;
  joinSessionDesc: string;
  alphaQuiz: string;
  alphaQuizDesc: string;

  // Common UI
  loading: string;
  error: string;
  cancel: string;
  confirm: string;
  back: string;
  next: string;
  join: string;
  create: string;

  // Join Page
  joinAsHost: string;
  joinAsPlayer: string;
  sessionCode: string;
  hostCode: string;
  playerName: string;
  selectFlag: string;
  selectTeam: string;
  searching: string;
  hostMobile: string;
  hostMobileDesc: string;
  playerJoin: string;
  playerJoinDesc: string;
  enterSessionCode: string;
  enterHostCode: string;
  enterPlayerName: string;
  flagSearch: string;
  teamSearch: string;
  joinGame: string;
  joiningGame: string;
  gameNotFound: string;
  gameIsFull: string;
  invalidCode: string;
  chooseJoinType: string;
  enterCodeAndName: string;
  enterSessionAndHostCode: string;
  needSessionAndHostCode: string;
  participatingPlayers: string;
  hostCodeFound: string;
  confirmJoinGame: string;
  aboutToJoinGame: string;
  firstPlayer: string;
  secondPlayer: string;
  moveToLobbyWait: string;
  noVideoRoomYet: string;
  contactHostCreateRoom: string;
  failedJoinGame: string;
  errorJoiningGame: string;

  // Create Session Page
  hostName: string;
  gameSettings: string;
  segmentSettings: string;
  questionsPerSegment: string;
  createNewSession: string;
  creatingSession: string;
  sessionCreated: string;

  // Active Games
  activeGames: string;
  noActiveGames: string;
  joinAsHostPlayer: string;
  playersOnline: string;
  created: string;
  quickJoin: string;
  refreshGames: string;

  // Lobby
  waitingForHost: string;
  waitingForPlayers: string;
  gameStarting: string;
  hostControls: string;
  startGame: string;
  lobbyCode: string;
  shareCode: string;

  // Game States
  config: string;
  lobby: string;
  playing: string;
  completed: string;

  // Language Toggle
  language: string;
  english: string;
  arabic: string;
  switchLanguage: string;
  
  // Lobby Page
  waitingLobby: string;
  lobbySessionCode: string;
  connectedPlayers: string;
  videoSystemUpdated: string;
  userInformation: string;
  participantType: string;
  participantName: string;
  participantId: string;
  videoSystemNotes: string;
  roomLinkLoaded: string;
  playerNamesVisible: string;
  videoRoomUsingSession: string;
  cameraControls: string;
  dailyKitchenSink: string;
  
  // Control Room Page
  controlRoom: string;
  playersCode: string;
  controlRoomHostCode: string;
  currentStage: string;
  hostConnected: string;
  hostDisconnected: string;
  controllerActive: string;
  connectedToServer: string;
  controlRoomStartGame: string;
  waitingConfig: string;
  gameAlreadyStarted: string;
  videoRoomReady: string;
  noVideoRoom: string;
  manageVideoLobby: string;
  importantVideoInfo: string;
  controlRoomGameOnly: string;
  videoManagementInLobby: string;
  goToLobby: string;
  showParticipantInfo: string;
  participantInfo: string;
  controlRoomHost: string;
  controlRoomFirstPlayer: string;
  controlRoomSecondPlayer: string;
  notJoinedYet: string;
  videoInteractionTip: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Landing Page
    welcome: 'Welcome to the Challenge!',
    startChallenge: 'Start the challenge with your friends now!',
    createSession: 'Create New Session',
    joinSession: 'Join Session',
    createSessionDesc: 'Create New Session: You will become the host and control the game',
    joinSessionDesc: 'Join Session: Enter as a player in an existing session',
    alphaQuiz: 'Alpha: Quiz 🚀',
    alphaQuizDesc: 'Alpha Quiz: Simplified version for testing (no video)',

    // Common UI
    loading: 'Loading...',
    error: 'Error',
    cancel: 'Cancel',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    join: 'Join',
    create: 'Create',

    // Join Page
    joinAsHost: 'Join as Host',
    joinAsPlayer: 'Join as Player',
    sessionCode: 'Session Code',
    hostCode: 'Host Code',
    playerName: 'Player Name',
    selectFlag: 'Select Flag',
    selectTeam: 'Select Team',
    searching: 'Searching...',
    hostMobile: 'Host (Mobile)',
    hostMobileDesc: 'Join from mobile to see what players see',
    playerJoin: 'Player',
    playerJoinDesc: 'Join as a player in the game',
    enterSessionCode: 'Enter session code',
    enterHostCode: 'Enter host code',
    enterPlayerName: 'Enter your name',
    flagSearch: 'Search countries...',
    teamSearch: 'Search teams...',
    joinGame: 'Join Game',
    joiningGame: 'Joining game...',
    gameNotFound: 'Game not found',
    gameIsFull: 'Game is full',
    invalidCode: 'Invalid code',
    chooseJoinType: 'Choose join type',
    enterCodeAndName: 'Enter game code and name',
    enterSessionAndHostCode: 'Enter session code and host code',
    needSessionAndHostCode: 'You need session code and host code',
    participatingPlayers: 'Participating players in the quiz',
    hostCodeFound: 'You will find the host code on the session setup page',
    confirmJoinGame: 'Confirm joining game',
    aboutToJoinGame: 'You are about to join game',
    firstPlayer: 'first player',
    secondPlayer: 'second player',
    moveToLobbyWait: 'You will be moved to the waiting lobby to start video and wait until the host starts the game.',
    noVideoRoomYet: 'No video room yet. Contact the host to create the room first.',
    contactHostCreateRoom: 'Contact the host to create the room first.',
    failedJoinGame: 'Failed to join game. Try again',
    errorJoiningGame: 'Error occurred while joining game',

    // Create Session Page  
    hostName: 'Host Name',
    gameSettings: 'Game Settings',
    segmentSettings: 'Segment Settings',
    questionsPerSegment: 'Questions per segment',
    createNewSession: 'Create New Session',
    creatingSession: 'Creating session...',
    sessionCreated: 'Session created successfully!',

    // Active Games
    activeGames: 'Active Games',
    noActiveGames: 'No active games found',
    joinAsHostPlayer: 'Join as Host or Player',
    playersOnline: 'players online',
    created: 'Created',
    quickJoin: 'Quick Join',
    refreshGames: 'Refresh Games',

    // Lobby
    waitingForHost: 'Waiting for host...',
    waitingForPlayers: 'Waiting for players...',
    gameStarting: 'Game starting...',
    hostControls: 'Host Controls',
    startGame: 'Start Game',
    lobbyCode: 'Lobby Code',
    shareCode: 'Share this code with players',

    // Game States
    config: 'Configuration',
    lobby: 'Lobby',
    playing: 'Playing',
    completed: 'Completed',

    // Language Toggle
    language: 'Language',
    english: 'English',
    arabic: 'العربية',
    switchLanguage: 'Switch Language',
    
    // Lobby Page
    waitingLobby: 'Waiting Lobby',
    lobbySessionCode: 'Session Code',
    connectedPlayers: 'Connected Players',
    videoSystemUpdated: 'Updated video system with player name display',
    userInformation: 'User Information',
    participantType: 'Type',
    participantName: 'Name',
    participantId: 'ID',
    videoSystemNotes: '✅ Updated Video System:',
    roomLinkLoaded: '• Room link automatically loaded from session ID',
    playerNamesVisible: '• Player names displayed below videos',
    videoRoomUsingSession: '• Video room uses session ID directly',
    cameraControls: '• Camera and microphone controls',
    dailyKitchenSink: '• Enhanced Daily.co Kitchen Sink application',
    
    // Control Room Page
    controlRoom: 'Control Room',
    playersCode: 'Players Code',
    controlRoomHostCode: 'Host Code',
    currentStage: 'Current Stage',
    hostConnected: 'Host Connected',
    hostDisconnected: 'Host Disconnected',
    controllerActive: 'Controller Active',
    connectedToServer: 'Connected to Server',
    controlRoomStartGame: 'Start Game',
    waitingConfig: 'Waiting for configuration confirmation...',
    gameAlreadyStarted: 'Game already started',
    videoRoomReady: '✓ Video room ready',
    noVideoRoom: 'No video room',
    manageVideoLobby: 'Manage Video in Lobby',
    importantVideoInfo: 'Important Information - Video Control',
    controlRoomGameOnly: 'This control room is for game management only - does not contain video settings',
    videoManagementInLobby: 'To manage video and interact with players, please use the waiting lobby',
    goToLobby: 'Go to Waiting Lobby',
    showParticipantInfo: 'Show participant information (for reference)',
    participantInfo: 'Participant Information:',
    controlRoomHost: 'Host',
    controlRoomFirstPlayer: 'First Player',
    controlRoomSecondPlayer: 'Second Player',
    notJoinedYet: 'Not joined yet',
    videoInteractionTip: '💡 To interact with video and participants, use the waiting lobby',
  },
  ar: {
    // Landing Page
    welcome: 'مرحباً بكم في التحدي!',
    startChallenge: 'ابدأ التحدي مع أصدقائك الآن!',
    createSession: 'إنشاء جلسة جديدة',
    joinSession: 'الانضمام لجلسة',
    createSessionDesc: 'إنشاء جلسة جديدة: ستصبح المقدم وتتحكم في اللعبة',
    joinSessionDesc: 'الانضمام لجلسة: ادخل كلاعب في جلسة موجودة',
    alphaQuiz: 'Alpha: Quiz 🚀',
    alphaQuizDesc: 'Alpha Quiz: نسخة مبسطة للاختبار (بدون فيديو)',

    // Common UI
    loading: 'جاري التحميل...',
    error: 'خطأ',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    back: 'رجوع',
    next: 'التالي',
    join: 'انضمام',
    create: 'إنشاء',

    // Join Page
    joinAsHost: 'انضمام كمقدم',
    joinAsPlayer: 'انضمام كلاعب',
    sessionCode: 'كود الجلسة',
    hostCode: 'كود المقدم',
    playerName: 'اسم اللاعب',
    selectFlag: 'اختر العلم',
    selectTeam: 'اختر الفريق',
    searching: 'جاري البحث...',
    hostMobile: 'مقدم (جوال)',
    hostMobileDesc: 'انضم من الجوال لرؤية ما يراه اللاعبون',
    playerJoin: 'لاعب',
    playerJoinDesc: 'انضم كلاعب في اللعبة',
    enterSessionCode: 'أدخل كود الجلسة',
    enterHostCode: 'أدخل كود المقدم',
    enterPlayerName: 'أدخل اسمك',
    flagSearch: 'ابحث عن الدول...',
    teamSearch: 'ابحث عن الفرق...',
    joinGame: 'انضمام للعبة',
    joiningGame: 'جاري الانضمام...',
    gameNotFound: 'اللعبة غير موجودة',
    gameIsFull: 'اللعبة ممتلئة',
    invalidCode: 'كود غير صحيح',
    chooseJoinType: 'اختر نوع الانضمام',
    enterCodeAndName: 'أدخل رمز اللعبة والاسم',
    enterSessionAndHostCode: 'أدخل رمز الجلسة ورمز المقدم',
    needSessionAndHostCode: 'تحتاج رمز الجلسة ورمز المقدم',
    participatingPlayers: 'للاعبين المشاركين في المسابقة',
    hostCodeFound: 'ستجد رمز المقدم في صفحة إعداد الجلسة',
    confirmJoinGame: 'تأكيد الانضمام للعبة',
    aboutToJoinGame: 'أنت على وشك الانضمام للعبة',
    firstPlayer: 'لاعب أول',
    secondPlayer: 'لاعب ثاني',
    moveToLobbyWait: 'سيتم نقلك إلى صالة الانتظار لبدء الفيديو والانتظار حتى يبدأ المقدم اللعبة.',
    noVideoRoomYet: 'لا توجد غرفة فيديو بعد.',
    contactHostCreateRoom: 'اتصل بالمقدم لإنشاء الغرفة أولاً.',
    failedJoinGame: 'فشل في الانضمام للعبة. حاول مرة أخرى',
    errorJoiningGame: 'حدث خطأ أثناء الانضمام للعبة',

    // Create Session Page
    hostName: 'اسم المقدم',
    gameSettings: 'إعدادات اللعبة',
    segmentSettings: 'إعدادات الأجزاء',
    questionsPerSegment: 'الأسئلة لكل جزء',
    createNewSession: 'إنشاء جلسة جديدة',
    creatingSession: 'جاري إنشاء الجلسة...',
    sessionCreated: 'تم إنشاء الجلسة بنجاح!',

    // Active Games
    activeGames: 'الألعاب النشطة',
    noActiveGames: 'لا توجد ألعاب نشطة',
    joinAsHostPlayer: 'انضم كمقدم أو لاعب',
    playersOnline: 'لاعبين متصلين',
    created: 'تم الإنشاء',
    quickJoin: 'انضمام سريع',
    refreshGames: 'تحديث الألعاب',

    // Lobby
    waitingForHost: 'في انتظار المقدم...',
    waitingForPlayers: 'في انتظار اللاعبين...',
    gameStarting: 'اللعبة تبدأ...',
    hostControls: 'تحكم المقدم',
    startGame: 'بدء اللعبة',
    lobbyCode: 'كود الغرفة',
    shareCode: 'شارك هذا الكود مع اللاعبين',

    // Game States
    config: 'إعداد',
    lobby: 'غرفة الانتظار',
    playing: 'جاري اللعب',
    completed: 'مكتملة',

    // Language Toggle
    language: 'اللغة',
    english: 'English',
    arabic: 'العربية',
    switchLanguage: 'تغيير اللغة',
    
    // Lobby Page
    waitingLobby: 'صالة الانتظار',
    lobbySessionCode: 'رمز الجلسة',
    connectedPlayers: 'اللاعبون المتصلون',
    videoSystemUpdated: 'نظام الفيديو المحدث مع عرض أسماء اللاعبين',
    userInformation: 'معلومات المستخدم',
    participantType: 'النوع',
    participantName: 'الاسم',
    participantId: 'المعرف',
    videoSystemNotes: '✅ نظام الفيديو المحدث:',
    roomLinkLoaded: '• رابط الغرفة يتم تحميله تلقائياً من معرف الجلسة',
    playerNamesVisible: '• أسماء اللاعبين تظهر أسفل مقاطع الفيديو',
    videoRoomUsingSession: '• غرفة الفيديو تستخدم معرف الجلسة مباشرة',
    cameraControls: '• تحكم في الكاميرا والميكروفون',
    dailyKitchenSink: '• تطبيق Daily.co Kitchen Sink المطور',
    
    // Control Room Page
    controlRoom: 'غرفة التحكم',
    playersCode: 'رمز اللاعبين',
    controlRoomHostCode: 'رمز المقدم',
    currentStage: 'المرحلة الحالية',
    hostConnected: 'المقدم متصل',
    hostDisconnected: 'المقدم غير متصل',
    controllerActive: 'تحكم نشط',
    connectedToServer: 'متصل بالخادم',
    controlRoomStartGame: 'ابدأ اللعبة',
    waitingConfig: 'في انتظار تأكيد البيانات...',
    gameAlreadyStarted: 'اللعبة بدأت فعلاً',
    videoRoomReady: '✓ غرفة الفيديو جاهزة',
    noVideoRoom: 'لا توجد غرفة فيديو',
    manageVideoLobby: 'إدارة الفيديو في الصالة',
    importantVideoInfo: 'معلومات هامة - التحكم في الفيديو',
    controlRoomGameOnly: 'هذه غرفة التحكم للعبة فقط - لا تحتوي على إعدادات الفيديو',
    videoManagementInLobby: 'لإدارة الفيديو والمشاركة مع اللاعبين، يرجى استخدام صالة الانتظار',
    goToLobby: 'الذهاب لصالة الانتظار',
    showParticipantInfo: 'عرض معلومات المشاركين (للمرجع)',
    participantInfo: 'معلومات المشاركين:',
    controlRoomHost: 'المقدم',
    controlRoomFirstPlayer: 'اللاعب الأول',
    controlRoomSecondPlayer: 'اللاعب الثاني',
    notJoinedYet: 'لم ينضم بعد',
    videoInteractionTip: '💡 للتفاعل مع الفيديو والمشاركين، استخدم صالة الانتظار',
  },
};

export const getTranslation = (language: Language, key: keyof Translations): string => {
  return translations[language][key];
};