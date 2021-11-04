const path = require("path");
const Dotenv = require('dotenv-webpack');

module.exports = {
    entry: {
        bundle: path.join(__dirname, './index.js'),
    },

    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'dist')
    },
    mode: process.env.NODE_ENV || 'development',

    watchOptions: {
        ignored: /node_modules|dist|\.js/g
    },

    devtool: false,

    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
        plugins: [],
        fallback: { 
            "crypto": require.resolve("crypto-browserify"),
            "stream": require.resolve("stream-browserify"),
            "buffer": require.resolve("buffer/"),
            
        },
    },

    plugins: [
        new Dotenv()
    ],

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader'
            }
        ]
    }
}