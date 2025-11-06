import FloatingAdminChatButton from '../components/FloatingAdminChatButton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <FloatingAdminChatButton />
    </>
  );
}
