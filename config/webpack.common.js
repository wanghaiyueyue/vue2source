const path = require('path')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const webpack = require('webpack')
const devMode = process.env.NODE_ENV === 'production'

module.exports = {
  // entry:{
  //   app: path.resolve(__dirname,'..','src/index.js'),
  //   about: path.resolve(__dirname,'..','src/about.js')
  // },
  entry: path.resolve(__dirname,'..','src/index.js'),
  module:{
    rules:[
      {
        test: /\.css$/,
        use:[
          devMode?MiniCssExtractPlugin.loader:'style-loader',
          'css-loader'
        ]
      },
      {
        test:/\.(png|gif|jpe?g)$/,
        use:['file-loader']
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins:[
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'webpack配置与优化&&webpack5',
      template: path.resolve(__dirname,'..','index.html')
    }),
    new MiniCssExtractPlugin({
      filename: devMode? '[name].css':'[name].[hash].css',
      chunkFilename: devMode?'[id].css':'[id].[hash].css'
    }),
    new webpack.ProvidePlugin({
      _: 'lodash',
      // join: ['lodash', 'join']
    })
  ],
  output:{
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname,'../','dist')
  }
}