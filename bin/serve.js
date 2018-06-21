const Express = require('express');
const HTTP = require('http');
const Path = require('path');
const Chalk = require('chalk');
const Webpack = require('webpack');
const History = require('connect-history-api-fallback');
const WebpackDevMiddleware = require('webpack-dev-middleware');
const WebpackHotMiddleware = require('webpack-hot-middleware');
const WebpackDevConfigPromise = require('../config/webpack.config.dev');
// const ServiceBundle = require('../services');





// unhandled errors should crash the process
process.on('unhandledRejection', error => {
  console.error(error);
  console.error(JSON.stringify(error, null, 2));
  console.error(error.toString());
  throw error;
});





main();
async function main() {
  const expressApp = Express();
  if (process.env.NODE_ENV === 'development') {
    expressApp.use(History());
    const config = await WebpackDevConfigPromise;
    const primedWebpackCompiler = Webpack(config);
    expressApp.use(
      WebpackDevMiddleware(
        primedWebpackCompiler,
        {
          publicPath: config.output.publicPath,
          stats: {
            colors: true
          }
        }
      )
    );
    expressApp.use(
      WebpackHotMiddleware(primedWebpackCompiler)
    );
  } else {
    expressApp.use(Express.static(Path.join(__dirname, '..', 'client-build')));
    expressApp.get('*', (req, res) => {
      // handle every route with index.html, where the react router will take over
      res.sendFile('index.html', { root: Path.join(__dirname, '..', 'client-build') });
    });
  }



  const httpServer = HTTP.createServer(expressApp);
  // ServiceBundle.initialize(socketIOServer);


  const port = process.env.PORT || 80;
  httpServer.listen(port, err => {
    if (err) {
      console.log(Chalk.red(err));
      return;
    }
    console.log(Chalk.cyan(`Listening for connections on port ${port}`));
  });
}
