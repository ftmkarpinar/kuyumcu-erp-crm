import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCompanySettings } from '@/redux/settings/selectors';
import { BASE_URL } from '@/config/serverApiConfig';

export default function SideContent() {
  // Redux store'dan oku
  const company = useSelector(selectCompanySettings) || {};

  // Redux henüz dolmadıysa localStorage'a bak (fallback)
  const localCompany = (() => {
    try {
      const s = JSON.parse(localStorage.getItem('settings') || '{}');
      return s?.company_settings || {};
    } catch { return {}; }
  })();

  const firmaAdi = company.company_name || localCompany.company_name || 'Kuyumcu Takip Sistemi';
  const logoPath = company.company_logo || localCompany.company_logo;
  const cacheKey = company._id || localCompany._id || '';
  const firmaLogo = logoPath ? BASE_URL + logoPath + '?t=' + cacheKey : null;

  // Giriş sayfasında da doğru title ve favicon göster
  useEffect(() => {
    if (firmaAdi && firmaAdi !== 'Kuyumcu Takip Sistemi') {
      document.title = firmaAdi + ' | Kuyumcu Takip';
    }

    if (firmaLogo) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.arc(64, 64, 64, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 0, 0, 128, 128);
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = canvas.toDataURL('image/png');
      };
      img.src = firmaLogo;
    }
  }, [firmaAdi, firmaLogo]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '60px 56px',
      position: 'relative',
      zIndex: 1,
      width: '100%',
      maxWidth: 480,
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 40 }}>
        {firmaLogo ? (
          <img
            src={firmaLogo}
            alt={firmaAdi}
            style={{
              width: 72, height: 72,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(212,137,14,0.4)',
              boxShadow: '0 0 24px rgba(212,137,14,0.2)',
            }}
          />
        ) : (
          <div style={{
            width: 72, height: 72,
            borderRadius: '50%',
            background: 'rgba(212,137,14,0.12)',
            border: '2px solid rgba(212,137,14,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28,
            boxShadow: '0 0 24px rgba(212,137,14,0.15)',
          }}>
            💎
          </div>
        )}
      </div>

      {/* Etiket */}
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: '#d4890e',
        marginBottom: 16,
      }}>
        Yönetim Paneli
      </div>

      {/* Firma Adı */}
      <h1 style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: 40,
        fontWeight: 700,
        color: 'rgba(255,255,255,0.92)',
        margin: '0 0 16px',
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
      }}>
        {firmaAdi}
      </h1>

      {/* Alt çizgi */}
      <div style={{
        width: 48,
        height: 2,
        background: 'linear-gradient(90deg, #d4890e, transparent)',
        marginBottom: 24,
      }} />

      {/* Açıklama */}
      <p style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 13,
        color: 'rgba(255,255,255,0.35)',
        margin: 0,
        lineHeight: 1.7,
      }}>
        Müşteri ve Cari Takip Sistemi
      </p>

    </div>
  );
}
