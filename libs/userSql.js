var UserSQL = {
    insertUser:'INSERT INTO user_table(username,password,date,type,openid) VALUES(?,?,?,?,?)',//插入
    updata:'UPDATE user_table SET type = ?,id = ? WHERE username = ? AND password = ? ',//更新
    queryAll:'SELECT * FROM user_table',//查询所有
    getUserByOpenid:'SELECT * FROM user_table WHERE id = ? ',//查询id
    getUserByInfo:'SELECT * FROM user_table WHERE id = ? AND password = ? ',//查询用户信息
    deleteUserByInfo:'DELETE FROM user_table WHERE id = ? AND password = ? ',//删除信息
    insertArticleInfo:"INSERT INTO article_table(id,author,author_src,article_title,post_time,article_summary,content,n_like) VALUES(?,?,?,?,?,?,?,?)"
};
module.exports = UserSQL;