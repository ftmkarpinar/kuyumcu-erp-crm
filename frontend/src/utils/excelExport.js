import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

const etiketDonustur = { 'düzenli': 'duzenli', 'riskli': 'riskli', 'toptancı': 'toptanci', 'toptanci': 'toptanci', 'vip': 'vip' };

export function musteriExcelSablonIndir() {
  const ornek = [
    {
      'Ad Soyad': 'Ahmet Yılmaz',
      'Telefon': '05321234567',
      'TC Kimlik No': '12345678901',
      'Adres': 'Örnek Mahallesi, İstanbul',
      'E-posta': 'ahmet@ornek.com',
      'Etiket': 'Düzenli',
      'Risk Skoru': 20,
      'Not': '',
    },
  ];
  const ws = XLSX.utils.json_to_sheet(ornek);
  ws['!cols'] = [
    { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 25 },
    { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 30 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Müşteriler');
  XLSX.writeFile(wb, 'Musteri_Import_Sablonu.xlsx');
}

export function musteriExcelOku(dosya) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];

        // Başlıklı mı (şablon) yoksa başlıksız mı (ham liste)?
        const ilkSatir = XLSX.utils.sheet_to_json(ws, { defval: '', header: 1 })[0] || [];
        const baslikliMi = ilkSatir.some(h => typeof h === 'string' && h.trim() === 'Ad Soyad');

        let musteriler;

        if (baslikliMi) {
          // Şablon formatı — başlık adlarıyla oku
          const satirlar = XLSX.utils.sheet_to_json(ws, { defval: '' });
          musteriler = satirlar.map((satir, index) => {
            const ad = (satir['Ad Soyad'] || '').toString().trim();
            if (!ad) return null;
            const etiketHam = (satir['Etiket'] || '').toString().toLowerCase().trim();
            return {
              _onizlemeKey: index,
              name: ad,
              phone: (satir['Telefon'] || '').toString().trim(),
              tcKimlik: (satir['TC Kimlik No'] || '').toString().trim(),
              address: (satir['Adres'] || '').toString().trim(),
              email: (satir['E-posta'] || '').toString().trim(),
              etiket: etiketDonustur[etiketHam] || undefined,
              riskSkoru: satir['Risk Skoru'] !== '' ? Number(satir['Risk Skoru']) || undefined : undefined,
              not: (satir['Not'] || '').toString().trim(),
            };
          }).filter(Boolean);
        } else {
          // Ham liste — kolonları sırayla oku: A=Ad, B=Telefon, C=TC, D=Adres, E=Email, F=Etiket
          const tumSatirlar = XLSX.utils.sheet_to_json(ws, { defval: '', header: 1 });
          musteriler = tumSatirlar.map((satir, index) => {
            const ad = (satir[0] || '').toString().trim();
            if (!ad) return null;
            const etiketHam = (satir[5] || '').toString().toLowerCase().trim();
            return {
              _onizlemeKey: index,
              name: ad,
              phone: (satir[1] || '').toString().trim(),
              tcKimlik: (satir[2] || '').toString().trim(),
              address: (satir[3] || '').toString().trim(),
              email: (satir[4] || '').toString().trim(),
              etiket: etiketDonustur[etiketHam] || undefined,
              riskSkoru: satir[6] !== '' ? Number(satir[6]) || undefined : undefined,
              not: (satir[7] || '').toString().trim(),
            };
          }).filter(Boolean);
        }

        if (musteriler.length === 0) {
          reject(new Error('Dosyada geçerli müşteri bulunamadı. A kolonunda isim dolu olmalı.'));
          return;
        }
        resolve(musteriler);
      } catch {
        reject(new Error('Excel dosyası okunamadı'));
      }
    };
    reader.onerror = () => reject(new Error('Dosya okunamadı'));
    reader.readAsArrayBuffer(dosya);
  });
}

export function musteriExcelIndir(musteriler) {
  const etiketYazi = { duzenli: 'Düzenli', riskli: 'Riskli', toptanci: 'Toptancı', vip: 'VIP' };

  const veri = musteriler.map((m) => ({
    'Ad Soyad': m.name || '',
    'Telefon': m.phone || '',
    'TC Kimlik No': m.tcKimlik || '',
    'Adres': m.address || '',
    'E-posta': m.email || '',
    'Etiket': etiketYazi[m.etiket] || '',
    'Risk Skoru': m.riskSkoru ?? '',
    'Not': m.not || '',
  }));

  const ws = XLSX.utils.json_to_sheet(veri);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Müşteriler');

  // Kolon genişlikleri
  ws['!cols'] = [
    { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 25 },
    { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 30 },
  ];

  XLSX.writeFile(wb, `Musteriler_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}

export function cariExcelIndir(cariKayitlar) {
  const islemTipiYazi = { alacak: 'Alacak', verecek: 'Verecek' };
  const durumYazi = { acik: 'Açık', kismi_odendi: 'Kısmi Ödendi', kapali: 'Kapalı' };
  const urunTipiYazi = { ceyrek: 'Çeyrek Altın', yarim: 'Yarım Altın', tam: 'Tam Altın', gram: 'Gram Altın', diger: 'Diğer' };

  const veri = cariKayitlar.map((k) => ({
    'Müşteri': k.musteri?.name || '',
    'Telefon': k.musteri?.phone || '',
    'İşlem Tipi': islemTipiYazi[k.islemTipi] || '',
    'Tutar (₺)': k.tutar || 0,
    'Ödenen (₺)': k.odemeTutari || 0,
    'Kalan (₺)': k.kalanTutar || 0,
    'İşlem Tarihi': k.islemTarihi ? dayjs(k.islemTarihi).format('DD.MM.YYYY') : '',
    'Vade Tarihi': k.vadeTarihi ? dayjs(k.vadeTarihi).format('DD.MM.YYYY') : '',
    'Ürün Tipi': urunTipiYazi[k.urunTipi] || '',
    'Gram': k.gramMiktari || '',
    'Açıklama': k.aciklama || '',
    'Durum': durumYazi[k.durum] || '',
  }));

  const ws = XLSX.utils.json_to_sheet(veri);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Cari İşlemler');

  ws['!cols'] = [
    { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
    { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 14 },
    { wch: 14 }, { wch: 8 }, { wch: 25 }, { wch: 14 },
  ];

  XLSX.writeFile(wb, `CariIslemler_${dayjs().format('YYYY-MM-DD')}.xlsx`);
}
