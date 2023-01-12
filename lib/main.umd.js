(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('cesium')) :
    typeof define === 'function' && define.amd ? define(['exports', 'cesium'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Jesium = {}, global.Cesium));
}(this, (function (exports, Cesium) { 'use strict';

    /**
     * 相机相关工具类
     */
    class CameraUtils {
        viewer;
        constructor(viewer) {
            this.viewer = viewer;
        }
        /**
         * 通过坐标数组指定相机 有过度 的飞向指定位置
         * @param coord [x, y, z]（WGS84坐标）
         */
        flyToByCoordArray(coord) {
            this.viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(...coord)
            });
        }
        /**
         * 通过坐标数组指定相机 没有过度 的飞向指定位置
         * @param coord [经度, 维度, 高度]（WGS84坐标）
         */
        setViewByCoordArray(coord) {
            this.viewer.camera.setView({
                destination: Cesium.Cartesian3.fromDegrees(...coord)
            });
        }
        /**
         * 获取当前相机信息
         * {
         *      经度,
         *      维度,
         *      高度,
         *      pitch,
         *      heading,
         *      roll
         * }
         */
        getCameraInfo() {
            const catoPosition = this.viewer.camera.positionCartographic;
            return {
                latitude: Cesium.Math.toDegrees(catoPosition.latitude),
                longitude: Cesium.Math.toDegrees(catoPosition.longitude),
                height: catoPosition.height,
                pitch: this.viewer.camera.pitch,
                heading: this.viewer.camera.heading,
                roll: this.viewer.camera.roll
            };
        }
        /**
         * 添加相机变化监听(监听回调函数会加入到事件队列中多次添加不会覆盖之前的回调函数，通过调用这个函数的回调函数来移除回调函数)
         * @param callback 监听回调函数
         * @returns 调用这个方法移除监听函数
         */
        addCameraChangeEvent(callback) {
            return this.viewer.camera.changed.addEventListener(callback);
        }
        /**
         * 添加指南针旋转监听(这个元素默认为向上是北方向)
         */
        addCompass(compassEl) {
            return this.addCameraChangeEvent(() => {
                const rotateAngle = Cesium.Math.toDegrees(this.viewer.camera.heading).toFixed(2);
                compassEl.style.transform = `rotateZ(${rotateAngle}deg)`;
            });
        }
        /**
         * 重置相机重新指向北方(heading为0)
         */
        resetCameraHeading() {
            const cameraInfo = this.getCameraInfo();
            this.viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(cameraInfo.longitude, cameraInfo.latitude, cameraInfo.height),
                orientation: {
                    heading: 0,
                    pitch: Cesium.Math.toRadians(cameraInfo.pitch),
                    roll: Cesium.Math.toRadians(cameraInfo.roll)
                }
            });
        }
    }

    /**
     * 用于cesium鼠标相关的帮助函数
     */
    class ControlUtils {
        viewer;
        handler; // cesium用于添加监听事件的handler
        __polygon_point_arr = []; // 动态绘制多边形时用于存放多边形点的数组（绘制完成后会清空）
        __temporary_polygon_entity = null; // 动态绘制多边形时用于存放临时多边形entity的对象（绘制完成会清空）
        constructor(viewer) {
            this.viewer = viewer;
            this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        }
        /**
         * 添加cesium场景的鼠标事件(同一事件类型只能有一个action，多次注册会覆盖之前的)
         * @param callback 鼠标事件触发的回调函数
         * @param eventType 鼠标事件类型，参考Cesium.ScreenSpaceEventType
         */
        addMouseEventWatch(callback, eventType) {
            this.handler.setInputAction(callback, eventType);
        }
        /**
         * 移除鼠标事件的action
         * @param eventType 事件类型，参考Cesium.ScreenSpaceEventType
         */
        removeMouseEventWatch(eventType) {
            this.handler.removeInputAction(eventType);
        }
        /**
         * 开启绘制的方法
         */
        drawPolygon(callback, polygonColor) {
            // 清除可能会用到的监听事件
            if (this.handler) {
                this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
                this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
            }
            this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
            //鼠标左键--确定选中点
            this.handler.setInputAction((event) => {
                // 屏幕坐标转为空间坐标
                let cartesian = this.viewer.camera.pickEllipsoid(event.position, this.viewer.scene.globe.ellipsoid);
                // 判断是否定义（是否可以获取到空间坐标）
                if (Cesium.defined(cartesian)) {
                    // 将点添加进保存多边形点的数组中，鼠标停止移动的时添加的点和，点击时候添加的点，坐标一样
                    this.__polygon_point_arr.push(cartesian);
                    // 判断是否开始绘制动态多边形，没有的话则开始绘制
                    if (this.__temporary_polygon_entity == null) {
                        // 绘制动态多边形
                        this.draw_dynamic_polygon(polygonColor);
                    }
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            //鼠标移动--实时绘制多边形
            this.handler.setInputAction((event) => {
                // 屏幕坐标转为空间坐标
                let cartesian = this.viewer.camera.pickEllipsoid(event.endPosition, this.viewer.scene.globe.ellipsoid);
                // 判断是否定义（是否可以获取到空间坐标）
                if (Cesium.defined(cartesian)) {
                    // 判断是否已经开始绘制动态多边形，已经开始的话，则可以动态拾取鼠标移动的点，修改点的坐标
                    if (this.__temporary_polygon_entity) {
                        // 只要元素点大于一，每次就删除一个点，因为实时动态的点是添加上去的
                        if (this.__polygon_point_arr.length > 1) {
                            // 删除数组最后一个元素（鼠标移动添加进去的点）
                            this.__polygon_point_arr.pop();
                        }
                        // 将新的点添加进动态多边形点的数组中，用于实时变化，注意：这里是先添加了一个点，然后再删除点，再添加，这样重复的
                        this.__polygon_point_arr.push(cartesian);
                    }
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            //鼠标右键--结束绘制
            this.handler.setInputAction((event) => {
                // 取消鼠标移动监听
                this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                // 清除动态绘制的多边形
                this.viewer.entities.remove(this.__temporary_polygon_entity);
                // 删除保存的临时多边形的entity
                this.__temporary_polygon_entity = null;
                // 绘制结果多边形
                const entity = this.draw_polygon(polygonColor);
                // 清空多边形点数组，用于下次绘制
                this.__polygon_point_arr = [];
                // 清除所有事件
                if (this.handler) {
                    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
                    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
                }
                // 绘制全流程完成调用回调函数并传入绘制结果
                callback(entity);
            }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        }
        /**
         * 绘制结果多边形
         */
        draw_polygon(polygonColor) {
            // 删除最后一个动态添加的点，如果鼠标没移动，最后一个和倒数第二个是一样的，所以也要删除
            this.__polygon_point_arr.pop();
            // 三个点以上才能绘制成多边形
            if (this.__polygon_point_arr.length >= 3) {
                let polygon_point_entity = this.viewer.entities.add({
                    polygon: {
                        hierarchy: this.__polygon_point_arr,
                        material: polygonColor.withAlpha(0.22),
                    },
                    polyline: {
                        positions: [...this.__polygon_point_arr, this.__polygon_point_arr[0]],
                        clampToGround: true,
                        width: 4,
                        material: polygonColor.withAlpha(1),
                    },
                });
                return {
                    entity: polygon_point_entity,
                    coord: [...this.__polygon_point_arr]
                };
            }
        }
        /**
         * 绘制动态多边形
         */
        draw_dynamic_polygon(polygonColor) {
            this.__temporary_polygon_entity = this.viewer.entities.add({
                polygon: {
                    // 这个方法上面有重点说明
                    hierarchy: new Cesium.CallbackProperty(() => {
                        // PolygonHierarchy 定义多边形及其孔的线性环的层次结构（空间坐标数组）
                        return new Cesium.PolygonHierarchy(this.__polygon_point_arr);
                    }, false),
                    material: polygonColor.withAlpha(0.22),
                },
                polyline: {
                    positions: new Cesium.CallbackProperty(() => {
                        return [...this.__polygon_point_arr, this.__polygon_point_arr[0]];
                    }, false),
                    clampToGround: true,
                    width: 4,
                    material: polygonColor.withAlpha(1),
                },
            });
        }
    }

    /**
     * 坐标相关工具类
     */
    class CoordUtils {
        viewer;
        constructor(viewer) {
            this.viewer = viewer;
        }
        /**
         * Cartographic转经纬度
         */
        cato2Lat(cato) {
            return {
                latitude: Cesium.Math.toDegrees(cato.latitude),
                longitude: Cesium.Math.toDegrees(cato.longitude),
                height: cato.height
            };
        }
        /**
         * 经纬度转Cartographic
         * @param coord 经纬度数组 [经度，维度，高度]
         */
        lat2Cato(coord) {
            const cartographic = Cesium.Cartographic.fromDegrees(...coord);
            return cartographic;
        }
        /**
         * Cartographic转笛卡尔3
         */
        cato2Car3(cato) {
            return this.viewer.scene.globe.ellipsoid.cartographicToCartesian(cato);
        }
    }

    /**
     * 影像相关工具类
     */
    class ImageryUtils {
        viewer;
        constructor(viewer) {
            this.viewer = viewer;
        }
        /**
         * 设置底图透明度
         * @param opacity 透明度
         */
        setBaseLayerOpacity(opacity) {
            if (opacity === 0) {
                this.viewer.imageryLayers._layers[0].show = false;
            }
            else {
                this.viewer.imageryLayers._layers[0].show = true;
                this.viewer.imageryLayers._layers[0].alpha = opacity;
            }
        }
    }

    const guid = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    /**
     * cesium的模型相关帮助类
     */
    class ModelUtils {
        viewer;
        billboardCollection; // 广告牌集合
        constructor(viewer) {
            this.viewer = viewer;
            this.billboardCollection = this.viewer.scene.primitives.add(new Cesium.BillboardCollection());
        }
        /**
         * 加载3dtiles
         * @param url 3dtiles地址
         * @param name 3dtiles名字
         * @param autoFlyTo 相机是否自动飞向3dtiles
         */
        add3DTiles(url, name = "", autoFlyTo = true) {
            const tileset = this.viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
                url,
                skipLevelOfDetail: true,
                cullRequestsWhileMovingMultiplier: 240,
                maximumMemoryUsage: 128,
                dynamicScreenSpaceErrorDensity: 0.1,
                dynamicScreenSpaceError: true,
            }));
            // 设置3dtiles的额外属性
            tileset.name = name;
            tileset.uuid = `${name}-${guid()}`;
            // 相机是否有过渡的飞向刚刚加载的3dtiles
            autoFlyTo && this.viewer.flyTo(tileset);
            return tileset;
        }
        /**
         * 通过uuid获取3dtiles
         * @param uuid 3dtiles对象的uuid
         */
        get3DTilesByUUID(uuid) {
            const cesiumPrimitives = this.viewer.scene.primitives._primitives;
            for (let i = 0; i < cesiumPrimitives.length; i++) {
                const primitive = cesiumPrimitives[i];
                if (primitive.uuid === uuid) {
                    return primitive;
                }
            }
            return null;
        }
        /**
         * 通过uuid设置3dtiles透明度
         * @param uuid
         */
        set3DTilesOpacityByUUID(uuid, opacity) {
            const threeDTiles = this.get3DTilesByUUID(uuid);
            if (threeDTiles) {
                if (opacity == 0) {
                    threeDTiles.show = false;
                }
                else {
                    threeDTiles.show = true;
                    threeDTiles.style = new Cesium.Cesium3DTileStyle({
                        color: `color('rgba(255,255,255,${opacity})')`,
                    });
                }
            }
        }
        /**
         * 添加广告牌
         * @param option 广告牌参数
         */
        addBillboard(option) {
            return this.billboardCollection.add(option);
        }
    }

    /**
     * Cesium工具类总类，不直接拿它使用，而是通过Web3DUtils.cesiumUtils访问
     */
    class Jesium {
        viewer;
        modelUtils; // cesium的模型（3dtiles、primitive、entity）相关操作帮助函数类
        cameraUtils; // cesium的相机相关操作帮助类
        coordUtils; // cesium的坐标转化相关操作帮助类
        controlUtils; // cesium的鼠标事件相关操作帮助类
        imageryUtils;
        /**
         * @param container 放cesium的div
         */
        constructor(container) {
            // 初始化viewer
            this.viewer = new Cesium.Viewer(container, {
                infoBox: false,
                baseLayerPicker: false,
                sceneModePicker: false,
                homeButton: false,
                geocoder: false,
                navigationHelpButton: false,
                animation: false,
                timeline: false,
                fullscreenButton: false,
                selectionIndicator: false,
                imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
                    url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
                }),
            });
            this.viewer.cesiumWidget.creditContainer.style.display = 'none'; // 去掉cesium的左下角logo区域
            this.viewer.scene.globe.baseColor = Cesium.Color.BLACK; // 设置地球颜色
            // 初始化帮助类们
            this.modelUtils = new ModelUtils(this.viewer);
            this.cameraUtils = new CameraUtils(this.viewer);
            this.coordUtils = new CoordUtils(this.viewer);
            this.controlUtils = new ControlUtils(this.viewer);
            this.imageryUtils = new ImageryUtils(this.viewer);
        }
        /**
         * 设置全局透明度（倾斜模型+底图）
         */
        setGlobalOpacity(uuid, opacity) {
            this.imageryUtils.setBaseLayerOpacity(opacity);
            this.modelUtils.set3DTilesOpacityByUUID(uuid, opacity);
        }
        /**
         * 加载cesium的页面被销毁时一定要调用此方法，否则多次打开关闭，会造成内存溢出
         */
        destory() {
            // 释放内存和CPU占用
            this.viewer?.canvas.getContext('webgl')?.getExtension('WEBGL_lose_context')?.loseContext();
            this.viewer?.destroy();
        }
    }

    /**
     * jesium版本号
     */
    const version = require("../package.json").version;

    exports.CameraUtils = CameraUtils;
    exports.ControlUtils = ControlUtils;
    exports.CoordUtils = CoordUtils;
    exports.ImageryUtils = ImageryUtils;
    exports.Jesium = Jesium;
    exports.ModelUtils = ModelUtils;
    exports.version = version;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
