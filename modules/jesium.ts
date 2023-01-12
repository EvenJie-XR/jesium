import * as Cesium from "cesium"
import { CameraUtils } from "./cameraUtils";
import { ControlUtils } from "./controlUtils";
import { CoordUtils } from "./coordUtils";
import { ImageryUtils } from "./imageryUtils";
import { ModelUtils } from "./modelUtils";

/**
 * Cesium工具类总类，不直接拿它使用，而是通过Web3DUtils.cesiumUtils访问
 */
export class Jesium {
    viewer: Cesium.Viewer
    modelUtils: ModelUtils // cesium的模型（3dtiles、primitive、entity）相关操作帮助函数类
    cameraUtils: CameraUtils // cesium的相机相关操作帮助类
    coordUtils: CoordUtils // cesium的坐标转化相关操作帮助类
    controlUtils: ControlUtils // cesium的鼠标事件相关操作帮助类
    imageryUtils: ImageryUtils
    /**
     * @param container 放cesium的div
     */
    constructor(container: HTMLDivElement) {
        // 初始化viewer
        this.viewer = new Cesium.Viewer(container, {
            infoBox: false, // 解决iframe无法执行js报错问题
            baseLayerPicker: false, // 去掉底图选择器
            sceneModePicker: false, // 去掉场景模式选择器 （3D，2D）
            homeButton: false, // 去掉起始点按钮
            geocoder: false, // 去掉地理代码搜索
            navigationHelpButton: false, // 去掉导航帮助按钮
            animation: false, // 取消动画按钮
            timeline: false, // 去掉时间线
            fullscreenButton: false, // 去掉全屏按钮
            selectionIndicator: false, // 去掉选择指示器
            imageryProvider: new Cesium.ArcGisMapServerImageryProvider({
                url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
            }),
        });
        (this.viewer.cesiumWidget.creditContainer as HTMLDivElement).style.display = 'none'; // 去掉cesium的左下角logo区域
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
    setGlobalOpacity(uuid: string, opacity: number) {
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