import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { getQuestionsForSegment } from '../data/questions';
import Scoreboard from '../components/Scoreboard';
import Timer from '../components/Timer';
import Buzzer from '../components/Buzzer';
import VideoRoom from '../components/VideoRoom';

type UserRole = 'host' | 'playerA' | 'playerB';

export default function QuizRoom() {
  const { gameId, roomId } = useParams<{ gameId?: string; roomId?: string }>();
  const [searchParams] = useSearchParams();
  const { state, actions } = useGame();
  const [userRole, setUserRole] = useState<UserRole>('host');
  const [isMobile, setIsMobile] = useState(false);

  const currentGameId = gameId || roomId;

  // Determine user role and device type
  useEffect(() => {
    const role = searchParams.get('role') as UserRole;
    if (role && ['host', 'playerA', 'playerB'].includes(role)) {
      setUserRole(role);
    }

    // Check if mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [searchParams]);

  // Initialize game if needed
  useEffect(() => {
    if (currentGameId && state.gameId !== currentGameId) {
      actions.startGame(currentGameId);
    }
  }, [currentGameId, state.gameId, actions]);

  const handleNextQuestion = () => {
    if (!state.currentSegment) return;
    
    const questions = getQuestionsForSegment(state.currentSegment, 1);
    if (questions.length > 0) {
      actions.nextQuestion(questions[0]);
    }
  };

  const handleNextSegment = () => {
    actions.nextSegment();
  };

  const handleTimeUp = () => {
    // Handle when timer runs out
    console.log('Time up!');
  };

  // Host PC View
  if (userRole === 'host' && !isMobile) {
    return (
      <main className="relative min-h-screen px-4 py-6 bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white font-arabic">تحدي الثلاثين</h1>
              <p className="text-accent2 font-arabic">الجلسة: {currentGameId}</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 font-arabic">المقدم (PC)</p>
              <div className="text-sm text-green-400">متصل</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Host Controls Panel */}
            <div className="lg:col-span-1 space-y-4">
              {/* Current Segment Info */}
              {state.currentSegment && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <h3 className="text-white font-bold mb-2 font-arabic">الفقرة الحالية</h3>
                  <div className="text-accent2 font-arabic">
                    {state.segments.find(s => s.code === state.currentSegment)?.name}
                  </div>
                  <div className="text-white/70 text-sm font-arabic">
                    سؤال {state.currentQuestionIndex} / {state.settings.questionsPerSegment[state.currentSegment]}
                  </div>
                </div>
              )}

              {/* Host Controls */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <h3 className="text-white font-bold mb-4 font-arabic">تحكم المقدم</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleNextQuestion}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-arabic text-sm"
                    disabled={state.phase !== 'playing' && state.phase !== 'segment-intro'}
                  >
                    السؤال التالي
                  </button>
                  
                  <button
                    onClick={handleNextSegment}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-arabic text-sm"
                  >
                    الفقرة التالية
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => actions.addStrike('playerA')}
                      className="py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-arabic text-xs"
                    >
                      خطأ أ
                    </button>
                    <button
                      onClick={() => actions.addStrike('playerB')}
                      className="py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-arabic text-xs"
                    >
                      خطأ ب
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => actions.updateScore('playerA', 1, 'إجابة صحيحة')}
                      className="py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-arabic text-xs"
                    >
                      +1 أ
                    </button>
                    <button
                      onClick={() => actions.updateScore('playerB', 1, 'إجابة صحيحة')}
                      className="py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-arabic text-xs"
                    >
                      +1 ب
                    </button>
                  </div>
                </div>
              </div>

              {/* Timer */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <Timer onTimeUp={handleTimeUp} />
              </div>
            </div>

            {/* Main Game Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Question Display */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4 font-arabic">منطقة السؤال</h2>
                {state.currentQuestion ? (
                  <div>
                    <div className="text-lg text-white mb-4 font-arabic" dir="rtl">
                      {state.currentQuestion.text}
                    </div>
                    
                    {/* Host sees the answers */}
                    <div className="bg-yellow-500/20 rounded-lg p-4 mb-4">
                      <h4 className="text-yellow-300 font-bold mb-2 font-arabic">الإجابات (للمقدم فقط):</h4>
                      <div className="flex flex-wrap gap-2">
                        {state.currentQuestion.answers.map((answer, index) => (
                          <span key={index} className="bg-yellow-500/30 text-yellow-100 rounded px-2 py-1 text-sm font-arabic">
                            {answer}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bell status for BELL segment */}
                    {state.currentSegment === 'BELL' && (
                      <div className="bg-blue-500/20 rounded-lg p-4">
                        <h4 className="text-blue-300 font-bold mb-2 font-arabic">حالة الجرس:</h4>
                        {state.bell.clickedBy ? (
                          <p className="text-blue-100 font-arabic">
                            ضغط الجرس: {state.players[state.bell.clickedBy].name}
                          </p>
                        ) : (
                          <p className="text-blue-100 font-arabic">انتظار ضغط الجرس...</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-white/70 font-arabic">
                    {state.phase === 'lobby' && 'انتظار بدء اللعبة...'}
                    {state.phase === 'segment-intro' && 'استعد للفقرة القادمة'}
                    {state.phase === 'final' && '🎉 انتهت اللعبة!'}
                  </div>
                )}
              </div>

              {/* Scoreboard */}
              <Scoreboard />

              {/* Video Chat Area */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <h3 className="text-white font-bold mb-2 font-arabic text-center">لاعب أ</h3>
                  <VideoRoom />
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <h3 className="text-white font-bold mb-2 font-arabic text-center">لاعب ب</h3>
                  <VideoRoom />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Mobile Player View
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-white font-arabic">تحدي الثلاثين</h1>
          <p className="text-accent2 text-sm font-arabic">
            {userRole === 'host' ? 'المقدم (موبايل)' : state.players[userRole].name}
          </p>
        </div>

        {/* Current Segment */}
        {state.currentSegment && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4 text-center">
            <h2 className="text-white font-bold font-arabic">
              {state.segments.find(s => s.code === state.currentSegment)?.name}
            </h2>
            <p className="text-white/70 text-sm font-arabic">
              سؤال {state.currentQuestionIndex} / {state.settings.questionsPerSegment[state.currentSegment]}
            </p>
          </div>
        )}

        {/* Timer */}
        <div className="flex justify-center mb-4">
          <Timer onTimeUp={handleTimeUp} />
        </div>

        {/* Scoreboard */}
        <div className="mb-4">
          <Scoreboard />
        </div>

        {/* Question Area for Players */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
          {state.currentQuestion ? (
            <div>
              {/* Players don't see the question text in some segments */}
              {(state.currentSegment === 'BELL' || state.currentSegment === 'SING') ? (
                <div className="text-center text-white/70 font-arabic">
                  انتظار السؤال من المقدم...
                </div>
              ) : (
                <div className="text-lg text-white font-arabic text-center" dir="rtl">
                  {state.currentQuestion.text}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-white/70 font-arabic">
              {state.phase === 'lobby' && 'انتظار بدء اللعبة...'}
              {state.phase === 'segment-intro' && 'استعد للفقرة القادمة'}
              {state.phase === 'final' && '🎉 انتهت اللعبة!'}
            </div>
          )}
        </div>

        {/* Bell for BELL segment */}
        {state.currentSegment === 'BELL' && userRole !== 'host' && (
          <div className="flex justify-center mb-4">
            <Buzzer playerId={userRole} />
          </div>
        )}

        {/* Video Chat */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <VideoRoom />
        </div>
      </div>
    </main>
  );
}
