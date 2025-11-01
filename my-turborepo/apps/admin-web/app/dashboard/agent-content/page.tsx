import { createClient } from '../../../lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '../LogoutButton'
import DashboardNav from '../DashboardNav'
import KnowledgeArticlesList from './KnowledgeArticlesList'

export default async function AgentContentPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      <DashboardNav />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <KnowledgeArticlesList />
        </div>
      </div>
    </div>
  )
}
