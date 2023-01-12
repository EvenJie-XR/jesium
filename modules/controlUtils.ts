import * as Cesium from "cesium"

/**
 * 用于cesium鼠标相关的帮助函数
 */
export class ControlUtils {
    handler: Cesium.ScreenSpaceEventHandler // cesium用于添加监听事件的handler
    private __polygon_point_arr: Cesium.Cartesian3[] = []; // 动态绘制多边形时用于存放多边形点的数组（绘制完成后会清空）
    private __temporary_polygon_entity: Cesium.Entity | null = null; // 动态绘制多边形时用于存放临时多边形entity的对象（绘制完成会清空）
    constructor(public viewer: Cesium.Viewer) {
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    }
    /**
     * 添加cesium场景的鼠标事件(同一事件类型只能有一个action，多次注册会覆盖之前的)
     * @param callback 鼠标事件触发的回调函数
     * @param eventType 鼠标事件类型，参考Cesium.ScreenSpaceEventType
     */
    addMouseEventWatch(callback: Cesium.ScreenSpaceEventHandler.PositionedEventCallback | Cesium.ScreenSpaceEventHandler.MotionEventCallback | Cesium.ScreenSpaceEventHandler.WheelEventCallback | Cesium.ScreenSpaceEventHandler.TwoPointEventCallback | Cesium.ScreenSpaceEventHandler.TwoPointMotionEventCallback, eventType: Cesium.ScreenSpaceEventType) {
        this.handler.setInputAction(callback, eventType);
    }
    /**
     * 移除鼠标事件的action
     * @param eventType 事件类型，参考Cesium.ScreenSpaceEventType
     */
    removeMouseEventWatch(eventType: Cesium.ScreenSpaceEventType) {
        this.handler.removeInputAction(eventType);
    }
    /**
     * 开启绘制的方法
     */
    drawPolygon(callback: (entity: { entity: Cesium.Entity, coord: Cesium.Cartesian3[] } | undefined) => void, polygonColor: Cesium.Color) {
        // 清除可能会用到的监听事件
        if (this.handler) {
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        }
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

        //鼠标左键--确定选中点
        this.handler.setInputAction((event: any) => {
            // 屏幕坐标转为空间坐标
            let cartesian = this.viewer.camera.pickEllipsoid(event.position, this.viewer.scene.globe.ellipsoid);
            // 判断是否定义（是否可以获取到空间坐标）
            if (Cesium.defined(cartesian)) {
                // 将点添加进保存多边形点的数组中，鼠标停止移动的时添加的点和，点击时候添加的点，坐标一样
                this.__polygon_point_arr.push(cartesian as Cesium.Cartesian3);
                // 判断是否开始绘制动态多边形，没有的话则开始绘制
                if (this.__temporary_polygon_entity == null) {
                    // 绘制动态多边形
                    this.draw_dynamic_polygon(polygonColor);
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        //鼠标移动--实时绘制多边形
        this.handler.setInputAction((event: any) => {
            // 屏幕坐标转为空间坐标
            let cartesian = this.viewer.camera.pickEllipsoid(event.endPosition, this.viewer.scene.globe.ellipsoid);
            // 判断是否定义（是否可以获取到空间坐标）
            if (Cesium.defined(cartesian)) {
                // 判断是否已经开始绘制动态多边形，已经开始的话，则可以动态拾取鼠标移动的点，修改点的坐标
                if (this.__temporary_polygon_entity) {
                    // 只要元素点大于一，每次就删除一个点，因为实时动态的点是添加上去的
                    if (this.__polygon_point_arr.length > 1) {
                        // 删除数组最后一个元素（鼠标移动添加进去的点）
                        this.__polygon_point_arr.pop();
                    }
                    // 将新的点添加进动态多边形点的数组中，用于实时变化，注意：这里是先添加了一个点，然后再删除点，再添加，这样重复的
                    this.__polygon_point_arr.push(cartesian as Cesium.Cartesian3);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        //鼠标右键--结束绘制
        this.handler.setInputAction((event: any) => {
            // 取消鼠标移动监听
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            // 清除动态绘制的多边形
            this.viewer.entities.remove(this.__temporary_polygon_entity as Cesium.Entity);
            // 删除保存的临时多边形的entity
            this.__temporary_polygon_entity = null;
            // 绘制结果多边形
            const entity = this.draw_polygon(polygonColor);
            // 清空多边形点数组，用于下次绘制
            this.__polygon_point_arr = [];
            // 清除所有事件
            if (this.handler) {
                this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
                this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
            }
            // 绘制全流程完成调用回调函数并传入绘制结果
            callback(entity);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
    /**
     * 绘制结果多边形
     */
    private draw_polygon(polygonColor: Cesium.Color): { entity: Cesium.Entity, coord: Cesium.Cartesian3[] } | undefined {
        // 删除最后一个动态添加的点，如果鼠标没移动，最后一个和倒数第二个是一样的，所以也要删除
        this.__polygon_point_arr.pop();
        // 三个点以上才能绘制成多边形
        if (this.__polygon_point_arr.length >= 3) {
            let polygon_point_entity = (this.viewer.entities as any).add({
                polygon: {
                    hierarchy: this.__polygon_point_arr,
                    material: polygonColor.withAlpha(0.22),
                },
                polyline: {
                    positions: [...this.__polygon_point_arr, this.__polygon_point_arr[0]],
                    clampToGround: true, // 线没有加上这个属性的话贴不上地形和倾斜（polygon就不需要，它默认什么都贴）
                    width: 4,
                    material: polygonColor.withAlpha(1),
                },
            });
            return {
                entity: polygon_point_entity,
                coord: [...this.__polygon_point_arr]
            };
        }
    }
    /**
     * 绘制动态多边形
     */
    private draw_dynamic_polygon(polygonColor: Cesium.Color) {
        this.__temporary_polygon_entity = this.viewer.entities.add({
            polygon: {
                // 这个方法上面有重点说明
                hierarchy: new Cesium.CallbackProperty(() => {
                    // PolygonHierarchy 定义多边形及其孔的线性环的层次结构（空间坐标数组）
                    return new Cesium.PolygonHierarchy(this.__polygon_point_arr);
                }, false),
                material: polygonColor.withAlpha(0.22),
            },
            polyline: {
                positions: new Cesium.CallbackProperty(() => {
                    return [...this.__polygon_point_arr, this.__polygon_point_arr[0]];
                }, false),
                clampToGround: true, // 线没有加上这个属性的话贴不上地形和倾斜（polygon就不需要，它默认什么都贴）
                width: 4,
                material: polygonColor.withAlpha(1),
            },
        });
    }
}