import { useEffect, useState } from 'react';
import { Table, Tag, Button, message } from 'antd';
import { HistoryOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '@/config/serverApiConfig';
import dayjs from 'dayjs';

function getAuthHeader() {
  const auth = JSON.parse(localStorage.getItem('auth') || '{}');
  return { Authorization: `Bearer ${auth?.current?.token || ''}` };
}

const islemRenk = {
  olusturdu: 'green',
  guncelledi: 'blue',
  sildi: 'red',
  tahsilat_ekledi: 'gold',
  giris_yapti: 'purple',
};

const islemYazi = {
  olusturdu: 'Oluşturdu',
  guncelledi: 'Güncelledi',
  sildi: 'Sildi',
  tahsilat_ekledi: 'Tahsilat Ekledi',
  giris_yapti: 'Giriş Yaptı',
};

const entityYazi = {
  client: 'Müşteri',
  cari: 'Cari İşlem',
  tahsilat: 'Tahsilat',
};

export default function IslemLog() {
  const [loglar, setLoglar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(false);

  const getir = async () => {
    setYukleniyor(true);
    try {
      const res = await axios.get(API_BASE_URL + 'log/list?limit=200', {
        headers: getAuthHeader(),
      });
      if (res.data?.success) setLoglar(res.data.result || []);
    } catch {
      message.error('Loglar yüklenemedi');
    }
    setYukleniyor(false);
  };

  useEffect(() => { getir(); }, []);

  const kolonlar = [
    {
      title: 'Tarih & Saat',
      dataIndex: 'tarih',
      render: (v) => dayjs(v).format('DD.MM.YYYY HH:mm'),
      width: 160,
    },
    {
      title: 'Kullanıcı',
      dataIndex: 'kullanici',
      render: (v) => v ? `${v.name} ${v.surname || ''}`.trim() : '-',
      width: 160,
    },
    {
      title: 'İşlem',
      dataIndex: 'islem',
      render: (v) => <Tag color={islemRenk[v]}>{islemYazi[v] || v}</Tag>,
      width: 140,
    },
    {
      title: 'Bölüm',
      dataIndex: 'entity',
      render: (v) => entityYazi[v] || v || '-',
      width: 120,
    },
    {
      title: 'Açıklama',
      dataIndex: 'aciklama',
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ margin: 0 }}><HistoryOutlined style={{ marginRight: 8 }} />İşlem Geçmişi</h2>
        <Button icon={<ReloadOutlined />} onClick={getir}>Yenile</Button>
      </div>

      <Table
        columns={kolonlar}
        dataSource={loglar}
        rowKey="_id"
        loading={yukleniyor}
        pagination={{ pageSize: 20 }}
        size="small"
        scroll={{ x: true }}
        locale={{ emptyText: 'Henüz işlem kaydı yok' }}
      />
    </div>
  );
}
