'use strict'
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');
let mongoUrl = 'mongodb://127.0.0.1:27017/logichome';
let domain = 'http://120.77.202.112/public/';

//home
//0.0轮播图
exports.getCarousel = (req, res) => {
    MongoClient.connect(mongoUrl, (err, db) => {
        if (err) throw err;
        let collection = db.collection('carousel');
        collection.aggregate(
            [{
                $project: {
                    _id: 0,
                    src: {
                        $concat: [domain, "$src"]
                    },
                    link: 1,
                }
            }]
        ).toArray((err, docs) => {
            if (err) throw err;
            res.end(JSON.stringify(docs))
            db.close();
        })
    });
};
//0.1随便瞅瞅
exports.getHelpYourself = (req, res) => {
    MongoClient.connect(mongoUrl, (err, db) => {
        //定义闭包接收请求状态
        let submit = (() => {
            let flag = 0;
            let data = [];
            return (arr) => {
                data = data.concat(arr);
                if(++flag === 2){
                    data.sort(() => 0.5 - Math.random());
                    res.end(JSON.stringify(data.slice(0,5)));
                    db.close();
                }
            }
        })();
        // 获取图片列表
        db.collection('photolist')
            .aggregate([{
                $project: {
                    title:1,
                    url: {
                        $concat: ["/photo/","$dirid"]
                    },
                    type:1
                }
            }]).toArray((err, docs) => {
            if (err) throw err;
            submit(docs);
        });
        // 获取文章列表
        db.collection('notelist')
            .aggregate([{
                $project: {
                    title:1,
                    url: {
                        $concat: ["/note/","$noteid"]
                    },
                    type:1
                }
            }]).toArray((err, docs) => {
            if (err) throw err;
            submit(docs);
        })
    })
};
//0.2最近更新
exports.getLastUpdate = (req, res) => {
    MongoClient.connect(mongoUrl, (err, db) => {
        //定义闭包函数计数并接收请求状态
        let submit = (() => {
            let flag = 0;
            let data = [];
            return (arr) => {
                data = data.concat(arr);
                if(++flag === 2){
                    data.sort((a,b) => b.time - a.time); //按时间倒序进行排序
                    res.end(JSON.stringify(data.slice(0,5)));
                    db.close();
                }
            }
        })();
        // 获取图片列表
        db.collection('photolist')
            .aggregate([{
                $project: {
                    title:1,
                    time:1,
                    url: {
                        $concat: ["/photo/","$dirid"]
                    },
                    type:1
                }
            }]).toArray((err, docs) => {
            if (err) throw err;
            submit(docs);
        });
        // 获取文章列表
        db.collection('notelist')
            .aggregate([{
                $project: {
                    title:1,
                    time:1,
                    url: {
                        $concat: ["/note/","$noteid"]
                    },
                    type:1
                }
            }]).toArray((err, docs) => {
            if (err) throw err;
            submit(docs);
        })
    })
};

//photo
//1.0照片目录
exports.getPhotoDir = (req, res ) => {
    MongoClient.connect(mongoUrl, (err, db) => {
        if (err) throw err;
        let collection = db.collection('photolist');
        collection.aggregate(
            [{
                $project: {
                    _id: 0,
                    cover: {
                        $concat: [domain, "$cover"]
                    },
                    dirname: 1,
                    dirid: 1,
                    title: 1,
                    count: 1,
                    views: 1,
                    likes: 1,
                    author: 1,
                    date: 1,
                    comment: 1,
                    time:1,
                    desc:1
                }
            }])
            .sort({time:-1})
            .toArray((err, docs) => {
                if (err) throw err;
                res.end(JSON.stringify(docs))
                db.close();
            })
    })
};
//1.1照片详情
exports.getPhoto = (req, res) => {
    MongoClient.connect(mongoUrl, (err, db) => {
        if (err) throw err;
        let dirid = req.params.dirid;
        db.collection('photolist')
            .update({dirid: dirid}, {$inc: {views: 1}});
        db.collection('photo')
            .find({dirid: dirid}).toArray((err, docs) => {
            if (err) throw err;
            docs.forEach(item => {
                item.src = domain + item.src + "?tempid=" + Math.random();
            });
            res.end(JSON.stringify(docs));
            db.close();
        })
    })
};
//1.2照片点赞
exports.addPhotoLike = (req, res) => {
    let id = req.params.id;
    MongoClient.connect(mongoUrl, (err, db) => {
        db.collection('photolist')
            .update({dirid: id}, {$inc: {likes: 1}});
        res.end(JSON.stringify(["ok"]));
        db.close();
    })
};
//1.3照片评论
exports.addPhotoComment = (req, res) => {
    MongoClient.connect(mongoUrl, (err, db) => {
        db.collection('photolist')
            .update({dirid: req.params.id}, {$push: {comment: req.body}})
        res.end("ok");
        db.close();
    })
};

//note
//2.0文章列表
exports.getNoteList = (req, res) => {
    MongoClient.connect(mongoUrl, (err, db) => {
        let collection = db.collection('notelist');
        collection.find({type: req.params.type}).toArray((err, docs) => {
            if (err) throw err;
            res.end(JSON.stringify(docs))
            db.close();
        })
    })
};
//2.1文章详情
exports.getNoteDetail = (req, res, next) => {
    let id = req.params.id
    MongoClient.connect(mongoUrl, (err, db) => {
        if (err) throw err;
        let collection = db.collection('notelist');
        collection.update({noteid: id}, {$inc: {views: 1}});
        collection.find({noteid: id}).toArray((err, docs) => {
            if (err) throw err;
            if (docs.length == 0) return next();
            fs.readFile('public/' + docs[0].src, 'utf-8', (err, data) => {
                if (err) throw err;
                docs[0].text = data.toString()
                res.end(JSON.stringify(docs[0]))
                db.close();
            })

        })
    });
};
//2.2文章点赞
exports.addNoteLike = (req, res) => {
    let id = req.params.id;
    MongoClient.connect(mongoUrl, (err, db) => {
        let collection = db.collection('notelist');
        collection.update({noteid: id}, {$inc: {likes: 1}})
        res.end(JSON.stringify(["ok"]));
        db.close();
    })
};
//2.3文章评论
exports.addNoteComment = (req, res) => {
    MongoClient.connect(mongoUrl, (err, db) => {
        db.collection('notelist')
            .update({noteid: req.params.id}, {$push: {comment: req.body}})
        res.end("ok");
        db.close();
    })
};

// 测试
// exports.test = (req, res) => {
//     console.log(req.body);
//     res.end(JSON.stringify(["ok"]))
// };