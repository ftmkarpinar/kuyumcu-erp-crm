import dayjs from 'dayjs';

export function ekstreYazdir({ musteri, cariKayitlar }) {
  const bugun = dayjs().format('DD.MM.YYYY');

  let toplamAlacak = 0;
  let toplamVerecek = 0;
  cariKayitlar.forEach((k) => {
    if (k.durum === 'kapali') return;
    if (k.islemTipi === 'alacak') toplamAlacak += k.kalanTutar || 0;
    else toplamVerecek += k.kalanTutar || 0;
  });

  const formatTutar = (t) =>
    '₺' + Number(t).toLocaleString('tr-TR', { minimumFractionDigits: 2 });

  const durumYazi = { acik: 'Açık', kismi_odendi: 'Kısmi Ödendi', kapali: 'Kapalı' };
  const islemTipiYazi = { alacak: 'Alacak', verecek: 'Verecek' };

  const satirlar = cariKayitlar
    .map(
      (k) => `
      <tr>
        <td>${k.islemTarihi ? dayjs(k.islemTarihi).format('DD.MM.YYYY') : '-'}</td>
        <td>${islemTipiYazi[k.islemTipi] || '-'}</td>
        <td>${formatTutar(k.tutar)}</td>
        <td>${formatTutar(k.odemeTutari || 0)}</td>
        <td>${formatTutar(k.kalanTutar || 0)}</td>
        <td>${k.vadeTarihi ? dayjs(k.vadeTarihi).format('DD.MM.YYYY') : '-'}</td>
        <td>${durumYazi[k.durum] || '-'}</td>
        <td>${k.aciklama || '-'}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8" />
      <title>Müşteri Ekstresi - ${musteri.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 12px; color: #222; padding: 32px; }
        .baslik { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #222; padding-bottom: 12px; }
        .baslik h1 { font-size: 20px; letter-spacing: 2px; }
        .baslik p { font-size: 11px; color: #666; margin-top: 4px; }
        .musteri-bilgi { display: flex; gap: 32px; margin-bottom: 20px; padding: 12px; background: #f9f9f9; border-radius: 6px; }
        .musteri-bilgi div { flex: 1; }
        .musteri-bilgi .etiket { color: #888; font-size: 11px; }
        .musteri-bilgi .deger { font-weight: bold; font-size: 13px; }
        .ozet { display: flex; gap: 16px; margin-bottom: 20px; }
        .ozet-kart { flex: 1; text-align: center; padding: 12px; border-radius: 6px; }
        .ozet-kart.alacak { background: #fff1f0; border: 1px solid #ffa39e; }
        .ozet-kart.verecek { background: #f6ffed; border: 1px solid #b7eb8f; }
        .ozet-kart .miktar { font-size: 20px; font-weight: bold; }
        .ozet-kart .etiket { font-size: 11px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th { background: #f0f0f0; padding: 8px; text-align: left; font-size: 11px; border: 1px solid #ddd; }
        td { padding: 7px 8px; border: 1px solid #eee; font-size: 11px; }
        tr:nth-child(even) { background: #fafafa; }
        .altbilgi { margin-top: 24px; text-align: center; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 10px; }
        @media print { body { padding: 16px; } }
      </style>
    </head>
    <body>
      <div class="baslik">
        <h1>MÜŞTERİ EKSTRESİ</h1>
        <p>Rapor Tarihi: ${bugun}</p>
      </div>

      <div class="musteri-bilgi">
        <div>
          <div class="etiket">Ad Soyad</div>
          <div class="deger">${musteri.name || '-'}</div>
        </div>
        <div>
          <div class="etiket">Telefon</div>
          <div class="deger">${musteri.phone || '-'}</div>
        </div>
        <div>
          <div class="etiket">TC Kimlik</div>
          <div class="deger">${musteri.tcKimlik || '-'}</div>
        </div>
        <div>
          <div class="etiket">Adres</div>
          <div class="deger">${musteri.address || '-'}</div>
        </div>
      </div>

      <div class="ozet">
        <div class="ozet-kart alacak">
          <div class="etiket">TOPLAM ALACAK</div>
          <div class="miktar" style="color:#cf1322">${formatTutar(toplamAlacak)}</div>
        </div>
        <div class="ozet-kart verecek">
          <div class="etiket">TOPLAM VERECEK</div>
          <div class="miktar" style="color:#389e0d">${formatTutar(toplamVerecek)}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>İşlem Tarihi</th>
            <th>Tür</th>
            <th>Tutar</th>
            <th>Ödenen</th>
            <th>Kalan</th>
            <th>Vade Tarihi</th>
            <th>Durum</th>
            <th>Açıklama</th>
          </tr>
        </thead>
        <tbody>
          ${satirlar || '<tr><td colspan="8" style="text-align:center">Kayıt bulunamadı</td></tr>'}
        </tbody>
      </table>

      <div class="altbilgi">Bu ekstre bilgisayar ortamında düzenlenmiştir. • ${bugun}</div>

      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `;

  const pencere = window.open('', '_blank', 'width=900,height=800');
  if (!pencere) {
    alert(
      'Tarayıcı popup penceresini engelledi.\n\nLütfen tarayıcınızın adres çubuğundaki popup engelleme simgesine tıklayıp bu site için izin verin, ardından tekrar deneyin.'
    );
    return;
  }
  pencere.document.write(html);
  pencere.document.close();
}
