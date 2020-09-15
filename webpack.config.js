const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
	entry: {
		main: './main.js'
	},
	devServer: {
		contentBase: 'dist'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
						plugins: [
							[
								'@babel/plugin-transform-react-jsx',
								{ pragma: 'createElement' }
							]
						]
					}
				}
			}
		]
	},
	mode: 'development',
	optimization: {
		minimize: false
	},
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			filename: "index.html",
			template: "./index.html"
		})
	]
}
