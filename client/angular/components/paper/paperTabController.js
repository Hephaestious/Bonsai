(function(){
  "use strict";
  var PTabCtrl = function($scope, $element){
    var kool = $scope.$parent.$parent.whichOne.list.push(this) - 1;
    $scope.$parent.$parent.initBar();
    $element[0].children[0].onmousedown = ()=>{
      $scope.$parent.$parent.animBar(kool);
    };
  };

  module.exports = {
    templateUrl: 'angular/components/paper/paperTab.html',
    transclude: true,
    controller: PTabCtrl
  };
}());
