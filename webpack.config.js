const path = require('path');
const KintonePlugin = require('@kintone/webpack-plugin-kintone-plugin');

module.exports = {
    entry: {
        desktop: './src/desktop/index.jsx',
        config: './src/config/index.jsx'
    },
    output: {
        path: path.resolve(__dirname, 'plugin'),
        filename: '[name].js'
    },
    module: {
        rules: [{
            test: /(\.js|\.jsx)$/,
            exclude: /node_modules/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env', '@babel/react']
                }
            }]
        }, {
            test: /\.css$/,
            use: [{loader: 'style-loader'}, {loader: 'css-loader'}]
        }]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    plugins: [
        new KintonePlugin({
            manifestJSONPath: './plugin/manifest.json',
            privateKeyPath: './private.ppk',
            pluginZipPath: './dist/plugin.zip'
        })
    ]
};