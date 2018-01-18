const express=require('express');
const mysql=require('mysql');

const common=require('../libs/common');
var dbSqlConfig = require("../libs/dbConfig");
var userSql = require("../libs/userSql");

//连接池
var db=mysql.createPool(dbSqlConfig.mysql);

module.exports=function (){
    var router=express.Router();
    //检查登录状态
    router.use(function(req, res, next){
        if(!req.session['admin_id'] &&req.url!='/loginto'){ //没有登录
            res.redirect('/mydoc');
        }else{
            next();
        }
    });
    router.use('/loginto',function(req, res){
        res.render('admin/login.ejs', {});
    });
    router.use('/loginto', function(req, res){
        var id=req.body.id;
        var password=common.md5(req.body.password+common.MD5_SUFFIX);
        console.log(password);
        db.query(userSql.getUserByOpenid[id],function(err, data){
            if(err){
                console.error(err);
                res.status(500).send('database error').end();
            }else{
                if(data.length==0){
                    res.status(400).send('no this admin').end();
                }else{
                    if(data[0].password==password){
                        //成功
                        req.session['admin_id']=data[0].ID;
                        res.redirect('/mydoc');
                    }else{
                        res.status(400).send('this password is incorrect').end();
                    }
                }
            }
        });
    });

    router.use('/', function(req, res){
        res.render('admin/index.ejs', {});
    });

    router.use('/banners',function(req, res){
        res.render('admin/banners.ejs', {})
    });
    return router;
};
