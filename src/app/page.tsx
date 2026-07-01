export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">ATS Open Source</h1>
        <p className="text-gray-500 mb-8">Applicant Tracking System — 100% open source</p>
        <a
          href="/dashboard"
          className="bg-teal-700 text-white px-6 py-3 rounded-lg hover:bg-teal-800 transition"
        >
          Acessar Dashboard
        </a>
      </div>
    </main>
  )
}
