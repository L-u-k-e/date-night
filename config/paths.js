const path = require('path');



const appDirectory = path.resolve(__dirname, '..');
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);


// config after eject: we're in ./config/
module.exports = {
  appRoot: resolveApp(''),
  appBuild: resolveApp('client-build'),
  appHtml: resolveApp('client-src/public/index.html'),
  appWebManifest: resolveApp('client-src/public/manifest.json'),
  appIndexJs: resolveApp('client-src/index.js'),
  appSrc: resolveApp('client-src'),
  appCSSVariables: resolveApp('client-src/styles/variables.css'),
  appViewComponent: resolveApp('client-src/view'),
  appStyles: resolveApp('client-src/styles'),
  appStylesIndex: resolveApp('client-src/styles/index.css'),
  appPackageJson: resolveApp('package.json'),
  appNodeModules: resolveApp('node_modules'),
  reactToolbox: resolveApp('node_modules/react-toolbox')
};
