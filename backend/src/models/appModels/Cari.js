const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  removed: { type: Boolean, default: false },
  enabled: { type: Boolean, default: true },

  musteri: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: true,
    autopopulate: true,
  },

  islemTipi: {
    type: String,
    enum: ['alacak', 'verecek'],
    required: true,
  },

  tutar: {
    type: Number,
    required: true,
    min: 0,
  },

  odemeTutari: {
    type: Number,
    default: 0,
    min: 0,
  },

  kalanTutar: {
    type: Number,
    default: function () {
      return this.tutar;
    },
  },

  islemTarihi: {
    type: Date,
    default: Date.now,
  },

  vadeTarihi: {
    type: Date,
    required: true,
  },

  aciklama: {
    type: String,
  },

  durum: {
    type: String,
    enum: ['acik', 'kismi_odendi', 'kapali'],
    default: 'acik',
  },

  // Kuyumcuya özel
  gramMiktari: {
    type: Number,
    min: 0,
  },

  urunTipi: {
    type: String,
    enum: ['ceyrek', 'yarim', 'tam', 'gram', 'diger'],
  },
  urunTipiAciklama: {
    type: String,
  },

  createdBy: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
});

schema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('Cari', schema);
