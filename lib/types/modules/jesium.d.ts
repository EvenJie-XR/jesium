import * as Cesium from "cesium";
import { CameraUtils } from "./cameraUtils";
import { ControlUtils } from "./controlUtils";
import { CoordUtils } from "./coordUtils";
import { ImageryUtils } from "./imageryUtils";
import { ModelUtils } from "./modelUtils";
/**
 * Cesium工具类总类，不直接拿它使用，而是通过Web3DUtils.cesiumUtils访问
 */
export declare class Jesium {
    viewer: Cesium.Viewer;
    modelUtils: ModelUtils;
    cameraUtils: CameraUtils;
    coordUtils: CoordUtils;
    controlUtils: ControlUtils;
    imageryUtils: ImageryUtils;
    /**
     * @param container 放cesium的div
     */
    constructor(container: HTMLDivElement);
    /**
     * 设置全局透明度（倾斜模型+底图）
     */
    setGlobalOpacity(uuid: string, opacity: number): void;
    /**
     * 加载cesium的页面被销毁时一定要调用此方法，否则多次打开关闭，会造成内存溢出
     */
    destory(): void;
}
