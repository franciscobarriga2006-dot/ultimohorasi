const express = require('express');
const { getChats, getMensajes,createChat } = require('../controllers/chats.controller.js');

const router = express.Router();
router.get('/chats', getChats);
router.get('/chats/:id/mensajes', getMensajes);
router.post('/chats', createChat);           
module.exports = router;
