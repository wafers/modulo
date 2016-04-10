var express = require('express');
var router = express.Router();
var ctrl = require('./controllers');

router.get('/topModules', ctrl.topModules);
router.post('/detailedSearch', ctrl.detailedSearch);
router.post('/npmSearch', ctrl.npmSearch);
router.post('/relatedKeywordSearch', ctrl.relatedKeywordSearch);
router.post('/relationships', ctrl.relationships);
router.post('/search', ctrl.search);

module.exports = router;
