# Neighborhood-Map_Udacity
By:Jing Tian

## 简介
来源于Udacity项目。
这是一个单页应用，使其可以显示你设定的区域，并具有迅速找到这些地点的搜索功能以及支持简单浏览各地点的列表视图。最后添加了百度翻译API，各地点的标题进行了翻译。
参考的项目要求：https://review.udacity.com/#!/rubrics/501/view

## 功能
> *  通过**高德地图API**加载了以武汉市为中心的若干名称中还有“地铁站”的地点，并在窗口右侧区域进行显示
> *  在地图上点击相应地点图标时，被点击图标会出现弹跳动画，并在上方展开信息栏，显示详细信息
> *  上述地点信息栏中包含对地点名称的英文翻译信息，该信息来自于**百度翻译API**
> *  窗口左侧具有所有地点信息的列表，以及搜索筛选框。可通过点击列表中代表地点的项，或在搜索栏中输入信息，实现对地点标注的筛选。

## 可用性
> * 响应式窗口，可在不同尺寸的浏览器上显示
> * 左侧列表可展开或隐藏
> * 含有对异常信息的处理

## 参考资料来源：
### 1. knockoutjs：http://knockoutjs.com/documentation/introduction.html
### 2. jQuery:https://jquery.com/
### 3. 高德地图开放平台：http://lbs.amap.com/
### 4. 百度翻译开放平台：http://api.fanyi.baidu.com/api/trans/product/index