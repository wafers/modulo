var requestHandler = require('./requestHandlers.js');

module.exports = function(app){
  // Add new routes inside the routes array.
  // The requesthandler function MUST have the same name as the string
  var postRoutes = ['search', 'relationships', 'detailedSearch', 'npmSearch'];
  var getRoutes = ['topModules'];

  postRoutes.forEach(function(endpoint){ createRoute(endpoint, 'post') });
  getRoutes.forEach(function(endpoint){ createRoute(endpoint, 'get') });

  function createRoute(name, type){
    app[type]('/'+name, requestHandler[name]);
  }
}