const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  mode: "development",
  entry: {
    index: __dirname + '/src/main.js',
  },
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js",
    clean: true
  },
  devServer: {
    static: './dist', //静态文件目录 默认是当前文件夹，这里指定的是打包后的文件
    host: "localhost", //服务器域名
    port: "3001", // 端口
    open: true, //自动打开页面
    hot: true//开启热更新 默认开启
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Nano React',
      scriptLoading: 'defer',
      template: 'src/index.html'
    })
  ]
}