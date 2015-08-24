var requestHandler = require('./requestHandlers.js');

module.exports = function(app){
  // Add new routes inside the routes array.
  // The requesthandler function MUST have the same name as the string
  var routes = ['search', 'relationships', 'detailedSearch', 'topModules'];

  routes.forEach(createRoute);

  function createRoute(endpoint){
    app.post('/'+endpoint, requestHandler[endpoint]);
  }
}