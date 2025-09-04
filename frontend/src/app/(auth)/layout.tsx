import React from 'react';

/**
 * This is a nested layout for the (auth) route group.
 * It does NOT contain <html> or <body> tags, as it inherits them from the root layout.
 * It can be used to wrap all pages in this group (e.g., login, register) with shared UI.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
    }}>
      {children}
    </div>
  );
}
