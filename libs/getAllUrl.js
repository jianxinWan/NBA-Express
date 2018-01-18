var request = require("request");//处理请求
var cheerio = require("cheerio");//爬网页
var async = require("async");//流程控制
var gbk = require("gbk");//转编码
var fs = require("fs");//文件
var UselessInfo = require("./DetUselessInfo").UselessInfo;//处理无用信息
//流程控制

(function () {
    async.waterfall([
        function(next) {
            getAllNewsUrl(next);
        },
        function(body,next){
            parser(body,next)
        },
        function(html,next) {
            getResult(html, next);
        }
    ], function (err, result) {
        printInfo(result);
    });
})();
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
}
function parser(body,next) {
    var result = gbk.toString('utf-8', body);
    next(null, body);
}
function getResult(html,next) {
    var $ = cheerio.load(html,{decodeEntities: false});
    var todayNewsInfo = $(".topleftbox a");
    var urlArry=[];
    for(var i=0;i<todayNewsInfo.length;i++){
        urlArry[i]=todayNewsInfo[i].attribs.href;
    }
    next(null,urlArry);
}
function printInfo(urlArry,next){
    return urlArry;
}

