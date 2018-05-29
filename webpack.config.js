const path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin'); // This is for watch mode

module.exports = {
    entry:{
        root: './src/root.js',
        login: './src/login.js',
        users: './src/users-client.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'public')
    },
    watch: true,
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.(png|jpg|jpeg|gif|ico)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                          name: './img/[name].[hash].[ext]'
                        }
                      }
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            hash: true,
            inject: 'head',
            template: 'ejs-compiled-loader!./src/root.ejs',
            chunks: ['root'],
            filename: '/root.html' //relative to root of the application
        }),
        new HtmlWebpackPlugin({
            hash: true,
            inject: 'head',
            template: 'ejs-compiled-loader!./src/login.ejs',
            chunks: ['login'],
            filename: '/login.html' //relative to root of the application
        })
   ]
};
