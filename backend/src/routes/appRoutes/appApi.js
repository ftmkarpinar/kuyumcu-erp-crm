const express = require('express');
const { catchErrors } = require('@/handlers/errorHandlers');
const router = express.Router();

const appControllers = require('@/controllers/appControllers');
const { routesList } = require('@/models/utils');
const dashboardController = require('@/controllers/appControllers/dashboardController');
const logKaydet = require('@/utils/logKaydet');

const entityTurkce = {
  client: 'Müşteri',
  cari: 'Cari İşlem',
  tahsilat: 'Tahsilat',
};

const logMiddleware = (entity) => (req, res, next) => {
  const orijinalJson = res.json.bind(res);
  res.json = (data) => {
    if (data?.success && req.admin) {
      const isimTurkce = entityTurkce[entity] || entity;
      let islem, aciklama;

      if (req.method === 'POST') {
        islem = entity === 'tahsilat' ? 'tahsilat_ekledi' : 'olusturdu';
        aciklama = `${isimTurkce} kaydı oluşturuldu`;
      } else if (req.method === 'PATCH') {
        islem = 'guncelledi';
        aciklama = `${isimTurkce} kaydı güncellendi`;
      } else if (req.method === 'DELETE') {
        islem = 'sildi';
        aciklama = `${isimTurkce} kaydı silindi`;
      }

      if (islem) {
        logKaydet({ kullaniciId: req.admin._id, islem, entity, aciklama });
      }
    }
    return orijinalJson(data);
  };
  next();
};

const routerApp = (entity, controller) => {
  router.route(`/${entity}/create`).post(logMiddleware(entity), catchErrors(controller['create']));
  router.route(`/${entity}/read/:id`).get(catchErrors(controller['read']));
  router.route(`/${entity}/update/:id`).patch(logMiddleware(entity), catchErrors(controller['update']));
  router.route(`/${entity}/delete/:id`).delete(logMiddleware(entity), catchErrors(controller['delete']));
  router.route(`/${entity}/search`).get(catchErrors(controller['search']));
  router.route(`/${entity}/list`).get(catchErrors(controller['list']));
  router.route(`/${entity}/listAll`).get(catchErrors(controller['listAll']));
  router.route(`/${entity}/filter`).get(catchErrors(controller['filter']));
  router.route(`/${entity}/summary`).get(catchErrors(controller['summary']));

  if (entity === 'invoice' || entity === 'quote' || entity === 'payment') {
    router.route(`/${entity}/mail`).post(catchErrors(controller['mail']));
  }

  if (entity === 'quote') {
    router.route(`/${entity}/convert/:id`).get(catchErrors(controller['convert']));
  }
};

router.route('/dashboard/summary').get(catchErrors(dashboardController.summary));
routesList.forEach(({ entity, controllerName }) => {
  const controller = appControllers[controllerName];
  routerApp(entity, controller);

  // Urun (stok) için özel endpoint'ler
  if (entity === 'urun') {
    router.route('/urun/stok/:id').patch(catchErrors(controller['stokGuncelle']));
    router.route('/urun/dusuk-stok').get(catchErrors(controller['dusukStok']));
  }
});

module.exports = router;
