import React from 'react';
import { Layout } from 'antd';

export default function AuthLayout({ sideContent, children }) {
  return (
    <Layout style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'row',
    }}>
      {/* Sol panel */}
      <div style={{
        flex: 1,
        minHeight: '100vh',
        background: '#0a0a0a',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Dekoratif arka plan çizgileri */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'repeating-linear-gradient(0deg, #d4890e 0px, #d4890e 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #d4890e 0px, #d4890e 1px, transparent 1px, transparent 60px)',
          pointerEvents: 'none',
        }} />
        {/* Altın glow merkezi */}
        <div style={{
          position: 'absolute',
          width: 400, height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,137,14,0.08) 0%, transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }} />
        {sideContent}
      </div>

      {/* Sağ panel - form */}
      <div style={{
        flex: 1,
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: 420,
          background: '#141414',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8,
          padding: '48px 40px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}>
          {children}
        </div>
      </div>
    </Layout>
  );
}
