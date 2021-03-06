var util = require('util');
var Tab = require('../client/tab').Tab;

var TxTab = function ()
{
  Tab.call(this);
};

util.inherits(TxTab, Tab);

TxTab.prototype.generateHtml = function ()
{
  return require('../../jade/tabs/tx.jade')();
};

TxTab.prototype.angular = function (module)
{
  module.controller('TxCtrl', ['$scope', 'rpNetwork', '$routeParams',
                               function ($scope, net, $routeParams)
  {
    $scope.state = 'loading';
    $scope.transaction = {
      hash: $routeParams.id
    };

    function loadTx() {
      // XXX: Dirty, dirty. But it's going to change soon anyway.
      var request = net.remote.request_ledger_hash();
      request.message.command = 'tx';
      request.message.transaction = $routeParams.id;
      request.on('success', function (res) {
        $scope.$apply(function () {
          $scope.state = 'loaded';
          // XXX This is for the upcoming tx RPC call format change.
          var tx = res.tx ? res.tx : res;
          _.extend($scope.transaction, res);
          console.log(res);
        });
      });
      request.on('error', function (res) {
        $scope.$apply(function () {
          $scope.state = 'error';
          console.log(res);
        });
      });
      request.request();
    }

    if (net.connected) loadTx();
    else net.on('connected', function () {
      $scope.$apply(function () {
        loadTx();
      });
    });
  }]);
};

module.exports = TxTab;
