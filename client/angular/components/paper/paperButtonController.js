(function(){
  "use strict";
  var PButtonCtrl = function($scope, $element){
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

    $scope.keyDown = function(e) {
      console.log(e);
      if (e.repeat) { return; }
      if (e.code != "Enter" && e.code != "Space") { return; }
      $element[0].children[1].downAction(e);
      (function(elm){
        let fnc = function(ev) {
            elm.upAction(ev);
            document.getElementsByTagName("body")[0].removeEventListener('keyup', fnc);
        };
        document.getElementsByTagName("body")[0].addEventListener('keyup', fnc)
      })($element[0].children[1]);
    };
  };

  module.exports = {
    templateUrl: 'angular/components/paper/paperButton.html',
    controller: PButtonCtrl,
    transclude: true
  };
}());
