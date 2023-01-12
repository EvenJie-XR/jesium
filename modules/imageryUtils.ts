import * as Cesium from "cesium"

/**
 * 影像相关工具类
 */
export class ImageryUtils {
    constructor(public viewer: Cesium.Viewer) {

    }
    /**
     * 设置底图透明度
     * @param opacity 透明度
     */
    setBaseLayerOpacity(opacity: number) {
        if(opacity === 0) {
            (this.viewer.imageryLayers as any)._layers[0].show = false;
        }else{
            (this.viewer.imageryLayers as any)._layers[0].show = true;
            (this.viewer.imageryLayers as any)._layers[0].alpha = opacity;
        }
        
    }
}