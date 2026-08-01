import { useEffect, useState } from 'react';
import { Form, Input, Button, Avatar, message, Divider } from 'antd';
import { UserOutlined, SaveOutlined, LockOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCurrentAdmin } from '@/redux/auth/selectors';
import { selectCompanySettings } from '@/redux/settings/selectors';
import { updateProfile, logout } from '@/redux/auth/actions';
import { BASE_URL } from '@/config/serverApiConfig';
import { request } from '@/request';

export default function ProfilSettings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentAdmin = useSelector(selectCurrentAdmin);
  const companySettings = useSelector(selectCompanySettings);
  const [form] = Form.useForm();
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sifreYukleniyor, setSifreYukleniyor] = useState(false);
  const [sifreForm] = Form.useForm();

  useEffect(() => {
    if (currentAdmin) {
      form.setFieldsValue({
        name: currentAdmin.name,
        surname: currentAdmin.surname,
        email: currentAdmin.email,
      });
    }
  }, [currentAdmin]);

  // Firma logosu varsa onu göster (kişisel fotoğraftan öncelikli)
  const fotoUrl = companySettings?.company_logo
    ? BASE_URL + companySettings.company_logo + '?v=' + encodeURIComponent(companySettings.company_logo)
    : currentAdmin?.photo
    ? BASE_URL + currentAdmin.photo
    : null;

  const kaydet = async (degerler) => {
    setYukleniyor(true);
    await dispatch(updateProfile({ entity: 'admin/profile', jsonData: degerler }));
    setYukleniyor(false);
    message.success('Profil güncellendi');
  };

  const sifreDegistir = async (degerler) => {
    if (degerler.yeniSifre !== degerler.yeniSifreTekrar) {
      message.error('Şifreler eşleşmiyor');
      return;
    }
    setSifreYukleniyor(true);
    const sonuc = await request.patch({
      entity: 'admin/profile/password',
      jsonData: { password: degerler.yeniSifre, passwordCheck: degerler.yeniSifreTekrar },
    });
    setSifreYukleniyor(false);
    if (sonuc?.success) {
      message.success('Şifre güncellendi. Yeniden giriş yapmanız gerekiyor...');
      setTimeout(() => {
        dispatch(logout());
        navigate('/login');
      }, 1500);
    } else {
      message.error(sonuc?.msg || 'Şifre güncellenemedi');
    }
  };

  return (
    <div style={{ maxWidth: 520, padding: '24px 0' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginBottom: 32,
          padding: 20,
          background: '#1a1a1a',
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <Avatar
          size={80}
          src={fotoUrl}
          icon={<UserOutlined />}
          style={{ background: '#1677ff', flexShrink: 0 }}
        />
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 18 }}>
            {currentAdmin?.name} {currentAdmin?.surname}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginTop: 4 }}>{currentAdmin?.email}</div>
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: '#d4a843',
              background: 'rgba(212,168,67,0.12)',
              padding: '2px 8px',
              borderRadius: 4,
              display: 'inline-block',
            }}
          >
            {{ owner: 'Sahip', admin: 'Yönetici', manager: 'Müdür', employee: 'Çalışan' }[currentAdmin?.role] || currentAdmin?.role}
          </div>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={kaydet}>
        <Form.Item name="name" label="Ad" rules={[{ required: true, message: 'Ad zorunlu' }]}>
          <Input size="large" placeholder="Adınız" />
        </Form.Item>
        <Form.Item
          name="surname"
          label="Soyad"
          rules={[{ required: true, message: 'Soyad zorunlu' }]}
        >
          <Input size="large" placeholder="Soyadınız" />
        </Form.Item>
        <Form.Item
          name="email"
          label="E-posta"
          rules={[{ required: true, type: 'email', message: 'Geçerli e-posta giriniz' }]}
        >
          <Input size="large" placeholder="E-posta adresiniz" />
        </Form.Item>

        <Form.Item style={{ marginTop: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={yukleniyor}
            icon={<SaveOutlined />}
            size="large"
            style={{ minWidth: 140 }}
          >
            Kaydet
          </Button>
        </Form.Item>
      </Form>

      <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '32px 0 24px' }} />

      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <LockOutlined style={{ color: '#d4a843', fontSize: 16 }} />
        <span style={{ fontWeight: 600, fontSize: 15 }}>Şifre Değiştir</span>
      </div>

      <Form form={sifreForm} layout="vertical" onFinish={sifreDegistir}>
        <Form.Item
          name="yeniSifre"
          label="Yeni Şifre"
          rules={[
            { required: true, message: 'Yeni şifre zorunlu' },
            { min: 8, message: 'Şifre en az 8 karakter olmalı' },
          ]}
        >
          <Input.Password size="large" placeholder="En az 8 karakter" />
        </Form.Item>
        <Form.Item
          name="yeniSifreTekrar"
          label="Yeni Şifre (Tekrar)"
          rules={[{ required: true, message: 'Şifre tekrarı zorunlu' }]}
        >
          <Input.Password size="large" placeholder="Şifreyi tekrar girin" />
        </Form.Item>
        <Form.Item style={{ marginTop: 8 }}>
          <Button
            htmlType="submit"
            loading={sifreYukleniyor}
            icon={<LockOutlined />}
            size="large"
            style={{ minWidth: 180, borderColor: '#d4a843', color: '#d4a843' }}
          >
            Şifreyi Güncelle
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
