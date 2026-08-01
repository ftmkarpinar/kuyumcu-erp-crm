const Client = require('@/models/appModels/Client');
const Cari = require('@/models/appModels/Cari');
const Tahsilat = require('@/models/appModels/Tahsilat');

const summary = async (req, res) => {
  const simdi = new Date();
  const ayBasi = new Date(simdi.getFullYear(), simdi.getMonth(), 1);
  const yediGunSonra = new Date(simdi);
  yediGunSonra.setDate(yediGunSonra.getDate() + 7);

  const [
    toplamMusteri,
    cariKayitlar,
    buAyTahsilat,
    vadesiGecmis,
    yaklasanVadeler,
  ] = await Promise.all([
    Client.countDocuments({ removed: false, enabled: true }),

    Cari.find({ removed: false }).select('islemTipi tutar kalanTutar durum'),

    Tahsilat.aggregate([
      { $match: { tarih: { $gte: ayBasi }, removed: false } },
      { $group: { _id: null, toplam: { $sum: '$tutar' } } },
    ]),

    Cari.countDocuments({
      removed: false,
      durum: { $in: ['acik', 'kismi_odendi'] },
      vadeTarihi: { $lt: simdi },
    }),

    Cari.find({
      removed: false,
      durum: { $in: ['acik', 'kismi_odendi'] },
      vadeTarihi: { $gte: simdi, $lte: yediGunSonra },
    })
      .populate('musteri', 'name phone')
      .select('musteri kalanTutar vadeTarihi islemTipi')
      .sort({ vadeTarihi: 1 })
      .limit(10),
  ]);

  // Alacak ve verecek toplamları
  let toplamAlacak = 0;
  let toplamVerecek = 0;
  cariKayitlar.forEach((c) => {
    if (c.durum === 'kapali') return;
    if (c.islemTipi === 'alacak') toplamAlacak += c.kalanTutar || 0;
    else toplamVerecek += c.kalanTutar || 0;
  });

  return res.status(200).json({
    success: true,
    result: {
      toplamMusteri,
      toplamAlacak: toplamAlacak.toFixed(2),
      toplamVerecek: toplamVerecek.toFixed(2),
      buAyTahsilat: buAyTahsilat[0]?.toplam?.toFixed(2) ?? '0.00',
      vadesiGecmis,
      yaklasanVadeler,
    },
  });
};

module.exports = { summary };
