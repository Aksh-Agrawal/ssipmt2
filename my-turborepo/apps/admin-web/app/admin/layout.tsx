import AdminNavigation from '../components/AdminNavigation';
import FloatingAdminChatButton from '../components/FloatingAdminChatButton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminNavigation>
      {children}
      <FloatingAdminChatButton />
    </AdminNavigation>
  );
}
