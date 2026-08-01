import { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select,
  Tag, Popconfirm, message, Switch, Space
} from 'antd';
import { PlusOutlined, DeleteOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import useRole from '@/hooks/useRole';
import { useSelector } from 'react-redux';
import { selectCurrentAdmin } from '@/redux/auth/selectors';

const { Option } = Select;

const rolRenk = { owner: 'gold', admin: 'blue', personel: 'green' };
const rolYazi = { owner: 'Sahip', admin: 'Admin', personel: 'Personel' };

function getAuthHeader() {
  const auth = JSON.parse(localStorage.getItem('auth') || '{}');
  return { Authorization: `Bearer ${auth?.current?.token || ''}` };
}

export default function Kullanicilar() {
  const { isOwner } = useRole();
  const currentAdmin = useSelector(selectCurrentAdmin);
  const [liste, setListe] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [modalAcik, setModalAcik] = useState(false);
  const [arama, setArama] = useState('');

  const filtreliListe = liste.filter((u) => {
    const ara = arama.toLowerCase();
    return (
      u.name?.toLowerCase().includes(ara) ||
      u.surname?.toLowerCase().includes(ara) ||
      u.email?.toLowerCase().includes(ara)
    );
  });
  const [form] = Form.useForm();

  const listeGetir = async () => {
    setYukleniyor(true);
    try {
      const res = await axios.get(API_BASE_URL + 'kullanici/list', { headers: getAuthHeader() });
      if (res.data?.success) setListe(res.data.result || []);
    } catch { message.error('Kullanıcılar yüklenemedi'); }
    setYukleniyor(false);
  };

  useEffect(() => { listeGetir(); }, []);

  const kaydet = async (degerler) => {
    try {
      const res = await axios.post(API_BASE_URL + 'kullanici/create', degerler, { headers: getAuthHeader() });
      if (res.data?.success) {
        message.success('Kullanıcı oluşturuldu');
        setModalAcik(false);
        form.resetFields();
        listeGetir();
      } else {
        message.error(res.data?.message || 'Hata oluştu');
      }
    } catch (e) {
      message.error(e.response?.data?.message || 'Hata oluştu');
    }
  };

  const durumDegistir = async (id, enabled) => {
    try {
      await axios.patch(API_BASE_URL + `kullanici/status/${id}`, { enabled }, { headers: getAuthHeader() });
      message.success(enabled ? 'Kullanıcı aktif edildi' : 'Kullanıcı devre dışı bırakıldı');
      listeGetir();
    } catch { message.error('İşlem başarısız'); }
  };

  const kullaniciSil = async (id) => {
    try {
      await axios.delete(API_BASE_URL + `kullanici/delete/${id}`, { headers: getAuthHeader() });
      message.success('Kullanıcı silindi');
      listeGetir();
    } catch { message.error('Silme işlemi başarısız'); }
  };

  const kolonlar = [
    {
      title: 'Ad Soyad', dataIndex: 'name',
      sorter: (a, b) => a.name?.localeCompare(b.name, 'tr'),
      render: (v, r) => `${v} ${r.surname || ''}`,
    },
    { title: 'E-posta', dataIndex: 'email' },
    {
      title: 'Rol', dataIndex: 'role',
      filters: [
        { text: 'Sahip', value: 'owner' },
        { text: 'Admin', value: 'admin' },
        { text: 'Personel', value: 'personel' },
      ],
      onFilter: (value, record) => record.role === value,
      render: (v) => <Tag color={rolRenk[v]}>{rolYazi[v] || v}</Tag>,
    },
    {
      title: 'Durum', dataIndex: 'enabled',
      render: (v, kayit) => (
        isOwner && kayit._id !== currentAdmin?._id
          ? <Switch checked={v} onChange={(val) => durumDegistir(kayit._id, val)} checkedChildren="Aktif" unCheckedChildren="Pasif" />
          : <Tag color={v ? 'green' : 'red'}>{v ? 'Aktif' : 'Pasif'}</Tag>
      ),
    },
    {
      title: '', key: 'islemler', width: 60,
      render: (_, kayit) => (
        isOwner && kayit._id !== currentAdmin?._id ? (
          <Popconfirm
            title="Bu kullanıcıyı silmek istediğinize emin misiniz?"
            onConfirm={() => kullaniciSil(kayit._id)}
            okText="Evet" cancelText="Hayır"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        ) : null
      ),
    },
  ];

  if (!isOwner) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Kullanıcı Yönetimi</h2>
        <p style={{ color: '#999', marginTop: 16 }}>Bu sayfayı görüntüleme yetkiniz bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0 }}><UserOutlined style={{ marginRight: 8 }} />Kullanıcı Yönetimi</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalAcik(true); }}>
          Yeni Kullanıcı Ekle
        </Button>
      </div>

      <Input
        prefix={<SearchOutlined style={{ color: 'var(--text-3)' }} />}
        placeholder="Ad, soyad veya e-posta ile ara..."
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
        pagination={{ pageSize: 20, showTotal: (t) => `Toplam ${t} kullanıcı` }}
      />

      <Modal
        title="Yeni Kullanıcı Ekle"
        open={modalAcik}
        onCancel={() => { setModalAcik(false); form.resetFields(); }}
        onOk={() => form.submit()}
        okText="Kaydet"
        cancelText="İptal"
      >
        <Form form={form} layout="vertical" onFinish={kaydet}>
          <Form.Item name="name" label="Ad" rules={[{ required: true, message: 'Ad zorunlu' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="surname" label="Soyad">
            <Input />
          </Form.Item>
          <Form.Item name="email" label="E-posta" rules={[{ required: true, type: 'email', message: 'Geçerli e-posta girin' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Şifre" rules={[{ required: true, min: 6, message: 'En az 6 karakter' }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="role" label="Rol" initialValue="personel" rules={[{ required: true }]}>
            <Select>
              <Option value="admin">Admin</Option>
              <Option value="personel">Personel</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
