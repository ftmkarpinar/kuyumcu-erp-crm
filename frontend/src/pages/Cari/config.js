export const fields = {
  musteri: {
    type: 'search',
    label: 'Müşteri',
    required: true,
    entity: 'client',
    displayLabels: ['name'],
    searchFields: 'name',
    outputValue: '_id',
  },
  islemTipi: {
    type: 'select',
    label: 'İşlem Tipi',
    required: true,
    options: [
      { value: 'alacak', label: 'Alacak (Müşteri borçlu)' },
      { value: 'verecek', label: 'Verecek (Biz borçluyuz)' },
    ],
  },
  tutar: {
    type: 'number',
    label: 'Tutar (₺)',
    required: true,
  },
  gramMiktari: {
    type: 'number',
    label: 'Gram Miktarı',
  },
  urunTipi: {
    type: 'selectWithFeedback',
    hasFeedback: true,
    label: 'Ürün Tipi',
    options: [
      { value: 'ceyrek', label: 'Çeyrek Altın' },
      { value: 'yarim', label: 'Yarım Altın' },
      { value: 'tam', label: 'Tam Altın' },
      { value: 'gram', label: 'Gram Altın' },
      { value: 'diger', label: 'Diğer' },
    ],
  },
  urunTipiAciklama: {
    type: 'string',
    label: 'Diğer ürün tipi (açıklayın)',
    feedback: 'diger',
  },
  islemTarihi: {
    type: 'date',
    label: 'İşlem Tarihi',
    required: true,
  },
  vadeTarihi: {
    type: 'date',
    label: 'Vade Tarihi',
    required: true,
  },
  aciklama: {
    type: 'textarea',
    label: 'Açıklama',
  },
};
