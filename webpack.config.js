const path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin'); // This is for watch mode

module.exports = {
    entry:{
        root: './src/root.js',
        login: './src/login.js',
        sioclient: './src/sioclient.js',
        charts: './src/charts.js',
        users: './src/users.js',
        clock: './src/clock.js'
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
                          name: './images/[name].[hash].[ext]'
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
            title: 'Charts',
            template: 'ejs-compiled-loader!./src/charts.ejs',
            chunks: ['charts'],
            filename: 'charts.html' //relative to root of the application
        }),
        new HtmlWebpackPlugin({
            hash: true,
            inject: 'head',
            title: 'Users',
            template: 'ejs-compiled-loader!./src/users.ejs',
            chunks: ['users'],
            filename: 'users.html' //relative to root of the application
        }),
        new HtmlWebpackPlugin({
            hash: true,
            inject: 'head',
            title: 'Login',
            template: 'ejs-compiled-loader!./src/login.ejs',
            chunks: ['login'],
            filename: 'login.html' //relative to root of the application
        }),
        new HtmlWebpackPlugin({
            hash: true,
            inject: 'head',
            title: 'Home',
            template: 'ejs-compiled-loader!./src/root.ejs',
            chunks: ['clock',"root"],
            filename: 'root.html' //relative to root of the application
        })
    ]
};
