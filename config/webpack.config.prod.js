// This is the production configuration.
// It compiles slowly and is focused on producing a fast and minimal bundle.
// The development configuration is different and lives in a separate file.


const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const postCSSFlexBugsPlugin = require('postcss-flexbugs-fixes');
const postCSSCSSNext = require('postcss-cssnext');
const postCSSImport = require('postcss-import');
const postCSSModulesValues = require('postcss-modules-values');
const extractCSSValueDeclarations = require('modules-values-extract');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const eslintFormatter = require('react-dev-utils/eslintFormatter');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const paths = require('./paths');

// Webpack uses `publicPath` to determine where the app is being served from.
// In development, we always serve from the root. This makes config easier.
const publicPath = '/';
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
const publicUrl = '';





const reactToolboxOverrides = {};
const webpackConfig = {
  // Don't attempt to continue if there are any errors.
  bail: true,
  entry: [
    require.resolve('babel-polyfill'),
    paths.appIndexJs,
    paths.appStylesIndex
  ],
  devtool: 'source-map',
  output: {
    path: paths.appBuild,
    filename: 'bundle.js',
    publicPath: publicPath,
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },
  resolve: {
    // This allows us to use paths relative to the appSrc directory in our require statements
    // There is also some config in the .eslintrc to make sure the eslint-import plugin doesn't complain
    modules: [paths.appSrc, paths.appNodeModules],
  },
  module: {
    rules: [
      // First, run the linter.
      // It's important to do this before Babel processes the JS.
      {
        test: /\.(js|jsx)$/,
        enforce: 'pre',
        use: [
          {
            options: {
              formatter: eslintFormatter,
              eslintPath: require.resolve('eslint'),
            },
            loader: require.resolve('eslint-loader'),
          },
        ],
        include: paths.appRoot,
      },
      {
        // "oneOf" will traverse all following loaders until one will
        // match the requirements. When no loader matches it will fall
        // back to the "file" loader at the end of the loader list.
        oneOf: [
          // "url" loader works like "file" loader except that it embeds assets
          // smaller than specified limit in bytes as data URLs to avoid requests.
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.gif$/, /\.ttf$/, /\.woff(2)$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: 10000
            },
          },
          // Process JS with Babel.
          {
            test: /\.js$/,
            include: paths.appRoot,
            exclude: paths.appNodeModules,
            loader: require.resolve('babel-loader'),
          },
          // Process CSS (See the generateCSSLoaders function for more details)
          {
            test: /\.s?css$/,
            include: [paths.appViewComponent, paths.reactToolbox],
            use: generateCSSLoaders({ modules: true })
          },
          {
            test: /\.s?css$/,
            include: [paths.appStyles],
            use: generateCSSLoaders({ modules: false })
          },
          // "file" loader makes sure assets end up in the `build` folder.
          // When you `import` an asset, you get its filename.
          // This loader doesn't use a "test" so it will catch all modules
          // that fall through the other loaders.
          {
            // Exclude `js` files to keep "css" loader working as it injects
            // it's runtime that would otherwise processed through "file" loader.
            // Also exclude `html` and `json` extensions so they get processed
            // by webpacks internal loaders.
            exclude: [/\.js$/, /\.html$/, /\.json$/],
            loader: require.resolve('file-loader'),
            options: {
              name: '[name].[hash:8].[ext]',
            },
          },
        ],
      },
      // ** STOP ** Are you adding a new loader?
      // Make sure to add the new loader(s) before the "file" loader.
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new InterpolateHtmlPlugin({
      PUBLIC_URL: publicUrl
    }),
    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    new UglifyJsPlugin({
      sourceMap: true,
    }),
    // copies static files to the output directory
    new CopyWebpackPlugin([
      { from: paths.appWebManifest },
    ]),
    // Generate a manifest file which contains a mapping of all asset filenames
    // to their corresponding output file so that tools can pick it up without
    // having to parse `index.html`.
    new ManifestPlugin({
      fileName: 'asset-manifest.json',
    }),
    // Moment.js is an extremely popular library that bundles large locale files
    // by default due to how Webpack interprets its code. This is a practical
    // solution that requires the user to opt into importing specific locales.
    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    // You can remove this if you don't use Moment.js:
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled',
      generateStatsFile: true
    }),
  ],
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
};





// Process Component CSS:
//   "postcss-loader" applies a set of postcss plugins
//   "css-loader" resolves paths in CSS and adds css module functionality.
//   "style-loader" turns CSS into JS modules that inject <style> tags and contain HMR logic.
function generateCSSLoaders({ modules }) {
  return [
    require.resolve('style-loader'),
    {
      loader: require.resolve('css-loader'),
      options: {
        modules,
        localIdentName: '[local]--[hash:base64:5]',
        importLoaders: 1,
      },
    },
    {
      loader: require.resolve('postcss-loader'),
      options: {
        // Necessary for external CSS imports to work
        // https://github.com/facebookincubator/create-react-app/issues/2677
        ident: 'postcss',
        plugins: () => [
          // This allows us to @import css variables from other css files in component css files
          postCSSImport({ addModulesDirectories: [paths.appStyles] }),
          // Fixes a set of known broweser incompatabilites/bugs relating to flex box
          postCSSFlexBugsPlugin,
          // Lets us use future CSS spec in our CSS today (custom properties, nested selectors, etc)
          postCSSCSSNext({
            browsers: [
              '>1%',
              'last 4 versions',
              'Firefox ESR',
              'not ie < 11',
            ],
            flexbox: 'no-2009',
            features: {
              customProperties: {
                variables: reactToolboxOverrides
              },
            },
            // Lets us import and export css properties marked with @value.
            // This is only used in the variables.css file in conjunction with the modules-values-extract
            // utility. We extact all @value declarations in that file into a JS object which is fed to the
            // css-next post-css plugin as a way to theme all of the react-toolbox components
            postCSSModulesValues,
          }),
        ],
      },
    }
  ];
}


module.exports = (
  extractCSSValueDeclarations({ files: [paths.appCSSVariables] })
  .then(values => {
    Object.keys(values)
    .filter(key => key.match(/^rt-/))
    .forEach(key => reactToolboxOverrides[key.substr(3)] = values[key]);

    return webpackConfig;
  })
);
