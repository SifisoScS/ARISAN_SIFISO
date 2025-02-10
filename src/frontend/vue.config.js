module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',  // Flask backend URL
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      },
    },
  },
};
