const mongoose = require('mongoose');

const listele = async (req, res) => {
  try {
    const IslemLog = mongoose.model('IslemLog');
    const { limit = 100 } = req.query;

    const loglar = await IslemLog.find()
      .sort({ tarih: -1 })
      .limit(Number(limit));

    return res.status(200).json({ success: true, result: loglar });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = { listele };
