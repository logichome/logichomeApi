'use strict'
const express = require('express');

let route = express.Router();
const apiCtrl = require('../controllers/apiControllers');
//home
//0.0轮播图
route.get('/api/getcarousel', apiCtrl.getCarousel);
//0.1随便瞅瞅
route.get('/api/gethelpyourself', apiCtrl.getHelpYourself);
//0.2最近更新
route.get('/api/getlastupdate', apiCtrl.getLastUpdate);

//photo
//1.0照片目录
route.get('/api/getphotodir', apiCtrl.getPhotoDir);
//1.1照片详情
route.get('/api/getphoto/:dirid', apiCtrl.getPhoto);
//1.2照片点赞
route.get('/api/addphotolike/:id', apiCtrl.addPhotoLike);
//1.3照片评论
route.post('/api/addphotocomment/:id', apiCtrl.addPhotoComment);

//note
//2.0文章列表
route.get('/api/getnotelist/:type', apiCtrl.getNoteList);
//2.1文章详情
route.get('/api/getnotedetail/:id', apiCtrl.getNoteDetail);
//2.2文章点赞
route.get('/api/addnotelike/:id', apiCtrl.addNoteLike);
//2.3文章评论
route.post('/api/addnotecomment/:id', apiCtrl.addNoteComment);

// 测试
// route.post('/api/test', apiCtrl.test);




module.exports = route;