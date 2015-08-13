angular.module('app')

.controller('DetailsController', ['DownloadVis', 'Sigma', 'versionVis','ModulePass', '$scope', function(DownloadVis, Sigma, versionVis, ModulePass, $scope){
  $scope.module = ModulePass.module;

  // Assigning module for demonstration purposes
  //$scope.module = {name: 'express', time:{"modified":"2015-08-03T05:04:40.888Z", "created":"2010-12-29T19:38:25.450Z", "0.14.0":"2010-12-29T19:38:25.450Z", "0.14.1":"2010-12-29T19:38:25.450Z", "1.0.0beta":"2010-12-29T19:38:25.450Z", "1.0.0beta2":"2010-12-29T19:38:25.450Z", "1.0.0rc":"2010-12-29T19:38:25.450Z", "1.0.0rc2":"2010-12-29T19:38:25.450Z", "1.0.0rc3":"2010-12-29T19:38:25.450Z", "1.0.0rc4":"2010-12-29T19:38:25.450Z", "1.0.0":"2010-12-29T19:38:25.450Z", "1.0.1":"2010-12-29T19:38:25.450Z", "1.0.2":"2011-01-11T02:09:30.004Z", "1.0.3":"2011-01-13T22:09:07.840Z", "1.0.4":"2011-02-05T19:13:15.043Z", "1.0.5":"2011-02-05T19:16:30.839Z", "1.0.6":"2011-02-07T21:45:32.271Z", "1.0.7":"2011-02-07T22:26:51.313Z", "2.0.0-pre":"2011-02-21T21:46:44.987Z", "1.0.8":"2011-03-02T02:58:14.314Z", "2.0.0beta":"2011-03-04T00:19:22.568Z", "2.0.0beta2":"2011-03-07T17:40:46.229Z", "2.0.0beta3":"2011-03-09T23:46:02.495Z", "2.0.0rc":"2011-03-14T22:01:43.971Z", "2.0.0rc2":"2011-03-17T18:01:26.604Z", "2.0.0rc3":"2011-03-17T20:02:05.880Z", "2.0.0":"2011-03-18T01:06:40.271Z", "2.1.0":"2011-03-24T20:47:46.219Z", "2.1.1":"2011-03-29T17:40:33.337Z", "2.2.0":"2011-03-30T18:40:56.080Z", "2.2.1":"2011-04-04T19:23:50.483Z", "2.2.2":"2011-04-12T09:44:57.909Z", "2.3.0":"2011-04-25T16:50:01.384Z", "2.3.1":"2011-04-26T22:26:27.392Z", "2.3.2":"2011-04-27T16:13:33.518Z", "2.3.3":"2011-05-03T18:31:39.123Z", "2.3.4":"2011-05-08T17:54:04.615Z", "2.3.5":"2011-05-20T02:07:37.117Z", "2.3.6":"2011-05-20T16:42:09.750Z", "2.3.7":"2011-05-23T22:54:25.787Z", "2.3.8":"2011-05-25T04:53:16.574Z", "2.3.9":"2011-05-25T17:18:34.557Z", "2.3.10":"2011-05-27T16:20:13.495Z", "2.3.11":"2011-06-04T17:51:29.978Z", "2.3.12":"2011-06-22T20:56:29.997Z", "2.4.0":"2011-06-28T16:41:30.571Z", "2.4.1":"2011-07-06T16:57:15.476Z", "2.4.2":"2011-07-07T03:15:52.511Z", "2.4.3":"2011-07-14T19:58:45.646Z", "2.4.4":"2011-08-05T11:30:40.300Z", "2.4.5":"2011-08-19T17:13:10.685Z", "2.4.6":"2011-08-22T17:20:21.180Z", "2.4.7":"2011-10-05T22:42:01.025Z", "2.5.0":"2011-10-24T23:01:02.271Z", "2.5.1":"2011-11-18T16:04:40.126Z", "2.5.2":"2011-12-10T19:09:42.049Z", "2.5.3":"2011-12-30T23:31:24.241Z", "2.5.4":"2012-01-02T16:36:02.493Z", "2.5.5":"2012-01-08T20:31:55.978Z", "2.5.6":"2012-01-13T23:40:26.942Z", "2.5.7":"2012-02-06T18:06:55.405Z", "2.5.8":"2012-02-08T20:08:32.863Z", "2.5.9":"2012-04-03T02:21:28.801Z", "3.0.0alpha1":"2012-04-20T01:52:04.759Z", "3.0.0alpha2":"2012-04-28T23:49:44.341Z", "3.0.0alpha3":"2012-05-08T00:59:57.918Z", "3.0.0alpha4":"2012-05-11T00:11:58.696Z", "3.0.0alpha5":"2012-05-30T23:48:32.953Z", "3.0.0beta1":"2012-06-01T19:27:26.608Z", "3.0.0beta2":"2012-06-06T21:47:02.734Z", "3.0.0beta3":"2012-06-15T18:40:57.491Z", "2.5.10":"2012-06-15T22:51:26.681Z", "3.0.0beta4":"2012-06-27T20:42:23.155Z", "2.5.11":"2012-07-04T18:24:06.584Z", "3.0.0beta5":"2012-07-03T17:20:29.622Z", "3.0.0beta6":"2012-07-13T16:19:35.230Z", "3.0.0beta7":"2012-07-17T02:28:35.931Z", "3.0.0rc1":"2012-07-24T20:33:00.953Z", "3.0.0rc2":"2012-08-03T20:33:05.751Z", "3.0.0rc3":"2012-08-14T03:24:13.107Z", "3.0.0rc4":"2012-08-31T05:13:49.677Z", "3.0.0rc5":"2012-10-09T15:44:52.115Z", "3.0.0":"2012-10-23T22:30:10.025Z", "3.0.1":"2012-11-02T00:27:52.006Z", "3.0.2":"2012-11-08T17:15:53.794Z", "3.0.3":"2012-11-13T17:13:59.443Z", "3.0.4":"2012-12-06T01:10:32.144Z", "3.0.5":"2012-12-19T21:45:36.784Z", "3.0.6":"2013-01-05T02:51:07.217Z", "3.1.0":"2013-01-26T04:27:35.979Z", "3.1.1":"2013-04-01T18:26:15.149Z", "3.1.2":"2013-04-12T19:14:26.989Z", "3.2.0":"2013-04-15T19:35:06.932Z", "3.2.1":"2013-04-30T02:17:29.901Z", "3.2.2":"2013-05-03T19:55:21.494Z", "3.2.3":"2013-05-07T14:55:36.616Z", "3.2.4":"2013-05-09T16:18:31.698Z", "3.2.5":"2013-05-22T04:02:26.880Z", "3.2.6":"2013-06-03T00:15:56.897Z", "3.3.0":"2013-06-26T17:07:53.250Z", "3.3.1":"2013-06-27T15:32:58.392Z", "3.3.2":"2013-07-03T18:25:57.781Z", "3.3.3":"2013-07-04T20:40:14.018Z", "3.3.4":"2013-07-08T21:42:52.735Z", "3.3.5":"2013-08-10T21:51:21.087Z", "3.3.6":"2013-08-27T20:49:22.441Z", "3.3.7":"2013-08-28T17:04:42.417Z", "1.0.0-beta":"2013-08-28T17:04:36.588Z", "1.0.0-beta2":"2013-08-28T17:04:36.588Z", "1.0.0-rc":"2013-08-28T17:04:36.588Z", "1.0.0-rc2":"2013-08-28T17:04:36.588Z", "1.0.0-rc3":"2013-08-28T17:04:36.588Z", "1.0.0-rc4":"2013-08-28T17:04:36.588Z", "2.0.0-beta":"2013-08-28T17:04:36.588Z", "2.0.0-beta2":"2013-08-28T17:04:36.588Z", "2.0.0-beta3":"2013-08-28T17:04:36.588Z", "2.0.0-rc":"2013-08-28T17:04:36.588Z", "2.0.0-rc2":"2013-08-28T17:04:36.588Z", "2.0.0-rc3":"2013-08-28T17:04:36.588Z", "3.0.0-alpha1":"2013-08-28T17:04:36.588Z", "3.0.0-alpha2":"2013-08-28T17:04:36.588Z", "3.0.0-alpha3":"2013-08-28T17:04:36.588Z", "3.0.0-alpha4":"2013-08-28T17:04:36.588Z", "3.0.0-alpha5":"2013-08-28T17:04:36.588Z", "3.0.0-beta1":"2013-08-28T17:04:36.588Z", "3.0.0-beta2":"2013-08-28T17:04:36.588Z", "3.0.0-beta3":"2013-08-28T17:04:36.588Z", "3.0.0-beta4":"2013-08-28T17:04:36.588Z", "3.0.0-beta6":"2013-08-28T17:04:36.588Z", "3.0.0-beta7":"2013-08-28T17:04:36.588Z", "3.0.0-rc1":"2013-08-28T17:04:36.588Z", "3.0.0-rc2":"2013-08-28T17:04:36.588Z", "3.0.0-rc3":"2013-08-28T17:04:36.588Z", "3.0.0-rc4":"2013-08-28T17:04:36.588Z", "3.0.0-rc5":"2013-08-28T17:04:36.588Z", "3.3.8":"2013-09-02T15:01:16.142Z", "3.4.0":"2013-09-07T19:25:10.243Z", "3.4.1":"2013-10-16T01:34:32.939Z", "3.4.2":"2013-10-19T02:04:44.007Z", "3.4.3":"2013-10-23T18:19:57.170Z", "3.4.4":"2013-10-29T17:34:18.760Z", "3.4.5":"2013-11-27T23:54:53.947Z", "3.4.6":"2013-12-01T20:21:22.058Z", "3.4.7":"2013-12-11T07:57:53.225Z", "3.4.8":"2014-01-14T04:51:15.079Z", "4.0.0-rc1":"2014-03-02T16:19:53.255Z", "4.0.0-rc2":"2014-03-05T06:34:13.334Z", "3.5.0":"2014-03-06T22:58:36.227Z", "4.0.0-rc3":"2014-03-12T01:39:53.076Z", "4.0.0-rc4":"2014-03-25T02:54:51.021Z", "3.5.1":"2014-03-25T20:59:05.986Z", "4.0.0":"2014-04-09T20:39:26.853Z", "3.5.2":"2014-04-24T20:40:38.736Z", "4.1.0":"2014-04-24T22:17:52.003Z", "4.1.1":"2014-04-27T23:50:27.414Z", "3.5.3":"2014-05-08T17:53:16.987Z", "4.1.2":"2014-05-08T18:44:48.652Z", "3.6.0":"2014-05-09T21:07:22.124Z", "4.2.0":"2014-05-12T02:04:12.759Z", "3.7.0":"2014-05-18T14:42:22.970Z", "3.8.0":"2014-05-21T06:08:40.496Z", "4.3.0":"2014-05-21T06:14:40.424Z", "4.3.1":"2014-05-23T23:12:59.820Z", "3.8.1":"2014-05-28T03:43:39.629Z", "4.3.2":"2014-05-29T04:20:38.007Z", "3.9.0":"2014-05-31T01:38:23.252Z", "4.4.0":"2014-05-31T04:02:21.301Z", "4.4.1":"2014-06-03T01:27:48.550Z", "3.10.0":"2014-06-03T04:42:47.299Z", "3.10.1":"2014-06-03T21:19:53.358Z", "3.10.2":"2014-06-04T01:36:31.574Z", "3.10.3":"2014-06-06T03:41:14.284Z", "3.10.4":"2014-06-09T22:56:08.589Z", "4.4.2":"2014-06-10T00:43:04.926Z", "3.10.5":"2014-06-12T04:36:07.939Z", "4.4.3":"2014-06-12T04:42:49.755Z", "3.11.0":"2014-06-20T03:43:59.969Z", "4.4.4":"2014-06-20T21:13:47.878Z", "3.12.0":"2014-06-22T02:35:24.439Z", "3.12.1":"2014-06-27T00:19:58.083Z", "4.4.5":"2014-06-27T03:54:22.452Z", "3.13.0":"2014-07-04T05:08:17.751Z", "4.5.0":"2014-07-05T01:04:36.156Z", "4.5.1":"2014-07-06T23:47:58.312Z", "3.14.0":"2014-07-11T17:31:04.739Z", "4.6.0":"2014-07-12T03:40:29.872Z", "4.6.1":"2014-07-13T02:19:51.397Z", "3.15.0":"2014-07-23T05:08:16.821Z", "4.7.0":"2014-07-26T01:34:51.642Z", "3.15.1":"2014-07-26T21:50:06.966Z", "4.7.1":"2014-07-26T23:02:44.448Z", "3.15.2":"2014-07-27T19:55:02.602Z", "4.7.2":"2014-07-27T20:02:46.467Z", "4.7.3":"2014-08-04T20:13:29.114Z", "3.15.3":"2014-08-04T22:25:19.592Z", "4.7.4":"2014-08-04T22:25:30.807Z", "3.16.0":"2014-08-06T05:39:52.833Z", "4.8.0":"2014-08-06T06:50:05.516Z", "3.16.1":"2014-08-06T22:06:59.615Z", "4.8.1":"2014-08-06T22:20:06.968Z", "3.16.2":"2014-08-07T15:58:53.103Z", "4.8.2":"2014-08-07T16:04:06.418Z", "3.16.3":"2014-08-08T02:31:12.394Z", "3.16.4":"2014-08-11T02:22:05.422Z", "4.8.3":"2014-08-11T02:29:06.849Z", "3.16.5":"2014-08-12T02:29:20.292Z", "3.16.6":"2014-08-15T03:52:36.175Z", "4.8.4":"2014-08-15T04:25:24.580Z", "3.16.7":"2014-08-19T02:45:51.457Z", "4.8.5":"2014-08-19T03:05:35.447Z", "3.16.8":"2014-08-28T01:17:12.818Z", "4.8.6":"2014-08-28T01:52:46.246Z", "3.16.9":"2014-08-30T05:23:37.535Z", "4.8.7":"2014-08-30T05:37:53.120Z", "3.16.10":"2014-09-05T06:16:49.692Z", "4.8.8":"2014-09-05T06:25:37.392Z", "3.17.0":"2014-09-09T03:22:41.705Z", "3.17.1":"2014-09-09T03:48:36.412Z", "4.9.0":"2014-09-09T04:33:18.960Z", "3.17.2":"2014-09-16T07:18:56.609Z", "4.9.1":"2014-09-17T06:54:31.479Z", "4.9.2":"2014-09-18T03:52:10.190Z", "3.17.3":"2014-09-18T17:40:22.718Z", "4.9.3":"2014-09-18T17:45:34.733Z", "3.17.4":"2014-09-20T06:02:17.235Z", "4.9.4":"2014-09-20T06:07:23.529Z", "3.17.5":"2014-09-24T23:41:41.338Z", "4.9.5":"2014-09-25T00:24:49.436Z", "3.17.6":"2014-10-03T04:05:10.920Z", "3.17.7":"2014-10-08T21:22:35.229Z", "4.9.6":"2014-10-09T02:35:55.395Z", "4.9.7":"2014-10-10T20:43:34.045Z", "3.17.8":"2014-10-16T04:36:53.277Z", "4.9.8":"2014-10-18T02:05:05.528Z", "3.18.0":"2014-10-18T05:10:21.951Z", "3.18.1":"2014-10-23T05:30:25.689Z", "4.10.0":"2014-10-24T02:36:30.641Z", "3.18.2":"2014-10-29T05:14:04.974Z", "4.10.1":"2014-10-29T05:21:08.596Z", "5.0.0-alpha.1":"2014-11-07T02:54:34.556Z", "3.18.3":"2014-11-09T23:38:00.888Z", "4.10.2":"2014-11-10T00:10:27.638Z", "3.18.4":"2014-11-23T20:52:49.813Z", "4.10.3":"2014-11-24T03:12:32.210Z", "4.10.4":"2014-11-25T05:19:30.905Z", "4.10.5":"2014-12-11T05:08:02.089Z", "3.18.5":"2014-12-12T04:24:32.541Z", "3.18.6":"2014-12-13T02:45:59.136Z", "4.10.6":"2014-12-13T04:17:13.785Z", "4.10.7":"2015-01-05T00:40:37.634Z", "3.19.0":"2015-01-09T06:36:21.099Z", "4.10.8":"2015-01-13T17:48:23.443Z", "4.11.0":"2015-01-14T04:21:56.291Z", "3.19.1":"2015-01-21T08:23:41.579Z", "4.11.1":"2015-01-21T08:34:52.857Z", "3.19.2":"2015-02-01T20:24:05.444Z", "4.11.2":"2015-02-01T20:45:09.837Z", "3.20.0":"2015-02-19T02:53:28.667Z", "4.12.0":"2015-02-23T06:58:39.027Z", "3.20.1":"2015-03-01T04:23:20.434Z", "4.12.1":"2015-03-02T01:13:30.608Z", "4.12.2":"2015-03-03T05:46:29.969Z", "3.20.2":"2015-03-17T05:06:28.342Z", "4.12.3":"2015-03-17T22:04:53.210Z", "3.20.3":"2015-05-18T04:06:45.934Z", "4.12.4":"2015-05-18T04:41:14.788Z", "3.21.0":"2015-06-19T01:42:28.037Z", "4.13.0":"2015-06-21T06:50:18.321Z", "3.21.1":"2015-07-06T04:55:30.351Z", "4.13.1":"2015-07-06T05:42:59.627Z", "5.0.0-alpha.2":"2015-07-07T05:46:20.081Z", "3.21.2":"2015-07-31T20:17:34.079Z", "4.13.2":"2015-07-31T21:10:49.838Z", "4.13.3":"2015-08-03T05:04:40.888Z"} };

  $scope.circleGraph = function() {
    versionVis.circleGraph($scope.module)
  }

  $scope.lineGraph = function() {
    versionVis.lineGraph($scope.module)
  }

  $scope.barGraph = function() {
    versionVis.barGraph($scope.module)
  }

  $scope.$watch(function(){ return Sigma.data }, function(){
    $scope.results = Sigma.data;
    s = new sigma({ 
            graph: $scope.results,
            container: 'graph-container',
            settings: {
              defaultNodeColor: '#ec5148',
              defaultEdgeColor: 'rgb(255,255,255,0.3)'
            }
    });
  })

  $scope.graphGraph = function(){
    Sigma.getResults($scope.module.name);
  }

  $scope.downloadGraph = function(){
    DownloadVis.downloadGraph();
  }
}]);