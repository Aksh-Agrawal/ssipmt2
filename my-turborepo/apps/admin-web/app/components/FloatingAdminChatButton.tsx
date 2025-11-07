'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function FloatingAdminChatButton() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  // Hide on the assistant page itself
  if (pathname === '/dashboard/assistant' || pathname === '/admin/assistant') {
    return null;
  }

  return (
    <>
      <style jsx>{`
        @keyframes pulse-admin {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(79, 70, 229, 0);
          }
        }
        .pulse-admin {
          animation: pulse-admin 2s infinite;
        }
      `}</style>

      <Link
        href="/admin/assistant"
        className="pulse-admin"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(79, 70, 229, 0.4)',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        }}
        title="AI Traffic Assistant"
      >
        <div style={{ fontSize: '32px', lineHeight: 1 }}>
          🤖
        </div>
      </Link>

      {/* Tooltip */}
      {isHovered && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '24px',
            backgroundColor: '#1F2937',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: 1001,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          AI Traffic Assistant - Click for insights 👮
        </div>
      )}
    </>
  );
}
