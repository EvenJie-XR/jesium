import * as Cesium from "cesium";
/**
 * 相机相关工具类
 */
export declare class CameraUtils {
    viewer: Cesium.Viewer;
    constructor(viewer: Cesium.Viewer);
    /**
     * 通过坐标数组指定相机 有过度 的飞向指定位置
     * @param coord [x, y, z]（WGS84坐标）
     */
    flyToByCoordArray(coord: [number, number, number]): void;
    /**
     * 通过坐标数组指定相机 没有过度 的飞向指定位置
     * @param coord [经度, 维度, 高度]（WGS84坐标）
     */
    setViewByCoordArray(coord: [number, number, number]): void;
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
    getCameraInfo(): {
        latitude: number;
        longitude: number;
        height: number;
        pitch: number;
        heading: number;
        roll: number;
    };
    /**
     * 添加相机变化监听(监听回调函数会加入到事件队列中多次添加不会覆盖之前的回调函数，通过调用这个函数的回调函数来移除回调函数)
     * @param callback 监听回调函数
     * @returns 调用这个方法移除监听函数
     */
    addCameraChangeEvent(callback: (...args: any[]) => void): Cesium.Event.RemoveCallback;
    /**
     * 添加指南针旋转监听(这个元素默认为向上是北方向)
     */
    addCompass(compassEl: HTMLDivElement): Cesium.Event.RemoveCallback;
    /**
     * 重置相机重新指向北方(heading为0)
     */
    resetCameraHeading(): void;
}
