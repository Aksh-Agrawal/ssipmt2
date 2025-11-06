import FloatingAdminChatButton from '../components/FloatingAdminChatButton';

export default function AdminLayout({
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
