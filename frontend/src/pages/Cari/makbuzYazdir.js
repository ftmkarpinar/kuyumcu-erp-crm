import dayjs from 'dayjs';
import { BASE_URL } from '@/config/serverApiConfig';

function firmaGetir() {
  try {
    const s = JSON.parse(localStorage.getItem('settings') || '{}');
    return s?.company_settings || {};
  } catch { return {}; }
}

function formatTL(tutar) {
  return '₺' + Number(tutar || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 });
}

function _pencereAc(html) {
  const pencere = window.open('', '_blank', 'width=680,height=920,scrollbars=yes');
  if (!pencere) {
    alert('Tarayıcı popup\'ı engelledi. Adres çubuğundaki izin simgesine tıklayıp izin verin.');
    return;
  }
  pencere.document.write(html);
  pencere.document.close();
}

function firmaBaslikHtml(firma) {
  const firmaAdi = firma.company_name || 'Kuyumcu';
  const logoUrl = firma.company_logo ? BASE_URL + firma.company_logo : null;
  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;margin-bottom:8px;" />`
    : '';
  const tel = firma.company_phone ? `Tel: ${firma.company_phone}` : '';
  const adres = firma.company_address ? ` &bull; ${firma.company_address}` : '';
  return `
    <div class="firma-baslik">
      ${logoHtml}
      <div class="firma-adi">${firmaAdi}</div>
      <div class="firma-alt">${tel}${adres}</div>
    </div>`;
}

const ortak_stil = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#1a1a1a}
  .sayfa{max-width:520px;margin:0 auto;padding:32px 28px}
  .firma-baslik{text-align:center;padding-bottom:16px;border-bottom:2px solid #1a1a1a;margin-bottom:20px}
  .firma-baslik .firma-adi{font-size:20px;font-weight:700;letter-spacing:1px}
  .firma-baslik .firma-alt{font-size:11px;color:#666;margin-top:4px}
  .belge-baslik{text-align:center;margin:16px 0;padding:10px;background:#1a1a1a;color:#fff;border-radius:4px}
  .belge-baslik h2{font-size:16px;letter-spacing:2px;font-weight:700}
  .belge-baslik p{font-size:11px;opacity:.7;margin-top:2px}
  .bolum{margin-bottom:18px}
  .bolum h3{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #eee}
  .satir{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #f5f5f5}
  .satir:last-child{border-bottom:none}
  .satir .etiket{color:#555;font-size:12px}
  .satir .deger{font-weight:600;text-align:right}
  .tutar-kutu{text-align:center;margin:20px 0;padding:18px;border:2px solid #1a1a1a;border-radius:8px}
  .tutar-kutu .etiket{font-size:11px;color:#666;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px}
  .tutar-kutu .miktar{font-size:36px;font-weight:800;letter-spacing:-1px}
  .tip-badge{display:inline-block;padding:4px 14px;border-radius:20px;font-weight:700;font-size:12px;margin:10px auto;letter-spacing:.5px}
  .tip-alacak{background:#fff0f0;color:#c00;border:1px solid #ffccc7}
  .tip-verecek{background:#f0fff0;color:#1a6a1a;border:1px solid #b7eb8f}
  .imzalar{display:flex;justify-content:space-between;margin-top:48px;gap:20px}
  .imza-alan{flex:1;text-align:center}
  .imza-cizgi{border-top:1px solid #999;width:120px;margin:0 auto 6px}
  .imza-etiket{font-size:11px;color:#666}
  .altbilgi{margin-top:28px;text-align:center;font-size:10px;color:#bbb;padding-top:12px;border-top:1px solid #eee}
  @media print{.sayfa{padding:16px}.imzalar{margin-top:64px}}
`;

// ── TAHSİLAT MAKBUZU ────────────────────────────────────────────────────────
export function makbuzYazdir({ tahsilat, cari, musteri }) {
  const firma = firmaGetir();
  const firmaAdi = firma.company_name || 'Kuyumcu';
  const tarih = dayjs(tahsilat.tarih || new Date()).format('DD.MM.YYYY HH:mm');
  const musteriAd = musteri?.name || cari?.musteri?.name || '';
  const musteriTel = musteri?.phone || cari?.musteri?.phone || '';

  const html = `<!DOCTYPE html>
<html lang="tr"><head><meta charset="UTF-8"/>
<title>Tahsilat Makbuzu</title>
<style>${ortak_stil}</style></head>
<body><div class="sayfa">
  ${firmaBaslikHtml(firma)}
  <div class="belge-baslik"><h2>TAHSİLAT MAKBUZU</h2><p>${tarih}</p></div>

  <div class="bolum">
    <h3>Müşteri Bilgileri</h3>
    <div class="satir"><span class="etiket">Ad Soyad</span><span class="deger">${musteriAd}</span></div>
    ${musteriTel ? `<div class="satir"><span class="etiket">Telefon</span><span class="deger">${musteriTel}</span></div>` : ''}
  </div>

  <div class="bolum">
    <h3>Borç Özeti</h3>
    <div class="satir"><span class="etiket">Toplam Borç</span><span class="deger">${formatTL(cari.tutar)}</span></div>
    <div class="satir"><span class="etiket">Bu Tahsilat</span><span class="deger" style="color:#1a6a1a">${formatTL(tahsilat.tutar)}</span></div>
    <div class="satir"><span class="etiket">Kalan Borç</span><span class="deger" style="color:${cari.kalanTutar > 0 ? '#c00' : '#1a6a1a'}">${formatTL(cari.kalanTutar)}</span></div>
    ${tahsilat.aciklama ? `<div class="satir"><span class="etiket">Açıklama</span><span class="deger">${tahsilat.aciklama}</span></div>` : ''}
  </div>

  <div class="tutar-kutu">
    <div class="etiket">Tahsil Edilen Tutar</div>
    <div class="miktar" style="color:#1a6a1a">${formatTL(tahsilat.tutar)}</div>
  </div>

  <div class="imzalar">
    <div class="imza-alan"><div class="imza-cizgi"></div><div class="imza-etiket">Müşteri İmzası</div></div>
    <div class="imza-alan"><div class="imza-cizgi"></div><div class="imza-etiket">Yetkili İmzası</div></div>
  </div>
  <div class="altbilgi">Bu belge bilgisayar ortamında düzenlenmiştir. • ${firmaAdi}</div>
</div>
<script>window.onload=function(){window.print()}</script>
</body></html>`;

  _pencereAc(html);
}

// ── CARİ İŞLEM FİŞİ ─────────────────────────────────────────────────────────
export function cariFisiYazdir(kayit) {
  const firma = firmaGetir();
  const firmaAdi = firma.company_name || 'Kuyumcu';
  const musteriAd = kayit.musteri?.name || '';
  const musteriTel = kayit.musteri?.phone || '';
  const islemTarihi = kayit.islemTarihi ? dayjs(kayit.islemTarihi).format('DD.MM.YYYY') : dayjs().format('DD.MM.YYYY');
  const vadeTarihi = kayit.vadeTarihi ? dayjs(kayit.vadeTarihi).format('DD.MM.YYYY') : '-';
  const islemTipiYazi = kayit.islemTipi === 'alacak' ? 'ALACAK — Müşteri Borçlu' : 'VERECEK — Biz Borçluyuz';
  const urunTipiMap = { ceyrek: 'Çeyrek Altın', yarim: 'Yarım Altın', tam: 'Tam Altın', gram: 'Gram Altın', diger: 'Diğer' };
  const urunTipi = urunTipiMap[kayit.urunTipi] || '';

  const html = `<!DOCTYPE html>
<html lang="tr"><head><meta charset="UTF-8"/>
<title>Cari İşlem Fişi</title>
<style>${ortak_stil}</style></head>
<body><div class="sayfa">
  ${firmaBaslikHtml(firma)}
  <div class="belge-baslik"><h2>CARİ İŞLEM FİŞİ</h2><p>Tarih: ${islemTarihi}</p></div>

  <div style="text-align:center;margin:10px 0">
    <span class="tip-badge ${kayit.islemTipi === 'alacak' ? 'tip-alacak' : 'tip-verecek'}">${islemTipiYazi}</span>
  </div>

  <div class="bolum">
    <h3>Müşteri Bilgileri</h3>
    <div class="satir"><span class="etiket">Ad Soyad</span><span class="deger">${musteriAd}</span></div>
    ${musteriTel ? `<div class="satir"><span class="etiket">Telefon</span><span class="deger">${musteriTel}</span></div>` : ''}
  </div>

  <div class="bolum">
    <h3>İşlem Detayı</h3>
    <div class="satir"><span class="etiket">İşlem Tarihi</span><span class="deger">${islemTarihi}</span></div>
    <div class="satir"><span class="etiket">Vade Tarihi</span><span class="deger">${vadeTarihi}</span></div>
    ${urunTipi ? `<div class="satir"><span class="etiket">Ürün / Altın Tipi</span><span class="deger">${urunTipi}${kayit.urunTipiAciklama ? ' — ' + kayit.urunTipiAciklama : ''}</span></div>` : ''}
    ${kayit.gramMiktari > 0 ? `<div class="satir"><span class="etiket">Gram Miktarı</span><span class="deger">${kayit.gramMiktari} gr</span></div>` : ''}
    <div class="satir"><span class="etiket">Ödenen</span><span class="deger" style="color:#1a6a1a">${formatTL(kayit.odemeTutari)}</span></div>
    <div class="satir"><span class="etiket">Kalan</span><span class="deger" style="color:${kayit.kalanTutar > 0 ? '#c00' : '#1a6a1a'}">${formatTL(kayit.kalanTutar)}</span></div>
    ${kayit.aciklama ? `<div class="satir"><span class="etiket">Açıklama</span><span class="deger">${kayit.aciklama}</span></div>` : ''}
  </div>

  <div class="tutar-kutu">
    <div class="etiket">İşlem Tutarı</div>
    <div class="miktar" style="color:${kayit.islemTipi === 'alacak' ? '#c00' : '#1a6a1a'}">${formatTL(kayit.tutar)}</div>
  </div>

  <div class="imzalar">
    <div class="imza-alan"><div class="imza-cizgi"></div><div class="imza-etiket">Müşteri İmzası</div></div>
    <div class="imza-alan"><div class="imza-cizgi"></div><div class="imza-etiket">Yetkili İmzası</div></div>
  </div>
  <div class="altbilgi">Bu belge bilgisayar ortamında düzenlenmiştir. • ${firmaAdi}</div>
</div>
<script>window.onload=function(){window.print()}</script>
</body></html>`;

  _pencereAc(html);
}
