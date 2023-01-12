import * as Cesium from "cesium";
/**
 * 影像相关工具类
 */
export declare class ImageryUtils {
    viewer: Cesium.Viewer;
    constructor(viewer: Cesium.Viewer);
    /**
     * 设置底图透明度
     * @param opacity 透明度
     */
    setBaseLayerOpacity(opacity: number): void;
}
