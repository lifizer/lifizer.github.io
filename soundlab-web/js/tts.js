const GOBAL_BASE = (function(){
    let url = [];
    if(window.location.origin == 'https://www.soundlab.heard-gl.com'){
      url[0] = 'https://api.soundlab.heard-gl.com/';
    }
    if(window.location.origin == 'https://www.soundlab.ai'){
      url[0] = 'https://api.soundlab.ai/';
    }
    return url;
  })();
  
  $(function(){
      // 导航
      $(window).scroll(function(e){
          if ($(window).scrollTop()>$(window).height()/2) {
              $('.navbar').addClass('nav-wrap-bottom')
          }else if($(window).scrollTop()<$(window).height()){
              $('.navbar').removeClass('nav-wrap-bottom');
          }
      });
  
  
      let category_id = "";
      let rate_id = 1;
      let volume_id = 1;
      let contentFilter = false;
      let tts_exp_text_val = $('#tts_exp_text').val();
      let tts_category_html = "";
      let tts_category_arr = [];
      let player = document.getElementById("player");
      let currentTime = 0;//在音频播放器中指定播放时间
  
  
      //获取一级分类
      $.ajax({
          type:"POST",
          dataType:"json",
          url: GOBAL_BASE[0] + "Category/index",
          data:{
              "type": "compound_cat",
              "pid": "0"
          },
          success:function(result){
              if(result.code == 1){
                  let navigationList = result.data;
                  if(navigationList.length > 0){
                      for(let i=0;i<navigationList.length;i++){
                          tts_category_html+= '<div class="tts_exp_title title1">'+navigationList[i].name+'</div><ul class="tts_exp_ul_list_'+navigationList[i].id+'"></ul>';
                          tts_category_arr[i] = navigationList[i].id;
                      }
                      $("#tts_category_data").html(tts_category_html);
                      randerSubCategory();
                  }
              }else{
                  layer.msg('网路服务出错了，请稍后再试');
              }
          }
      });
  
      //获取二级分类
      function randerSubCategory(){
          for(let i=0;i<tts_category_arr.length;i++){
              $.ajax({
                  type:"POST",
                  dataType:"json",
                  url: GOBAL_BASE[0] + "Compoundcat/getList",
                  data:{
                      "category_id": tts_category_arr[i],
                      "page": "1",
                      "pagesize": "10"
                  },
                  success:function(response){
                      console.log(response);
                      if(response.code == 1){
                          let html = '';
                          let dataList = response.data.data;
                          if(dataList.length > 0){
                              for(let j=0;j<dataList.length;j++){
                                 html+= '<li class="tts_left" data-id="'+dataList[j].id+'">'
                                     + '<div class="item">'+dataList[j].name+ (dataList[j].is_recommend == 1 ? '<i class="icon"></i>' : '') +'</div>'
                                     +'</li>'
                              }
                              html+='</ul>';
                          }
                          $(".tts_exp_ul_list_"+tts_category_arr[i]).html(html);
                      }else{
                          layer.msg('网路服务出错了，请稍后再试');
                      }
                  }
              });
          }
      }
      
      //点击分类选中
      $(document).on("click","#tts_category_data li",function(){
          $("#tts_category_data li").removeClass("click");
          $(this).addClass("click");
          category_id = $(this).data("id");
      });
      
      //点击音速
      $(document).on("click","#tts_rate_data li",function(){
          $(this).addClass("active").siblings().removeClass("active");
          rate_id = $(this).data("id");
      });
      
      //点击音量
      $(document).on("click","#tts_volume_data li",function(){
          $(this).addClass("active").siblings().removeClass("active");
          volume_id = $(this).data("id");
      });
  
      //判断文本中是否包含敏感信息
      $('#tts_exp_text').on('input propertychange', function (e) {
          let _this = $(this);
          tts_exp_text_val = $('#tts_exp_text').val();
          if(tts_exp_text_val.length < 200){
              $("#word").html(tts_exp_text_val.length);
              if(tts_exp_text_val != ""){
                  $.ajax({
                      type:"POST",
                      dataType:"json",
                      url: GOBAL_BASE[0] + "Alitextscan/contentFilter",
                      data:{
                          "text": tts_exp_text_val
                      },
                      success:function(result){
                          if(result.code == 1){
                              if(result.data.code == true){
                                  contentFilter = true;
                              }else{
                                  contentFilter = false;
                                  layer.msg('文本中包含敏感信息，请删除其内容再试试');
                              }
                          }else{
                              layer.msg(result.msg);
                          }
                      }
                  });
              }
          }else{
              $("#word").html(200);
              $('#tts_exp_text').val(tts_exp_text_val.substr(0,200));
              layer.msg('最多输入200字');
          }
      });
  
      

    //合成按钮
    $(document).on("click","#contral_star",function(){
        let isCounting = 20;
        let _interval;
        let textValStorage = window.localStorage.getItem("textValStorage") == null ? '' : window.localStorage.getItem("textValStorage");
        let speedStorage = window.localStorage.getItem("speedStorage") == null ? '' : window.localStorage.getItem("speedStorage");
        let cat_idStorage = window.localStorage.getItem("cat_idStorage") == null ? '' : window.localStorage.getItem("cat_idStorage");
        let audioStorage = window.localStorage.getItem("audioStorage") == null ? '' : window.localStorage.getItem("audioStorage");
        let tts_exp_text_length = $("#tts_exp_text").val().length;
        if(category_id){
            if($("#tts_exp_text").val() != "" && tts_exp_text_length <= 200){
                if(textValStorage == tts_exp_text_val && parseInt(speedStorage) == rate_id && parseInt(cat_idStorage) == category_id){//判断文本内容不改变、类别也未改变、语速未改变
                    if(currentTime > 0){
                        player.play();
                        $("#contral_star").css("display","none");
                        $("#contral_star_toggle").css("display","block");
                    }else{
                        player.src = audioStorage;
                        player.play();
                        currentTime = 0;
                        $("#contral_star").css("display","none");
                        $("#contral_star_toggle").css("display","block");
                    }
                }else{
                    clearInterval(_interval);
                    //合成虚拟倒计时
                    if(tts_exp_text_length <= 30){
                        isCounting = 20;
                    }else if(tts_exp_text_length > 30 && tts_exp_text_length <= 50){
                        isCounting = 40;
                    }else if(tts_exp_text_length > 50 && tts_exp_text_length <= 100){
                        isCounting = 60;
                    }else if(tts_exp_text_length > 100 && tts_exp_text_length <= 120){
                        isCounting = 70;
                    }else if(tts_exp_text_length > 120 && tts_exp_text_length <= 150){
                        isCounting = 100;
                    }else if(tts_exp_text_length > 150 && tts_exp_text_length <= 200){
                        isCounting = 120;
                    }
                    _interval = setInterval(() => {
                        if(isCounting != 0){
                            isCounting--;
                            $("#loading_page").show();
                            $("#counting").html(isCounting);
                        }else{
                            isCounting = 0;
                            clearInterval(_interval);
                        }
                        
                    }, 1000);

                    if(contentFilter){
                        $.ajax({
                            type:"POST",
                            dataType:"json",
                            url: GOBAL_BASE[0]+"/Compound/add",
                            data:{
                                "text": tts_exp_text_val,
                                "cat_id": category_id,
                                "type": "2",
                                "speed": rate_id,
                                "volume": volume_id
                            },
                            success:function(result){
                                $("#loading_page").hide();
                                clearInterval(_interval);
                                isCounting = 0;
                                $("#counting").html("0");
                                if(result.code == 1){
                                    player.src = result.data.src_domain;
                                    player.play();
                                    currentTime = 0;
                                    $("#contral_star").css("display","none");
                                    $("#contral_star_toggle").css("display","block");
                                    window.localStorage.setItem("textValStorage",tts_exp_text_val);
                                    window.localStorage.setItem("speedStorage",rate_id);
                                    window.localStorage.setItem("cat_idStorage",category_id);
                                    window.localStorage.setItem("audioStorage",result.data.src_domain);
                                }else{
                                    layer.msg(result.msg);
                                }
                            }
                        });
                    }else{
                        $("#loading_page").hide();
                        layer.msg('文本中包含敏感信息，请删除其内容再试试');
                    }
                }
            }else{
                if($("#tts_exp_text").val().length > 50){
                    layer.msg('最多输入50字');
                }else{
                    layer.msg('请输入文本内容');
                }
            }
        }else{
            layer.msg('请选择发音人');
        }
    });
  
      if(player){
          player.loop = false;
          player.addEventListener('ended', function () {
              currentTime = 0;
              $("#contral_star").css("display","block");
              $("#contral_star_toggle").css("display","none");
          }, false);
      }
  
      $(document).on("click","#contral_star_toggle",function(){
          $("#contral_star").css("display","block");
          $("#contral_star_toggle").css("display","none");
          player.pause();
          currentTime = player.currentTime;
          console.log(currentTime);
      });
  
  });