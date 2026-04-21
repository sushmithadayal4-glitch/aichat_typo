export default function HeroSection({ onStart }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-5xl font-bold">Psalm AI ✨</h1>

      <p className="text-gray-400 mt-2">
        Ask anything. Get instant answers.
      </p>

      <button
        onClick={onStart}
        className="mt-6 bg-primary px-6 py-3 rounded-xl hover:scale-105 transition"
      >
        Start Chat
      </button>
    </div>
  );
}