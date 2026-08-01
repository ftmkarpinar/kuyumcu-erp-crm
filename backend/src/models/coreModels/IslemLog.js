const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  kullanici: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
    autopopulate: { select: 'name surname email role' },
  },
  islem: {
    type: String,
    enum: ['olusturdu', 'guncelledi', 'sildi', 'tahsilat_ekledi', 'giris_yapti'],
    required: true,
  },
  entity: {
    type: String, // 'musteri', 'cari', 'tahsilat'
  },
  aciklama: {
    type: String,
  },
  tarih: {
    type: Date,
    default: Date.now,
  },
});

schema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('IslemLog', schema);
