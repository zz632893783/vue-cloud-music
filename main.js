import appVue from './appVue.vue';
import Vue from 'vue';

new Vue({
	el: '#app',
	render: function (createFunc) {
		return createFunc(appVue)
	}
});