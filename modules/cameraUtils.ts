import * as Cesium from "cesium"

/**
 * 相机相关工具类
 */
export class CameraUtils {
    constructor(public viewer: Cesium.Viewer) {
        
    }
    /**
     * 通过坐标数组指定相机 有过度 的飞向指定位置
     * @param coord [x, y, z]（WGS84坐标）
     */
    flyToByCoordArray(coord: [number, number, number]) {
        this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(...coord)
        });
    }
    /**
     * 通过坐标数组指定相机 没有过度 的飞向指定位置
     * @param coord [经度, 维度, 高度]（WGS84坐标）
     */
    setViewByCoordArray(coord: [number, number, number]) {
        this.viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(...coord)
        });
    }
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
    getCameraInfo() {
        const catoPosition = this.viewer.camera.positionCartographic;
        return {
            latitude: Cesium.Math.toDegrees(catoPosition.latitude),
            longitude: Cesium.Math.toDegrees(catoPosition.longitude),
            height: catoPosition.height,
            pitch: this.viewer.camera.pitch,
            heading: this.viewer.camera.heading,
            roll: this.viewer.camera.roll
        }
    }
    /**
     * 添加相机变化监听(监听回调函数会加入到事件队列中多次添加不会覆盖之前的回调函数，通过调用这个函数的回调函数来移除回调函数)
     * @param callback 监听回调函数
     * @returns 调用这个方法移除监听函数
     */
    addCameraChangeEvent(callback: (...args: any[]) => void) {
        return this.viewer.camera.changed.addEventListener(callback);
    }
    /**
     * 添加指南针旋转监听(这个元素默认为向上是北方向)
     */
    addCompass(compassEl: HTMLDivElement) {
        return this.addCameraChangeEvent(() => {
            const rotateAngle = Cesium.Math.toDegrees(
				this.viewer.camera.heading
			).toFixed(2);
			compassEl.style.transform = `rotateZ(${rotateAngle}deg)`;
        })
    }
    /**
     * 重置相机重新指向北方(heading为0)
     */
    resetCameraHeading() {
        const cameraInfo = this.getCameraInfo();
        this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(cameraInfo.longitude, cameraInfo.latitude, cameraInfo.height),
            orientation: {
                heading: 0,
                pitch: Cesium.Math.toRadians(cameraInfo.pitch),
                roll: Cesium.Math.toRadians(cameraInfo.roll)
            }
        });
    }
}