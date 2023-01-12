import * as Cesium from "cesium";
/**
 * 用于cesium鼠标相关的帮助函数
 */
export declare class ControlUtils {
    viewer: Cesium.Viewer;
    handler: Cesium.ScreenSpaceEventHandler;
    private __polygon_point_arr;
    private __temporary_polygon_entity;
    constructor(viewer: Cesium.Viewer);
    /**
     * 添加cesium场景的鼠标事件(同一事件类型只能有一个action，多次注册会覆盖之前的)
     * @param callback 鼠标事件触发的回调函数
     * @param eventType 鼠标事件类型，参考Cesium.ScreenSpaceEventType
     */
    addMouseEventWatch(callback: Cesium.ScreenSpaceEventHandler.PositionedEventCallback | Cesium.ScreenSpaceEventHandler.MotionEventCallback | Cesium.ScreenSpaceEventHandler.WheelEventCallback | Cesium.ScreenSpaceEventHandler.TwoPointEventCallback | Cesium.ScreenSpaceEventHandler.TwoPointMotionEventCallback, eventType: Cesium.ScreenSpaceEventType): void;
    /**
     * 移除鼠标事件的action
     * @param eventType 事件类型，参考Cesium.ScreenSpaceEventType
     */
    removeMouseEventWatch(eventType: Cesium.ScreenSpaceEventType): void;
    /**
     * 开启绘制的方法
     */
    drawPolygon(callback: (entity: {
        entity: Cesium.Entity;
        coord: Cesium.Cartesian3[];
    } | undefined) => void, polygonColor: Cesium.Color): void;
    /**
     * 绘制结果多边形
     */
    private draw_polygon;
    /**
     * 绘制动态多边形
     */
    private draw_dynamic_polygon;
}
