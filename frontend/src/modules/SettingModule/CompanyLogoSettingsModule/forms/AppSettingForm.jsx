import { Button, Form, message, Upload } from 'antd';

import { UploadOutlined } from '@ant-design/icons';

import useLanguage from '@/locale/useLanguage';

export default function AppSettingForm() {
  const translate = useLanguage();
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('Yalnızca JPG/PNG dosyası yükleyebilirsiniz!');
    }
    const isLt2M = file.size / 1024 / 1024 < 5;
    if (!isLt2M) {
      message.error('Görsel 5MB\'dan küçük olmalıdır!');
    }
    return false;
  };
  return (
    <>
      <Form.Item
        name="file"
        label="Logo"
        valuePropName="fileList"
        getValueFromEvent={(e) => e.fileList}
      >
        <Upload
          beforeUpload={beforeUpload}
          listType="picture"
          accept="image/png, image/jpeg"
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>{translate('click_to_upload')}</Button>
        </Upload>
      </Form.Item>
    </>
  );
}
