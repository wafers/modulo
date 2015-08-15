var requestHandler = require('./requestHandlers.js');

module.exports = function(app){
  // Add new routes here
  app.post('/search', requestHandler.search);
  app.post('/relationships', requestHandler.relationships);
  app.post('/detailedSearch', requestHandler.detailedSearch);
}