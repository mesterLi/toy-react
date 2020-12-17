const webpack = require('webpack');
const { merge } = require('webpack-merge');
const config = require('./webpack.config');

const newConfig = merge(config, {
  devtool: 'production',
});

webpack(newConfig, err => {
  if (err) {
    console.log('err', err);
  }
  console.log('build success');
})