const mongoose = require('mongoose');

async function logKaydet({ kullaniciId, islem, entity, aciklama }) {
  try {
    const IslemLog = mongoose.model('IslemLog');
    await new IslemLog({ kullanici: kullaniciId, islem, entity, aciklama }).save();
  } catch (e) {
    // Log hatası uygulamayı durdurmasın
    console.error('Log kaydedilemedi:', e.message);
  }
}

module.exports = logKaydet;
