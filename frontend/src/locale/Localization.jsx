import { ConfigProvider } from 'antd';
import tr_TR from 'antd/es/locale/tr_TR';

export default function Localization({ children }) {
  return (
    <ConfigProvider
      locale={tr_TR}
      theme={{
        token: {
          colorPrimary: '#339393',
          colorLink: '#1640D6',
          borderRadius: 0,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
