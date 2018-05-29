const path = require('path');

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
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    }
};
