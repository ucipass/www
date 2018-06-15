const path = require('path');
const rootDir = path.join( __dirname, "dist","public","js")
var HtmlWebpackPlugin = require('html-webpack-plugin'); //This is for watch mode
var CopyWebpackPlugin =  require('copy-webpack-plugin');
module.exports = {
    entry:{
        "users": './src/users.js',
        'root': './src/root.js',
        "login": './src/login.js',
        "sioclient": './src/sioclient.js',
        "test": './src/test/test-client.js',
        "charts": './src/charts/charts-client.js',
        "files": './src/files/files-client.js',
        "settings": './src/settings/settings-client.js',
        "clock": './src/clock.js'
    },
    output: {
        filename: '[name].js',
        //filename: '[name][hash].js',
        path: rootDir
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
                            //name: '../../public/images/[name].[hash].[ext]'
                            name: '../../public/images/[name].[ext]'
                        }
                      }
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            hash: false,
            inject: 'head',
            title: 'Charts',
            template: 'ejs-compiled-loader!./src/charts/charts.ejs',
            chunks: ['charts'],
            filename: '../../charts/index.html' //relative to root of the application
        }),
        new HtmlWebpackPlugin({
            hash: false,
            inject: 'head',
            title: 'Users',
            template: 'ejs-compiled-loader!./src/users.ejs',
            chunks: ['users'],
            filename: '../../users/index.html' //relative to root of the application
        }),
        new HtmlWebpackPlugin({
            hash: false,
            inject: 'head',
            title: 'Login',
            template: 'ejs-compiled-loader!./src/login.ejs',
            chunks: ['login'],
            filename: '../../login.html' //relative to root of the application
        }),
        new HtmlWebpackPlugin({
            hash: false,
            inject: 'head',
            title: 'Home',
            template: 'ejs-compiled-loader!./src/root.ejs',
            chunks: ['clock',"root"],
            filename: '../../index.html' //relative to root of the application
        }),
        new HtmlWebpackPlugin({
            hash: false,
            inject: 'head',
            title: 'Test',
            template: 'ejs-compiled-loader!./src/test/test.ejs',
            chunks: ['test'],
            filename: '../../test/index.html' //relative to root of the application
        }),
        new HtmlWebpackPlugin({
            hash: false,
            inject: 'head',
            title: 'Settings',
            template: 'ejs-compiled-loader!./src/settings/settings.ejs',
            chunks: ['root','settings'],
            filename: '../../settings/index.html' //relative to root of the application
        }),
        new HtmlWebpackPlugin({
            hash: false,
            inject: 'head',
            title: 'Files',
            template: 'ejs-compiled-loader!./src/files/files.ejs',
            chunks: ['root','files'],
            filename: '../../files/index.html' //relative to root of the application
        }),
        new CopyWebpackPlugin(
            [{
                //context: '../source/'
                from: './src/images/favicon.ico',
                to: '../images',
                force: true
            }], {
                copyUnmodified: true
            }
        )
    ]
};
