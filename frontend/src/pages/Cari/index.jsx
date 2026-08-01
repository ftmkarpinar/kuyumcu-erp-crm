import { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber,
  Select, DatePicker, Tag, Popconfirm, message, Space
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined, EyeOutlined, PrinterOutlined, FileExcelOutlined, SearchOutlined } from '@ant-design/icons';
import { request } from '@/request';
import dayjs from 'dayjs';
import { makbuzYazdir, cariFisiYazdir } from './makbuzYazdir';
import useRole from '@/hooks/useRole';
import { cariExcelIndir } from '@/utils/excelExport';

const { TextArea } = Input;
const { Option } = Select;

const islemTipiRenk = { alacak: 'red', verecek: 'green' };
const islemTipiYazi = { alacak: 'Alacak', verecek: 'Verecek' };
const durumRenk = { acik: 'red', kismi_odendi: 'orange', kapali: 'green' };
const durumYazi = { acik: 'Açık', kismi_odendi: 'Kısmi Ödendi', kapali: 'Kapalı' };

function formatTutar(tutar) {
  if (tutar === undefined || tutar === null) return '-';
  return '₺' + Number(tutar).toLocaleString('tr-TR', { minimumFractionDigits: 2 });
}

export default function Cari() {
  const { canEdit, canDelete } = useRole();
  const [liste, setListe] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [musteriler, setMusteriler] = useState([]);

  const [cariModalAcik, setCariModalAcik] = useState(false);
  const [duzenlenenKayit, setDuzenlenenKayit] = useState(null);
  const [cariForm] = Form.useForm();

  const [tahsilatModalAcik, setTahsilatModalAcik] = useState(false);
  const [seciliCari, setSeciliCari] = useState(null);
  const [tahsilatForm] = Form.useForm();

  const [goruntuleModalAcik, setGoruntuleModalAcik] = useState(false);
  const [goruntulenenKayit, setGoruntulenenKayit] = useState(null);
  const [arama, setArama] = useState('');

  const filtreliListe = liste.filter((k) => {
    const ara = arama.toLowerCase();
    return (
      k.musteri?.name?.toLowerCase().includes(ara) ||
      k.aciklama?.toLowerCase().includes(ara)
    );
  });

  const listeGetir = async () => {
    setYukleniyor(true);
    const sonuc = await request.list({ entity: 'cari' });
    if (sonuc?.success) setListe(sonuc.result || []);
    setYukleniyor(false);
  };

  const musterileriGetir = async () => {
    const sonuc = await request.listAll({ entity: 'client' });
    if (sonuc?.success) setMusteriler(sonuc.result || []);
  };

  useEffect(() => {
    listeGetir();
    musterileriGetir();
  }, []);

  const cariKaydet = async (degerler) => {
    const veri = {
      ...degerler,
      islemTarihi: degerler.islemTarihi?.toISOString(),
      vadeTarihi: degerler.vadeTarihi?.toISOString(),
    };
    let sonuc;
    if (duzenlenenKayit) {
      sonuc = await request.update({ entity: 'cari', id: duzenlenenKayit._id, jsonData: veri });
    } else {
      sonuc = await request.create({ entity: 'cari', jsonData: veri });
    }
    if (sonuc?.success) {
      message.success(duzenlenenKayit ? 'Kayıt güncellendi' : 'Kayıt eklendi');
      setCariModalAcik(false);
      setDuzenlenenKayit(null);
      cariForm.resetFields();
      listeGetir();
    } else {
      message.error('İşlem başarısız');
    }
  };

  const cariSil = async (id) => {
    const sonuc = await request.delete({ entity: 'cari', id });
    if (sonuc?.success) {
      message.success('Kayıt silindi');
      listeGetir();
    }
  };

  const [makbuzVerisi, setMakbuzVerisi] = useState(null);
  const [makbuzModalAcik, setMakbuzModalAcik] = useState(false);

  const tahsilatKaydet = async (degerler) => {
    const veri = {
      cari: seciliCari._id,
      musteri: seciliCari.musteri?._id || seciliCari.musteri,
      tutar: degerler.tutar,
      tarih: degerler.tarih?.toISOString() || new Date().toISOString(),
      aciklama: degerler.aciklama,
    };
    const sonuc = await request.create({ entity: 'tahsilat', jsonData: veri });
    if (sonuc?.success) {
      message.success('Tahsilat kaydedildi');
      setTahsilatModalAcik(false);
      tahsilatForm.resetFields();
      listeGetir();
      const yeniKalan = Math.max((seciliCari.kalanTutar || 0) - degerler.tutar, 0);
      setMakbuzVerisi({
        tahsilat: { tutar: degerler.tutar, tarih: degerler.tarih, aciklama: degerler.aciklama },
        cari: { ...seciliCari, kalanTutar: yeniKalan },
        musteri: seciliCari.musteri,
      });
      setMakbuzModalAcik(true);
    } else {
      message.error('Tahsilat kaydedilemedi');
    }
  };

  const duzenleAc = (kayit) => {
    setDuzenlenenKayit(kayit);
    cariForm.setFieldsValue({
      musteri: kayit.musteri?._id || kayit.musteri,
      islemTipi: kayit.islemTipi,
      tutar: kayit.tutar,
      gramMiktari: kayit.gramMiktari,
      urunTipi: kayit.urunTipi,
      urunTipiAciklama: kayit.urunTipiAciklama,
      islemTarihi: kayit.islemTarihi ? dayjs(kayit.islemTarihi) : null,
      vadeTarihi: kayit.vadeTarihi ? dayjs(kayit.vadeTarihi) : null,
      aciklama: kayit.aciklama,
    });
    setCariModalAcik(true);
  };

  const tahsilatAc = (kayit) => {
    setSeciliCari(kayit);
    tahsilatForm.resetFields();
    tahsilatForm.setFieldsValue({ tarih: dayjs() });
    setTahsilatModalAcik(true);
  };

  const goruntuleAc = (kayit) => {
    setGoruntulenenKayit(kayit);
    setGoruntuleModalAcik(true);
  };

  const kolonlar = [
    {
      title: 'Müşteri',
      dataIndex: 'musteri',
      width: 160,
      sorter: (a, b) => (a.musteri?.name || '').localeCompare(b.musteri?.name || '', 'tr'),
      render: (v) => v?.name || '-',
    },
    {
      title: 'İşlem Tipi',
      dataIndex: 'islemTipi',
      width: 120,
      filters: [
        { text: 'Alacak', value: 'alacak' },
        { text: 'Verecek', value: 'verecek' },
      ],
      onFilter: (value, record) => record.islemTipi === value,
      render: (v) => v ? <Tag color={islemTipiRenk[v]}>{islemTipiYazi[v]}</Tag> : '-',
    },
    {
      title: 'Tutar',
      dataIndex: 'tutar',
      width: 140,
      sorter: (a, b) => (a.tutar || 0) - (b.tutar || 0),
      render: (v) => <span style={{ whiteSpace: 'nowrap' }}>{formatTutar(v)}</span>,
    },
    {
      title: 'Kalan',
      dataIndex: 'kalanTutar',
      width: 140,
      sorter: (a, b) => (a.kalanTutar || 0) - (b.kalanTutar || 0),
      render: (v) => <span style={{ whiteSpace: 'nowrap' }}>{formatTutar(v)}</span>,
    },
    {
      title: 'Vade Tarihi',
      dataIndex: 'vadeTarihi',
      width: 120,
      sorter: (a, b) => new Date(a.vadeTarihi || 0) - new Date(b.vadeTarihi || 0),
      render: (v) => <span style={{ whiteSpace: 'nowrap' }}>{v ? dayjs(v).format('DD.MM.YYYY') : '-'}</span>,
    },
    {
      title: 'Durum',
      dataIndex: 'durum',
      width: 130,
      filters: [
        { text: 'Açık', value: 'acik' },
        { text: 'Kısmi Ödendi', value: 'kismi_odendi' },
        { text: 'Kapalı', value: 'kapali' },
      ],
      onFilter: (value, record) => record.durum === value,
      render: (v) => v ? <Tag color={durumRenk[v]}>{durumYazi[v]}</Tag> : '-',
    },
    {
      title: 'İşlemler',
      key: 'islemler',
      fixed: 'right',
      render: (_, kayit) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => goruntuleAc(kayit)} />
          <Button
            size="small"
            icon={<PrinterOutlined />}
            title="Fiş Yazdır"
            onClick={() => cariFisiYazdir(kayit)}
            style={{ color: '#d4890e', borderColor: '#d4890e' }}
          />
          {kayit.durum !== 'kapali' && (
            <Button
              size="small"
              type="primary"
              icon={<DollarOutlined />}
              onClick={() => tahsilatAc(kayit)}
            >
              Tahsilat
            </Button>
          )}
          {canEdit && <Button size="small" icon={<EditOutlined />} onClick={() => duzenleAc(kayit)} />}
          {canDelete && (
            <Popconfirm
              title="Bu kaydı silmek istediğinize emin misiniz?"
              onConfirm={() => cariSil(kayit._id)}
              okText="Evet"
              cancelText="Hayır"
            >
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ margin: 0 }}>Cari İşlem Listesi</h2>
          <span style={{ color: 'var(--text-3)', fontSize: 13 }}>({filtreliListe.length} kayıt)</span>
        </div>
        <Space wrap>
          <Button
            icon={<FileExcelOutlined />}
            onClick={() => cariExcelIndir(liste)}
            style={{ color: '#217346', borderColor: '#217346' }}
          >
            Excel İndir
          </Button>
          {canEdit && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setDuzenlenenKayit(null);
                cariForm.resetFields();
                setCariModalAcik(true);
              }}
            >
              Yeni Cari Kaydı
            </Button>
          )}
        </Space>
      </div>

      <Input
        prefix={<SearchOutlined style={{ color: 'var(--text-3)' }} />}
        placeholder="Müşteri adı veya açıklama ile ara..."
        value={arama}
        onChange={(e) => setArama(e.target.value)}
        allowClear
        style={{ marginBottom: 16, maxWidth: 360 }}
      />
      <Table
        columns={kolonlar}
        dataSource={filtreliListe}
        rowKey="_id"
        loading={yukleniyor}
        scroll={{ x: true }}
        pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `Toplam ${t} kayıt` }}
      />

      {/* Cari Ekle/Düzenle Modal */}
      <Modal
        title={duzenlenenKayit ? 'Cari Kaydı Düzenle' : 'Yeni Cari Kaydı'}
        open={cariModalAcik}
        onCancel={() => { setCariModalAcik(false); setDuzenlenenKayit(null); cariForm.resetFields(); }}
        onOk={() => cariForm.submit()}
        okText="Kaydet"
        cancelText="İptal"
        width={600}
      >
        <Form form={cariForm} layout="vertical" onFinish={cariKaydet}>
          <Form.Item name="musteri" label="Müşteri" rules={[{ required: true, message: 'Müşteri seçiniz' }]}>
            <Select showSearch placeholder="Müşteri seçin" optionFilterProp="children">
              {musteriler.map((m) => (
                <Option key={m._id} value={m._id}>{m.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="islemTipi" label="İşlem Tipi" rules={[{ required: true }]}>
            <Select placeholder="Seçin">
              <Option value="alacak">Alacak (Müşteri borçlu)</Option>
              <Option value="verecek">Verecek (Biz borçluyuz)</Option>
            </Select>
          </Form.Item>
          <Form.Item name="tutar" label="Tutar (₺)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="gramMiktari" label="Gram Miktarı">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="urunTipi" label="Ürün Tipi">
            <Select placeholder="Seçin" allowClear>
              <Option value="ceyrek">Çeyrek Altın</Option>
              <Option value="yarim">Yarım Altın</Option>
              <Option value="tam">Tam Altın</Option>
              <Option value="gram">Gram Altın</Option>
              <Option value="diger">Diğer</Option>
            </Select>
          </Form.Item>
          <Form.Item name="urunTipiAciklama" label="Ürün Açıklaması">
            <Input />
          </Form.Item>
          <Form.Item name="islemTarihi" label="İşlem Tarihi" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
          <Form.Item name="vadeTarihi" label="Vade Tarihi" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
          <Form.Item name="aciklama" label="Açıklama">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Tahsilat Modal */}
      <Modal
        title={`Tahsilat Ekle — ${seciliCari?.musteri?.name || ''}`}
        open={tahsilatModalAcik}
        onCancel={() => { setTahsilatModalAcik(false); tahsilatForm.resetFields(); }}
        onOk={() => tahsilatForm.submit()}
        okText="Tahsilatı Kaydet"
        cancelText="İptal"
      >
        {seciliCari && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
            <p style={{ margin: 0 }}>Toplam Borç: <strong>{formatTutar(seciliCari.tutar)}</strong></p>
            <p style={{ margin: 0 }}>Kalan: <strong style={{ color: 'red' }}>{formatTutar(seciliCari.kalanTutar)}</strong></p>
          </div>
        )}
        <Form form={tahsilatForm} layout="vertical" onFinish={tahsilatKaydet}>
          <Form.Item name="tutar" label="Tahsilat Tutarı (₺)" rules={[{ required: true, message: 'Tutar giriniz' }]}>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              max={seciliCari?.kalanTutar}
            />
          </Form.Item>
          <Form.Item name="tarih" label="Tahsilat Tarihi" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
          <Form.Item name="aciklama" label="Açıklama">
            <TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Görüntüle Modal */}
      <Modal
        title="Cari Kayıt Detayı"
        open={goruntuleModalAcik}
        onCancel={() => setGoruntuleModalAcik(false)}
        footer={null}
      >
        {goruntulenenKayit && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {[
              ['Müşteri', goruntulenenKayit.musteri?.name],
              ['İşlem Tipi', <Tag color={islemTipiRenk[goruntulenenKayit.islemTipi]}>{islemTipiYazi[goruntulenenKayit.islemTipi]}</Tag>],
              ['Tutar', formatTutar(goruntulenenKayit.tutar)],
              ['Ödenen', formatTutar(goruntulenenKayit.odemeTutari)],
              ['Kalan', formatTutar(goruntulenenKayit.kalanTutar)],
              ['Vade Tarihi', goruntulenenKayit.vadeTarihi ? dayjs(goruntulenenKayit.vadeTarihi).format('DD.MM.YYYY') : '-'],
              ['İşlem Tarihi', goruntulenenKayit.islemTarihi ? dayjs(goruntulenenKayit.islemTarihi).format('DD.MM.YYYY') : '-'],
              ['Ürün Tipi', goruntulenenKayit.urunTipi || '-'],
              ['Gram', goruntulenenKayit.gramMiktari || '-'],
              ['Açıklama', goruntulenenKayit.aciklama || '-'],
              ['Durum', <Tag color={durumRenk[goruntulenenKayit.durum]}>{durumYazi[goruntulenenKayit.durum]}</Tag>],
            ].map(([baslik, deger]) => (
              <tr key={baslik} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <td style={{ padding: '8px', fontWeight: 'bold', width: '40%', color: 'var(--text-2)' }}>{baslik}</td>
                <td style={{ padding: '8px', color: 'var(--text-1)' }}>{deger}</td>
              </tr>
            ))}
          </table>
        )}
      </Modal>

      {/* Makbuz Modal */}
      <Modal
        title="Tahsilat Makbuzu"
        open={makbuzModalAcik}
        onCancel={() => setMakbuzModalAcik(false)}
        footer={[
          <Button key="yazdir" type="primary" icon={<PrinterOutlined />} onClick={() => makbuzYazdir(makbuzVerisi)}>
            Yazdır / PDF İndir
          </Button>,
          <Button key="kapat" onClick={() => setMakbuzModalAcik(false)}>Kapat</Button>,
        ]}
      >
        {makbuzVerisi && (
          <div style={{ padding: 8 }}>
            <div style={{ textAlign: 'center', marginBottom: 20, borderBottom: '2px solid #222', paddingBottom: 12 }}>
              <h2 style={{ margin: 0 }}>TAHSİLAT MAKBUZU</h2>
              <p style={{ color: 'var(--text-2)', marginTop: 4 }}>
                {dayjs(makbuzVerisi.tahsilat.tarih).format('DD.MM.YYYY')}
              </p>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              {[
                ['Müşteri', makbuzVerisi.musteri?.name || '-'],
                ['Telefon', makbuzVerisi.musteri?.phone || '-'],
                ['Toplam Borç', formatTutar(makbuzVerisi.cari.tutar)],
                ['Kalan Borç', formatTutar(makbuzVerisi.cari.kalanTutar)],
                ['Açıklama', makbuzVerisi.tahsilat.aciklama || '-'],
              ].map(([baslik, deger]) => (
                <tr key={baslik} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px', color: '#666', width: '40%' }}>{baslik}</td>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>{deger}</td>
                </tr>
              ))}
            </table>
            <div style={{ textAlign: 'center', margin: '20px 0', padding: 16, background: 'rgba(82,196,26,0.08)', border: '1px solid rgba(82,196,26,0.3)', borderRadius: 8 }}>
              <div style={{ color: 'var(--text-2)', fontSize: 12 }}>TAHSİL EDİLEN TUTAR</div>
              <div style={{ fontSize: 32, fontWeight: 'bold', color: '#389e0d' }}>
                {formatTutar(makbuzVerisi.tahsilat.tutar)}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


