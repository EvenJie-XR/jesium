# Jesium

概述：利用原生cesium封装一些常用功能,帮助快速开发cesium项目

中文文档：https://gunomniscience.github.io/jesium/


## Vue3中使用jesium

1. 安装cesium
   ```
   npm i cesium
   ```
2. 拷贝node_modules/cesium/Build/Cesium/Assets、node_modules/cesium/Build/Cesium/ThirdParty、node_modules/cesium/Build/Cesium/Widgets、node_modules/cesium/Build/Cesium/Workers目录到项目的public目录下
3. 在main.ts中添加如下代码
   ```ts
    import { Ion } from "cesium"
    import "cesium/Build/Cesium/Widgets/widgets.css";

    // 配置cesium初始化
    window.CESIUM_BASE_URL = '/'; // / = public目录，如果是放在public/libs/cesium下面那么应该写：/libs/cesium/
    Ion.defaultAccessToken = '你的Cesium Ion的token';
   ```
4. 配置已经完成接下来可以使用jesium来快速开发cesium了
   ```ts

   ```
