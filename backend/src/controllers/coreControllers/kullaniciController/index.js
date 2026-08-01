const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { generate: uniqueId } = require('shortid');

const listele = async (req, res) => {
  try {
    const Admin = mongoose.model('Admin');
    const kullanicilar = await Admin.find({ removed: false }).select('name surname email role enabled created');
    return res.status(200).json({ success: true, result: kullanicilar });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

const olustur = async (req, res) => {
  try {
    // Sadece owner oluşturabilir
    if (req.admin.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok.' });
    }

    const Admin = mongoose.model('Admin');
    const AdminPassword = mongoose.model('AdminPassword');
    const { name, surname, email, password, role } = req.body;

    const mevcutKullanici = await Admin.findOne({ email, removed: false });
    if (mevcutKullanici) {
      return res.status(409).json({ success: false, message: 'Bu e-posta zaten kayıtlı.' });
    }

    const salt = uniqueId();
    const passwordHash = new AdminPassword().generateHash(salt, password);

    const yeniAdmin = await new Admin({
      name,
      surname: surname || '',
      email,
      role: role || 'personel',
      enabled: true,
    }).save();

    await new AdminPassword({
      password: passwordHash,
      emailVerified: true,
      salt,
      user: yeniAdmin._id,
    }).save();

    return res.status(200).json({ success: true, result: yeniAdmin, message: 'Kullanıcı oluşturuldu.' });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

const durumGuncelle = async (req, res) => {
  try {
    if (req.admin.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok.' });
    }
    const Admin = mongoose.model('Admin');
    const { id } = req.params;
    const { enabled } = req.body;
    const guncellenen = await Admin.findByIdAndUpdate(id, { enabled }, { new: true });
    return res.status(200).json({ success: true, result: guncellenen });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

const sil = async (req, res) => {
  try {
    if (req.admin.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Bu işlem için yetkiniz yok.' });
    }
    const Admin = mongoose.model('Admin');
    const { id } = req.params;
    if (id === req.admin._id.toString()) {
      return res.status(400).json({ success: false, message: 'Kendinizi silemezsiniz.' });
    }
    await Admin.findByIdAndUpdate(id, { removed: true });
    return res.status(200).json({ success: true, message: 'Kullanıcı silindi.' });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

module.exports = { listele, olustur, durumGuncelle, sil };
