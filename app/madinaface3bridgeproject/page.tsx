'use client';

export default function MadinaFace3BridgeProject() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364l-1.414 1.414M21 12h-2m0 0h-2m2 0v2m0-2V10M3.636 4.636l1.414 1.414M3 12h2m0 0h2m-2 0v2m0-2V10m9-6V2m0 2v2m0-2h2m-2 0H10" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Project Deactivated
          </h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            The Madina Face 3 Community Bridge Project donation page is currently not active. Thank you to everyone who supported this initiative.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}
