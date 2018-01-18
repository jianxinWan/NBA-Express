window.onload=function () {
    var oTxtUser = document.getElementById('user');
    var oTxtPass = document.getElementById('pass');
    var oBtnLogin = document.getElementById('btn1');

    oBtnLogin.onclick=function (){
        ajax({
            url: '/loginto',
            data: {id: oTxtUser.value, pass: oTxtPass.value},
            type: 'get',
            success: function (str){
                var json=JSON.parse(str);
                if(json.status==100){
                    window.location.href='/mydoc';
                }else{
                    alert(json.msg);
                }
            },
            error: function (){
                alert('通信错误');
            }
        });
    };
};