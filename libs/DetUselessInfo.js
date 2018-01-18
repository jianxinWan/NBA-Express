//删除无用信息
module.exports= {
    UselessInfo:function(str) {
        var newString = ""
        for (var i = 0; i < str.length; i++) {
            if (str[i] != "\n"&&str[i] != "\t"&&str[i]!=" ") {
                newString += str[i];
            }
        }
        //清除内容中前三个字"直播吧!"
        if(newString[0]=='直'&&newString[1]=="播"){
            newString=newString.slice(3,newString.length);
        }
        return newString;
    },
    DetTimeInfo:function(timeString){
        var newTimeString="";
        for(var i=0;i<20;i++){
            newTimeString+=timeString[i];
        }
        return  newTimeString;
    }
}
