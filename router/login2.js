const express=require('express');
const mysql=require('mysql');
var urlLib = require("url");

const common=require('../libs/common');
var dbSqlConfig = require("../libs/dbConfig");
var userSql = require("../libs/userSql");

//连接池
var db=mysql.createPool(dbSqlConfig.mysql);

module.exports=function(){
    var router=express.Router();
    router.use("/",function(req,res){
        var userInfo = urlLib.parse(req.url, true).query;
        var password=common.md5(userInfo.pass+common.MD5_SUFFIX);
        db.query(userSql.getUserByInfo,[userInfo.id,password],function (err, results){
            if (err){
                console.log(err);
            }else{
                // 数据库存在
                if (results.length == 0){
                    res.send(JSON.stringify({status:'102',msg:'用户名或密码错误'})).end();
                } else{
                    if (results[0].id == userInfo.id && results[0].password == password) {
                        res.send(JSON.stringify({
                            status:'100',
                            msg:'登录成功',
                            username:results[0].username,
                        })).end();
                        req.session.id=results[0].id; //登陆成功，设置session
                    }
                }
            }
        });
    });
    return router;
};
