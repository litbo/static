/*
* basic.js 页面的基本函数集合,放置于页面顶部，JQ下方
* */

//1：获取当前页面的URL属性值，接收参数name：属性名，如果有对应属性值则返回属性值否则返回 null
(function ($) {
    $.getUrlParam = function (name, site) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"), r;
        if (site === 1) {
            r = window.parent.location.search.substr(1).match(reg)
        } else {
            try {
                r = site.location.search.substr(1).match(reg);
            } catch (e) {
                r = window.location.search.substr(1).match(reg)
            }
        }
        if (r != null) return decodeURI(r[2]);
        return null;
    };
})(jQuery);

//3：cookies操作函数
jQuery.cookie = function (name, value, options) {
    if (typeof value != 'undefined') {
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString();
        }
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};

//4：页面加载遮罩
function markPage(text,time){
    if(!($(".begin").length > 0)){
        $("body").prepend($("<div>").attr("class","begin"))
    }
    var timer = null;
    text = text || "页面急速加载中!";
    time = Number(time) || 3000;
    $(".begin").append($("<div>").attr("class","main-mask").css({"display":"block","background":"rgba(0,0,0,0.6)"})
        .append($("<p>").attr("class","loading").html("<br />"+text)
            .prepend($("<i>").attr("class","layui-icon layui-icon-loading layui-icon layui-anim layui-anim-rotate layui-anim-loop"))
        ))
    clearTimeout(timer);
    timer = setTimeout(function(){
        $(".begin").remove();
    },time);
    document.addEventListener('readystatechange',function(){
        if(document.readyState === "complete"){
            $(".begin").remove();
        }
    });
};

//5：frame通用函数
//frame_all({"back":true},{})
function frame_all() {
    //判断并添加 返回 按钮
    for (var i = 0; i < arguments.length; i++) {
        var aName = "",value="";
        if(typeof arguments[i] === "object"){
            for(var name in arguments[i]){
                aName = name;
                value = arguments[i][name];
            }
        }else{
            aName = arguments[i];
        }
        switch (aName) {
            case "back" :
                backPage(value);
                break;//添加返回按钮
            case "table":
                tableFunc();
                break;//表格加载完毕执行函数
            case "link":
                tableClick(value);
                break;//表格点击函数
            case "message":
                addTableMessage(value);
                break;//提示信息
            case "check":
                checkTable(value);
                break;//检测表格
        }

    }

    //检测表格
    function checkTable(value){
        console.log(obj.data);
    }//未启用

    //返回按钮
    function backPage(value) {
        if(value !== "" && (!value || value === "false")){
            //console.log("当前页面已经禁止加载返回按钮了！")
            return ;
        }

        if (document.referrer !== 'null' || document.referrer !== "") {
            var $tool = $(".h_tool")
            if ($tool) {
                $tool.prepend("<button class=\"layui-btn\" data-type=\"backUrl\">返回</button>\n")
            } else {
                $("body").prepend("<div class=\"layui-row search_button\">\n" +
                    "    <div class=\"col-xs-12\">\n" +
                    "        <div class=\"test-table-reload-btn\" style=\"margin-top: 20px;\">\n" +
                    "            <button class=\"layui-btn\" data-type=\"backUrl\">返回</button>\n" +
                    "        </div>\n" +
                    "    </div>\n" +
                    "</div>")
            }

        }//添加返回上一页按钮
    }

    function tableFunc(){

    }
    //行单击事件
    function tableClick(value){
        console.log(value);
        if(typeof value !== "object" && typeof value[0] !== "object"){
            return "参数必须是第一项为obj的数组!"
        }
        var values = value[1] || "table";
        layui.use('table',function(){
            var table = layui.table;
            table.on('tool('+values+')', function (obj) {
                var data = obj.data;
                if (obj.event === "openLink") {
                    layer.confirm("确定跳转链接吗？", function () {
                        if(data.link){
                            location.href = data.link +"?link="+ encodeURIComponent(window.location.href);
                        }else{
                            layer.alert("没有可以跳转的链接哦！")
                        }
                    });

                }
            });
        })
    }

    //message提示信息 未解决问题：内容相同message会共有同列
    function addTableMessage(value) {//num：添加messages的表格列数 obj：TABLE组件返回参数，本处使用obj.data获取TABLE数据
        var num = value[0],obj = value[1], timeIn = value[2], timeOut = value[3];
        if (Number(num) !== "number" && Number(num) <= 0 && typeof obj !== "object") {
            return "参数输入错误！";
        }
        timeIn = Number(timeIn) || 500;
        timeOut = Number(timeOut) || 100;
        var oData = obj.data;
        $("td:nth-child(" + Number(num) + ")").mouseover(function (e) {
            if($("#tips").length <=0){
                $("body").append($("<div>").attr("id","tips"))
            }
            for (var i = 0; i < oData.length; i++) {
                for (var titles in oData[i]) {
                    if (oData[i][titles] === $(this).text()) {//确保当前的单元值与捕获的数据中的值对应，避免对应错误
                        $("#tips").html("");
                        try {
                            for (var j = 0; j < oData[i].messages.length; j++) {
                                $("#tips").append("<p>\n" +
                                    "        <span class=\"tip_title\">" + oData[i].messages[j].name + "</span>：<span class=\"tip_conts\">" + oData[i].messages[j].value + "</span>\n" +
                                    "    </p>")
                            }
                        } catch (e) {
                            continue;
                        }
                        e = e || window.event;
                        _x = e.pageX || e.clientX + document.body.scroolLeft;
                        _y = e.pageY || e.clientY + document.body.scrollTop;
                        //$("#tips").fadeOut(50);
                        $("#tips").css("left", _x + 'px').css("top", _y + 'px').fadeIn(timeIn);
                        $(this).mouseleave(function () {
                            $("#tips").fadeOut(timeOut).remove();
                        })
                        break;
                    }
                }
            }
        })
    }
    //返回按钮点击事件
    $("button[data-type='backUrl']").on('click', function () {
        layer.confirm("确定返回表格信息吗？", function () {
            location.href = document.referrer;//返回上一个页面
        });
    })
}


