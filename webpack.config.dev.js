const path = require('path');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const DependencyExtractionWebpackPlugin = require('@wordpress/dependency-extraction-webpack-plugin');

const stats = {
    all: false,
    assets: true,
    colors: true,
    errors: true,
    performance: true,
    timings: true,
    warnings: true,
};

const camelCaseDash = string => string.replace(
    /-([a-z])/g,
    (match, letter) => letter.toUpperCase()
);

const rules = [
    {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
            loader: 'babel-loader',
        },
    },
    {
        test: /\.svg$/,
        use: [
            {
                loader: 'babel-loader',
            },
            {
                loader: '@svgr/webpack',
                options: { babel: false },
            },
        ],
    },
    {
        test: /\.(png|jpg|gif)$/,
        use: [
            {
                loader: 'file-loader',
                options: {
                    outputPath: 'images',
                    publicPath: 'dist/images',
                    regExp: /\/([^]+)\/([^]+)\/images\/(.+)\.(.*)?$/,
                    name: '[1]-[2]-[3].[hash:hex:7].[ext]',
                },
            },
        ],
    },
];

const wpExternals = [
    'ajax',
    'api',
    'api-fetch',
    'block-editor',
    'blocks',
    'codeEditor',
    'components',
    'compose',
    'core-data',
    'data',
    'date',
    'editor',
    'element',
    'escape-html',
    'html-entities',
    'hooks',
    'i18n',
    'keyboard-shortcuts',
    'keycodes',
    'plugins',
    'rich-text',
    'token-list',
    'url',
    'viewport',
].reduce((externals, name) => ({
    ...externals,
    [`@wordpress/${name}`]: `wp.${camelCaseDash(name)}`,
}), {});

module.exports = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    stats,
    externals: {
        wp: 'wp',
        lodash: 'lodash',
        fetch: 'fetch',
        ...wpExternals,
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build'),
    },
    module: {
        strictExportPresence: true,
        rules,
    },
    entry: {
        editor: {
            import: path.resolve(__dirname, './src/index.js'),
        },
    },
    plugins: [
        new DependencyExtractionWebpackPlugin(),
        new FileManagerPlugin({
            events: {
                onStart: {
                    delete: [
                        './gutenverse/assets/js/blocks.js*'
                    ]
                },
                onEnd: {
                    copy: [
                        {
                            source: process.env.NODE_ENV === 'development' ? './build/editor.js*' : './build/editor.js',
                            destination: './wp-editor-json-import/assets/js/',
                        },
                        {
                            source: './build/editor.asset.php',
                            destination: './wp-editor-json-import/lib/',
                        },
                    ],
                },
            },
            runTasksInSeries: true,
        }),
    ],
};