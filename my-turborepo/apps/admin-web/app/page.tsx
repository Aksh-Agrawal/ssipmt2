import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export default async function Home() {
  // Check if user is authenticated
  const { userId } = await auth();
  
  if (userId) {
    // Redirect authenticated users to dashboard
    redirect('/admin/dashboard');
  } else {
    // Redirect unauthenticated users to login
    redirect('/login');
  }
}
