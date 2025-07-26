import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { getQuestionsForSegment } from '../data/questions';
import Scoreboard from '../components/Scoreboard';
import Timer from '../components/Timer';
import Buzzer from '../components/Buzzer';
import VideoRoom from '../components/VideoRoom';

export default function QuizRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const { state, actions } = useGame();

  useEffect(() => {
    if (roomId && !state.gameId) {
      actions.startGame(roomId);
    }
  }, [roomId, state.gameId, actions]);

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

  const SegmentBanner = () => {
    if (!state.currentSegment) return null;
    
    const segment = state.segments.find(s => s.code === state.currentSegment);
    if (!segment) return null;

    return (
      <motion.div
        className="mx-auto my-4 text-center py-4 px-6 rounded-2xl shadow-lg bg-gradient-to-r from-purple-600 to-blue-600"
        initial={{ opacity: 0, y: -32 }}
        animate={{ opacity: 1, y: 0 }}
        dir="rtl"
      >
        <h2 className="text-2xl font-bold text-white mb-2">
          {segment.name}
        </h2>
        <p className="text-purple-100 text-sm mb-2">{segment.description}</p>
        <div className="text-xs text-purple-200">
          سؤال {state.currentQuestionIndex} / {state.settings.questionsPerSegment[state.currentSegment]}
        </div>
      </motion.div>
    );
  };

  const QuestionPanel = () => {
    if (!state.currentQuestion) {
      return (
        <motion.div 
          className="rounded-xl p-6 shadow-lg bg-white/10 backdrop-blur-sm text-center my-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-lg text-white/80" dir="rtl">
            {state.phase === 'lobby' && 'انتظر بدء اللعبة...'}
            {state.phase === 'segment-intro' && 'استعد للفقرة القادمة'}
            {state.phase === 'playing' && 'جاري تحميل السؤال...'}
            {state.phase === 'final' && '🎉 انتهت اللعبة!'}
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        className="rounded-xl p-6 shadow-lg bg-white/10 backdrop-blur-sm text-center my-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        key={state.currentQuestion.id}
      >
        <div className="text-xl font-bold mb-4 text-white" dir="rtl">
          {state.currentQuestion.text}
        </div>
        
        {/* Show answers for WSHA and AUCT segments */}
        {(state.currentSegment === 'WSHA' || state.currentSegment === 'AUCT') && (
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {state.currentQuestion.answers.map((answer, index) => (
              <motion.span
                key={index}
                className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {answer}
              </motion.span>
            ))}
          </div>
        )}

        {/* Bell component for BELL segment */}
        {state.currentSegment === 'BELL' && (
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <p className="text-white/80 mb-2 text-sm">لاعب أ</p>
              <Buzzer playerId="playerA" />
            </div>
            <div className="text-center">
              <p className="text-white/80 mb-2 text-sm">لاعب ب</p>
              <Buzzer playerId="playerB" />
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const HostControls = () => (
    <div className="mt-6 flex gap-4 justify-center flex-wrap">
      <motion.button
        onClick={handleNextQuestion}
        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 shadow-lg font-bold transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={state.phase !== 'playing' && state.phase !== 'segment-intro'}
      >
        السؤال التالي
      </motion.button>

      <motion.button
        onClick={handleNextSegment}
        className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 shadow-lg font-bold transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        الفقرة التالية
      </motion.button>

      <motion.button
        onClick={() => actions.addStrike('playerA')}
        className="rounded-xl bg-red-500 hover:bg-red-600 text-white px-4 py-3 shadow-lg font-bold transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        خطأ لاعب أ
      </motion.button>

      <motion.button
        onClick={() => actions.addStrike('playerB')}
        className="rounded-xl bg-red-500 hover:bg-red-600 text-white px-4 py-3 shadow-lg font-bold transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        خطأ لاعب ب
      </motion.button>

      <motion.button
        onClick={() => actions.updateScore('playerA', 1, 'إجابة صحيحة')}
        className="rounded-xl bg-green-500 hover:bg-green-600 text-white px-4 py-3 shadow-lg font-bold transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        +1 لاعب أ
      </motion.button>

      <motion.button
        onClick={() => actions.updateScore('playerB', 1, 'إجابة صحيحة')}
        className="rounded-xl bg-green-500 hover:bg-green-600 text-white px-4 py-3 shadow-lg font-bold transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        +1 لاعب ب
      </motion.button>
    </div>
  );

  return (
    <main className="relative min-h-screen px-4 py-6 bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="max-w-6xl mx-auto">
        {/* Segment Banner */}
        <SegmentBanner />

        {/* Video Chat Section */}
        <section className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="relative">
            <h3 className="text-white text-center mb-2 font-bold">المقدم</h3>
            <VideoRoom />
          </div>
          <div className="relative">
            <h3 className="text-white text-center mb-2 font-bold">لاعب أ</h3>
            <VideoRoom />
          </div>
          <div className="relative">
            <h3 className="text-white text-center mb-2 font-bold">لاعب ب</h3>
            <VideoRoom />
          </div>
        </section>

        {/* Timer */}
        <div className="flex justify-center mb-6">
          <Timer />
        </div>

        {/* Scoreboard */}
        <Scoreboard className="mb-6" />

        {/* Question Panel */}
        <QuestionPanel />

        {/* Host Controls */}
        <HostControls />

        {/* Game State Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <motion.div
            className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div>Phase: {state.phase}</div>
            <div>Segment: {state.currentSegment}</div>
            <div>Question: {state.currentQuestionIndex}</div>
            <div>Bell Active: {state.bell.isActive ? 'Yes' : 'No'}</div>
            <div>Clicked By: {state.bell.clickedBy || 'None'}</div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
