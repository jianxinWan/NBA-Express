const redis = require("mysql");
const bcrypt = require("bcrypt");
//连接池
var db=mysql.createPool({host: 'localhost', user: 'root', password: '520956wjx', database: 'blog'});
module.exports = User;

function User(obj){
    for(var key in obj){     //遍历传入对象中的键
        this[key] = obj[key];  //合并值
    }
}
User.prototype.save=function(fn){
    if(this.id){
        this.update(fn);
    }else{
        var user = this;
        db.query('INSERT INTO runoob_tbl',function(err,id){    //创建唯一ID
            if(err) return fn(err);
            user.id = id;
            user.hashPassword(function(err){
                if(err) return fn(err);
                user.update(fn);           //保存用户属性
            });
        });
    }
};
User.prototype.update = function(fn){
    var user = this;
    var id = user.id;
    db.set('user:id'+user.name,id,function(){
       if(err){
           return fn(err);
       }else{
           db.hmset('user:'+id,user,function(err){
              fn(err);
           });
       }
    });
}
//在用户模型中添加bcrypt
User.prototype.hashPassword = function (fn) {
    var user = this;
    bcrypt.genSalt(12,function(err,salt){  //生成有12个字符的盐
        if(err){
            return fn(err);
        }
        user.salt = salt;  //设定盐以便保存
        //生成哈希
        bcrypt.hash(user.pass,salt,function(){
            if(err){
                return fn(err);
            }
            user.pass = hash;
            fn();
        });
    });
}
var  tobi  = new User({
    name:'Tobi',
    pass:'1234567',
    age:'2'
});
tobi.save(function(err){
    if(err) throw err;
    console.log('user id %d',tobi.id);
});
//获取用户数据
User.getByName = function(name,fn){
    User.getId(name,function(err,id){
        if(err) return fn(err);
    });
};
User.getId = function(name,fn){
    db.get('user:id'+name,fn);
};
User.get = function(id,fn){
    db.hgetall('user:'+id,function(err,user){
        if(err) return fn(err);
        fn(null,new User(user));
    });
};

//认证用户的名称和密码
User.authenticate = function (name,pass,fn) {
    User.getByName(name,function(err,user){
       if(err) return fn(err);
       if(!user.id)return fn();
       bcrypt.hash(pass,user.salt,function(err,hash){
          if(err) return fn();
          if(hash == user.pass) return fn(null,user);
          fn();
       });
    });
};