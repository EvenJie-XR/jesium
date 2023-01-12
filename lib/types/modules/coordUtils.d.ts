import * as Cesium from "cesium";
/**
 * 坐标相关工具类
 */
export declare class CoordUtils {
    viewer: Cesium.Viewer;
    constructor(viewer: Cesium.Viewer);
    /**
     * Cartographic转经纬度
     */
    cato2Lat(cato: Cesium.Cartographic): {
        latitude: number;
        longitude: number;
        height: number;
    };
    /**
     * 经纬度转Cartographic
     * @param coord 经纬度数组 [经度，维度，高度]
     */
    lat2Cato(coord: [number, number, number]): Cesium.Cartographic;
    /**
     * Cartographic转笛卡尔3
     */
    cato2Car3(cato: Cesium.Cartographic): Cesium.Cartesian3;
}
