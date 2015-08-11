var requestHandler = require('./requestHandlers.js');

module.exports = function(app){
  app.post('/search', requestHandler.search);
  app.post('/relationships', requestHandler.relationships);
  // app.post('/detailedSearch', requestHandler.detailedSearch); 
    // Takes an arr of moduleNames

  // Add new routes here
}