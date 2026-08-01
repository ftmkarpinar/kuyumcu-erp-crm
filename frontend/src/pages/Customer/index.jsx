import { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber,
  Select, Tag, Popconfirm, message, Space, Tooltip, Upload, Progress
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined,
  FileTextOutlined, EyeOutlined, FileExcelOutlined,
  UploadOutlined, DownloadOutlined, SearchOutlined
} from '@ant-design/icons';
import { request } from '@/request';
import { ekstreYazdir } from './ekstreYazdir';
import useRole from '@/hooks/useRole';
import { musteriExcelIndir, musteriExcelSablonIndir, musteriExcelOku } from '@/utils/excelExport';
import waIcon from '@/style/images/whatsapp.svg';

function whatsappAc(telefon, musteriAdi) {
  if (!telefon) return;
  let numara = telefon.replace(/[\s\-().+]/g, '');
  if (numara.startsWith('0')) numara = '90' + numara.slice(1);
  else if (!numara.startsWith('90')) numara = '90' + numara;
  window.open(`https://wa.me/${numara}`, '_blank');
}

const { TextArea } = Input;
const { Option } = Select;

const etiketRenk = { duzenli: 'green', riskli: 'red', toptanci: 'blue', vip: 'gold' };
const etiketYazi = { duzenli: 'Düzenli', riskli: 'Riskli', toptanci: 'Toptancı', vip: 'VIP' };

export default function Customer() {
  const { canEdit, canDelete } = useRole();
  const [liste, setListe] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState(null);
  const [form] = Form.useForm();
  const [goruntuleModalAcik, setGoruntuleModalAcik] = useState(false);
  const [goruntulenen, setGoruntulenen] = useState(null);
  const [ekstreYukleniyor, setEkstreYukleniyor] = useState(false);
  const [importModalAcik, setImportModalAcik] = useState(false);
  const [importVerisi, setImportVerisi] = useState([]);
  const [importYukleniyor, setImportYukleniyor] = useState(false);
  const [importIlerleme, setImportIlerleme] = useState(0);
  const [arama, setArama] = useState('');

  const filtreliListe = liste.filter((m) => {
    const ara = arama.toLowerCase();
    return (
      m.name?.toLowerCase().includes(ara) ||
      m.phone?.toLowerCase().includes(ara) ||
      m.tcKimlik?.toLowerCase().includes(ara) ||
      m.address?.toLowerCase().includes(ara)
    );
  });

  const listeGetir = async () => {
    setYukleniyor(true);
    const sonuc = await request.list({ entity: 'client' });
    if (sonuc?.success) setListe(sonuc.result || []);
    setYukleniyor(false);
  };

  useEffect(() => { listeGetir(); }, []);

  const kaydet = async (degerler) => {
    let sonuc;
    if (duzenlenen) {
      sonuc = await request.update({ entity: 'client', id: duzenlenen._id, jsonData: degerler });
    } else {
      sonuc = await request.create({ entity: 'client', jsonData: degerler });
    }
    if (sonuc?.success) {
      message.success(duzenlenen ? 'Müşteri güncellendi' : 'Müşteri eklendi');
      setModalAcik(false);
      setDuzenlenen(null);
      form.resetFields();
      listeGetir();
    } else {
      message.error('İşlem başarısız');
    }
  };

  const sil = async (id) => {
    const sonuc = await request.delete({ entity: 'client', id });
    if (sonuc?.success) {
      message.success('Müşteri ve ilgili kayıtlar silindi');
      listeGetir();
    } else {
      message.error(sonuc?.message || 'Silme işlemi başarısız');
    }
  };

  const duzenleAc = (kayit) => {
    setDuzenlenen(kayit);
    form.setFieldsValue(kayit);
    setModalAcik(true);
  };

  const dosyaSec = async (dosya) => {
    try {
      const veri = await musteriExcelOku(dosya);
      if (veri.length === 0) {
        message.warning('Dosyada geçerli müşteri bulunamadı. A kolonunda isim dolu olmalı.');
        return false;
      }
      setImportVerisi(veri);
      setImportModalAcik(true);
    } catch (err) {
      message.error(err.message || 'Dosya okunamadı');
    }
    return false; // Upload'ın otomatik göndermesini engelle
  };

  const topluAktar = async () => {
    setImportYukleniyor(true);
    setImportIlerleme(0);
    let eklendi = 0;
    let guncellendi = 0;
    let basarisiz = 0;
    for (let i = 0; i < importVerisi.length; i++) {
      const { _onizlemeKey, ...musteri } = importVerisi[i];

      // Telefon veya TC ile mevcut müşteri ara
      const mevcutMusteri = liste.find((m) => {
        if (musteri.phone && m.phone && m.phone.replace(/\s/g, '') === musteri.phone.replace(/\s/g, '')) return true;
        if (musteri.tcKimlik && m.tcKimlik && m.tcKimlik === musteri.tcKimlik) return true;
        return false;
      });

      let sonuc;
      if (mevcutMusteri) {
        sonuc = await request.update({ entity: 'client', id: mevcutMusteri._id, jsonData: musteri });
        if (sonuc?.success) guncellendi++;
        else basarisiz++;
      } else {
        sonuc = await request.create({ entity: 'client', jsonData: musteri });
        if (sonuc?.success) eklendi++;
        else basarisiz++;
      }

      setImportIlerleme(Math.round(((i + 1) / importVerisi.length) * 100));
    }
    setImportYukleniyor(false);
    const mesajParcalari = [];
    if (eklendi > 0) mesajParcalari.push(`${eklendi} yeni müşteri eklendi`);
    if (guncellendi > 0) mesajParcalari.push(`${guncellendi} müşteri güncellendi`);
    if (mesajParcalari.length > 0) {
      message.success(mesajParcalari.join(', ') + (basarisiz > 0 ? `. ${basarisiz} kayıt işlenemedi.` : '.'));
    } else {
      message.error('Hiçbir kayıt işlenemedi.');
    }
    setImportModalAcik(false);
    setImportVerisi([]);
    setImportIlerleme(0);
    listeGetir();
  };

  const ekstreAl = async (musteri) => {
    setEkstreYukleniyor(musteri._id);
    const sonuc = await request.filter({ entity: 'cari', options: { filter: 'musteri', equal: musteri._id } });
    const cariKayitlar = sonuc?.success ? (sonuc.result || []) : [];
    setEkstreYukleniyor(false);
    ekstreYazdir({ musteri, cariKayitlar });
  };

  const kolonlar = [
    {
      title: 'Ad Soyad', dataIndex: 'name',
      width: 160,
      sorter: (a, b) => a.name?.localeCompare(b.name, 'tr'),
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Telefon', dataIndex: 'phone',
      width: 140,
      render: (v) => <span style={{ whiteSpace: 'nowrap' }}>{v || '-'}</span>,
    },
    { title: 'TC Kimlik No', dataIndex: 'tcKimlik', width: 130, render: (v) => v || '-' },
    { title: 'Adres', dataIndex: 'address', render: (v) => v || '-' },
    {
      title: 'Etiket', dataIndex: 'etiket',
      width: 110,
      filters: [
        { text: 'Düzenli', value: 'duzenli' },
        { text: 'Riskli', value: 'riskli' },
        { text: 'Toptancı', value: 'toptanci' },
        { text: 'VIP', value: 'vip' },
      ],
      onFilter: (value, record) => record.etiket === value,
      render: (v) => v ? <Tag color={etiketRenk[v]}>{etiketYazi[v]}</Tag> : '-',
    },
    {
      title: 'İşlemler', key: 'islemler', fixed: 'right',
      render: (_, kayit) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => { setGoruntulenen(kayit); setGoruntuleModalAcik(true); }} />
          <Button
            size="small"
            icon={<FileTextOutlined />}
            loading={ekstreYukleniyor === kayit._id}
            onClick={() => ekstreAl(kayit)}
          >
            Ekstre
          </Button>
          <Tooltip title={kayit.phone ? 'WhatsApp\'tan yaz' : 'Telefon numarası yok'}>
            <img
              src={waIcon}
              alt="WhatsApp"
              onClick={() => kayit.phone && whatsappAc(kayit.phone, kayit.name)}
              style={{
                width: 32,
                height: 32,
                cursor: kayit.phone ? 'pointer' : 'not-allowed',
                opacity: kayit.phone ? 1 : 0.4,
                flexShrink: 0,
                display: 'block',
              }}
            />
          </Tooltip>
          {canEdit && <Button size="small" icon={<EditOutlined />} onClick={() => duzenleAc(kayit)} />}
          {canDelete && (
            <Popconfirm
              title="Müşteriyi sil"
              description="Açık borcu yoksa müşteri ve tüm cari kayıtları silinecektir. Emin misiniz?"
              onConfirm={() => sil(kayit._id)}
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
          <h2 style={{ margin: 0 }}>Müşteri Listesi</h2>
          <span style={{ color: 'var(--text-3)', fontSize: 13 }}>({filtreliListe.length} kayıt)</span>
        </div>
        <Space wrap>
          <Button
            icon={<FileExcelOutlined />}
            onClick={() => musteriExcelIndir(liste)}
            style={{ color: '#217346', borderColor: '#217346' }}
          >
            Excel İndir
          </Button>
          {canEdit && (
            <>
              <Button
                icon={<DownloadOutlined />}
                onClick={musteriExcelSablonIndir}
              >
                Şablon İndir
              </Button>
              <Upload beforeUpload={dosyaSec} accept=".xlsx,.xls" showUploadList={false}>
                <Button icon={<UploadOutlined />} style={{ color: '#1677ff', borderColor: '#1677ff' }}>
                  Excel İçe Aktar
                </Button>
              </Upload>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => { setDuzenlenen(null); form.resetFields(); setModalAcik(true); }}>
                Yeni Müşteri Ekle
              </Button>
            </>
          )}
        </Space>
      </div>

      <Input
        prefix={<SearchOutlined style={{ color: 'var(--text-3)' }} />}
        placeholder="Ad, telefon veya TC ile ara..."
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

      {/* Ekle / Düzenle Modal */}
      <Modal
        title={duzenlenen ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Ekle'}
        open={modalAcik}
        onCancel={() => { setModalAcik(false); setDuzenlenen(null); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Kaydet"
        cancelText="İptal"
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={kaydet}>
          <Form.Item name="name" label="Ad Soyad" rules={[{ required: true, message: 'Ad Soyad zorunlu' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Telefon" rules={[{ required: true, message: 'Telefon zorunlu' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="tcKimlik" label="TC Kimlik No">
            <Input maxLength={11} />
          </Form.Item>
          <Form.Item name="address" label="Adres">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="E-posta">
            <Input />
          </Form.Item>
          <Form.Item name="etiket" label="Etiket">
            <Select allowClear placeholder="Seçin">
              <Option value="duzenli">Düzenli</Option>
              <Option value="riskli">Riskli</Option>
              <Option value="toptanci">Toptancı</Option>
              <Option value="vip">VIP</Option>
            </Select>
          </Form.Item>
          <Form.Item name="not" label="Not">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Excel Import Modal */}
      <Modal
        title={(() => {
          const guncellenecek = importVerisi.filter(row =>
            liste.find(m =>
              (row.phone && m.phone && m.phone.replace(/\s/g, '') === row.phone.replace(/\s/g, '')) ||
              (row.tcKimlik && m.tcKimlik && m.tcKimlik === row.tcKimlik)
            )
          ).length;
          const yeni = importVerisi.length - guncellenecek;
          const parcalar = [];
          if (yeni > 0) parcalar.push(`${yeni} yeni`);
          if (guncellenecek > 0) parcalar.push(`${guncellenecek} güncelleme`);
          return `Excel İçe Aktar — ${parcalar.join(', ')}`;
        })()}
        open={importModalAcik}
        onCancel={() => { if (!importYukleniyor) { setImportModalAcik(false); setImportVerisi([]); } }}
        onOk={topluAktar}
        okText={`${importVerisi.length} Müşteriyi Aktar`}
        cancelText="İptal"
        okButtonProps={{ loading: importYukleniyor, disabled: importVerisi.length === 0 }}
        cancelButtonProps={{ disabled: importYukleniyor }}
        width={800}
      >
        {importYukleniyor && (
          <Progress percent={importIlerleme} style={{ marginBottom: 12 }} />
        )}
        <Table
          size="small"
          dataSource={importVerisi}
          rowKey="_onizlemeKey"
          scroll={{ x: true, y: 300 }}
          pagination={false}
          columns={[
            {
              title: 'Durum', key: 'durum', width: 100,
              render: (_, row) => {
                const mevcut = liste.find((m) => {
                  if (row.phone && m.phone && m.phone.replace(/\s/g, '') === row.phone.replace(/\s/g, '')) return true;
                  if (row.tcKimlik && m.tcKimlik && m.tcKimlik === row.tcKimlik) return true;
                  return false;
                });
                return mevcut
                  ? <Tag color="orange">Güncelleme</Tag>
                  : <Tag color="green">Yeni</Tag>;
              },
            },
            { title: 'Ad Soyad', dataIndex: 'name', width: 150 },
            { title: 'Telefon', dataIndex: 'phone', width: 120, render: v => v || '-' },
            { title: 'TC No', dataIndex: 'tcKimlik', width: 120, render: v => v || '-' },
            { title: 'E-posta', dataIndex: 'email', width: 150, render: v => v || '-' },
            { title: 'Etiket', dataIndex: 'etiket', width: 90, render: v => v ? <Tag color={etiketRenk[v]}>{etiketYazi[v]}</Tag> : '-' },
          ]}
        />
      </Modal>

      {/* Görüntüle Modal */}
      <Modal
        title="Müşteri Detayı"
        open={goruntuleModalAcik}
        onCancel={() => setGoruntuleModalAcik(false)}
        footer={null}
      >
        {goruntulenen && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            {[
              ['Ad Soyad', goruntulenen.name],
              ['Telefon', goruntulenen.phone || '-'],
              ['TC Kimlik No', goruntulenen.tcKimlik || '-'],
              ['Adres', goruntulenen.address || '-'],
              ['E-posta', goruntulenen.email || '-'],
              ['Etiket', goruntulenen.etiket ? <Tag color={etiketRenk[goruntulenen.etiket]}>{etiketYazi[goruntulenen.etiket]}</Tag> : '-'],
              ['Not', goruntulenen.not || '-'],
            ].map(([baslik, deger]) => (
              <tr key={baslik} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <td style={{ padding: '8px', color: 'var(--text-2)', width: '40%', fontWeight: 'bold' }}>{baslik}</td>
                <td style={{ padding: '8px', color: 'var(--text-1)' }}>{deger}</td>
              </tr>
            ))}
          </table>
        )}
      </Modal>
    </div>
  );
}
