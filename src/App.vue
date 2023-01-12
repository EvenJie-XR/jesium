<template>
	<div class="cesium-container" ref="cesiumContainer"></div>
</template>
<script lang="ts" setup>
import {reactive,toRefs,defineComponent, ref, onMounted} from "vue"
import { Jesium } from "jesium"

const cesiumContainer = ref();
onMounted(() => {
	const jesium = new Jesium(cesiumContainer.value);
})
</script>

<style lang="scss" scoped>
.cesium-container {
	width: 100%;
	height: 100%;
}
</style>
