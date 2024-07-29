const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production' ? '././' : './',
  chainWebpack: (config) => {
    config
      .plugin('provide')
      // eslint-disable-next-line global-require
      .use(require('webpack').ProvidePlugin, [{
        'window.Quill': 'quill/dist/quill.js',
        Quill: 'quill/dist/quill.js',
        'window.jQuery': 'jquery/src/jquery.js',
        jQuery: 'jquery/src/jquery.js',
      }]);
  },
})
