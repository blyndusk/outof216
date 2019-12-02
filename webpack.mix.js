

const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const mix = require('laravel-mix');

mix
    .js(
        "./src/entry.ts", 
        `${process.env.MIX_PUBLIC}/entry.js`
    )
    .sass(
        "./src/styles/master.scss", 
        `${process.env.MIX_PUBLIC}/entry.css`
    )
    //.copyDirectory('src/assets', `${process.env.MIX_PUBLIC}`/assets`)
    .sourceMaps()
    .disableNotifications()
    .webpackConfig({
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: "ts-loader",
                    exclude: /node_modules/
                }
            ]
        },
        resolve: {
            extensions: [ 
                '.tsx', 
                '.ts', 
                '.js' 
            ],
        },
        plugins: [
            new BrowserSyncPlugin({
                host: 'localhost',
                port: 6190,
                server: { 
                    baseDir: [
                        process.env.MIX_PUBLIC
                    ] 
                }
            }),
        ]
    })
