import { useEffect, useState } from 'react';
import { Table, Tag, Button, Space, Card, Statistic, Row, Col, Input, Tooltip } from 'antd';
import { WarningOutlined, FileExcelOutlined, SearchOutlined } from '@ant-design/icons';
import { request } from '@/request';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { selectCompanySettings } from '@/redux/settings/selectors';
import { useSelector } from 'react-redux';
import waIcon from '@/style/images/whatsapp.svg';

function whatsappAc({ telefon, musteriAdi, kalanTutar, vadeTarihi, firmaAdi }) {
  if (!telefon) return;
  let numara = telefon.replace(/[\s\-().+]/g, '');
  if (numara.startsWith('0')) numara = '90' + numara.slice(1);
  else if (!numara.startsWith('90')) numara = '90' + numara;

  const mesaj =
    `Sayın ${musteriAdi}, ` +
    `${dayjs(vadeTarihi).format('DD.MM.YYYY')} vadeli ` +
    `${kalanTutar} tutarındaki borcunuzun ödeme tarihi geçmiş bulunmaktadır. ` +
    `Lütfen en kısa sürede ödemenizi yapmanızı rica ederiz. ` +
    `Saygılarımızla, ${firmaAdi}`;

  window.open(`https://wa.me/${numara}?text=${encodeURIComponent(mesaj)}`, '_blank');
}

function formatTutar(tutar) {
  if (tutar === undefined || tutar === null) return '-';
  return '₺' + Number(tutar).toLocaleString('tr-TR', { minimumFractionDigits: 2 });
}

function gecenGun(tarih) {
  return dayjs().diff(dayjs(tarih), 'day');
}

function gecikmeRenk(gun) {
  if (gun > 90) return 'red';
  if (gun > 30) return 'orange';
  return 'gold';
}

export default function Gecikenler() {
  const [liste, setListe] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [arama, setArama] = useState('');
  const companySettings = useSelector(selectCompanySettings);
  const firmaAdi = companySettings?.company_name || 'Kuyumcu';

  const listeGetir = async () => {
    setYukleniyor(true);
    const sonuc = await request.list({ entity: 'cari' });
    if (sonuc?.success) {
      const bugun = dayjs();
      const gecikenler = (sonuc.result || []).filter(
        (k) =>
          k.durum !== 'kapali' &&
          k.vadeTarihi &&
          dayjs(k.vadeTarihi).isBefore(bugun, 'day')
      );
      gecikenler.sort((a, b) => dayjs(a.vadeTarihi).diff(dayjs(b.vadeTarihi)));
      setListe(gecikenler);
    }
    setYukleniyor(false);
  };

  useEffect(() => {
    listeGetir();
  }, []);

  const filtrelenmis = liste.filter((k) => {
    if (!arama) return true;
    const ad = k.musteri?.name?.toLowerCase() || '';
    return ad.includes(arama.toLowerCase());
  });

  const toplamKalan = filtrelenmis.reduce((t, k) => t + (k.kalanTutar || 0), 0);
  const kritik = filtrelenmis.filter((k) => gecenGun(k.vadeTarihi) > 90).length;

  const excelIndir = () => {
    const veri = filtrelenmis.map((k) => ({
      'Müşteri': k.musteri?.name || '-',
      'Telefon': k.musteri?.phone || '-',
      'Tutar': k.tutar,
      'Kalan': k.kalanTutar,
      'Vade Tarihi': k.vadeTarihi ? dayjs(k.vadeTarihi).format('DD.MM.YYYY') : '-',
      'Geciken Gün': gecenGun(k.vadeTarihi),
      'Durum': k.durum === 'kismi_odendi' ? 'Kısmi Ödendi' : 'Açık',
      'Ürün': k.urunTipi || '-',
      'Açıklama': k.aciklama || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(veri);
    ws['!cols'] = [
      { wch: 22 }, { wch: 16 }, { wch: 14 }, { wch: 14 },
      { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 28 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Gecikenler');
    XLSX.writeFile(wb, `gecikenler-${dayjs().format('YYYY-MM-DD')}.xlsx`);
  };

  const kolonlar = [
    {
      title: 'Müşteri',
      dataIndex: 'musteri',
      render: (v) => <strong>{v?.name || '-'}</strong>,
    },
    {
      title: 'Telefon',
      dataIndex: 'musteri',
      key: 'telefon',
      render: (v) => v?.phone || '-',
    },
    {
      title: 'Kalan Borç',
      dataIndex: 'kalanTutar',
      render: (v) => (
        <span style={{ color: '#cf1322', fontWeight: 'bold' }}>{formatTutar(v)}</span>
      ),
      sorter: (a, b) => (a.kalanTutar || 0) - (b.kalanTutar || 0),
    },
    {
      title: 'Vade Tarihi',
      dataIndex: 'vadeTarihi',
      render: (v) => (
        <span style={{ color: '#cf1322' }}>
          {v ? dayjs(v).format('DD.MM.YYYY') : '-'}
        </span>
      ),
    },
    {
      title: 'Geciken Gün',
      dataIndex: 'vadeTarihi',
      key: 'gecikme',
      render: (v) => {
        const gun = gecenGun(v);
        return (
          <Tag color={gecikmeRenk(gun)} style={{ fontWeight: 'bold' }}>
            {gun} gün
          </Tag>
        );
      },
      sorter: (a, b) => gecenGun(b.vadeTarihi) - gecenGun(a.vadeTarihi),
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Durum',
      dataIndex: 'durum',
      render: (v) => (
        <Tag color={v === 'kismi_odendi' ? 'orange' : 'red'}>
          {v === 'kismi_odendi' ? 'Kısmi Ödendi' : 'Açık'}
        </Tag>
      ),
    },
    {
      title: 'Ürün',
      dataIndex: 'urunTipi',
      render: (v) => v || '-',
    },
    {
      title: 'İşlemler',
      key: 'wp',
      render: (_, kayit) => {
        const telefon = kayit.musteri?.phone;
        return (
          <Tooltip title={telefon ? 'WhatsApp hatırlatma gönder' : 'Telefon numarası yok'}>
            <img
              src={waIcon}
              alt="WhatsApp"
              onClick={() =>
                telefon &&
                whatsappAc({
                  telefon,
                  musteriAdi: kayit.musteri?.name,
                  kalanTutar: formatTutar(kayit.kalanTutar),
                  vadeTarihi: kayit.vadeTarihi,
                  firmaAdi,
                })
              }
              style={{
                width: 32,
                height: 32,
                cursor: telefon ? 'pointer' : 'not-allowed',
                opacity: telefon ? 1 : 0.4,
                flexShrink: 0,
                display: 'block',
              }}
            />
          </Tooltip>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0 }}>
          <WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />
          Geciken Ödemeler Raporu
        </h2>
        <Button
          icon={<FileExcelOutlined />}
          onClick={excelIndir}
          style={{ color: '#217346', borderColor: '#217346' }}
          disabled={filtrelenmis.length === 0}
        >
          Excel İndir
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Toplam Geciken Kayıt"
              value={filtrelenmis.length}
              valueStyle={{ color: '#cf1322' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Toplam Geciken Alacak"
              value={toplamKalan}
              precision={2}
              suffix="₺"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Kritik (90+ Gün)"
              value={kritik}
              valueStyle={{ color: kritik > 0 ? '#ff4d4f' : '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Müşteri adına göre ara..."
          prefix={<SearchOutlined />}
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          style={{ maxWidth: 320 }}
          allowClear
        />
      </div>

      <Table
        columns={kolonlar}
        dataSource={filtrelenmis}
        rowKey="_id"
        loading={yukleniyor}
        pagination={{ pageSize: 15 }}
        scroll={{ x: true }}
        locale={{ emptyText: '✅ Geciken ödeme yok' }}
        rowClassName={(record) =>
          gecenGun(record.vadeTarihi) > 90 ? 'geciken-kritik' : ''
        }
        style={{ background: '#fff' }}
      />

      <style>{`
        .geciken-kritik td { background: #fff2f0 !important; }
      `}</style>
    </div>
  );
}
