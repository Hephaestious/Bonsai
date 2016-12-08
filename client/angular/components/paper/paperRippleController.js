(function(){
  "use strict";
  var Utility = {
    distance: function(x1, y1, x2, y2) {
      var xDelta = (x1 - x2);
      var yDelta = (y1 - y2);
      return Math.sqrt(xDelta * xDelta + yDelta * yDelta);
    },
    now: window.performance && window.performance.now ?
        window.performance.now.bind(window.performance) : Date.now
  };

  function ElementMetrics(element) {
    this.element = element;
    this.width = this.boundingRect.width;
    this.height = this.boundingRect.height;
    this.size = Math.max(this.width, this.height);
  }
  ElementMetrics.prototype = {
    get boundingRect () {
      return this.element.getBoundingClientRect();
    },
    furthestCornerDistanceFrom: function(x, y) {
      var topLeft = Utility.distance(x, y, 0, 0);
      var topRight = Utility.distance(x, y, this.width, 0);
      var bottomLeft = Utility.distance(x, y, 0, this.height);
      var bottomRight = Utility.distance(x, y, this.width, this.height);
      return Math.max(topLeft, topRight, bottomLeft, bottomRight);
    }
  };

  function Ripple(element, pelement) {
    this.element = element;
    this.pelement = pelement;
    this.color = window.getComputedStyle(element).color;
    this.wave = document.createElement('div');
    this.waveContainer = document.createElement('div');
    this.wave.style.backgroundColor = this.color;
    this.wave.classList.add('wave');
    this.waveContainer.classList.add('wave-container');
    this.waveContainer.appendChild(this.wave);
    this.resetInteractionState();
  }
  Ripple.MAX_RADIUS = 300;
  Ripple.prototype = {
    get recenters() {
      return this.pelement.recenters;
    },
    get center() {
      return this.pelement.center;
    },
    get mouseDownElapsed() {
      var elapsed;
      if (!this.mouseDownStart) {
        return 0;
      }
      elapsed = Utility.now() - this.mouseDownStart;
      if (this.mouseUpStart) {
        elapsed -= this.mouseUpElapsed;
      }
      return elapsed;
    },
    get mouseUpElapsed() {
      return this.mouseUpStart ?
        Utility.now () - this.mouseUpStart : 0;
    },
    get mouseDownElapsedSeconds() {
      return this.mouseDownElapsed / 1000;
    },
    get mouseUpElapsedSeconds() {
      return this.mouseUpElapsed / 1000;
    },
    get mouseInteractionSeconds() {
      return this.mouseDownElapsedSeconds + this.mouseUpElapsedSeconds;
    },
    get initialOpacity() {
      return this.pelement.initialOpacity;
    },
    get opacityDecayVelocity() {
      return this.pelement.opacityDecayVelocity;
    },
    get radius() {
      var width2 = this.containerMetrics.width * this.containerMetrics.width;
      var height2 = this.containerMetrics.height * this.containerMetrics.height;
      var waveRadius = Math.min(
        Math.sqrt(width2 + height2),
        Ripple.MAX_RADIUS
      ) * 1.1 + 5;
      var duration = 1.1 - 0.2 * (waveRadius / Ripple.MAX_RADIUS);
      var timeNow = this.mouseInteractionSeconds / duration;
      var size = waveRadius * (1 - Math.pow(80, -timeNow));
      return Math.abs(size);
    },
    get opacity() {
      if (!this.mouseUpStart) {
        return this.initialOpacity;
      }
      return Math.max(
        0,
        this.initialOpacity - this.mouseUpElapsedSeconds * this.opacityDecayVelocity
      );
    },
    get outerOpacity() {
      // Linear increase in background opacity, capped at the opacity
      // of the wavefront (waveOpacity).
      var outerOpacity = this.mouseUpElapsedSeconds * 0.3;
      var waveOpacity = this.opacity;
      return Math.max(
        0,
        Math.min(outerOpacity, waveOpacity)
      );
    },
    get isOpacityFullyDecayed() {
      return this.opacity < 0.01 &&
        this.radius >= Math.min(this.maxRadius, Ripple.MAX_RADIUS);
    },
    get isRestingAtMaxRadius() {
      return this.opacity >= this.initialOpacity &&
        this.radius >= Math.min(this.maxRadius, Ripple.MAX_RADIUS);
    },
    get isAnimationComplete() {
      return this.mouseUpStart ?
        this.isOpacityFullyDecayed : this.isRestingAtMaxRadius;
    },
    get translationFraction() {
      return Math.min(
        1,
        this.radius / this.containerMetrics.size * 2 / Math.sqrt(2)
      );
    },
    get xNow() {
      if (this.xEnd) {
        return this.xStart + this.translationFraction * (this.xEnd - this.xStart);
      }
      return this.xStart;
    },
    get yNow() {
      if (this.yEnd) {
        return this.yStart + this.translationFraction * (this.yEnd - this.yStart);
      }
      return this.yStart;
    },
    get isMouseDown() {
      return this.mouseDownStart && !this.mouseUpStart;
    },
    resetInteractionState: function() {
      this.maxRadius = 0;
      this.mouseDownStart = 0;
      this.mouseUpStart = 0;
      this.xStart = 0;
      this.yStart = 0;
      this.xEnd = 0;
      this.yEnd = 0;
      this.slideDistance = 0;
      this.containerMetrics = new ElementMetrics(this.element);
    },
    draw: function() {
      var scale;
      var translateString;
      var dx;
      var dy;
      this.wave.style.opacity = this.opacity;
      scale = this.radius / (this.containerMetrics.size / 2);
      dx = this.xNow - (this.containerMetrics.width / 2);
      dy = this.yNow - (this.containerMetrics.height / 2);
      // 2d transform for safari because of border-radius and overflow:hidden clipping bug.
      // https://bugs.webkit.org/show_bug.cgi?id=98538
      this.waveContainer.style.webkitTransform = 'translate(' + dx + 'px, ' + dy + 'px)';
      this.waveContainer.style.transform = 'translate3d(' + dx + 'px, ' + dy + 'px, 0)';
      this.wave.style.webkitTransform = 'scale(' + scale + ',' + scale + ')';
      this.wave.style.transform = 'scale3d(' + scale + ',' + scale + ',1)';
    },

    downAction: function(event) {
      var xCenter = this.containerMetrics.width / 2;
      var yCenter = this.containerMetrics.height / 2;
      this.resetInteractionState();
      this.mouseDownStart = Utility.now();
      if (this.center) {
        this.xStart = xCenter;
        this.yStart = yCenter;
        this.slideDistance = Utility.distance(
          this.xStart, this.yStart, this.xEnd, this.yEnd
        );
      } else {
        this.xStart = event ?
            event.clientX - this.containerMetrics.boundingRect.left :
            this.containerMetrics.width / 2;
        this.yStart = event ?
            event.clientY - this.containerMetrics.boundingRect.top :
            this.containerMetrics.height / 2;
      }
      if (this.recenters) {
        this.xEnd = xCenter;
        this.yEnd = yCenter;
        this.slideDistance = Utility.distance(
          this.xStart, this.yStart, this.xEnd, this.yEnd
        );
      }
      this.maxRadius = this.containerMetrics.furthestCornerDistanceFrom(
        this.xStart,
        this.yStart
      );
      this.waveContainer.style.top =
        (this.containerMetrics.height - this.containerMetrics.size) / 2 + 'px';
      this.waveContainer.style.left =
        (this.containerMetrics.width - this.containerMetrics.size) / 2 + 'px';
      this.waveContainer.style.width = this.containerMetrics.size + 'px';
      this.waveContainer.style.height = this.containerMetrics.size + 'px';
    },

    upAction: function(event) {
      if (!this.isMouseDown) {
        return;
      }
      this.mouseUpStart = Utility.now();
    },
    remove: function() {
      this.waveContainer.parentNode.removeChild(
        this.waveContainer
      );
    }
  };

  var PRippleCtrl = function($scope, $element){
    let thisObject = {};
    (function($element){
      this.initialOpacity = 0.25;
      this.opacityDecayVelocity = 0.8;
      this.recenters = false;
      this.center = false;
      this.ripples = [];
      this.animating = false;
      this.holdDown = false;
      this.noink = false;
      this._animating = false;
      (function(ths){ths._boundAnimate = function() { return ths.animate.call(ths); };})(this);

      Object.defineProperty(this, "target", { get: function () { return this.keyEventTarget; } });
      Object.defineProperty(this, "shouldKeepAnimating", { get: function () {
        for (var index = 0; index < this.ripples.length; ++index) {
          if (!this.ripples[index].isAnimationComplete) {
            return true;
          }
        }
        return false;
      } });

      this.simulatedRipple = function() {
        this.downAction(null);

        (function(ths){setTimeout(function() {
          ths.upAction();
        }, 1000);})(this)
      };

      this.uiDownAction = function(event) {
        if (!this.noink) {
          this.downAction(event);
        }
      };

      this.downAction = function(event) {
        if (this.holdDown && this.ripples.length > 0) {
          return;
        }
        var ripple = this.addRipple();
        ripple.downAction(event);
        if (!this._animating) {
          this._animating = true;
          this.animate();
        }
      };

      this.uiUpAction = function(event) {
        if (!this.noink) {
          this.upAction(event);
        }
      };

      this.upAction = function(event) {
        if (this.holdDown) {
          return;
        }
        this.ripples.forEach(function(ripple) {
          ripple.upAction(event);
        });
        if (!this._animating) {
          this._animating = true;
          this.animate();
        }
      };

      this.onAnimationComplete = function() {
        this._animating = false;
        $element[0].children[0].style.backgroundColor = null;
        var event = document.createEvent("HTMLEvents");
        event.initEvent("transitionend", true, true);
        $element[0].dispatchEvent(event);
      };

      this.addRipple = function() {
        var ripple = new Ripple($element[0], this);
        $element[0].children[1].appendChild(ripple.waveContainer);
        $element[0].children[0].style.backgroundColor = ripple.color;
        this.ripples.push(ripple);
        if (!this._animating) {
          this._animating = true;
          this.animate();
        }
        return ripple;
      };

      this.removeRipple = function(ripple) {
        var rippleIndex = this.ripples.indexOf(ripple);
        if (rippleIndex < 0) {
          return;
        }
        this.ripples.splice(rippleIndex, 1);
        ripple.remove();
        if (!this.ripples.length) {
          this._animating = false;
        }
      };

      this.animate = function() {
        if (!this._animating) {
          return;
        }
        var index;
        var ripple;
        for (index = 0; index < this.ripples.length; ++index) {
          ripple = this.ripples[index];
          ripple.draw();
          $element[0].children[0].style.opacity = ripple.outerOpacity;
          if (ripple.isOpacityFullyDecayed && !ripple.isRestingAtMaxRadius) {
            this.removeRipple(ripple);
          }
        }
        if (!this.shouldKeepAnimating && this.ripples.length === 0) {
          this.onAnimationComplete();
        } else {
          window.requestAnimationFrame(this._boundAnimate);
        }
      };

      this._holdDownChanged = function(newVal, oldVal) {
        if (oldVal === undefined) {
          return;
        }
        if (newVal) {
          this.downAction();
        } else {
          this.upAction();
        }
      };

      (function(ths){$element[0].upAction = function(e){ths.upAction(e);};
      $element[0].downAction = function(e){ths.downAction(e);}})(this);
    }).call(thisObject, $element);
  };

  module.exports = {
    templateUrl: 'angular/components/paper/paperRipple.html',
    controller: PRippleCtrl
  };
}());
