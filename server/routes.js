var requestHandler = require('./requestHandlers.js');

module.exports = function(app){
  app.post('/search', requestHandler.search);

  // Add new routes here
}