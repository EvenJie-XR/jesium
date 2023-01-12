import * as Cesium from "cesium"

/**
 * 坐标相关工具类
 */
export class CoordUtils {
    constructor(public viewer: Cesium.Viewer) {

    }

    /**
     * Cartographic转经纬度
     */
    cato2Lat(cato: Cesium.Cartographic) {
        return {
            latitude: Cesium.Math.toDegrees(cato.latitude),
            longitude: Cesium.Math.toDegrees(cato.longitude),
            height: cato.height
        }
    }
    /**
     * 经纬度转Cartographic
     * @param coord 经纬度数组 [经度，维度，高度]
     */
    lat2Cato(coord: [number, number, number]): Cesium.Cartographic {
        const cartographic = Cesium.Cartographic.fromDegrees(...coord);
        return cartographic;
    }
    /**
     * Cartographic转笛卡尔3
     */
    cato2Car3(cato: Cesium.Cartographic): Cesium.Cartesian3 {
        return this.viewer.scene.globe.ellipsoid.cartographicToCartesian(cato);
    }
}