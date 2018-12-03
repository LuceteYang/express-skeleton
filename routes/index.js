var express = require('express');
var api = express.Router();

const postCtrl = require('./post');

api.get('/', postCtrl.templateRender);
api.get('/string', postCtrl.stringRender);
api.get('/json', postCtrl.jsonRender);
api.get('/db-connect', postCtrl.dbConnect);

module.exports = api;