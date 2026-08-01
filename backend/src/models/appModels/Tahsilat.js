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

  cari: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cari',
    required: true,
    autopopulate: true,
  },

  tutar: {
    type: Number,
    required: true,
    min: 0,
  },

  tarih: {
    type: Date,
    default: Date.now,
  },

  aciklama: {
    type: String,
  },

  createdBy: { type: mongoose.Schema.ObjectId, ref: 'Admin' },
  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now },
});

schema.plugin(require('mongoose-autopopulate'));

module.exports = mongoose.model('Tahsilat', schema);
