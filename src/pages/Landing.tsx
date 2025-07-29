import { Link } from 'react-router-dom';

/**
 * Minimal landing page for the Test_arena branch.  Offers links to
 * start a new test session or join an existing one.  The styling
 * aligns loosely with the original project without including any
 * heavy design dependencies.
 */
export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-6 p-4">
      {/* Logo from public assets to match the new branding */}
      <img
        src="/tahadialthalatheen/images/Logo.png"
        alt="تحدي الثلاثين"
        className="w-32 md:w-48"
      />
      <h1 className="text-4xl font-extrabold text-accent">تحدي الثلاثين</h1>
      <p className="text-center text-lg text-gray-300">
        ابدأ التحدي مع أصدقائك الآن!
      </p>
      <div className="space-y-3">
        <Link
          to="/join"
          className="block rounded bg-blue-600 px-6 py-3 text-center text-white hover:bg-blue-700"
        >
          الانضمام إلى جلسة
        </Link>
        <Link
          to="/test-api"
          className="block rounded bg-green-600 px-6 py-3 text-center text-white hover:bg-green-700"
        >
          تجربة الواجهة البرمجية
        </Link>
      </div>
    </div>
  );
}
