const mongoose = require('mongoose');

const yedekAl = async (req, res) => {
  try {
    const Client = mongoose.model('Client');
    const Cari = mongoose.model('Cari');
    const Tahsilat = mongoose.model('Tahsilat');
    const Admin = mongoose.model('Admin');

    const [musteriler, cariKayitlar, tahsilatlar, kullanicilar] = await Promise.all([
      Client.find({ removed: false }),
      Cari.find({ removed: false }).populate('musteri', 'name phone'),
      Tahsilat.find({ removed: false }).populate('musteri', 'name'),
      Admin.find({ removed: false }).select('name surname email role enabled created'),
    ]);

    const yedek = {
      tarih: new Date().toISOString(),
      versiyon: '1.0',
      musteriler,
      cariKayitlar,
      tahsilatlar,
      kullanicilar,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=yedek_${new Date().toISOString().slice(0, 10)}.json`
    );
    return res.status(200).json({ success: true, result: yedek });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = { yedekAl };
