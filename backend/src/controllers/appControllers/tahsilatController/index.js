const mongoose = require('mongoose');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');

function modelController() {
  const CariModel = mongoose.model('Cari');
  const methods = createCRUDController('Tahsilat');

  const originalCreate = methods.create;

  methods.create = async (req, res) => {
    try {
      const TahsilatModel = mongoose.model('Tahsilat');
      const { cari: cariId, tutar } = req.body;

      const cari = await CariModel.findById(cariId);
      if (!cari) {
        return res.status(404).json({ success: false, message: 'Cari kaydı bulunamadı' });
      }

      const yeniOdemeTutari = (cari.odemeTutari || 0) + Number(tutar);
      const yeniKalanTutar = cari.tutar - yeniOdemeTutari;

      let yeniDurum = 'acik';
      if (yeniKalanTutar <= 0) yeniDurum = 'kapali';
      else if (yeniOdemeTutari > 0) yeniDurum = 'kismi_odendi';

      await CariModel.findByIdAndUpdate(cariId, {
        odemeTutari: yeniOdemeTutari,
        kalanTutar: Math.max(yeniKalanTutar, 0),
        durum: yeniDurum,
        updated: Date.now(),
      });

      const tahsilat = new TahsilatModel({
        ...req.body,
        createdBy: req.admin._id,
      });
      const result = await tahsilat.save();

      return res.status(200).json({
        success: true,
        result,
        message: 'Tahsilat başarıyla kaydedildi',
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  return methods;
}

module.exports = modelController();
