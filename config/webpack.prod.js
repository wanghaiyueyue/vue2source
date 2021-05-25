const { merge } = require('webpack-merge')
process.env.NODE_ENV = 'production';
const common = require('./webpack.common')
module.exports=merge(common,{
  mode: 'production',
  // devtool: 'source-map',
  optimization:{
    // 去重
    splitChunks:{
      chunks: 'all',
      cacheGroups:{
        vendor:{
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    },
    // 提取引导模板，运行时
    runtimeChunk: 'single',

  }
})