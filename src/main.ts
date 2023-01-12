import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { Ion } from "cesium"
import "cesium/Build/Cesium/Widgets/widgets.css";

// 配置cesium初始化
window.CESIUM_BASE_URL = '/libs/cesium/';
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiOTNkMWU3NS0wM2JiLTQ4NmMtYTgyNi05NWU3MWVjMWEzMmYiLCJpZCI6NzE0MzQsImlhdCI6MTYzNTIxNjIyMX0.QnoSt0kZkqKMAL_9EHw6toCwONY-Ao2mRwYpS36FLAk';

createApp(App).mount("#app");