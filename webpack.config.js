module.exports = {
    entry: {
        bundle: __dirname + '/src/mvvm.js'
    },
    output: {
        path: __dirname + '/dist',
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                // loader: 'babel-loader?cacheDirectory', // 使用缓存目录它可以进一步提升webpack的编译速度
                options: {
                    presets: ['env']
                }
            }
        ]
    }
}