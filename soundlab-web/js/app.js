//提交意见
$("#confirm_btn").on("click",function(){
    var userVal = $("#username").val();
    var emailVal = $("#email").val();
    var telVal = $("#tel").val();
    var demandVal = $("#demand").val();
    var regemai =  /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    var regtel =/^1[34578]{1}\d{9}$/;
    if(userVal == ''){
        layer.msg("请填写用户名");
        $("#username").focus();
        return false;
    }
    if(emailVal == ''){
        layer.msg("请填写邮箱");
        $("#email").focus();
        return false;
    }else if(!regemai.test(emailVal)){
        layer.msg('请填写正确的邮箱');
        $("#email").focus();
        return false;
    }
    if(telVal == ''){
        layer.msg("请填写电话");
        $("#tel").focus();
        return false;
    }else if(!regtel.test(telVal)){
        layer.msg('请填写正确的手机号');
        $("#tel").focus();
        return false;
    }
    if(demandVal == ''){
        layer.msg("请填写意见");
        $("#demand").focus();
        return false;
    }
    $.ajax({
        type:"POST",
        dataType:"json",
        url:"https://api.sounddat.heard-gl.com/Demand/add",
        data:{
            "name":userVal,
            "email":emailVal,
            "mobile":telVal,
            "describe":demandVal
        },
        success:function(result){
            layer.msg('感谢您提供的需求与建议，我们会及时采纳！');
            $("#username").val("");
            $("#email").val("");
            $("#tel").val("");
            $("#demand").val("");
        }
    });

});