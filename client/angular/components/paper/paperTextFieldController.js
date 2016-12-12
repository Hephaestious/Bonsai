(function(){
  "use strict";
  var PTFieldCtrl = function($scope, $element){
    var elem = $element[0].getElementsByClassName("paperTextRoot")[0];
    ((elm = elem) => {
      var cfunc = function(e) {
        if (elm.value == "") {
          elm.parentElement.classList.remove("content");
        } else {
          elm.parentElement.classList.add("content");
        }
      };

      var bfunc = function(e) {
        if (e.type == "focus") {
          elm.parentElement.classList.add("focused");
        } else {
          elm.parentElement.classList.remove("focused");
        }
      }

      elm.addEventListener("keydown", cfunc);
      elm.addEventListener("paste", cfunc);
      elm.addEventListener("input", cfunc);
      elm.addEventListener("focus", bfunc);
      elm.addEventListener("blur", bfunc);
    })();
  };

  module.exports = {
    templateUrl: 'angular/components/paper/paperTextField.html',
    controller: PTFieldCtrl,
    bindings: {
      password: '@',
      label: '@',
      hint: '@',
      width: '='
    }
  };
}());
