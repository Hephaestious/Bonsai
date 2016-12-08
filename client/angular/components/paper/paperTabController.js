(function(){
  "use strict";
  var PTabCtrl = function($scope, $element){
    var kool = $scope.$parent.$parent.whichOne.list.push(this) - 1;
    $scope.$parent.$parent.initBar();
    $element[0].children[0].onmouseup = ()=>{
      $scope.$parent.$parent.animBar(kool);
    };

    $scope.mouseDown = function(e) {
      $element[0].children[1].downAction(e);
      (function(elm){
        let fnc = function(ev) {
            elm.upAction(ev);
            document.getElementsByTagName("body")[0].removeEventListener('mouseup', fnc);
        };
        document.getElementsByTagName("body")[0].addEventListener('mouseup', fnc)
      })($element[0].children[1]);
    };

    $scope.mouseUp = function(e) {
      $element[0].children[1].upAction(e);
    };
  };

  module.exports = {
    templateUrl: 'angular/components/paper/paperTab.html',
    transclude: true,
    controller: PTabCtrl
  };
}());
