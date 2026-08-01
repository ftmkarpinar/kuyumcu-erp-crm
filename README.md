# Kuyumcu Takip Sistemi

Kuyumcu işletmeleri için geliştirilmiş bir ERP / CRM uygulaması. Müşteri cari hesaplarını, altın ve mücevher stoğunu, faturaları, teklifleri ve tahsilatları tek yerden yönetir; vadesi geçen ödemeleri takip eder.

Web tabanlıdır: **Node.js / Express.js / MongoDB** üzerinde çalışır, arayüzü **React** ve **Ant Design** ile yazılmıştır. Türkçe ve İngilizce dil desteği vardır.

---

## Uygulamadaki sayfalar

### Panel

Açılış ekranı. Cari durum, tahsilat ve fatura hareketlerinin genel özetini gösterir.

### Cari

Kuyumculuğa özel cari hesap modülü. Her kayıtta müşteri, işlem tipi, tutar, ödenen tutar ve kalan tutar tutulur. Ayrıca işlem ve vade tarihi, ürün tipi ve **gram miktarı** alanları bulunur — yani hesap yalnızca para üzerinden değil, gram üzerinden de takip edilebilir. Kayıtlar için makbuz yazdırılabilir.

### Stok

Ürün ve stok yönetimi. Her ürün için ürün adı, kategori, **ayar** (14/18/22 vb.), birim, **gram ağırlık**, stok miktarı, minimum stok seviyesi, maliyet, satış fiyatı ve barkod tutulur. Minimum stok alanı sayesinde azalan ürünler izlenebilir.

### Gecikenler

Vade tarihi geçmiş ve hâlâ kapanmamış cari kayıtları listeler. Tahsil edilmesi gereken alacakların takibi için kullanılır.

### Tahsilat

Müşteriden alınan ödemelerin kaydı. Her tahsilat bir müşteriye ve ilgili cari hesaba bağlanır; tutar, tarih ve açıklama tutulur.

### Müşteriler

Müşteri kayıtları ve iletişim bilgileri. Cari hesaplar, faturalar ve tahsilatlar bu kayıtlara bağlanır.

### Faturalar

Fatura oluşturma, düzenleme ve listeleme. Faturalar PDF olarak indirilebilir ve e-posta ile gönderilebilir. Ödeme durumu fatura üzerinden takip edilir.

### Teklifler

Müşteriye sunulacak fiyat tekliflerinin hazırlanması. Teklifler de PDF olarak çıkarılabilir ve kabul edilmesi hâlinde faturaya dönüştürülebilir.

### Ödemeler

Faturalara karşılık alınan ödemelerin kaydı ve ödeme makbuzu üretimi.

### İşlem Kaydı

Sistemde yapılan işlemlerin geçmiş kaydı. Hangi kaydın ne zaman değiştirildiğinin izlenmesini sağlar.

### Kullanıcılar

Sistemi kullanan personelin hesapları ve yetkileri.

### Ayarlar

Firma bilgileri, logo, para birimi, tarih biçimi, dil, vergi oranları ve ödeme yöntemi tanımları.

---

## Teknik özet

| Katman | Kullanılan teknoloji |
|---|---|
| Sunucu | Node.js, Express.js |
| Veritabanı | MongoDB (Mongoose) |
| Arayüz | React, Ant Design, Redux |
| Derleme | Vite |
| Kimlik doğrulama | JWT |
| Belge üretimi | PDF (fatura, teklif, makbuz) |
