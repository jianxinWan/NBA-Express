var https = require("https");               //调用https
var cheerio = require("cheerio");           //调用数据分析库
var Promise = require("bluebird");          //调用promise库
var request = require("request");           //处理请求
var cheerio = require("cheerio");           //爬网页
var async = require("async");               //流程控制
var gbk = require("gbk");                   //转编码
var fs = require("fs");                     //文件
var mysql=require('mysql');                 //调用数据库模块

//调用包装好的数据库文件
var dbSqlConfig = require("./libs/dbConfig");
var userSql = require("./libs/userSql");

//建立连接池
var db=mysql.createPool(dbSqlConfig.mysql);


//分析界面信息
var UselessInfo = require("./libs/DetUselessInfo").UselessInfo;//处理无用信息
var DetTimeInfo = require("./libs/DetUselessInfo").DetTimeInfo;//处理时间
var todayNewsInfo = require("./libs/getAllUrl");

var allInfo = [];
(function () {
    async.waterfall([
        function getAllNewsUrl(next) {
            var options = {
                url:"https://news.zhibo8.cc/nba/",
                encoding:null,
            };
            request(options, function (error, response, body){
                if (!error && response.statusCode == 200){
                    next(null, body);
                }
                else{
                    console.log(error);
                }
            });
        },
        function(body,next) {
            var result = gbk.toString('utf-8', body);
            next(null, body);
        },
        function(html,next) {
            var $ = cheerio.load(html,{decodeEntities: false});
            var todayNewsInfo = $(".topleftbox a");
            var urlArry=[];
            for(var i=0;i<todayNewsInfo.length;i++){
                urlArry[i]=todayNewsInfo[i].attribs.href;
            }
            next(null,urlArry);
        }
    ], function (err, result) {
        for(i=0;i<result.length;i++){
            allInfo.push(getPageAsync("https:"+result[i]));
        }
        Promise
            .all(allInfo)
            .then(function(pages){
                var coursesData = [];
                pages.forEach(function(html){
                    var curses = filterChapters(html);
                    coursesData.push(curses);
                });
                printCourseInfo(coursesData);
            });
    });
})();
function filterChapters(html){
    var $ = cheerio.load(html,{decodeEntities: false});
    var NewsTitleInfo = $(" .title h1").text();
    var NewsConInfo = $(".content").text();
    var NewsTimeInfo = $(".title span").text();
    if(NewsTimeInfo[0]==undefined){//判断短链接获取的时间问题
        NewsTimeInfo = $(".from-site span").text();
    }
    var NewsInfo={
        title:UselessInfo(NewsTitleInfo),
        content:NewsConInfo,
        time:DetTimeInfo(NewsTimeInfo)
    };
    return  NewsInfo;
}
//添加到数据库
function printCourseInfo(cursesData){
    for(var i=0;i<cursesData.length;i++){
        db.query(userSql.insertArticleInfo,[i+1,"篮球机长","images/sun.jpg",cursesData[i].title,cursesData[i].time,cursesData[i].title,cursesData[i].content,1],function(err){
            if(err){
                console.log(err);
            }
        });
    }
}
//异步爬取每个网页(url)的信息
function getPageAsync(url){
    return new Promise(function(resolve,reject){
        console.log("正在爬取"+url);
        https.get(url,function(res){
            var html =  "";
            res.on('data',function(data){
                html+=data;
            });
            res.on('end',function(){
                resolve(html);
            });
        }).on('erro',function(e){
            reject(e);
            console.log("Error!!!!!");
        });
    });
}