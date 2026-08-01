const mongoose = require('mongoose');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');

const summary = require('./summary');

function modelController() {
  const Model = mongoose.model('Client');
  const methods = createCRUDController('Client');

  methods.summary = (req, res) => summary(Model, req, res);

  // Müşteri silme — önce borç kontrolü, sonra cascade sil
  methods.delete = async (req, res) => {
    try {
      const { id } = req.params;
      const Cari = mongoose.model('Cari');

      // Bu müşteriye ait açık/kısmi cari kayıtları var mı?
      const acikKayitlar = await Cari.find({
        musteri: id,
        durum: { $in: ['acik', 'kismi_odendi'] },
        removed: false,
      });

      if (acikKayitlar.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Bu müşterinin ${acikKayitlar.length} adet açık/ödenmemiş borcu bulunmaktadır. Silinmeden önce tüm borçların kapatılması gerekir.`,
        });
      }

      // Açık borç yok — ilgili tüm cari kayıtları sil
      await Cari.updateMany(
        { musteri: id },
        { $set: { removed: true } }
      );

      // Müşteriyi sil
      const silinen = await Model.findByIdAndUpdate(
        id,
        { $set: { removed: true } },
        { new: true }
      );

      if (!silinen) {
        return res.status(404).json({ success: false, message: 'Müşteri bulunamadı' });
      }

      return res.status(200).json({ success: true, result: silinen, message: 'Müşteri ve ilgili kayıtlar silindi' });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  return methods;
}

module.exports = modelController();
