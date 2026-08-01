const mongoose = require('mongoose');
const autopopulate = require('mongoose-autopopulate');

const urunSchema = new mongoose.Schema({
  removed: { type: Boolean, default: false },
  enabled: { type: Boolean, default: true },

  urunAdi: { type: String, required: true, trim: true },

  kategori: {
    type: String,
    enum: ['bilezik', 'yuzuk', 'kolye', 'kupe', 'altin', 'gumus', 'para', 'diger'],
    required: true,
  },

  ayar: {
    type: String,
    enum: ['8', '14', '18', '21', '22', '24', '925', 'has', 'diger'],
    default: 'diger',
  },

  birim: {
    type: String,
    enum: ['adet', 'gram'],
    default: 'adet',
    required: true,
  },

  gramAgirlik: { type: Number, min: 0, default: 0 }, // adet ürün ise parça başı gram

  stokMiktari: { type: Number, min: 0, default: 0, required: true },

  minimumStok: { type: Number, min: 0, default: 1 }, // bu altına düşünce uyarı

  maliyet: { type: Number, min: 0, default: 0 }, // alış fiyatı

  satisFiyati: { type: Number, min: 0, default: 0 }, // satış fiyatı

  barkod: { type: String, trim: true },

  aciklama: { type: String, trim: true },

  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
    autopopulate: { select: 'name surname email' },
  },

  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
});

urunSchema.plugin(autopopulate);

module.exports = mongoose.model('Urun', urunSchema);
