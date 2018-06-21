// This is the development webpack configuration.
// It is focused on developer experience and fast rebuilds.
// The production configuration is different and lives in a separate file.


const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const postCSSFlexBugsPlugin = require('postcss-flexbugs-fixes');
const postCSSCSSNext = require('postcss-cssnext');
const postCSSImport = require('postcss-import');
const postCSSModulesValues = require('postcss-modules-values');
const extractCSSValueDeclarations = require('modules-values-extract');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const eslintFormatter = require('react-dev-utils/eslintFormatter');
// const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const paths = require('./paths');

// Webpack uses `publicPath` to determine where the app is being served from.
// In development, we always serve from the root. This makes config easier.
const publicPath = '/';
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.
const publicUrl = '';

const reactToolboxOverrides = {};
const webpackConfig = {
  // You may want 'eval' instead if you prefer to see the compiled output in DevTools.
  // See the discussion in https://github.com/facebookincubator/create-react-app/issues/343.
  devtool: 'cheap-module-source-map',
  entry: [
    require.resolve('react-hot-loader/patch'),
    require.resolve('webpack-hot-middleware/client'),
    paths.appIndexJs,
    paths.appStylesIndex
  ],
  output: {
    // Next line is not used in dev but WebpackDevServer crashes without it:
    path: paths.appBuild,
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: true,
    // This does not produce a real file. It's just the virtual path that is
    // served by WebpackDevServer in development. This is the JS bundle
    // containing code from all our entry points, and the Webpack runtime.
    filename: 'bundle.js',
    // There are also additional JS chunk files if you use code splitting.
    chunkFilename: '[name].chunk.js',
    // This is the URL that app is served from. We use "/" in development.
    publicPath: publicPath,
    // Point sourcemap entries to original disk location (format as URL on Windows)
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },
  resolve: {
    // This allows us to use paths relative to the appSrc directory in our require statements
    // There is also some config in the .eslintrc to make sure the eslint-import plugin doesn't complain
    modules: [paths.appSrc, paths.appNodeModules],
    plugins: [
      // This would prevent us from importing files from outside of client-src/ (or node_modules/).
      // Doing so often causes confusion because we only process files within client-src/ with babel.
      // We allow this however, because we need to do this for json schemas and some libs
      // new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
    ],
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
        include: paths.appSrc,
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
              limit: 10000,
              name: '[name].[hash:8].[ext]',
            },
          },
          // Process JS with Babel.
          {
            test: /\.(js|jsx)$/,
            include: paths.appSrc,
            loader: require.resolve('babel-loader'),
            exclude: paths.appNodeModules,
            options: {
              // This is a feature of `babel-loader` for webpack (not Babel itself).
              // It enables caching results in ./node_modules/.cache/babel-loader/
              // directory for faster rebuilds.
              cacheDirectory: true,
            },
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
          // "file" loader makes sure those assets get served by WebpackDevServer.
          // When you `import` an asset, you get its (virtual) filename.
          // In production, they would get copied to the `build` folder.
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
    new InterpolateHtmlPlugin({
      PUBLIC_URL: publicUrl
    }),
    // Generates an `index.html` file with the <script> injected.
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
    }),
    new CopyWebpackPlugin([
      { from: paths.appWebManifest },
    ]),
    // Add module names to factory functions so they appear in browser profiler.
    new webpack.NamedModulesPlugin(),
    // This is necessary to emit hot updates (currently CSS only):
    new webpack.HotModuleReplacementPlugin(),
    // Watcher doesn't work well if you mistype casing in a path so we use
    // a plugin that prints an error when you attempt to do this.
    // See https://github.com/facebookincubator/create-react-app/issues/240
    new CaseSensitivePathsPlugin(),
    // If you require a missing module and then `npm install` it, you still have
    // to restart the development server for Webpack to discover it. This plugin
    // makes the discovery automatic so you don't have to restart.
    // See https://github.com/facebookincubator/create-react-app/issues/186
    new WatchMissingNodeModulesPlugin(paths.appNodeModules),
    // Moment.js is an extremely popular library that bundles large locale files
    // by default due to how Webpack interprets its code. This is a practical
    // solution that requires the user to opt into importing specific locales.
    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    // You can remove this if you don't use Moment.js:
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
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
  // Turn off performance hints during development. Because we don't do any
  // splitting or minification in interest of compilation speed, these warnings become
  // cumbersome.
  performance: {
    hints: false,
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
          /* This allows us to @import css variables from other css files in component css files */
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
