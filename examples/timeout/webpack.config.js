const path = require('path');
const webpack = require("webpack");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const port = 9055;

module.exports = {
    entry: './timeout/timeout.js',
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist',
        publicPath: `http://127.0.0.1:${port}/`,
        public: `127.0.0.1:${port}`,
        hotOnly: true,
        historyApiFallback: true,
        port,
        host: '127.0.0.1',
    },
    output: {
        filename: '[name].[hash].js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
    },
    optimization: {
        minimize: false
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Caching',
            template: './timeout/timeout.html',
            filename: './index.html' //relative to root of the application
        }),
        new CopyWebpackPlugin([
            {from: './timeout'}
        ]),
        new webpack.EnvironmentPlugin({
            BUILD_TYPE: 'browser'
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                loader: 'babel-loader',
                options: {
                    "presets": ["@babel/preset-react"],
                    "plugins": [
                        "@babel/plugin-proposal-class-properties",
                        "@babel/plugin-transform-object-assign"
                    ],
                    "env": {
                        "development": {
                            "compact": false
                        }
                    }
                }
            },
            {
                test: /\.css$/,
                loader: 'style-loader'
            }, {
                test: /\.css$/,
                loader: 'css-loader',
                options: {
                    modules: {
                        localIdentName: "[name]__[local]___[hash:base64:5]",
                    },
                }
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader'
                ]
            }

        ]
    },
    resolve: {
    alias: { 'react-dom': '@hot-loader/react-dom'  }
    },
};
