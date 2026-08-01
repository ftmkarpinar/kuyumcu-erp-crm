export const fields = {
  name: {
    type: 'string',
    label: 'Ad Soyad',
    required: true,
  },
  phone: {
    type: 'phone',
    label: 'Telefon',
  },
  tcKimlik: {
    type: 'string',
    label: 'TC Kimlik No',
    maxLength: 11,
  },
  address: {
    type: 'string',
    label: 'Adres',
  },
  email: {
    type: 'email',
    label: 'E-posta',
  },
  etiket: {
    type: 'tag',
    label: 'Etiket',
    options: [
      { value: 'duzenli', label: 'Düzenli', color: 'green' },
      { value: 'riskli', label: 'Riskli', color: 'red' },
      { value: 'toptanci', label: 'Toptancı', color: 'blue' },
      { value: 'vip', label: 'VIP', color: 'gold' },
    ],
  },
  riskSkoru: {
    type: 'number',
    label: 'Risk Skoru (0-100)',
  },
  not: {
    type: 'textarea',
    label: 'Not',
  },
};
