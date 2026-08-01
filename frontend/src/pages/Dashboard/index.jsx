import { useEffect, useState, useRef } from 'react';
import { Tag, Spin, Table } from 'antd';
import {
  UserOutlined,
  RiseOutlined,
  FallOutlined,
  WarningOutlined,
  DollarOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { request } from '@/request';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
dayjs.locale('tr');
import { useSelector } from 'react-redux';
import { selectCompanySettings } from '@/redux/settings/selectors';

/* ── Animasyonlu sayaç hook ── */
function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(target * ease);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return val;
}

/* ── Büyük stat kartı ── */
function StatCard({ title, value, prefix, suffix = '', color, mono = false, format = 'number' }) {
  const animated = useCountUp(typeof value === 'number' ? value : 0);
  const display =
    format === 'currency'
      ? '₺' + animated.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : Math.round(animated).toLocaleString('tr-TR');

  return (
    <div className="bento-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ color: 'var(--gold)', fontSize: 16 }}>{prefix}</span>
        <span style={{
          fontSize: 10,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--text-2)',
          fontFamily: 'var(--mono)',
        }}>
          {title}
        </span>
      </div>
      <div style={{
        fontSize: mono ? 28 : 32,
        fontWeight: 700,
        color: color || 'var(--text-1)',
        fontFamily: 'var(--mono)',
        lineHeight: 1,
        letterSpacing: '-0.02em',
      }}>
        {display}
        {suffix && <span style={{ fontSize: 16, marginLeft: 4, color: 'var(--text-2)' }}>{suffix}</span>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [veri, setVeri] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const companySettings = useSelector(selectCompanySettings);
  const firmaAdi = companySettings?.company_name || 'Sistem';

  useEffect(() => {
    request.summary({ entity: 'dashboard' }).then((sonuc) => {
      if (sonuc?.success) setVeri(sonuc.result);
      setYukleniyor(false);
    });
  }, []);

  if (yukleniyor) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 0' }}>

      {/* ── Başlık ── */}
      <div style={{ marginBottom: 32 }}>
        <p style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          color: 'var(--gold)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          margin: 0,
          marginBottom: 6,
        }}>
          OPERASYONELKontrol Paneli
        </p>
        <h1 style={{
          margin: 0,
          fontSize: 28,
          fontWeight: 700,
          color: 'var(--text-1)',
          letterSpacing: '-0.02em',
        }}>
          {firmaAdi}
        </h1>
        <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 4, fontFamily: 'var(--mono)' }}>
          {dayjs().format('DD MMMM YYYY — HH:mm')}
        </p>
      </div>

      {/* ── Bento Grid ── */}
      <div className="bento-grid">

        {/* Büyük stat — Toplam Alacak */}
        <div className="bento-card bento-wide" style={{ gridColumn: 'span 2' }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--text-2)', fontFamily: 'var(--mono)', marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <RiseOutlined style={{ color: '#ff4d4f' }} /> Toplam Alacak
          </div>
          <AnimatedCurrency value={veri?.toplamAlacak || 0} color="#ff6b6b" />
          <div style={{ marginTop: 12, height: 2, background: 'linear-gradient(90deg, #ff4d4f44, transparent)' }} />
        </div>

        {/* Toplam Müşteri */}
        <StatCard
          title="Toplam Müşteri"
          value={veri?.toplamMusteri || 0}
          prefix={<UserOutlined />}
          color="var(--gold)"
        />

        {/* Toplam Verecek */}
        <StatCard
          title="Toplam Verecek"
          value={veri?.toplamVerecek || 0}
          prefix={<FallOutlined />}
          color="#52c41a"
          format="currency"
        />

        {/* Bu Ay Tahsilat */}
        <StatCard
          title="Bu Ay Tahsilat"
          value={veri?.buAyTahsilat || 0}
          prefix={<DollarOutlined />}
          color="var(--gold)"
          format="currency"
        />

        {/* Vadesi Geçmiş */}
        <div className="bento-card" style={{
          borderColor: veri?.vadesiGecmis > 0 ? 'rgba(250,173,20,0.4)' : undefined,
        }}>
          <div style={{
            fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--text-2)', fontFamily: 'var(--mono)', marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <WarningOutlined style={{ color: '#faad14' }} /> Vadesi Geçmiş
          </div>
          <div style={{
            fontSize: 48,
            fontWeight: 700,
            fontFamily: 'var(--mono)',
            color: veri?.vadesiGecmis > 0 ? '#faad14' : '#52c41a',
            lineHeight: 1,
          }}>
            {veri?.vadesiGecmis || 0}
          </div>
          <div style={{ marginTop: 8, color: 'var(--text-3)', fontSize: 12 }}>
            {veri?.vadesiGecmis > 0 ? 'kayıt takip gerektiriyor' : 'tüm ödemeler güncel'}
          </div>
        </div>

        {/* Yaklaşan Vadeler tablosu — tam genişlik */}
        <div className="bento-card" style={{ gridColumn: '1 / -1' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 16,
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--text-2)',
          }}>
            <ClockCircleOutlined style={{ color: 'var(--gold)' }} />
            Yaklaşan Vadeler — 7 Gün
          </div>
          <Table
            dataSource={veri?.yaklasanVadeler || []}
            rowKey="_id"
            pagination={false}
            size="small"
            scroll={{ x: true }}
            locale={{ emptyText: <span style={{ color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>— Yaklaşan vade yok —</span> }}
            columns={[
              {
                title: 'Müşteri',
                dataIndex: ['musteri', 'name'],
                render: v => <span style={{ fontWeight: 600 }}>{v}</span>,
              },
              {
                title: 'Telefon',
                dataIndex: ['musteri', 'phone'],
                render: v => <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-2)' }}>{v || '—'}</span>,
              },
              {
                title: 'Tür',
                dataIndex: 'islemTipi',
                render: tip => (
                  <Tag color={tip === 'alacak' ? 'red' : 'green'}>
                    {tip === 'alacak' ? 'Alacak' : 'Verecek'}
                  </Tag>
                ),
              },
              {
                title: 'Kalan Tutar',
                dataIndex: 'kalanTutar',
                render: tutar => (
                  <span style={{ fontFamily: 'var(--mono)', color: 'var(--gold)', fontWeight: 600 }}>
                    ₺{Number(tutar).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                  </span>
                ),
              },
              {
                title: 'Vade Tarihi',
                dataIndex: 'vadeTarihi',
                render: tarih => (
                  <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-2)' }}>
                    {dayjs(tarih).format('DD.MM.YYYY')}
                  </span>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Büyük para animasyonu ── */
function AnimatedCurrency({ value, color }) {
  const animated = useCountUp(value);
  return (
    <div style={{
      fontSize: 42,
      fontWeight: 700,
      color: color || 'var(--text-1)',
      fontFamily: 'var(--mono)',
      letterSpacing: '-0.03em',
      lineHeight: 1,
    }}>
      ₺{animated.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </div>
  );
}
