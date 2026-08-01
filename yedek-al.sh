#!/bin/bash
# Kuyumcu Sistemi - Otomatik Yedekleme
# Kullanım: ./yedek-al.sh
# Otomatik çalıştırmak için: crontab -e ile günlük zamanlayıcı kur

YEDEK_KLASOR="$HOME/Desktop/kuyumcu-yedekler"
TARIH=$(date +%Y-%m-%d_%H-%M)
HEDEF="$YEDEK_KLASOR/yedek-$TARIH"

# Klasör yoksa oluştur
mkdir -p "$YEDEK_KLASOR"

echo "Yedek alınıyor: $HEDEF"

mongodump \
  --uri="mongodb://localhost:27017/idurar-erp-crm" \
  --out="$HEDEF" \
  --quiet

if [ $? -eq 0 ]; then
  echo "✅ Yedek başarıyla alındı: $HEDEF"
else
  echo "❌ Yedek alınamadı!"
  exit 1
fi

# 30 günden eski yedekleri sil (disk dolmasın)
find "$YEDEK_KLASOR" -maxdepth 1 -type d -name "yedek-*" -mtime +30 -exec rm -rf {} \;
echo "🧹 30 günden eski yedekler temizlendi"
