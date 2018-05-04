//The ViewModel for Knockout
function myViewModel() {
    var self = this;
    //设置左侧信息栏宽度
    self.menuWidth = ko.observable('260');
    //初始化myWidth，该变量监控窗口宽度变化
    self.myWidth = ko.observable($(window).width());
    //增加窗口尺寸变化的响应，窗口尺寸变化时，修改self.myWidth()
    $(window).resize(function () {
        self.myWidth($(window).width());
        map.setFitView();
    });
    //设置变量，根据窗口尺寸和左侧信息栏宽度，修改右侧地图容器宽度
    self.sreenWidth = ko.computed(function () {
        return self.myWidth() - self.menuWidth() + "px";
    });
    //汉堡滑动菜单的响应，点击时展开或隐藏窗口左侧菜单
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
        map.setFitView();
    });
    //绑定搜索栏输入信息
    self.inputFilter = ko.observable();
    //初始化左侧列表栏内容
    //self.title = ko.observableArray(titleArray);
    self.title = ko.computed(function() {
        if (!self.inputFilter()) {
            markerArray.forEach(function(el){
                el.show();
            });
            return titleArray;
        } else {
            return titleArray.filter(function(item,index) {
                if(item.indexOf(self.inputFilter()) != -1){
                markerArray[index].show();
                return true;
                }
                markerArray[index].hide();
                return false;
            });
        }
    });
    //响应搜索/筛选按钮的内容
    self.filterEvt = function (evt) {
        //自动显示第一个符合条件地点的信息栏
        if(self.title().length>0){
            marker=markerArray[ko.utils.arrayIndexOf(titleArray, self.title()[0])];
            marker.emit('click', {target: marker});
        }
        else{
            alert('筛选无结果，请重新输入');
            self.inputFilter('');
        }
        
    };
    //响应列表上的单击事件
    self.showThisMarker = function (evt) {
        self.inputFilter(this.toString());
        self.filterEvt();
    };

}

//set map
var map;
var infoWindow = new AMap.InfoWindow({
    offset: new AMap.Pixel(15, -20)
});
var lastClickMarker = null;
var translation = '';
var markerArray=new Array();
var titleArray= new Array();

function initializeMap() {
    // 创建地图对象
//    对地图进行初始化
    map = new AMap.Map('mapArea', {
        resizeEnable: true,
        center: [114.305215, 30.592935],
        zoom: 9,
        mapStyle: 'amap://styles/macaron'
    });

    map.plugin(["AMap.ToolBar"], function () {
        // 添加 工具条
        map.addControl(new AMap.ToolBar());
    });
//    搜索目标对象
    searchLocation('地铁站');

    map.addControl(new AMap.ToolBar());
    if (AMap.UA.mobile) {
        document.getElementById('button_group').style.display = 'none';
    }
}

function searchLocation(name) {
    //使用Promise，在地图上的标注信息加载完后，再对knockout进行初始化
    //保证标记相关的数组信息加载完成
    var loadLocs = new Promise(function (resolve, reject) {
        AMap.plugin('AMap.PlaceSearch', function () { //回调函数
            var placeSearch = new AMap.PlaceSearch({
                city: '027',
                pageSize: 50
            });


            //使用placeSearch对象调用关键字搜索的功能
            placeSearch.search(name, function (status, data) {
                if (status !== 'complete') return;
                var poisCount = data.poiList.count > 30 ? 30 : data.poiList.count;
                for (let i = 0; i < poisCount; i++) {

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
                    //marker.setTitle(pois[i].name + '\r\n地址：' + pois[i].address + '\r\n类型：' + pois[i].type);
                    marker.setTitle(`${pois[i].name}
                                    地址：${pois[i].address}
                                    类型：${pois[i].type}`);

                    marker.content = `<span class="infoWindow"><b>${pois[i].name}</b><a class='inline'  href='http://ditu.amap.com/detail/${pois[i].id }' target='_blank'>详细信息</a><br/>地址：${pois[i].address} <br/>类型：${pois[i].type } </span>`;
                    // marker.setAnimation('AMAP_ANIMATION_BOUNCE');
                    marker.id = pois[i].id;
                    marker.name = pois[i].name;
                    marker.on('click', markerClick);
                    marker.setExtData(pois[i].name);
                    map.setFitView();
                    markerArray.push(marker);
                    titleArray.push(marker.getExtData());
                }
                //加载完成后，通知后续任务
                resolve();
            })
        })


    });
    loadLocs.then(function () {
        ko.applyBindings(new myViewModel());
    });
}

function markerClick(e) {
    //恢复上一marker的状态
    if (lastClickMarker != null) {
        lastClickMarker.setAnimation('AMAP_ANIMATION_NONE');
    }
    lastClickMarker = e.target;
    e.target.setAnimation('AMAP_ANIMATION_BOUNCE');
    var q = e.target.getExtData();
    //加入翻译,使用百度翻译API
    var appid = '20180503000152683';
    var key = 'ZAK33SUJ_pCT27O_O4j0';
    var from = 'zh';
    var to = 'en';
    var salt = (new Date).getTime();
    var str1 = appid + q + salt + key;
    var sign = MD5(str1);
    //配置数据后使用ajax函数进行请求，并对接收到的信息进行处理
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
        })
    //判断请求是否有误，并处理
        .fail(function () {
            alert('Error occurs when loading translation.');

        })
    //判断返回消息是否有误，并处理
        .done(function (data) {
            if (data.trans_result.length > 0) {
                translation = data.trans_result[0].dst;
            } else {
                alert(`Translation failed.
                        error_code:${data.erro_code},error_msg:${data.error_msg }.`);
            }

        })
    //若返回消息无误，将翻译信息显示在信息栏中
        .done(function () {
            infoWindow.setContent(`${e.target.content}<div>Translation:${translation}</div>`);
            infoWindow.open(map, e.target.getPosition());
            map.setFitView();
        });

}

//优化列表效果，增加类似a:hover的效果
$('ul').on('mouseenter', 'li', function () {
        $(this).addClass("mouseover");

    })
    .on('mouseleave', 'li', function () {
        $("li[class*='mouseover']").removeClass("mouseover");

    });


//网页加载完成后，在加载地图，完成后续初始化
window.addEventListener('load', initializeMap);

