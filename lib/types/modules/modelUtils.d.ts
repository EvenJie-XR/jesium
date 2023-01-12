import * as Cesium from "cesium";
/**
 * 广告牌参数
 */
declare type BillboardOption = {
    show: boolean;
    position: Cesium.Cartesian3;
    pixelOffset: Cesium.Cartesian2;
    eyeOffset: Cesium.Cartesian3;
    heightReference: Cesium.HeightReference;
    horizontalOrigin: Cesium.HorizontalOrigin;
    verticalOrigin: Cesium.VerticalOrigin;
    scale: number;
    image: string;
    imageSubRegion: Cesium.BoundingRectangle;
    color: Cesium.Color;
    id: string;
    rotation: number;
    alignedAxis: Cesium.Cartesian3;
    width: number;
    height: number;
    scaleByDistance: Cesium.NearFarScalar;
    translucencyByDistance: Cesium.NearFarScalar;
    pixelOffsetScaleByDistance: Cesium.NearFarScalar;
    sizeInMeters: boolean;
    distanceDisplayCondition: Cesium.DistanceDisplayCondition;
};
/**
 * cesium的模型相关帮助类
 */
export declare class ModelUtils {
    viewer: Cesium.Viewer;
    billboardCollection: Cesium.BillboardCollection;
    constructor(viewer: Cesium.Viewer);
    /**
     * 加载3dtiles
     * @param url 3dtiles地址
     * @param name 3dtiles名字
     * @param autoFlyTo 相机是否自动飞向3dtiles
     */
    add3DTiles(url: string, name?: string, autoFlyTo?: boolean): Cesium.Cesium3DTileset;
    /**
     * 通过uuid获取3dtiles
     * @param uuid 3dtiles对象的uuid
     */
    get3DTilesByUUID(uuid: string): Cesium.Cesium3DTileset | null;
    /**
     * 通过uuid设置3dtiles透明度
     * @param uuid
     */
    set3DTilesOpacityByUUID(uuid: string, opacity: number): void;
    /**
     * 添加广告牌
     * @param option 广告牌参数
     */
    addBillboard(option: BillboardOption): Cesium.Billboard;
}
export {};
