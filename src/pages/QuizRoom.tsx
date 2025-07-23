import { useParams } from "react-router-dom";
import { motion } from "framer-motion";

export default function QuizRoom() {
  const { roomId } = useParams();
  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2 className="text-4xl font-extrabold text-accent font-arabic mb-3">
        غرفة التحدي
      </h2>
      <div className="mb-6 text-accent2 font-arabic text-lg">رمز الجلسة: <b>{roomId}</b></div>
      <div className="bg-glass rounded-3xl shadow-2xl px-8 py-6 mb-8 w-full max-w-lg flex flex-col items-center backdrop-blur-md">
        <div className="mb-2 text-accent2 font-arabic text-xl">سيظهر هنا البث المرئي لاحقاً 🎥</div>
        <div className="w-full h-40 bg-accent2/10 rounded-xl flex items-center justify-center text-accent2">
          Video Chat Placeholder
        </div>
      </div>
      <div className="bg-glass rounded-3xl shadow-lg px-8 py-8 w-full max-w-lg">
        <div className="mb-4 text-accent text-xl font-arabic text-center">الأسئلة ستظهر هنا</div>
        <div className="w-full h-32 bg-accent/10 rounded-lg flex items-center justify-center text-accent">
          Quiz Segment Placeholder
        </div>
      </div>
    </motion.div>
  );
}
