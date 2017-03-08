'use strict'
// 引入框架 搭建框架
const express = require('express');
const path = require("path")
let app = express();
// 配置模板
app.set('views','./views');
app.set('view engine','jade');
//引入并配置bodyParser
let bodyParser = require('body-parser'); //引入body-parser
app.use(bodyParser.json()); //parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

let history = require('connect-history-api-fallback');
app.use(history({
    htmlAcceptHeaders: ['text/html', 'application/xhtml+xml']
}));

// 将所有api的请求响应content-type设置为application/json，设置允许跨域响应报文头
app.all('/api/*',(req,res,next)=>{
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","*");
    res.setHeader('Content-Type','application/json;charset=utf-8');
    next();
});

// 引入路由配置
const api_router = require('./routes/apiRoute')
app.use(api_router);


// 配置静态文件目录
app.use("/public",express.static('public'));
app.use(express.static('../LoGicHome/dist'));
// app.use("*",function(req, res, next) {
//     res.sendFile(path.resolve(__dirname,"../logichome/dist/index.html"));
// });

// 开启服务器
app.listen(80,function(){
    console.log('服务器启动',new Date());
});
// 处理404
app.use(function(req, res, next) {
    res.status(404).send('Sorry cant find that!');
});
// 处理错误
app.use(function(err, req, res, next) {
    console.error(err.stack);
    console.log("err");
    res.status(500).send('Something broke!');
    next();
});