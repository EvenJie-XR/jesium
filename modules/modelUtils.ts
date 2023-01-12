import * as Cesium from "cesium"
import { guid } from "./utils/misc";

/**
 * 广告牌参数
 */
type BillboardOption = {
    show : boolean,
    position : Cesium.Cartesian3,
    pixelOffset : Cesium.Cartesian2,
    eyeOffset : Cesium.Cartesian3,
    heightReference : Cesium.HeightReference,
    horizontalOrigin : Cesium.HorizontalOrigin,
    verticalOrigin : Cesium.VerticalOrigin,
    scale : number,
    image : string,
    imageSubRegion : Cesium.BoundingRectangle,
    color : Cesium.Color,
    id : string,
    rotation : number,
    alignedAxis : Cesium.Cartesian3,
    width : number,
    height : number,
    scaleByDistance : Cesium.NearFarScalar,
    translucencyByDistance : Cesium.NearFarScalar,
    pixelOffsetScaleByDistance : Cesium.NearFarScalar,
    sizeInMeters : boolean,
    distanceDisplayCondition : Cesium.DistanceDisplayCondition
}

/**
 * cesium的模型相关帮助类
 */
export class ModelUtils {
    billboardCollection: Cesium.BillboardCollection // 广告牌集合
    constructor(public viewer: Cesium.Viewer) {
        this.billboardCollection = this.viewer.scene.primitives.add(
            new Cesium.BillboardCollection()
        );
    }
    /**
     * 加载3dtiles
     * @param url 3dtiles地址
     * @param name 3dtiles名字
     * @param autoFlyTo 相机是否自动飞向3dtiles
     */
    add3DTiles(url: string, name: string = "", autoFlyTo: boolean = true): Cesium.Cesium3DTileset {
        const tileset = this.viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
            url,
            skipLevelOfDetail: true,
            cullRequestsWhileMovingMultiplier: 240, // 值越大能够更快的剔除
            maximumMemoryUsage: 128, // 内存分配变小有利于倾斜摄影数据回收，提升性能体验
            dynamicScreenSpaceErrorDensity: 0.1, // 数值加大，能让周边加载变快
            dynamicScreenSpaceError: true, // 有了这个后，会在真正的全屏加载完之后才清晰化房屋
        }))
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
    get3DTilesByUUID(uuid: string): Cesium.Cesium3DTileset | null {
        const cesiumPrimitives = (this.viewer.scene.primitives as any)._primitives as any[];
        for(let i = 0; i < cesiumPrimitives.length; i++) {
            const primitive = cesiumPrimitives[i];
            if(primitive.uuid === uuid){
                return primitive;
            }
        }
        return null;
    }
    /**
     * 通过uuid设置3dtiles透明度
     * @param uuid 
     */
    set3DTilesOpacityByUUID(uuid: string, opacity: number) {
        const threeDTiles = this.get3DTilesByUUID(uuid);
        if(threeDTiles) {
            if( opacity == 0 ) {
                threeDTiles.show = false;
            }else{
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
    addBillboard(option: BillboardOption) {
        return this.billboardCollection.add(option)
    }
}