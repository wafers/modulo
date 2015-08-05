


if (Meteor.isClient) {
  Session.setDefault('counter', 0);

  Template.hello.onRendered(function(){
    var data = {
  "nodes": [
    {
      "id": "n0",
      "label": "A node",
      "x": 0,
      "y": 0,
      "size": 3
    },
    {
      "id": "n1",
      "label": "Another node",
      "x": 3,
      "y": 1,
      "size": 2
    },
    {
      "id": "n2",
      "label": "And a last one",
      "x": 1,
      "y": 3,
      "size": 1
    }
  ],
  "edges": [
    {
      "id": "e0",
      "source": "n0",
      "target": "n1"
    },
    {
      "id": "e1",
      "source": "n1",
      "target": "n2"
    },
    {
      "id": "e2",
      "source": "n2",
      "target": "n0"
    }
  ]
}


    s = new sigma({ 
            graph: data,
            container: 'container',
            settings: {
                defaultNodeColor: '#ec5148'
            }
    });
  })

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.hello.events({
    'click button': function () {
      Session.set('counter', Session.get('counter') + 1);
    }
  });
}

if (Meteor.isServer) {
  'use strict';
  var Registry = Meteor.npmRequire('npm-registry');
  var npm = new Registry({});

  Async.runSync(function(done){
    npm.packages.get('yahoo-finance', function(err, result){
      console.log(result);
      done(null, true);
    });
  });
}