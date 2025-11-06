import { createClient } from '../../lib/supabase/server';
import { redirect } from 'next/navigation';
import dynamic from 'next/dynamic';
import LogoutButton from './LogoutButton';
import DashboardNav from './DashboardNav';

// Dynamically import ReportsList to reduce initial bundle size
const ReportsList = dynamic(() => import('./ReportsList'), {
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="ml-2 text-gray-600">Loading reports...</span>
    </div>
  ),
});

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user.email}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      <DashboardNav />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* AI Assistant Quick Access Card */}
          <div className="mb-6">
            <a
              href="/dashboard/assistant"
              className="block rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              }}
            >
              <div className="p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-5xl">🤖</div>
                    <div>
                      <h2 className="text-2xl font-bold mb-1">AI Traffic & Operations Assistant</h2>
                      <p className="text-indigo-100">
                        Get instant insights on traffic, reports, and SLA compliance
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium">
                      🚨 MVP Feature
                    </div>
                    <div className="text-sm text-indigo-100">
                      Click to start chatting →
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                    📊 Real-time Analytics
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                    🚦 Traffic Intelligence
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                    ⏰ SLA Tracking
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                    🎯 Resource Allocation
                  </span>
                </div>
              </div>
            </a>
          </div>

          <ReportsList />
        </div>
      </div>
    </div>
  );
}
