import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Drawer, Layout, Menu } from 'antd';

import { useAppContext } from '@/context/appContext';
import { useSelector } from 'react-redux';
import { selectCompanySettings } from '@/redux/settings/selectors';
import { BASE_URL } from '@/config/serverApiConfig';

import useLanguage from '@/locale/useLanguage';
import logoIcon from '@/style/images/logo-icon.svg';

import useResponsive from '@/hooks/useResponsive';

import {
  SettingOutlined,
  CustomerServiceOutlined,
  ContainerOutlined,
  FileSyncOutlined,
  DashboardOutlined,
  TagOutlined,
  TagsOutlined,
  UserOutlined,
  CreditCardOutlined,
  MenuOutlined,
  FileOutlined,
  ShopOutlined,
  FilterOutlined,
  WalletOutlined,
  ReconciliationOutlined,
  GoldOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

export default function Navigation() {
  const { isMobile } = useResponsive();

  return isMobile ? null : <Sidebar collapsible={false} />;
}

export function MobileMenuButton() {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Button
        type="text"
        size="large"
        onClick={() => setVisible(true)}
        style={{ marginRight: 'auto' }}
      >
        <MenuOutlined style={{ fontSize: 20 }} />
      </Button>
      <Drawer width={256} placement="left" closable={false} onClose={() => setVisible(false)} open={visible}>
        <Sidebar collapsible={false} isMobile={true} />
      </Drawer>
    </>
  );
}

function Sidebar({ collapsible, isMobile = false }) {
  let location = useLocation();

  const { state: stateApp, appContextAction } = useAppContext();
  const { isNavMenuClose } = stateApp;
  const { navMenu } = appContextAction;
  const [showLogoApp, setLogoApp] = useState(isNavMenuClose);
  const [currentPath, setCurrentPath] = useState(location.pathname.slice(1));

  const companySettings = useSelector(selectCompanySettings);
  const firmaAdi = companySettings?.company_name || 'CRM';
  const firmaLogoPath = companySettings?.company_logo;
  const firmaLogoUrl = firmaLogoPath
    ? BASE_URL + firmaLogoPath + '?v=' + encodeURIComponent(firmaLogoPath)
    : null;

  const translate = useLanguage();
  const navigate = useNavigate();

  const items = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to={'/'}>Ana Sayfa</Link>,
    },
    {
      key: 'customer',
      icon: <CustomerServiceOutlined />,
      label: <Link to={'/customer'}>Müşteriler</Link>,
    },
    {
      key: 'cari',
      icon: <ContainerOutlined />,
      label: <Link to={'/account'}>Cari İşlemler</Link>,
    },
    {
      key: 'kullanicilar',
      icon: <UserOutlined />,
      label: <Link to={'/kullanicilar'}>Kullanıcılar</Link>,
    },
    {
      key: 'islem-log',
      icon: <FileSyncOutlined />,
      label: <Link to={'/islem-log'}>İşlem Geçmişi</Link>,
    },
    {
      key: 'gecikenler',
      icon: <WalletOutlined />,
      label: <Link to={'/gecikenler'}>Geciken Ödemeler</Link>,
    },
    {
      key: 'stok',
      icon: <GoldOutlined />,
      label: <Link to={'/stok'}>Stok Yönetimi</Link>,
    },
    {
      key: 'generalSettings',
      label: <Link to={'/settings'}>Ayarlar</Link>,
      icon: <SettingOutlined />,
    },
  ];

  useEffect(() => {
    if (location)
      if (currentPath !== location.pathname) {
        if (location.pathname === '/') {
          setCurrentPath('dashboard');
        } else setCurrentPath(location.pathname.slice(1));
      }
  }, [location, currentPath]);

  useEffect(() => {
    if (isNavMenuClose) {
      setLogoApp(isNavMenuClose);
    }
    const timer = setTimeout(() => {
      if (!isNavMenuClose) {
        setLogoApp(isNavMenuClose);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [isNavMenuClose]);
  const onCollapse = () => {
    navMenu.collapse();
  };

  return (
    <Sider
      collapsible={collapsible}
      collapsed={collapsible ? isNavMenuClose : collapsible}
      onCollapse={onCollapse}
      className="navigation"
      width={256}
      style={{
        overflow: 'auto',
        height: '100vh',

        position: isMobile ? 'absolute' : 'relative',
        bottom: '20px',
        ...(!isMobile && {
          // border: 'none',
          ['left']: '20px',
          top: '20px',
          // borderRadius: '8px',
        }),
      }}
      theme={'light'}
    >
      <div
        className="logo"
        onClick={() => navigate('/')}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {firmaLogoUrl ? (
          <img
            src={firmaLogoUrl}
            alt="Logo"
            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%', flexShrink: 0 }}
          />
        ) : (
          <img src={logoIcon} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0 }} />
        )}

        {!showLogoApp && (
          <span
            style={{
              fontWeight: '700',
              fontSize: '15px',
              color: '#d4a843',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '160px',
              letterSpacing: '0.3px',
            }}
          >
            {firmaAdi}
          </span>
        )}
      </div>
      <Menu
        items={items}
        mode="inline"
        theme={'light'}
        selectedKeys={[currentPath]}
        style={{
          width: 256,
        }}
      />
    </Sider>
  );
}

function MobileSidebar() {
  const [visible, setVisible] = useState(false);
  const showDrawer = () => {
    setVisible(true);
  };
  const onClose = () => {
    setVisible(false);
  };

  return (
    <>
      <Button
        type="text"
        size="large"
        onClick={showDrawer}
        className="mobile-sidebar-btn"
        style={{ ['marginLeft']: 25 }}
      >
        <MenuOutlined style={{ fontSize: 18 }} />
      </Button>
      <Drawer
        width={250}
        // style={{ backgroundColor: 'rgba(255, 255, 255, 1)' }}
        placement={'left'}
        closable={false}
        onClose={onClose}
        open={visible}
      >
        <Sidebar collapsible={false} isMobile={true} />
      </Drawer>
    </>
  );
}
