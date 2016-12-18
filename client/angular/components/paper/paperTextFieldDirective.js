module.exports = function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      console.log(elm);
      window.xad = elm;
      var elmI = elm.children()[0].children[1].children[1];
      elmI.addEventListener('blur', ((ctrl, elmI)=>{return function() {
        console.log(ctrl)
        ctrl.$setViewValue(elmI.value);
      };})(ctrl, elmI));
    }
  };
};
