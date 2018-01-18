function todouble(n){
    return n<10? '0'+ n:''+n;
}
module.exports={
    timeShift:function(timestamp){
        var oData=new Date();
        oData.setTime(timestamp*1000);
        return oData.getFullYear()+'-'+todouble(oData.getMonth()+1)+'-'+
            todouble(oData.getDay()+10)+' '+todouble(oData.getHours())+':'+
            todouble(oData.getMinutes())+':'+todouble(oData.getSeconds());
    }
}
