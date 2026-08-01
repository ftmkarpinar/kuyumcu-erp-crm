import { lazy, Suspense, useEffect } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
import { selectCompanySettings } from '@/redux/settings/selectors';
import { settingsAction } from '@/redux/settings/actions';
import { AppContextProvider } from '@/context/appContext';
import PageLoader from '@/components/PageLoader';
import AuthRouter from '@/router/AuthRouter';
import Localization from '@/locale/Localization';
import { notification } from 'antd';
import { BASE_URL } from '@/config/serverApiConfig';

const ErpApp = lazy(() => import('./ErpApp'));

const DefaultApp = () => (
  <Localization>
    <AppContextProvider>
      <Suspense fallback={<PageLoader />}>
        <ErpApp />
      </Suspense>
    </AppContextProvider>
  </Localization>
);

function setTitleAndFavicon(name, logoPath) {
  if (name) document.title = name + ' | Kuyumcu Takip';

  if (logoPath) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 128; canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.arc(64, 64, 64, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 0, 0, 128, 128);
      let link = document.querySelector("link[rel~='icon']");
      if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
      link.href = canvas.toDataURL('image/png');
    };
    img.src = BASE_URL + logoPath;
  }
}

export default function KuyumcuOs() {
  const { isLoggedIn } = useSelector(selectAuth);
  const companySettings = useSelector(selectCompanySettings);
  const dispatch = useDispatch();

  // İlk yüklemede ve her auth değişiminde title/favicon ayarla
  useEffect(() => {
    // Her zaman localStorage'dan anında ayarla (API bekleme)
    try {
      const saved = JSON.parse(localStorage.getItem('settings') || '{}');
      const cs = saved?.company_settings || {};
      if (cs.company_name) setTitleAndFavicon(cs.company_name, cs.company_logo);
    } catch { /* sessiz hata */ }

    // Settings API'sını sadece giriş yapılmışken çek (401 hatası önlenir)
    if (isLoggedIn) {
      dispatch(settingsAction.list({ entity: 'setting' }));
    }
  }, [isLoggedIn]);

  // Redux'tan taze veri gelince de güncelle
  useEffect(() => {
    const name = companySettings?.company_name;
    const logo = companySettings?.company_logo;
    if (name) setTitleAndFavicon(name, logo);
  }, [companySettings]);

  // // Online state
  // const [isOnline, setIsOnline] = useState(navigator.onLine);

  // useEffect(() => {
  //   // Update network status
  //   const handleStatusChange = () => {
  //     setIsOnline(navigator.onLine);
  //     if (!isOnline) {
  //       console.log('🚀 ~ useEffect ~ navigator.onLine:', navigator.onLine);
  //       notification.config({
  //         duration: 20,
  //         maxCount: 1,
  //       });
  //       // Code to execute when there is internet connection
  //       notification.error({
  //         message: 'No internet connection',
  //         description: 'Cannot connect to the Internet, Check your internet network',
  //       });
  //     }
  //   };

  //   // Listen to the online status
  //   window.addEventListener('online', handleStatusChange);

  //   // Listen to the offline status
  //   window.addEventListener('offline', handleStatusChange);

  //   // Specify how to clean up after this effect for performance improvment
  //   return () => {
  //     window.removeEventListener('online', handleStatusChange);
  //     window.removeEventListener('offline', handleStatusChange);
  //   };
  // }, [navigator.onLine]);

  if (!isLoggedIn)
    return (
      <Localization>
        <AuthRouter />
      </Localization>
    );
  else {
    return <DefaultApp />;
  }
}
