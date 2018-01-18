var  express=require('express');            //调用express模块
var static=require('express-static');       //读取静态文件
var cookieParser=require('cookie-parser');  //解析cookie时使用
var cookieSession=require('cookie-session');     //调用session模块，方便向前台发送cookie
var bodyParser=require('body-parser');      //解析返回的请求体
var multer=require('multer');               //使用multer进行附件上传
var multerObj=multer({dest: './www/upload'});
var consolidate=require('consolidate');     //采用哪种模板引擎
var mysql=require('mysql');                 //调用数据库模块
var bcrypt = require("bcrypt");             //加盐哈希函数
var urlLib = require("url");                //解析url时使用

//导入自定义模块
var common=require("./libs/timeshift");
var dbSqlConfig = require("./libs/dbConfig");
var userSql = require("./libs/userSql");


//连接池
var db=mysql.createPool(dbSqlConfig.mysql);

var server=express();
server.listen(8080);

// server.use(bodyParser.urlencoded());
// server.use(multerObj.any());

//2.cookie、session
server.use(cookieParser());
(function (){
    var keys=[];
    for(var i=0;i<100000;i++){
        keys[i]='a_'+Math.random();
    }
    server.use(cookieSession({
        name: 'sess_id',
        keys: keys,
        maxAge: 20*60*1000  //20min
    }));
})();

//4.配置模板引擎
//输出什么东西
server.set('view engine', 'html');
//模板文件放在哪儿
server.set('views', './template');
//哪种模板引擎
server.engine('html', consolidate.ejs);
//接收用户请求,首页界面设置
server.get('/index', function(req, res, next){
  //查询banner的东西
  db.query("SELECT * FROM banner_table", function(err, data){
    if(err){
      res.status(500).send('database banners error').end();
    }else{
      res.banners=data;
      next();
    }
  });
});
server.get('/index', function(req, res, next){
  //查询文章列表
  db.query('SELECT * FROM article_table',function(err, data){
    if(err){
      res.status(500).send('database articles error').end();
    }else{
      res.articleList=data;
      next();
    }
  });
});
server.get('/index', function(req, res){
  res.render('index.ejs', {articleList: res.articleList,banners:res.banners});
});
//访问每个文章
server.get('/article',function(req,res){
  if(req.query.id!=null) {
      if (req.query.act == 'like') {
          db.query(`UPDATE article_table SET n_like=n_like+1 WHERE id=${req.query.id}`, function (err, data) {
              if (err) {
                  res.status(500).send("数据有问题");
                  console.log(err);
              } else {
                  db.query(`SELECT * FROM article_table WHERE id=${req.query.id}`, function (err, data) {
                      if (data.length == 0) {
                          res.status(404).send("您请求的文件找不到");
                      } else {
                          var articleData = data[0];
                          articleData.newData = common.timeShift(articleData.post_time);
                          articleData.content = articleData.content.replace(/^/gm, '<p>').replace(/$/gm, '</p>');
                          res.render('context.ejs', {
                              article: data[0]
                          });
                      }
                  });
              }
          });
      } else {
          db.query(`SELECT * FROM article_table WHERE id=${req.query.id}`, function (err, data) {
              if (err) {
                  res.status(500).send('数据有问题').end();
              } else {
                  if (data.length == 0) {
                      res.status(404).send('您请求的文章找不到').end();
                  } else {
                      var articleData = data[0];
                      //articleData.newData = common.timeShift(articleData.post_time);
                      articleData.content = articleData.content.replace(/^/gm, '<p>').replace(/$/gm, '</p>');
                      res.render('context.ejs', {
                          article: data[0]
                      });
                  }
              }
          });
      }
  }
  else{
      res.status(404).send('您请求的文章找不到').end();
  }
});
//请求登录界面，进行渲染
server.use('/login', function(req, res, next){
    res.render('login_user.ejs',{});
});
//如果登录接口被请求，存数据库进行查找
server.use('/loginto',require('./router/login2.js')());
//个人中心界面
server.use('/mydoc',function(req,res){
    if(req.session.id){
        var userInfoById ={
            src:"images/sun.jpg"
        };
        res.render('mydoc.ejs',{userInfo:userInfoById});
    }
    else{
        var userDefaultInfo ={
            src:"img/headimg.png"
        };
        res.render('mydoc.ejs',{userInfo:userDefaultInfo});
    }
});
//4.static数据
server.use(static('./www'));
//登陆注册

