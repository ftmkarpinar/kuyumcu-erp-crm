import { useState } from 'react';
import { Button, Card, Typography, message, Alert } from 'antd';
import { DownloadOutlined, DatabaseOutlined } from '@ant-design/icons';
import { API_BASE_URL } from '@/config/serverApiConfig';
import axios from 'axios';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;

function getAuthHeader() {
  const auth = JSON.parse(localStorage.getItem('auth') || '{}');
  return { Authorization: `Bearer ${auth?.current?.token || ''}` };
}

export default function YedekSettings() {
  const [yukleniyor, setYukleniyor] = useState(false);

  const yedekIndir = async () => {
    setYukleniyor(true);
    try {
      const res = await axios.get(API_BASE_URL + 'yedek/indir', {
        headers: getAuthHeader(),
      });

      if (res.data?.success) {
        const { musteriler, cariKayitlar, tahsilatlar } = res.data.result;
        const wb = XLSX.utils.book_new();

        // Müşteriler sayfası
        const musteriVerisi = musteriler.map((m) => ({
          'Ad Soyad': m.name || '',
          'Telefon': m.phone || '',
          'TC Kimlik': m.tcKimlik || '',
          'Adres': m.address || '',
          'E-posta': m.email || '',
          'Etiket': m.etiket || '',
          'Risk Skoru': m.riskSkoru ?? '',
          'Not': m.not || '',
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(musteriVerisi), 'Müşteriler');

        // Cari İşlemler sayfası
        const durumYazi = { acik: 'Açık', kismi_odendi: 'Kısmi Ödendi', kapali: 'Kapalı' };
        const cariVerisi = cariKayitlar.map((k) => ({
          'Müşteri': k.musteri?.name || '',
          'İşlem Tipi': k.islemTipi === 'alacak' ? 'Alacak' : 'Verecek',
          'Tutar (₺)': k.tutar || 0,
          'Ödenen (₺)': k.odemeTutari || 0,
          'Kalan (₺)': k.kalanTutar || 0,
          'İşlem Tarihi': k.islemTarihi ? dayjs(k.islemTarihi).format('DD.MM.YYYY') : '',
          'Vade Tarihi': k.vadeTarihi ? dayjs(k.vadeTarihi).format('DD.MM.YYYY') : '',
          'Açıklama': k.aciklama || '',
          'Durum': durumYazi[k.durum] || '',
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(cariVerisi), 'Cari İşlemler');

        // Tahsilatlar sayfası
        const tahsilatVerisi = tahsilatlar.map((t) => ({
          'Müşteri': t.musteri?.name || '',
          'Tutar (₺)': t.tutar || 0,
          'Tarih': t.tarih ? dayjs(t.tarih).format('DD.MM.YYYY') : '',
          'Açıklama': t.aciklama || '',
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tahsilatVerisi), 'Tahsilatlar');

        XLSX.writeFile(wb, `Yedek_${dayjs().format('YYYY-MM-DD')}.xlsx`);
        message.success('Yedek Excel olarak indirildi');
      }
    } catch {
      message.error('Yedek alınamadı');
    }
    setYukleniyor(false);
  };

  return (
    <div style={{ maxWidth: 600, padding: 24 }}>
      <Title level={4}>
        <DatabaseOutlined style={{ marginRight: 8 }} />
        Manuel Yedekleme
      </Title>

      <Alert
        message="Yedek hakkında"
        description="Tüm müşteri, cari işlem ve tahsilat verileri Excel dosyasına kaydedilir. 3 ayrı sekme halinde düzenlenmiş olarak gelir. Bu dosyayı güvenli bir yerde saklayın."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card>
        <Text>Aşağıdaki butona tıklayarak tüm veritabanının yedeğini bilgisayarınıza indirebilirsiniz.</Text>
        <br /><br />
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          loading={yukleniyor}
          onClick={yedekIndir}
          size="large"
        >
          Yedeği İndir
        </Button>
      </Card>
    </div>
  );
}
