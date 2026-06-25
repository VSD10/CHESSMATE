import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl mb-4 opacity-20">♟</div>
      <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-2">Page Not Found</h1>
      <p className="text-gray-500 text-sm mb-6">That move was illegal.</p>
      <Link to="/" className="px-5 py-2.5 bg-cm-accent text-white rounded-xl text-sm font-semibold hover:bg-cm-accent-l transition-colors active:scale-[0.98]">
        Back to Home
      </Link>
    </div>
  );
}
