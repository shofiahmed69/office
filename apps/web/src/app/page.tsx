export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">
          Welcome to <span className="text-blue-600">ScholarPass</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          AI-Powered Personalized Learning Platform
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Get Started
          </a>
          <a
            href="/docs"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Documentation
          </a>
        </div>
      </div>
    </main>
  )
}
