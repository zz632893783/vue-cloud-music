const path = require('path');
module.exports = {
	entry: './main.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, './dist')
	},
	module: {
		rules: [{
			test: /\.vue$/,
			use: ['vue-loader']
		}, {
			test: /\.(jpe?g|png)$/,
			use: ['file-loader']
		}]
	}
}