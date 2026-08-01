import { useState, useEffect, useCallback } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Select,
  Space, Tag, Popconfirm, message, Tooltip, Badge, Statistic, Row, Col, Card
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  PlusCircleOutlined, MinusCircleOutlined, SettingOutlined,
  WarningOutlined, GoldOutlined, SearchOutlined
} from '@ant-design/icons';
import { request } from '@/request';

const { Option } = Select;

const kategoriRenk = {
  bilezik: 'gold',
  yuzuk: 'purple',
  kolye: 'blue',
  kupe: 'pink',
  altin: 'yellow',
  gumus: 'default',
  para: 'green',
  diger: 'default',
};

const kategoriLabel = {
  bilezik: 'Bilezik', yuzuk: 'Yüzük', kolye: 'Kolye',
  kupe: 'Küpe', altin: 'Altın', gumus: 'Gümüş',
  para: 'Para/Coin', diger: 'Diğer',
};

const ayarLabel = {
  '8': '8 Ayar', '14': '14 Ayar', '18': '18 Ayar',
  '21': '21 Ayar', '22': '22 Ayar', '24': '24 Ayar',
  '925': '925 Gümüş', 'has': 'Has Altın', 'diger': 'Diğer',
};

export default function Stok() {
  const [urunler, setUrunler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [modalAcik, setModalAcik] = useState(false);
  const [stokModalAcik, setStokModalAcik] = useState(false);
  const [seciliUrun, setSeciliUrun] = useState(null);
  const [form] = Form.useForm();
  const [stokForm] = Form.useForm();
  const [arama, setArama] = useState('');

  const urunleriYukle = useCallback(async () => {
    setYukleniyor(true);
    try {
      const res = await request.listAll({ entity: 'urun' });
      if (res.success) setUrunler(res.result || []);
    } catch {
      message.error('Ürünler yüklenemedi');
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => { urunleriYukle(); }, [urunleriYukle]);

  const yeniUrun = () => {
    setSeciliUrun(null);
    form.resetFields();
    setModalAcik(true);
  };

  const duzenle = (urun) => {
    setSeciliUrun(urun);
    form.setFieldsValue({
      urunAdi: urun.urunAdi,
      kategori: urun.kategori,
      ayar: urun.ayar,
      birim: urun.birim,
      gramAgirlik: urun.gramAgirlik,
      stokMiktari: urun.stokMiktari,
      minimumStok: urun.minimumStok,
      maliyet: urun.maliyet,
      satisFiyati: urun.satisFiyati,
      barkod: urun.barkod,
      aciklama: urun.aciklama,
    });
    setModalAcik(true);
  };

  const stokDuzenle = (urun) => {
    setSeciliUrun(urun);
    stokForm.resetFields();
    setStokModalAcik(true);
  };

  const kaydet = async (degerler) => {
    try {
      if (seciliUrun) {
        await request.update({ entity: 'urun', id: seciliUrun._id, jsonData: degerler });
        message.success('Ürün güncellendi');
      } else {
        await request.create({ entity: 'urun', jsonData: degerler });
        message.success('Ürün eklendi');
      }
      setModalAcik(false);
      urunleriYukle();
    } catch {
      message.error('İşlem başarısız');
    }
  };

  const sil = async (id) => {
    try {
      await request.delete({ entity: 'urun', id });
      message.success('Ürün silindi');
      urunleriYukle();
    } catch {
      message.error('Silme başarısız');
    }
  };

  const stokGuncelle = async (degerler) => {
    try {
      const res = await request.patch({
        entity: `urun/stok/${seciliUrun._id}`,
        jsonData: degerler,
      });
      if (res.success) {
        message.success('Stok güncellendi');
        setStokModalAcik(false);
        urunleriYukle();
      } else {
        message.error(res.message || 'Hata oluştu');
      }
    } catch {
      message.error('Stok güncelleme başarısız');
    }
  };

  const filtreliUrunler = urunler.filter((u) => {
    const ara = arama.toLowerCase();
    return (
      u.urunAdi?.toLowerCase().includes(ara) ||
      u.barkod?.toLowerCase().includes(ara) ||
      u.kategori?.toLowerCase().includes(ara)
    );
  });

  const toplamUrun = urunler.length;
  const dusukStok = urunler.filter(u => u.stokMiktari <= u.minimumStok).length;
  const toplamDeger = urunler.reduce((acc, u) => acc + (u.stokMiktari * u.satisFiyati), 0);

  const kolonlar = [
    {
      title: 'Ürün Adı',
      dataIndex: 'urunAdi',
      key: 'urunAdi',
      sorter: (a, b) => a.urunAdi?.localeCompare(b.urunAdi, 'tr'),
      render: (text, rec) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 600, color: 'var(--text-1)' }}>{text}</span>
          {rec.barkod && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{rec.barkod}</span>}
        </Space>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'kategori',
      key: 'kategori',
      filters: Object.entries(kategoriLabel).map(([k, v]) => ({ text: v, value: k })),
      onFilter: (value, record) => record.kategori === value,
      render: (val) => <Tag color={kategoriRenk[val]}>{kategoriLabel[val]}</Tag>,
    },
    {
      title: 'Ayar',
      dataIndex: 'ayar',
      key: 'ayar',
      render: (val) => <span style={{ color: '#d4890e', fontWeight: 600 }}>{ayarLabel[val] || val}</span>,
    },
    {
      title: 'Birim',
      dataIndex: 'birim',
      key: 'birim',
      render: (val) => <Tag>{val === 'adet' ? 'Adet' : 'Gram'}</Tag>,
    },
    {
      title: 'Gram Ağırlık',
      dataIndex: 'gramAgirlik',
      key: 'gramAgirlik',
      render: (val, rec) => rec.birim === 'adet' && val > 0
        ? <span>{val} gr/adet</span>
        : <span style={{ color: 'var(--text-3)' }}>—</span>,
    },
    {
      title: 'Stok',
      dataIndex: 'stokMiktari',
      key: 'stokMiktari',
      sorter: (a, b) => a.stokMiktari - b.stokMiktari,
      render: (val, rec) => {
        const dusuk = val <= rec.minimumStok;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: dusuk ? '#ff4d4f' : '#52c41a' }}>
              {val}
            </span>
            {dusuk && <WarningOutlined style={{ color: '#ff4d4f', fontSize: 14 }} />}
            <span style={{ color: 'var(--text-3)', fontSize: 12 }}>
              (min: {rec.minimumStok})
            </span>
          </div>
        );
      },
    },
    {
      title: 'Alış Fiyatı',
      dataIndex: 'maliyet',
      key: 'maliyet',
      sorter: (a, b) => (a.maliyet || 0) - (b.maliyet || 0),
      render: (val) => val > 0
        ? <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>₺{val.toLocaleString('tr-TR')}</span>
        : <span style={{ color: 'var(--text-3)' }}>—</span>,
    },
    {
      title: 'Satış Fiyatı',
      dataIndex: 'satisFiyati',
      key: 'satisFiyati',
      sorter: (a, b) => (a.satisFiyati || 0) - (b.satisFiyati || 0),
      render: (val) => val > 0
        ? <span style={{ color: '#d4890e', fontWeight: 600 }}>₺{val.toLocaleString('tr-TR')}</span>
        : <span style={{ color: 'var(--text-3)' }}>—</span>,
    },
    {
      title: 'İşlemler',
      key: 'islemler',
      width: 160,
      render: (_, rec) => (
        <Space size={4} wrap>
          <Tooltip title="Stok Giriş/Çıkış">
            <Button
              size="small"
              icon={<PlusCircleOutlined />}
              style={{ background: '#1a3a1a', border: '1px solid #52c41a', color: '#52c41a' }}
              onClick={() => stokDuzenle(rec)}
            />
          </Tooltip>
          <Tooltip title="Düzenle">
            <Button
              size="small"
              icon={<EditOutlined />}
              style={{ background: '#1a2a3a', border: '1px solid #1677ff', color: '#1677ff' }}
              onClick={() => duzenle(rec)}
            />
          </Tooltip>
          <Popconfirm
            title="Bu ürünü silmek istiyor musunuz?"
            onConfirm={() => sil(rec._id)}
            okText="Evet" cancelText="Hayır"
          >
            <Tooltip title="Sil">
              <Button
                size="small"
                icon={<DeleteOutlined />}
                style={{ background: '#3a1a1a', border: '1px solid #ff4d4f', color: '#ff4d4f' }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '0 0 40px' }}>
      {/* Başlık */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--text-1)', fontSize: 22, fontWeight: 700 }}>
            <GoldOutlined style={{ color: '#d4890e', marginRight: 8 }} />
            Stok Yönetimi
          </h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-2)', fontSize: 13 }}>
            Ürün envanteri ve stok takibi
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={yeniUrun}
          size="large"
        >
          Yeni Ürün Ekle
        </Button>
      </div>

      {/* İstatistikler */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Statistic
              title={<span style={{ color: 'var(--text-2)' }}>Toplam Ürün Çeşidi</span>}
              value={toplamUrun}
              valueStyle={{ color: 'var(--text-1)' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ background: '#1a1a1a', border: `1px solid ${dusukStok > 0 ? 'rgba(255,77,79,0.4)' : 'rgba(255,255,255,0.07)'}` }}>
            <Statistic
              title={<span style={{ color: 'var(--text-2)' }}>Düşük Stok Uyarısı</span>}
              value={dusukStok}
              valueStyle={{ color: dusukStok > 0 ? '#ff4d4f' : '#52c41a' }}
              suffix="ürün"
              prefix={dusukStok > 0 ? <WarningOutlined /> : null}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small" style={{ background: '#1a1a1a', border: '1px solid rgba(212,137,14,0.3)' }}>
            <Statistic
              title={<span style={{ color: 'var(--text-2)' }}>Toplam Stok Değeri</span>}
              value={toplamDeger}
              valueStyle={{ color: '#d4890e' }}
              prefix="₺"
              formatter={(v) => Number(v).toLocaleString('tr-TR')}
            />
          </Card>
        </Col>
      </Row>

      {/* Arama */}
      <Input
        prefix={<SearchOutlined style={{ color: 'var(--text-3)' }} />}
        placeholder="Ürün adı, barkod veya kategori ile ara..."
        value={arama}
        onChange={(e) => setArama(e.target.value)}
        allowClear
        style={{ marginBottom: 16, maxWidth: 360 }}
      />

      {/* Tablo */}
      <Table
        dataSource={filtreliUrunler}
        columns={kolonlar}
        rowKey="_id"
        loading={yukleniyor}
        scroll={{ x: true }}
        pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (t) => `Toplam ${t} ürün` }}
        rowClassName={(rec) => rec.stokMiktari <= rec.minimumStok ? 'dusuk-stok-satir' : ''}
      />

      {/* Ürün Ekle/Düzenle Modal */}
      <Modal
        title={seciliUrun ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
        open={modalAcik}
        onCancel={() => setModalAcik(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={kaydet} style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="urunAdi" label="Ürün Adı" rules={[{ required: true, message: 'Ürün adı zorunlu' }]}>
                <Input placeholder="Örn: 22 Ayar Bilezik 5gr" size="large" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="barkod" label="Barkod">
                <Input placeholder="Opsiyonel" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="kategori" label="Kategori" rules={[{ required: true }]}>
                <Select size="large">
                  {Object.entries(kategoriLabel).map(([k, v]) => <Option key={k} value={k}>{v}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="ayar" label="Ayar" initialValue="diger">
                <Select size="large">
                  {Object.entries(ayarLabel).map(([k, v]) => <Option key={k} value={k}>{v}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="birim" label="Birim" initialValue="adet" rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="adet">Adet</Option>
                  <Option value="gram">Gram</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="gramAgirlik" label="Gram Ağırlık (adet ise)" initialValue={0}>
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} addonAfter="gr" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="stokMiktari" label="Başlangıç Stok" initialValue={0} rules={[{ required: true }]}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="minimumStok" label="Min. Stok Uyarısı" initialValue={1}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="maliyet" label="Alış Fiyatı (₺)" initialValue={0}>
                <InputNumber min={0} style={{ width: '100%' }} formatter={v => `₺ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="satisFiyati" label="Satış Fiyatı (₺)" initialValue={0}>
                <InputNumber min={0} style={{ width: '100%' }} formatter={v => `₺ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="aciklama" label="Açıklama">
            <Input.TextArea rows={2} placeholder="Opsiyonel not..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalAcik(false)}>İptal</Button>
              <Button type="primary" htmlType="submit">
                {seciliUrun ? 'Güncelle' : 'Kaydet'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Stok Güncelleme Modal */}
      <Modal
        title={`Stok Güncelle — ${seciliUrun?.urunAdi}`}
        open={stokModalAcik}
        onCancel={() => setStokModalAcik(false)}
        footer={null}
        width={400}
      >
        {seciliUrun && (
          <div style={{ marginBottom: 16, padding: 12, background: '#111', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ color: 'var(--text-2)' }}>Mevcut Stok: </span>
            <span style={{ fontWeight: 700, fontSize: 20, color: '#d4890e' }}>
              {seciliUrun.stokMiktari} {seciliUrun.birim}
            </span>
          </div>
        )}
        <Form form={stokForm} layout="vertical" onFinish={stokGuncelle}>
          <Form.Item name="tip" label="İşlem Tipi" initialValue="giris" rules={[{ required: true }]}>
            <Select size="large">
              <Option value="giris">
                <PlusCircleOutlined style={{ color: '#52c41a', marginRight: 6 }} />
                Stok Girişi (Ekle)
              </Option>
              <Option value="cikis">
                <MinusCircleOutlined style={{ color: '#ff4d4f', marginRight: 6 }} />
                Stok Çıkışı (Düş)
              </Option>
              <Option value="ayarla">
                <SettingOutlined style={{ color: '#1677ff', marginRight: 6 }} />
                Stok Düzelt (Set)
              </Option>
            </Select>
          </Form.Item>

          <Form.Item name="miktar" label="Miktar" rules={[{ required: true, message: 'Miktar giriniz' }]}>
            <InputNumber min={0} style={{ width: '100%' }} size="large" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setStokModalAcik(false)}>İptal</Button>
              <Button type="primary" htmlType="submit">Güncelle</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
