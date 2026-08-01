const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const Urun = require('@/models/appModels/Urun');

const crudMethods = createCRUDController('Urun');

// Stok miktarını arttır/azalt
const stokGuncelle = async (req, res) => {
  try {
    const { id } = req.params;
    const { miktar, tip, aciklama } = req.body;
    // tip: 'giris' (stok giriş) | 'cikis' (stok çıkış) | 'ayarla' (direkt set)

    const urun = await Urun.findById(id);
    if (!urun) return res.status(404).json({ success: false, message: 'Ürün bulunamadı' });

    if (tip === 'giris') {
      urun.stokMiktari += Number(miktar);
    } else if (tip === 'cikis') {
      if (urun.stokMiktari < Number(miktar)) {
        return res.status(400).json({ success: false, message: 'Yetersiz stok' });
      }
      urun.stokMiktari -= Number(miktar);
    } else if (tip === 'ayarla') {
      urun.stokMiktari = Number(miktar);
    }

    urun.updated = new Date();
    await urun.save();

    return res.status(200).json({
      success: true,
      result: urun,
      message: 'Stok güncellendi',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Düşük stok uyarısı
const dusukStok = async (req, res) => {
  try {
    const urunler = await Urun.find({
      removed: false,
      $expr: { $lte: ['$stokMiktari', '$minimumStok'] },
    });
    return res.status(200).json({ success: true, result: urunler });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  ...crudMethods,
  stokGuncelle,
  dusukStok,
};
