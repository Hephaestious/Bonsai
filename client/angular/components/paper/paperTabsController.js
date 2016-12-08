(function(){
  "use strict";
  var PTabsCtrl = function($scope, $element){
    $scope.whichOne = {
      'list': [],
      'selected': 0
    };

    var bar = $element[0].children[1];

    $scope.initBar = function() {
      var len = $scope.whichOne.list.length;
      var numScl = 1 / len;
      var offset = 50 * (numScl + 2 * numScl * $scope.whichOne.selected - 1);
      bar.style.transform = "translateX("+offset+"%) scaleX("+numScl+")";
    };

    $scope.animBar = function(newSel) {
      var len = $scope.whichOne.list.length;
      var numScl = 1 / len;
      var oldSel = $scope.whichOne.selected;
      var coffset = 50 * (numScl + 2 * numScl * oldSel - 1);
      $scope.whichOne.selected = newSel;
      var offset = 50 * (numScl + 2 * numScl * newSel - 1);
      var doff = offset - coffset;
      bar.classList.remove('contract');
      bar.classList.add('expand');
      bar.style.transform = "translate3d("+(coffset + doff / 2)+"%, 0, 0) scaleX("+numScl * 1.25+")";
      var func = ()=>{
        bar.classList.remove('expand');
        bar.classList.add('contract');
        bar.style.transform = "translate3d("+offset+"%, 0, 0) scaleX("+numScl+")";
        bar.removeEventListener('transitionend', func);
      };
      bar.addEventListener('transitionend', func);
    };

    window.testE = $scope;
  };

  module.exports = {
    templateUrl: 'angular/components/paper/paperTabs.html',
    transclude: true,
    controller: PTabsCtrl
  };
}());
