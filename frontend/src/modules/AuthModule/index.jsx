import useLanguage from '@/locale/useLanguage';

import { Layout, Col, Divider, Typography } from 'antd';

import AuthLayout from '@/layout/AuthLayout';
import SideContent from './SideContent';

const { Content } = Layout;
const { Title } = Typography;

const AuthModule = ({ authContent, AUTH_TITLE, isForRegistre = false }) => {
  const translate = useLanguage();
  return (
    <AuthLayout sideContent={<SideContent />}>
      <div>
        {/* Üst etiket */}
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#d4890e',
          marginBottom: 20,
        }}>
          Kimlik Doğrulama
        </div>

        <Title level={2} style={{
          color: 'rgba(255,255,255,0.92)',
          margin: '0 0 8px',
          fontSize: 26,
          fontWeight: 700,
        }}>
          {translate(AUTH_TITLE)}
        </Title>

        <p style={{
          color: 'rgba(255,255,255,0.3)',
          fontSize: 13,
          fontFamily: "'JetBrains Mono', monospace",
          margin: '0 0 32px',
        }}>
          Sisteme erişmek için giriş yapınız
        </p>

        {/* Altın çizgi */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, #d4890e44, transparent)',
          marginBottom: 32,
        }} />

        <div>{authContent}</div>
      </div>
    </AuthLayout>
  );
};

export default AuthModule;
