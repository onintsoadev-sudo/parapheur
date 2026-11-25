const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

const authCtrl = require('../controllers/authController');
const dgCtrl = require('../controllers/dgController');
const dirCtrl = require('../controllers/dirController');
const servCtrl = require('../controllers/servController');
const courrierCtrl = require('../controllers/courrierController');
const mouvementCtrl = require('../controllers/mouvementController');
const visitorCtrl = require('../controllers/visitorController');
const supportCtrl = require('../controllers/supportController');

// ---------- Auth / Users ----------
router.get('/user', auth, authCtrl.getUser);
router.get('/userCount', auth, authCtrl.userCount);
router.post('/register', auth, authCtrl.register);
router.get('/usersList', auth, authCtrl.usersList);
router.post('/login', authCtrl.login);
router.get('/accounts', authCtrl.accounts);
router.post('/logout', auth, authCtrl.logout);
router.post('/updateStatus/:user_id', auth, authCtrl.updateStatus);
router.post('/updateUser/password', auth, authCtrl.updateUserPassword);
router.post('/updateUser/info', auth, authCtrl.updateUserInfo);
router.get('/resetPassword/:email/:token', authCtrl.resetPassword);
router.post('/forgotPassword', authCtrl.forgotPassword);

// ---------- API Resources (dg / dir / serv) ----------
router.get('/dg', dgCtrl.index);
router.post('/dg', dgCtrl.store);
router.get('/dg/:dg', dgCtrl.show);
router.put('/dg/:dg', dgCtrl.update);
router.patch('/dg/:dg', dgCtrl.update);
router.delete('/dg/:dg', dgCtrl.destroy);

router.get('/dir', dirCtrl.index);
router.post('/dir', dirCtrl.store);
router.get('/dir/:dir', dirCtrl.show);
router.put('/dir/:dir', dirCtrl.update);
router.patch('/dir/:dir', dirCtrl.update);
router.delete('/dir/:dir', dirCtrl.destroy);

router.get('/serv', servCtrl.index);
router.post('/serv', servCtrl.store);
router.get('/serv/:serv', servCtrl.show);
router.put('/serv/:serv', servCtrl.update);
router.patch('/serv/:serv', servCtrl.update);
router.delete('/serv/:serv', servCtrl.destroy);

router.get('/services/:id_dir', servCtrl.getListOfServByDirection);

// ---------- Courriers ----------
router.post('/doc', auth, courrierCtrl.addDoc);
router.post('/docUpdateLivre/:id_doc', auth, courrierCtrl.updateLivre);
router.get('/docs', auth, courrierCtrl.fetchDocs);
router.get('/docsByDirection', auth, courrierCtrl.fetchDocsByDirection);
router.get('/docByDirection/:id_doc', auth, courrierCtrl.fetchDocByOneByDirection);
router.get('/delDoc/:id_courrier', auth, courrierCtrl.deleteDoc);
router.post('/upDoc/:id_courrier', auth, courrierCtrl.updateDoc);
router.get('/getDoc/:id_doc', auth, courrierCtrl.getDoc);
router.post('/findDoc', courrierCtrl.findMyDoc);

// ---------- Mouvements / Transferts ----------
router.post('/transDoc', auth, mouvementCtrl.makeMovement);
router.post('/transDocMove/:m_id', auth, mouvementCtrl.makeMovementMove);
router.post('/docUpdateLivreMove/:id_doc', auth, mouvementCtrl.updateLivre);
router.get('/moveByDirection', auth, mouvementCtrl.getListTransDocByDirection);
router.get('/docByService/:id_doc', auth, mouvementCtrl.fetchDocByOneByService);
router.get('/docByServiceToSp/:id_doc', auth, mouvementCtrl.fetchDocByOneByServiceToSp);
router.get('/moveByService', auth, mouvementCtrl.getListTransDocByService);
router.get('/serviceToSp', auth, mouvementCtrl.moveServiceToSp);
router.get('/moveTransferedByService', auth, mouvementCtrl.getListTransferedDocByService);
router.get('/moveTransferedToService', auth, mouvementCtrl.getListTransferedDocToService);
router.get('/getDocsHistory/:doc_id', mouvementCtrl.getMovements);

// ---------- Statistiques ----------
router.get('/stats/count', auth, courrierCtrl.courrierCount);
router.post('/stats/gotByOwnerCount', auth, courrierCtrl.courrierGotByOwnerCount);
router.post('/stats/notGotByOwnerCount', auth, courrierCtrl.courrierNotGotByOwnerCount);
router.get('/stats/date', auth, courrierCtrl.listDate);
router.get('/stats/notLivred', auth, courrierCtrl.courrierNotLivred);
router.post('/stats/notLivredByPeriod', auth, courrierCtrl.courrierNotLivredByPeriod);
router.get('/stats/livred', auth, courrierCtrl.courrierLivred);
router.post('/stats/livredByPeriod', auth, courrierCtrl.courrierLivredByPeriod);
router.get('/stats/graph', auth, courrierCtrl.graph);
router.post('/stats/countByService', auth, courrierCtrl.numberOfDocByService);
router.post('/stats/countByServiceNoFilter', auth, courrierCtrl.numberOfDocByServiceNoFilter);
router.post('/stats/countByDirectionAdmin', courrierCtrl.numberOfDocByDirectionAdmin);
router.get('/stats/countByDirection', courrierCtrl.numberOfDocByDirection);
router.post('/stats/countByDirectionByPeriod', auth, courrierCtrl.numberOfDocByDirectionByPeriod);
router.post('/stats/period', courrierCtrl.filterPeriodDate);
router.post('/stats/countDocByDirection', auth, courrierCtrl.countDocByDirection);

// ---------- Visitors ----------
router.get('/visitors', visitorCtrl.increment);
router.get('/visitors/charts', auth, visitorCtrl.getViewPeriodForChartLine);
router.post('/visitors/period', auth, visitorCtrl.showNumberOfVisitByPeriod);

// ---------- Support ----------
router.post('/support', supportCtrl.sendMessage);
router.get('/getMessages', auth, supportCtrl.getMessages);
router.delete('/deleteMessages/:id', auth, supportCtrl.deleteMessages);
router.delete('/messages/deleteAll', auth, supportCtrl.deleteAllMessages);

module.exports = router;
