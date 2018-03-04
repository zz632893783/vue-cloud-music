<template>
	<div id="appVue">
		<vue-cloud-music></vue-cloud-music>
	</div>
</template>
<script>
	import vueCloudMusic from './component/vueCloudMusic.vue'

	export default {
		data: function () {
			return {
				name: 'appVue'
			}
		},
		components: {
			'vue-cloud-music': vueCloudMusic
		}
	}
</script>