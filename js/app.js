//The ViewModel
function myViewModel() {
    var self = this;
    self.menuWidth = ko.observable('260');
    self.myWidth = ko.observable($(window).width());
    $(window).resize(function () {
        self.myWidth($(window).width());
    });
    self.sreenWidth = ko.computed(function () {
        return self.myWidth() - self.menuWidth() + "px";
    });
    $('#ham').on('click', function () {
        //$('#menu').toggle('slow');
        if ($('#menu').width() > 0) {
            $('#menu').animate({
                width: '0'
            }, 'normal');
            self.menuWidth(0);
        } else {
            $('#menu').animate({
                width: '260'
            }, 'nomal');
            self.menuWidth(260);
        }
    });

};
ko.applyBindings(new myViewModel());

//set map
var map;
var infoWindow = new AMap.InfoWindow({
    offset: new AMap.Pixel(15, -20)
});
var lastClickMarker=null;



function initializeMap() {
    // 创建地图对象
    map = new AMap.Map('mapArea', {
        resizeEnable: true,
        center: [114.305215, 30.592935],
        zoom: 9
    });

    map.plugin(["AMap.ToolBar"], function () {
        // 添加 工具条
        map.addControl(new AMap.ToolBar());
    });
    searchLocation('地铁站');
    map.setFitView();

    map.addControl(new AMap.ToolBar());
    if (AMap.UA.mobile) {
        document.getElementById('button_group').style.display = 'none';
    }
}

function searchLocation(name) {
    AMap.plugin('AMap.PlaceSearch', function () { //回调函数
        var placeSearch = new AMap.PlaceSearch({
            city: '027',
            pageSize: 50
        });
        //使用placeSearch对象调用关键字搜索的功能
        placeSearch.search(name, function (status, data) {
            if (status !== 'complete') return;
            var poisCount=data.poiList.count>50?50:data.poiList.count;
            for (var i = 0; i < poisCount-1; i++) {

                var pois = data.poiList.pois;
                var marker = new AMap.Marker({
                    content: '<div class="marker" >' + '</div>',
                    position: pois[i].location,
                    map: map,
                });
                marker.setLabel({
                    offset: new AMap.Pixel(20, 20), //修改label相对于maker的位置
                    content: pois[i].name
                });
                marker.setTitle(pois[i].name + '\r\n地址：' + pois[i].address + '\r\n类型：' + pois[i].type);

                marker.content = '<span class="infoWindow"><b>' + pois[i].name + "</b><a class='inline'  href='http://ditu.amap.com/detail/" + pois[i].id + "' target='_blank'>详细信息</a>" + '<br/>地址：' + pois[i].address + '<br/>类型：' + pois[i].type + '</span>';
                // marker.setAnimation('AMAP_ANIMATION_BOUNCE');
                marker.id = pois[i].id;
                marker.name = pois[i].name;
                marker.on('click', markerClick);
                //marker.emit('click', {target: marker});
                marker.setExtData(pois[i].name);
                map.setFitView();
            }
 
        })
    })
}

function markerClick(e) {
    //恢复上一marker的状态
    if (lastClickMarker != null) {
        lastClickMarker.setAnimation('AMAP_ANIMATION_NONE');
    }
    lastClickMarker = e.target;
    e.target.setAnimation('AMAP_ANIMATION_BOUNCE');
    var q=e.target.getExtData();
    //加入翻译
    //Baidu trans api
    var appid = '20180503000152683';
    var key = 'ZAK33SUJ_pCT27O_O4j0';
    var from='zh';
    var to='en';
    var salt = (new Date).getTime();
    var str1 = appid + q + salt + key;
    var sign = MD5(str1);
    $.ajax({
        url: 'http://api.fanyi.baidu.com/api/trans/vip/translate',
        type: 'get',
        dataType: 'jsonp',
        data: {
            q: q,
            appid: appid,
            salt: salt,
            from: from,
            to: to,
            sign: sign
        }
    }).done(function(data){
        if(data.trans_result.length>0){
            alert(data.trans_result[0].dst);
        }
        else{
            alert("Translation failed.\r\n error_code:"+data.erro_code+"error_msg:"+data.error_msg+".");
        }
    
    });

    infoWindow.setContent(e.target.content);
    infoWindow.open(map, e.target.getPosition());
}


window.addEventListener('load', initializeMap);