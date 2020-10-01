(function (f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }g.officetemp = f();
  }
})(function () {
  var define, module, exports;return function () {
    function r(e, n, t) {
      function o(i, f) {
        if (!n[i]) {
          if (!e[i]) {
            var c = "function" == typeof require && require;if (!f && c) return c(i, !0);if (u) return u(i, !0);var a = new Error("Cannot find module '" + i + "'");throw a.code = "MODULE_NOT_FOUND", a;
          }var p = n[i] = { exports: {} };e[i][0].call(p.exports, function (r) {
            var n = e[i][1][r];return o(n || r);
          }, p, p.exports, r, e, n, t);
        }return n[i].exports;
      }for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);return o;
    }return r;
  }()({ 1: [function (require, module, exports) {
      // Copyright Joyent, Inc. and other Node contributors.
      //
      // Permission is hereby granted, free of charge, to any person obtaining a
      // copy of this software and associated documentation files (the
      // "Software"), to deal in the Software without restriction, including
      // without limitation the rights to use, copy, modify, merge, publish,
      // distribute, sublicense, and/or sell copies of the Software, and to permit
      // persons to whom the Software is furnished to do so, subject to the
      // following conditions:
      //
      // The above copyright notice and this permission notice shall be included
      // in all copies or substantial portions of the Software.
      //
      // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
      // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
      // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
      // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
      // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
      // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
      // USE OR OTHER DEALINGS IN THE SOFTWARE.

      var objectCreate = Object.create || objectCreatePolyfill;
      var objectKeys = Object.keys || objectKeysPolyfill;
      var bind = Function.prototype.bind || functionBindPolyfill;

      function EventEmitter() {
        if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        }

        this._maxListeners = this._maxListeners || undefined;
      }
      module.exports = EventEmitter;

      // Backwards-compat with node 0.10.x
      EventEmitter.EventEmitter = EventEmitter;

      EventEmitter.prototype._events = undefined;
      EventEmitter.prototype._maxListeners = undefined;

      // By default EventEmitters will print a warning if more than 10 listeners are
      // added to it. This is a useful default which helps finding memory leaks.
      var defaultMaxListeners = 10;

      var hasDefineProperty;
      try {
        var o = {};
        if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
        hasDefineProperty = o.x === 0;
      } catch (err) {
        hasDefineProperty = false;
      }
      if (hasDefineProperty) {
        Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
          enumerable: true,
          get: function () {
            return defaultMaxListeners;
          },
          set: function (arg) {
            // check whether the input is a positive number (whose value is zero or
            // greater and not a NaN).
            if (typeof arg !== 'number' || arg < 0 || arg !== arg) throw new TypeError('"defaultMaxListeners" must be a positive number');
            defaultMaxListeners = arg;
          }
        });
      } else {
        EventEmitter.defaultMaxListeners = defaultMaxListeners;
      }

      // Obviously not all Emitters should be limited to 10. This function allows
      // that to be increased. Set to zero for unlimited.
      EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
        if (typeof n !== 'number' || n < 0 || isNaN(n)) throw new TypeError('"n" argument must be a positive number');
        this._maxListeners = n;
        return this;
      };

      function $getMaxListeners(that) {
        if (that._maxListeners === undefined) return EventEmitter.defaultMaxListeners;
        return that._maxListeners;
      }

      EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
        return $getMaxListeners(this);
      };

      // These standalone emit* functions are used to optimize calling of event
      // handlers for fast cases because emit() itself often has a variable number of
      // arguments and can be deoptimized because of that. These functions always have
      // the same number of arguments and thus do not get deoptimized, so the code
      // inside them can execute faster.
      function emitNone(handler, isFn, self) {
        if (isFn) handler.call(self);else {
          var len = handler.length;
          var listeners = arrayClone(handler, len);
          for (var i = 0; i < len; ++i) listeners[i].call(self);
        }
      }
      function emitOne(handler, isFn, self, arg1) {
        if (isFn) handler.call(self, arg1);else {
          var len = handler.length;
          var listeners = arrayClone(handler, len);
          for (var i = 0; i < len; ++i) listeners[i].call(self, arg1);
        }
      }
      function emitTwo(handler, isFn, self, arg1, arg2) {
        if (isFn) handler.call(self, arg1, arg2);else {
          var len = handler.length;
          var listeners = arrayClone(handler, len);
          for (var i = 0; i < len; ++i) listeners[i].call(self, arg1, arg2);
        }
      }
      function emitThree(handler, isFn, self, arg1, arg2, arg3) {
        if (isFn) handler.call(self, arg1, arg2, arg3);else {
          var len = handler.length;
          var listeners = arrayClone(handler, len);
          for (var i = 0; i < len; ++i) listeners[i].call(self, arg1, arg2, arg3);
        }
      }

      function emitMany(handler, isFn, self, args) {
        if (isFn) handler.apply(self, args);else {
          var len = handler.length;
          var listeners = arrayClone(handler, len);
          for (var i = 0; i < len; ++i) listeners[i].apply(self, args);
        }
      }

      EventEmitter.prototype.emit = function emit(type) {
        var er, handler, len, args, i, events;
        var doError = type === 'error';

        events = this._events;
        if (events) doError = doError && events.error == null;else if (!doError) return false;

        // If there is no 'error' event listener then throw.
        if (doError) {
          if (arguments.length > 1) er = arguments[1];
          if (er instanceof Error) {
            throw er; // Unhandled 'error' event
          } else {
            // At least give some kind of context to the user
            var err = new Error('Unhandled "error" event. (' + er + ')');
            err.context = er;
            throw err;
          }
          return false;
        }

        handler = events[type];

        if (!handler) return false;

        var isFn = typeof handler === 'function';
        len = arguments.length;
        switch (len) {
          // fast cases
          case 1:
            emitNone(handler, isFn, this);
            break;
          case 2:
            emitOne(handler, isFn, this, arguments[1]);
            break;
          case 3:
            emitTwo(handler, isFn, this, arguments[1], arguments[2]);
            break;
          case 4:
            emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
            break;
          // slower
          default:
            args = new Array(len - 1);
            for (i = 1; i < len; i++) args[i - 1] = arguments[i];
            emitMany(handler, isFn, this, args);
        }

        return true;
      };

      function _addListener(target, type, listener, prepend) {
        var m;
        var events;
        var existing;

        if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');

        events = target._events;
        if (!events) {
          events = target._events = objectCreate(null);
          target._eventsCount = 0;
        } else {
          // To avoid recursion in the case that type === "newListener"! Before
          // adding it to the listeners, first emit "newListener".
          if (events.newListener) {
            target.emit('newListener', type, listener.listener ? listener.listener : listener);

            // Re-assign `events` because a newListener handler could have caused the
            // this._events to be assigned to a new object
            events = target._events;
          }
          existing = events[type];
        }

        if (!existing) {
          // Optimize the case of one listener. Don't need the extra array object.
          existing = events[type] = listener;
          ++target._eventsCount;
        } else {
          if (typeof existing === 'function') {
            // Adding the second element, need to change to array.
            existing = events[type] = prepend ? [listener, existing] : [existing, listener];
          } else {
            // If we've already got an array, just append.
            if (prepend) {
              existing.unshift(listener);
            } else {
              existing.push(listener);
            }
          }

          // Check for listener leak
          if (!existing.warned) {
            m = $getMaxListeners(target);
            if (m && m > 0 && existing.length > m) {
              existing.warned = true;
              var w = new Error('Possible EventEmitter memory leak detected. ' + existing.length + ' "' + String(type) + '" listeners ' + 'added. Use emitter.setMaxListeners() to ' + 'increase limit.');
              w.name = 'MaxListenersExceededWarning';
              w.emitter = target;
              w.type = type;
              w.count = existing.length;
              if (typeof console === 'object' && console.warn) {
                console.warn('%s: %s', w.name, w.message);
              }
            }
          }
        }

        return target;
      }

      EventEmitter.prototype.addListener = function addListener(type, listener) {
        return _addListener(this, type, listener, false);
      };

      EventEmitter.prototype.on = EventEmitter.prototype.addListener;

      EventEmitter.prototype.prependListener = function prependListener(type, listener) {
        return _addListener(this, type, listener, true);
      };

      function onceWrapper() {
        if (!this.fired) {
          this.target.removeListener(this.type, this.wrapFn);
          this.fired = true;
          switch (arguments.length) {
            case 0:
              return this.listener.call(this.target);
            case 1:
              return this.listener.call(this.target, arguments[0]);
            case 2:
              return this.listener.call(this.target, arguments[0], arguments[1]);
            case 3:
              return this.listener.call(this.target, arguments[0], arguments[1], arguments[2]);
            default:
              var args = new Array(arguments.length);
              for (var i = 0; i < args.length; ++i) args[i] = arguments[i];
              this.listener.apply(this.target, args);
          }
        }
      }

      function _onceWrap(target, type, listener) {
        var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
        var wrapped = bind.call(onceWrapper, state);
        wrapped.listener = listener;
        state.wrapFn = wrapped;
        return wrapped;
      }

      EventEmitter.prototype.once = function once(type, listener) {
        if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');
        this.on(type, _onceWrap(this, type, listener));
        return this;
      };

      EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
        if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');
        this.prependListener(type, _onceWrap(this, type, listener));
        return this;
      };

      // Emits a 'removeListener' event if and only if the listener was removed.
      EventEmitter.prototype.removeListener = function removeListener(type, listener) {
        var list, events, position, i, originalListener;

        if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');

        events = this._events;
        if (!events) return this;

        list = events[type];
        if (!list) return this;

        if (list === listener || list.listener === listener) {
          if (--this._eventsCount === 0) this._events = objectCreate(null);else {
            delete events[type];
            if (events.removeListener) this.emit('removeListener', type, list.listener || listener);
          }
        } else if (typeof list !== 'function') {
          position = -1;

          for (i = list.length - 1; i >= 0; i--) {
            if (list[i] === listener || list[i].listener === listener) {
              originalListener = list[i].listener;
              position = i;
              break;
            }
          }

          if (position < 0) return this;

          if (position === 0) list.shift();else spliceOne(list, position);

          if (list.length === 1) events[type] = list[0];

          if (events.removeListener) this.emit('removeListener', type, originalListener || listener);
        }

        return this;
      };

      EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
        var listeners, events, i;

        events = this._events;
        if (!events) return this;

        // not listening for removeListener, no need to emit
        if (!events.removeListener) {
          if (arguments.length === 0) {
            this._events = objectCreate(null);
            this._eventsCount = 0;
          } else if (events[type]) {
            if (--this._eventsCount === 0) this._events = objectCreate(null);else delete events[type];
          }
          return this;
        }

        // emit removeListener for all listeners on all events
        if (arguments.length === 0) {
          var keys = objectKeys(events);
          var key;
          for (i = 0; i < keys.length; ++i) {
            key = keys[i];
            if (key === 'removeListener') continue;
            this.removeAllListeners(key);
          }
          this.removeAllListeners('removeListener');
          this._events = objectCreate(null);
          this._eventsCount = 0;
          return this;
        }

        listeners = events[type];

        if (typeof listeners === 'function') {
          this.removeListener(type, listeners);
        } else if (listeners) {
          // LIFO order
          for (i = listeners.length - 1; i >= 0; i--) {
            this.removeListener(type, listeners[i]);
          }
        }

        return this;
      };

      function _listeners(target, type, unwrap) {
        var events = target._events;

        if (!events) return [];

        var evlistener = events[type];
        if (!evlistener) return [];

        if (typeof evlistener === 'function') return unwrap ? [evlistener.listener || evlistener] : [evlistener];

        return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
      }

      EventEmitter.prototype.listeners = function listeners(type) {
        return _listeners(this, type, true);
      };

      EventEmitter.prototype.rawListeners = function rawListeners(type) {
        return _listeners(this, type, false);
      };

      EventEmitter.listenerCount = function (emitter, type) {
        if (typeof emitter.listenerCount === 'function') {
          return emitter.listenerCount(type);
        } else {
          return listenerCount.call(emitter, type);
        }
      };

      EventEmitter.prototype.listenerCount = listenerCount;
      function listenerCount(type) {
        var events = this._events;

        if (events) {
          var evlistener = events[type];

          if (typeof evlistener === 'function') {
            return 1;
          } else if (evlistener) {
            return evlistener.length;
          }
        }

        return 0;
      }

      EventEmitter.prototype.eventNames = function eventNames() {
        return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
      };

      // About 1.5x faster than the two-arg version of Array#splice().
      function spliceOne(list, index) {
        for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) list[i] = list[k];
        list.pop();
      }

      function arrayClone(arr, n) {
        var copy = new Array(n);
        for (var i = 0; i < n; ++i) copy[i] = arr[i];
        return copy;
      }

      function unwrapListeners(arr) {
        var ret = new Array(arr.length);
        for (var i = 0; i < ret.length; ++i) {
          ret[i] = arr[i].listener || arr[i];
        }
        return ret;
      }

      function objectCreatePolyfill(proto) {
        var F = function () {};
        F.prototype = proto;
        return new F();
      }
      function objectKeysPolyfill(obj) {
        var keys = [];
        for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
          keys.push(k);
        }
        return k;
      }
      function functionBindPolyfill(context) {
        var fn = this;
        return function () {
          return fn.apply(context, arguments);
        };
      }
    }, {}], 2: [function (require, module, exports) {
      /* officetemper - A game about temp work
       * Copyright (C) 2017  Peter Rogers
       *
       * This program is free software: you can redistribute it and/or modify
       * it under the terms of the GNU General Public License as published by
       * the Free Software Foundation, either version 3 of the License, or
       * (at your option) any later version.
       *
       * This program is distributed in the hope that it will be useful,
       * but WITHOUT ANY WARRANTY; without even the implied warranty of
       * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
       * GNU General Public License for more details.
       *
       * You should have received a copy of the GNU General Public License
       * along with this program.  If not, see <http://www.gnu.org/licenses/>.
       */

      const Thing = require('./thing');
      const Sprites = require("./sprites");
      const Resource = require('./resource');
      const { getImage } = require('./resource');

      class Aisle extends Thing {
        constructor() {
          super();
          // The container holds everything in this aisle
          this.container = new PIXI.Container();
          // Things that are behind the counter
          this.behindCounter = new PIXI.Container();
          this.behindCounter.position.set(0, -4);
          this.container.addChild(this.behindCounter);

          this.counter = new PIXI.Sprite(getImage(Resource.OFFICE, 'office_desk1'));
          this.counter.anchor.set(0, 1);
          //this.counter.position.set(0, ypos);
          this.container.addChild(this.counter);

          this.inFrontCounter = new PIXI.Container();
          this.inFrontCounter.position.set(0, this.behindCounter.position.y);
          this.container.addChild(this.inFrontCounter);

          this.cabinetArea = new PIXI.Container();
          this.cabinetArea.position.set(205, -3);
          this.container.addChild(this.cabinetArea);

          // The counter (top) is referenced to its bottom edge
          this.onCounter = new PIXI.Container();
          this.onCounter.position.set(0, -20);
          this.container.addChild(this.onCounter);

          this.cabinet = new Sprites.Cabinet();
          this.cabinet.sprite.position.set(220, -1);
          this.container.addChild(this.cabinet.sprite);
          this.papers = [];
        }

        get sprite() {
          return this.container;
        }

        getY() {
          return this.container.position.y;
        }

        spawn() {}

        get width() {
          return this.counter.width;
        }

        addPaper(paper) {
          this.papers.push(paper);
          this.onCounter.addChild(paper.sprite);
        }

        removePaper(paper) {
          let i = this.papers.indexOf(paper);
          if (i !== -1) {
            this.papers[i] = this.papers[this.papers.length - 1];
            this.papers.pop();
            this.onCounter.removeChild(paper.sprite);
          }
        }
      }

      module.exports = Aisle;
    }, { "./resource": 11, "./sprites": 12, "./thing": 14 }], 3: [function (require, module, exports) {
      /* APDUNGEON - A dungeon crawler demo written in javascript + pixi.js
       * Copyright (C) 2017  Peter Rogers (peter.rogers@gmail.com)
       *
       * This program is free software: you can redistribute it and/or modify
       * it under the terms of the GNU General Public License as published by
       * the Free Software Foundation, either version 3 of the License, or
       * (at your option) any later version.
       *
       * This program is distributed in the hope that it will be useful,
       * but WITHOUT ANY WARRANTY; without even the implied warranty of
       * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
       * GNU General Public License for more details.
       *
       * You should have received a copy of the GNU General Public License
       * along with this program.  If not, see <http://www.gnu.org/licenses/>.
       * 
       * See LICENSE.txt for the full text of the license.
       */

      var PRIMARY = 90;
      var PRIMARY_ALT = 65;
      var SWAP = 88;
      var SPACE = 32;
      var ARROW_UP = 38;
      var ARROW_LEFT = 37;
      var ARROW_RIGHT = 39;
      var ARROW_DOWN = 40;
      var TEST_KEY = 75;

      var DOUBLE_PRESS_TIME = 0.3;

      var DEFAULTS = {
        up: ARROW_UP,
        down: ARROW_DOWN,
        left: ARROW_LEFT,
        right: ARROW_RIGHT,
        primary: [PRIMARY, PRIMARY_ALT],
        swap: SWAP,
        space: SPACE
      };

      /* A single input (eg attack) */
      class Input {
        constructor(name) {
          this.name = name;
          this.held = false;
          this.justPressed = false;
          this.justReleased = false;
          this.doublePressed = false;
        }

        press(set) {
          this.justPressed = !this.held;
          this.held = set === undefined ? true : set;
        }

        release(set) {
          this.justReleased = !!this.held;
          this.held = false;
        }
      }

      class KeyboardControls {
        constructor() {
          // Map of Input instances stored by key code
          this.inputByKey = {};
          this.inputs = [];
          this.time = 0;
          // Keep track of the last input pressed, so we can detect double-clicks
          this.lastInputPressed = null;
          this.lastInputPressedTime = 0;
          for (let name of Object.keys(DEFAULTS)) {
            let keys = DEFAULTS[name];

            if (typeof keys.push !== "function") {
              keys = [keys];
            }

            this[name] = new Input(name);
            this.inputs.push(this[name]);
            for (let key of keys) {
              this.inputByKey[key] = this[name];
            }
          }
        }

        getX() {
          return this.right.held - this.left.held;
        }

        getY() {
          return this.down.held - this.up.held;
        }

        /* This should be called after the game state is updated */
        update(dt) {
          this.time += dt;
          for (let input of this.inputs) {
            input.justPressed = false;
            input.justReleased = false;
            input.doublePressed = false;
          }
        }

        attachKeyboardEvents() {
          window.addEventListener("keydown", event => {
            var input = this.inputByKey[event.keyCode];
            if (input && !input.held) {
              // Handle double-pressing the input
              if (this.lastInputPressed === input && this.time - this.lastInputPressedTime < DOUBLE_PRESS_TIME) {
                input.doublePressed = true;
              }
              this.lastInputPressedTime = this.time;
              this.lastInputPressed = input;

              input.press();
              event.stopPropagation();
              event.preventDefault();
            }
          });

          window.addEventListener("keyup", event => {
            var input = this.inputByKey[event.keyCode];
            if (input) {
              input.release();
              event.stopPropagation();
              event.preventDefault();
            }
          });
        }
      }

      /******************/
      /* ManualControls */
      /******************/

      class ManualControls {
        constructor() {
          this.dirx = 0;
          this.diry = 0;

          for (let name of Object.keys(DEFAULTS)) {
            this[name] = new Input(name);
          }
        }

        getX() {
          return this.dirx;
        }

        getY() {
          return this.diry;
        }
      }

      /***********/
      /* Exports */
      /***********/

      module.exports = {};

      module.exports.ManualControls = ManualControls;
      module.exports.KeyboardControls = KeyboardControls;
    }, {}], 4: [function (require, module, exports) {
      /* officetemper - A game about temp work
       * Copyright (C) 2017  Peter Rogers
       *
       * This program is free software: you can redistribute it and/or modify
       * it under the terms of the GNU General Public License as published by
       * the Free Software Foundation, either version 3 of the License, or
       * (at your option) any later version.
       *
       * This program is distributed in the hope that it will be useful,
       * but WITHOUT ANY WARRANTY; without even the implied warranty of
       * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
       * GNU General Public License for more details.
       *
       * You should have received a copy of the GNU General Public License
       * along with this program.  If not, see <http://www.gnu.org/licenses/>.
       */

      const Process = require("./process");
      const Resource = require("./resource");
      const Player = require("./player");
      const Sprites = require("./sprites");
      const SuitGuy = require('./suitguy');
      const Aisle = require("./aisle");
      const getImage = Resource.getImage;
      const LEDSign = require("./ledsign");

      const AISLE_YPOS_LIST = [72, 111, 150];

      class GameScreen {
        constructor(controls) {
          this.stage = new PIXI.Container();
          //this.process = new Process();
          this.controls = controls;
          this.timer = 0;
          this.aisle = 0;
          this.player = null;
          this.things = [];
        }

        getAisle(n) {
          return this.aisleList[n];
        }

        getAisleEnd() {
          return this.aisleList[0].width;
        }

        getNumAisles() {
          return this.aisleList.length;
        }

        start() {
          this.background = getImage(Resource.OFFICE, 'office_carpet');
          this.stage.addChild(new PIXI.Sprite(this.background));

          let sprite = null;
          let img = getImage(Resource.OFFICE, 'office_shadows');
          this.stage.addChild(new PIXI.Sprite(img));

          img = getImage(Resource.OFFICE, 'office_wall');
          this.stage.addChild(new PIXI.Sprite(img));

          img = getImage(Resource.OFFICE, 'office_counter');
          sprite = new PIXI.Sprite(img);
          sprite.position.set(118, 15);
          this.stage.addChild(sprite);

          img = getImage(Resource.OFFICE, 'office_microwave');
          sprite = new PIXI.Sprite(img);
          sprite.position.set(126, 9);
          this.stage.addChild(sprite);

          img = getImage(Resource.OFFICE, 'office_counter2');
          sprite = new PIXI.Sprite(img);
          sprite.position.set(6, 15);
          this.stage.addChild(sprite);

          img = getImage(Resource.OFFICE, 'office_counter3');
          sprite = new PIXI.Sprite(img);
          sprite.position.set(187, 15);
          this.stage.addChild(sprite);

          this.aisleList = [];
          for (let ypos of AISLE_YPOS_LIST) {
            let aisle = new Aisle();
            aisle.position.set(0, ypos);
            this.stage.addChild(aisle.sprite);
            this.aisleList.push(aisle);
          }
          this.player = new Player(this.controls);
          this.addThing(this.player);

          let guy = new SuitGuy(this.aisleList[1]);
          this.addThing(guy);

          this.ledSign = new LEDSign();
          this.ledSign.position.set(8, 0);
          this.addThing(this.ledSign);

          this.ledSign.addMessage("HELLO WORLD");
          this.ledSign.addMessage("THIS IS ANOTHER THING", {
            separator: " *** "
          });
        }

        addThing(thing) {
          this.things.push(thing);
          if (thing.spawn) thing.spawn(this);
        }

        removeThing(thing) {
          let i = this.things.indexOf(thing);
          if (i != -1) {
            /*this.things[i] = this.things[this.things.length-1];
              this.things.pop();*/
            this.things.splice(i, 1);
            if (thing.despawn) thing.despawn();
          }
        }

        getStage() {
          return this.stage;
        }

        get width() {
          return this.background.width;
        }

        get height() {
          return this.background.height;
        }

        update(dt) {
          this.timer += dt;

          let n = 0;
          while (n < this.things.length) {
            let thing = this.things[n];
            if (thing.update && thing.update(dt) === false) {
              this.removeThing(thing);
            } else {
              n++;
            }
          }
        }

        isDone() {
          return false;
        }
      }

      module.exports = GameScreen;
    }, { "./aisle": 2, "./ledsign": 5, "./player": 9, "./process": 10, "./resource": 11, "./sprites": 12, "./suitguy": 13 }], 5: [function (require, module, exports) {
      /* officetemper - A game about temp work
       * Copyright (C) 2017  Peter Rogers
       *
       * This program is free software: you can redistribute it and/or modify
       * it under the terms of the GNU General Public License as published by
       * the Free Software Foundation, either version 3 of the License, or
       * (at your option) any later version.
       *
       * This program is distributed in the hope that it will be useful,
       * but WITHOUT ANY WARRANTY; without even the implied warranty of
       * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
       * GNU General Public License for more details.
       *
       * You should have received a copy of the GNU General Public License
       * along with this program.  If not, see <http://www.gnu.org/licenses/>.
       */

      const Thing = require("./thing");
      const Resource = require('./resource');

      class LEDSign extends Thing {
        constructor() {
          super();
          this.scrollSpeed = 10;
          this.sprite = new PIXI.Container();

          let img = Resource.getImage(Resource.OFFICE, 'office_sign');
          this.bg = new PIXI.Sprite(img);
          this.bg.anchor.set(0, 0);
          this.sprite.addChild(this.bg);

          this.textSprites = [];

          this.textContainer = new PIXI.Container();
          this.textContainer.position.set(6, 4.25);
          this.sprite.addChild(this.textContainer);
        }

        spawn(screen) {
          screen.stage.addChild(this.sprite);
        }

        update(dt) {
          // Note that the graphics clipping mask is given in global/screen
          // coordinates. (ie after scaling)
          // TODO - optimize this so that the clipping mask is only updated
          // when the bounds actually change
          let rect = this.bg.getBounds();
          let scale = rect.width / this.bg.width;

          this.textContainer.mask = new PIXI.Graphics().drawRect(rect.x + scale * 4, rect.y, rect.width - scale * 9, rect.height);

          // Messages constantly scroll to the left
          for (let text of this.textContainer.children) {
            text.position.x -= this.scrollSpeed * dt;
          }
          // Remove elements as they scroll off the display
          let first = this.textContainer.children[0];
          if (first && first.position.x + first.width < 0) {
            this.textContainer.removeChild(first);
          }
        }

        addMessage(msg, opts) {
          let separator = opts && opts.separator || ' ';

          if (this.textContainer.children.length > 0) {
            msg = separator + msg;
          }
          let text = new PIXI.extras.BitmapText(msg, {
            font: {
              'name': 'ledfont',
              'size': 6
            }
          });
          // Append the message to the end of the list
          for (let other of this.textContainer.children) {
            text.position.x += other.width;
          }
          this.textContainer.addChild(text);
        }
      }

      module.exports = LEDSign;
    }, { "./resource": 11, "./thing": 14 }], 6: [function (require, module, exports) {
      /* officetemper - A game about temp work
       * Copyright (C) 2017  Peter Rogers
       *
       * This program is free software: you can redistribute it and/or modify
       * it under the terms of the GNU General Public License as published by
       * the Free Software Foundation, either version 3 of the License, or
       * (at your option) any later version.
       *
       * This program is distributed in the hope that it will be useful,
       * but WITHOUT ANY WARRANTY; without even the implied warranty of
       * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
       * GNU General Public License for more details.
       *
       * You should have received a copy of the GNU General Public License
       * along with this program.  If not, see <http://www.gnu.org/licenses/>.
       */

      var Resource = require("./resource");

      class LoadingScreen {
        constructor() {
          this.mediaPath = "media";
          this.doneLoading = false;
          this.stage = new PIXI.Container();
        }

        start() {
          PIXI.loader.defaultQueryString = "nocache=" + new Date().getTime();

          for (let key in Resource.ALL) {
            /* Store the resources by path (minus the base path) */
            let path = this.mediaPath + "/" + Resource.ALL[key];
            PIXI.loader.add(Resource.ALL[key], path);
            console.log(Resource.ALL[key] + " => " + path);
          }
          PIXI.loader.onError.add(arg => {
            console.log("ERROR: " + arg);
          });

          PIXI.loader.onLoad.add(arg => {
            console.log("PROGRESS: " + (arg.progress | 0));
          });
          PIXI.loader.load(() => {
            console.log("Done loading assets");
            /*let snd = PIXI.loader.resources[Resource.SND_TEST];
              PIXI.sound.play(Resource.SND_TEST);*/
            this.doneLoading = true;
          });
        }

        update() {
          // Show loading progress
          // ...
        }

        getStage() {
          return this.stage;
        }

        isDone() {
          return this.doneLoading;
        }
      };

      module.exports = LoadingScreen;
    }, { "./resource": 11 }], 7: [function (require, module, exports) {
      /* officetemper - A game about temp work
       * Copyright (C) 2017  Peter Rogers
       *
       * This program is free software: you can redistribute it and/or modify
       * it under the terms of the GNU General Public License as published by
       * the Free Software Foundation, either version 3 of the License, or
       * (at your option) any later version.
       *
       * This program is distributed in the hope that it will be useful,
       * but WITHOUT ANY WARRANTY; without even the implied warranty of
       * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
       * GNU General Public License for more details.
       *
       * You should have received a copy of the GNU General Public License
       * along with this program.  If not, see <http://www.gnu.org/licenses/>.
       */

      /* Imports */

      /* Note: once imported the PIXI module is available everywhere */
      //require("pixi.js");
      /* This patches the standard PIXI module with a loader that understands 
       * sound files. It also adds an API under PIXI.sound.* */
      //require("pixi-sound");

      const LoadingScreen = require("./loading");
      const TitleScreen = require("./title");
      const Controls = require("./controls");
      const GameScreen = require("./game");
      const NextScreen = require('./next');

      const GAME_WIDTH = 250;
      const GAME_HEIGHT = 150;
      const ASPECT_RATIO = GAME_WIDTH / GAME_HEIGHT;

      var app = null;

      class Application {
        constructor(container) {
          if (typeof container == 'string') {
            container = document.getElementById(container);
          }
          this.container = container;
          this.pixiApp = null;
          this.screens = {};
          this.screen = null;
          this.controls = new Controls.KeyboardControls();
          this.controls.attachKeyboardEvents();
        }

        start() {
          // TODO - enable the ticker?
          //PIXI.ticker.shared.autoStart = false;
          //PIXI.ticker.shared.stop();

          PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
          //PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

          //let rect = getLargestRect(this.container, ASPECT_RATIO);

          let rect = this.container.getBoundingClientRect();
          let scale = Math.min(rect.width / GAME_WIDTH, rect.height / GAME_HEIGHT);

          //scale = Math.floor(scale);
          //if (scale <= 0) scale = 1;

          this.pixiApp = new PIXI.Application({
            width: GAME_WIDTH * scale,
            height: GAME_HEIGHT * scale,
            backgroundColor: 0xe0e0a0,
            //resolution: 1,
            //preserveDrawingBuffer: true,
            //antialias: false,
            forceCanvas: true,
            roundPixels: true
          });
          this.pixiApp.renderer.plugins.interaction.destroy();
          this.container.appendChild(this.pixiApp.view);

          this.pixiApp.stage.scale.set(scale);

          this.screens = {
            loading: new LoadingScreen(),
            title: new TitleScreen(this.controls),
            game: new GameScreen(this.controls),
            nextLevel: new NextScreen()
          };
          this.screen = this.screens.loading;
          this.screen.start();

          // Start the ticker, which will drive the render loop
          PIXI.ticker.shared.add(() => {
            this.update(PIXI.ticker.shared.elapsedMS / 1000.0);
          });

          // Have the ticker start/stop when the window receives/loses
          // focus. (eg player clicks to another tab/returns)
          window.addEventListener('focus', () => {
            PIXI.ticker.shared.start();
          });
          window.addEventListener('blur', () => {
            PIXI.ticker.shared.stop();
          });
        }

        // Called from the render loop (which is handled via PIXI ticker)
        update(dt) {
          if (this.screen) {
            this.screen.update(dt);
            this.pixiApp.render();
          }
          this.controls.update(dt);

          // If the screen is done, figure out where to go next
          if (this.screen.isDone()) {
            if (this.screen === this.screens.loading) {
              this.setScreen(this.screens.title);
            } else if (this.screen === this.screens.title) {
              this.setScreen(this.screens.nextLevel);
            } else if (this.screen === this.screens.nextLevel) {
              this.setScreen(this.screens.game);
            } else {
              this.setScreen(null);
            }
          }
        }

        setScreen(screen) {
          // TODO - eventually handle screen transitions here
          this.screen = screen;
          if (this.screen) {
            this.screen.start();
            this.pixiApp.stage.removeChildren();
            this.pixiApp.stage.addChild(this.screen.getStage());
          }
        }

        resize() {
          let rect = get_largest_rect(this.container, ASPECT_RATIO);
          this.pixiApp.renderer.resize(rect.width, rect.height);
        }
      }

      /* Returns the largest rectangle that will fit into the given container 
       * element. */
      function getLargestRect(container, aspect) {
        let rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          throw Error("invalid container size");
        }

        // Maintain the aspect ratio when sizing the render view
        let width = Math.round(rect.height * aspect);
        let height = rect.height;

        if (width > rect.width) {
          width = rect.width;
          height = Math.round(rect.height / aspect);
        }
        return {
          width: width,
          height: height
        };
      }

      module.exports = {};

      /* Call to start the game */
      module.exports.start = function (container) {
        app = new Application(container);
        app.start();
      };

      /* Call to have the canvas automatically resize to fill it's container */
      module.exports.resize = function () {
        app.resize();
      };
    }, { "./controls": 3, "./game": 4, "./loading": 6, "./next": 8, "./title": 15 }], 8: [function (require, module, exports) {
      /* officetemper - A game about temp work
       * Copyright (C) 2017  Peter Rogers
       *
       * This program is free software: you can redistribute it and/or modify
       * it under the terms of the GNU General Public License as published by
       * the Free Software Foundation, either version 3 of the License, or
       * (at your option) any later version.
       *
       * This program is distributed in the hope that it will be useful,
       * but WITHOUT ANY WARRANTY; without even the implied warranty of
       * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
       * GNU General Public License for more details.
       *
       * You should have received a copy of the GNU General Public License
       * along with this program.  If not, see <http://www.gnu.org/licenses/>.
       */

      const { getSprite } = require('./resource');

      class NextScreen {
        constructor() {
          this.timer = 3;
        }

        start() {
          // TODO - lots of magic numbers here
          this.stage = new PIXI.Container();
          this.stage.scale.set(1.5);

          let bg = new PIXI.Sprite(getSprite('colours_black'));
          bg.scale.set(6, 4);
          this.stage.addChild(bg);

          let portrait = new PIXI.Sprite(getSprite('portraits_terrance'));
          portrait.position.set(65, 30);
          this.stage.addChild(portrait);

          let msg = 'GET READY!';
          let text = new PIXI.extras.BitmapText(msg, {
            font: {
              'name': 'boxybold',
              'size': 6
            }
          });
          text.position.set(53, 62);
          this.stage.addChild(text);
        }

        update(dt) {
          this.timer -= dt;
        }

        getStage() {
          return this.stage;
        }

        isDone() {
          return this.timer <= 0;
        }
      }

      module.exports = NextScreen;
    }, { "./resource": 11 }], 9: [function (require, module, exports) {
      /* officetemper - A game about temp work
       * Copyright (C) 2017  Peter Rogers
       *
       * This program is free software: you can redistribute it and/or modify
       * it under the terms of the GNU General Public License as published by
       * the Free Software Foundation, either version 3 of the License, or
       * (at your option) any later version.
       *
       * This program is distributed in the hope that it will be useful,
       * but WITHOUT ANY WARRANTY; without even the implied warranty of
       * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
       * GNU General Public License for more details.
       *
       * You should have received a copy of the GNU General Public License
       * along with this program.  If not, see <http://www.gnu.org/licenses/>.
       */

      const Tween = require("./tween");
      const Sprites = require("./sprites");
      const Thing = require("./thing");
      const { getSprite } = require('./resource');

      // Returns the stack size associated with the given search time
      function getStackSize(time) {
        // The (cabinet) search times associated with each charge level
        let chargeLevels = [['large', 1], ['medium', 0.5], ['small', 0]];

        for (let arg of chargeLevels) {
          let name = arg[0];
          let cutoff = arg[1];
          if (time >= cutoff) return name;
        }
        return chargeLevels[chargeLevels.length - 1];
      }

      class Player extends Thing {
        constructor(controls) {
          super();
          this.sprite = new PIXI.Sprite(getSprite('terrance_idle'));
          this.sprite.anchor.set(0.5, 1);
          this.state = Player.STATES.IDLE;
          this.lastState = -1;
          this.aisle = 0;
          this.timer = 0;
          this.chargeTime = 0;
          this.nextAisle = -1;
          this.controls = controls;
          this.gameScreen = null;
        }

        spawn(gameScreen) {
          this.gameScreen = gameScreen;
          this.aisle = 0;
          this.getAisle().cabinetArea.addChild(this.sprite);
        }

        getAisle() {
          return this.gameScreen.getAisle(this.aisle);
        }

        setImage(name) {
          this.sprite.texture = getSprite('terrance_' + name);
        }

        update(dt) {
          let stateChanged = this.lastState != this.state;
          this.lastState = this.state;
          if (this.state == Player.STATES.IDLE) {
            if (stateChanged) {
              // Done searching
              this.sprite.scale.x = 1;
              this.sprite.position.x = 0;
              this.setImage('idle');
            }

            // Handle up/down movement
            this.nextAisle = -1;
            if (this.controls.up.justPressed && this.aisle > 0) {
              this.nextAisle = this.aisle - 1;
            }
            if (this.controls.down.justPressed && this.aisle < this.gameScreen.getNumAisles() - 1) {
              this.nextAisle = this.aisle + 1;
            }
            if (this.nextAisle != -1) {
              let dy = this.gameScreen.getAisle(this.aisle).getY() - this.gameScreen.getAisle(this.nextAisle).getY();
              let tween = new Tween(this.sprite, {
                src: [this.sprite.position.x, this.sprite.position.y],
                dest: [this.sprite.position.x, this.sprite.position.y - dy],
                duration: 0.1,
                interpolate: Tween.Linear
              });

              // Wait in a trap state until the tweening between isles
              // is finished.
              this.state = Player.STATES.MOVING;

              tween.on('done', () => {
                this.getAisle().cabinetArea.removeChild(this.sprite);
                this.aisle = this.nextAisle;
                this.getAisle().cabinetArea.addChild(this.sprite);
                this.state = Player.STATES.IDLE;
                this.sprite.position.y = 0;
              });

              this.gameScreen.addThing(tween);

              return;
            }
            // Handle searching
            if (this.controls.right.justPressed) {
              this.state = Player.STATES.SEARCHING;
            }
          } else if (this.state == Player.STATES.MOVING) {
            // The player is moving between aisles
            // Nothing to do
          } else if (this.state == Player.STATES.SEARCHING) {
            if (stateChanged) {
              // The player is searching the filing cabinet
              this.setImage('search');
              this.sprite.position.x = 14;
              this.sprite.position.y = 0;
              this.sprite.scale.x = -1;
              // Open the cabinet
              this.getAisle().cabinet.setOpen(true);
              // Have the player searching for a minimum amount of time
              this.timer = 0.15;
              this.chargeTime = 0;
            }

            if (this.timer <= 0) {
              // Start the "speed charge" after an initial delay
              this.chargeTime += dt;
            }

            this.timer -= dt;
            if (!this.controls.right.held && this.timer <= 0) {
              // Close the cabinet and throw the paper
              this.getAisle().cabinet.setOpen(false);

              // The speed relates to how long the player searched the
              // cabinet.
              let speed = 100; // TODO - fix this
              let paper = new Sprites.PaperStack(this.getAisle(), {
                size: 'small',
                velx: -speed
              });
              paper.sprite.position.set(this.getAisle().width, 0);
              this.gameScreen.addThing(paper);
              this.state = Player.STATES.THROWING;
            }
          } else if (this.state == Player.STATES.THROWING) {
            if (stateChanged) {
              // Show the throw pose for a bit before going idle again
              this.timer = 0.1;
              this.setImage('throw');
              this.sprite.position.x = 0;
              this.sprite.scale.x = 1;
            }
            this.timer -= dt;
            if (this.timer <= 0) {
              this.state = Player.STATES.IDLE;
            }
          }
        }
      };

      Player.STATES = {
        IDLE: 0,
        MOVING: 1,
        SEARCHING: 2,
        THROWING: 3
      };

      module.exports = Player;
    }, { "./resource": 11, "./sprites": 12, "./thing": 14, "./tween": 16 }], 10: [function (require, module, exports) {
      /* officetemper - A game about temp work
       * Copyright (C) 2017  Peter Rogers
       *
       * This program is free software: you can redistribute it and/or modify
       * it under the terms of the GNU General Public License as published by
       * the Free Software Foundation, either version 3 of the License, or
       * (at your option) any later version.
       *
       * This program is distributed in the hope that it will be useful,
       * but WITHOUT ANY WARRANTY; without even the implied warranty of
       * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
       * GNU General Public License for more details.
       *
       * You should have received a copy of the GNU General Public License
       * along with this program.  If not, see <http://www.gnu.org/licenses/>.
       */

      class Process {
        constructor() {
          this.callbacks = [];
        }

        // Adds a callback function or object (which defines an update method)
        // This returns a promise that resolves when the callback is finished.
        // (ie returns false on some future call)
        add(func) {
          return new Promise(resolve => {
            this.callbacks.push(dt => {
              // The callback will run on every call to update (below),
              // until it returns false - where we remove it from the
              // callback list.
              let result = null;

              if (func.update) result = func.update(dt);else result = func(dt);

              if (!result) {
                resolve();
                return false;
              }
              return true;
            });
          });
        }

        // Returns a promise that resolves after the given amount of (game) time
        // has elapsed.
        wait(delay) {
          let timer = delay;
          return this.add(function (dt) {
            timer -= dt;
            return timer > 0;
          });
        }

        update(dt) {
          let n = 0;
          while (n < this.callbacks.length) {
            let func = this.callbacks[n];
            if (!func(dt)) {
              let last = this.callbacks.pop();
              if (func !== last) this.callbacks[n] = last;
            } else {
              n++;
            }
          }
        }
      }

      module.exports = Process;
    }, {}], 11: [function (require, module, exports) {

      module.exports = {};

      module.exports.ALL = {
        SPRITES: 'sprites.json',
        TITLE: 'title-text.png',
        OFFICE: 'office.json',
        GAME_FONT: 'boxybold.fnt',
        LED_FONT: 'ledfont.fnt',
        SND_TEST: 'powerup1.wav'
      };

      for (let key in module.exports.ALL) {
        module.exports[key] = module.exports.ALL[key];
      }

      function getSprite(name) {
        return getImage(module.exports.SPRITES, name);
      }

      function getImage(sheet, name) {
        let img = null;
        let res = PIXI.loader.resources[sheet];
        if (!res) {
          console.log("WARNING: cannot find sheet " + sheet);
          return null;
        }

        if (name === undefined) {
          img = res.texture;
        } else {
          img = res.textures[name];
        }
        if (!img) {
          console.log("WARNING: can't find texture: " + sheet + "/" + name);
        }
        return img;
      }

      module.exports.getImage = getImage;
      module.exports.getSprite = getSprite;
    }, {}], 12: [function (require, module, exports) {
      /* officetemper - A game about temp work
       * Copyright (C) 2017  Peter Rogers
       *
       * This program is free software: you can redistribute it and/or modify
       * it under the terms of the GNU General Public License as published by
       * the Free Software Foundation, either version 3 of the License, or
       * (at your option) any later version.
       *
       * This program is distributed in the hope that it will be useful,
       * but WITHOUT ANY WARRANTY; without even the implied warranty of
       * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
       * GNU General Public License for more details.
       *
       * You should have received a copy of the GNU General Public License
       * along with this program.  If not, see <http://www.gnu.org/licenses/>.
       */

      const Sprites = require("./sprites");
      const Thing = require("./thing");
      const { getSprite } = require('./resource');

      class Cabinet extends Thing {
        constructor() {
          super();
          this.sprite = new PIXI.Sprite();
          this.sprite.anchor.set(0, 1);
          this.setOpen(false);
        }

        setOpen(b) {
          let img = null;
          if (b) img = 'cabinet_open';else img = 'cabinet_closed';
          this.sprite.texture = getSprite(img);
        }

        spawn(gameScreen) {}
      }

      class Scenery extends Thing {
        constructor(frames, fps) {
          super();
          this.frames = frames;
          this.fps = fps;
          this.frame = 0;
          this.sprite = new PIXI.Sprite(this.frames[0]);
          this.sprite.anchor.set(0.5, 0.5);
        }

        spawn(screen) {
          this.screen = screen;
        }

        update(dt) {
          if ((this.frame | 0) > this.frames.length - 1) {
            this.screen.removeThing(this);
          } else {
            this.sprite.texture = this.frames[this.frame | 0];
            this.frame += this.fps * dt;
          }
        }
      }

      class PaperStack extends Thing {
        constructor(aisle, args) {
          super();
          this.aisle = aisle;
          this.velx = args && args.velx || 100;
          this.size = args && args.size || 'small';
          this.falling = false;
          this.exploding = false;
          this.vely = 0;
          this.frame = 0;

          this.sprite = new PIXI.Sprite(getSprite('paperstack_' + this.size));
          this.sprite.anchor.set(0, 1);
        }

        spawn(gameScreen) {
          this.gameScreen = gameScreen;
          this.aisle.addPaper(this);
        }

        despawn() {
          this.aisle.removePaper(this);
        }

        areSigned() {
          return this.velx > 0;
        }

        update(dt) {
          if (this.falling) {
            // Falling off the screen
            this.vely += 300 * dt;
            this.sprite.position.x += this.velx * dt / 2;
            this.sprite.position.y += this.vely * dt;

            if (this.sprite.position.y > this.aisle.counter.height) {
              let explosion = new Scenery([getSprite('explode_1'), getSprite('explode_2')], 10);
              this.gameScreen.addThing(explosion);
              this.aisle.onCounter.addChild(explosion.sprite);
              explosion.sprite.position.set(this.sprite.position.x + 5, this.sprite.position.y - 5);
              //this.gameScreen.removeThing(this);
              return false;
            }
          } else {
            // Sliding across the counter top
            let rightEdge = this.sprite.position.x + this.sprite.width;
            this.sprite.position.x += dt * this.velx;
            if (this.velx > 0 && rightEdge > this.gameScreen.getAisleEnd()) {
              // Fell off the counter top (being returned to the player)
              this.falling = true;
            }
            if (this.velx < 0 && rightEdge < 0) {
              // Fell off the counter (being thrown by the player)
              //this.gameScreen.removeThing(this);
              return false;
            }
          }
        }
      }

      module.exports = {
        PaperStack: PaperStack,
        Cabinet: Cabinet
      };
    }, { "./resource": 11, "./sprites": 12, "./thing": 14 }], 13: [function (require, module, exports) {
      /* officetemper - A game about temp work
       * Copyright (C) 2017  Peter Rogers
       *
       * This program is free software: you can redistribute it and/or modify
       * it under the terms of the GNU General Public License as published by
       * the Free Software Foundation, either version 3 of the License, or
       * (at your option) any later version.
       *
       * This program is distributed in the hope that it will be useful,
       * but WITHOUT ANY WARRANTY; without even the implied warranty of
       * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
       * GNU General Public License for more details.
       *
       * You should have received a copy of the GNU General Public License
       * along with this program.  If not, see <http://www.gnu.org/licenses/>.
       */

      const Sprites = require("./sprites");
      const Thing = require('./thing');
      const Resource = require('./resource');
      const { getImage } = require('./resource');

      class SuitGuy extends Thing {
        constructor(aisle) {
          super();
          let img = getImage(Resource.SPRITES, 'bluesuit_idle');
          this.sprite = new PIXI.Sprite(img);
          this.sprite.anchor.set(0.5, 1);
          this.speechContainer = new PIXI.Container();
          this.speechContainer.position.set(15, -34);
          this.sprite.addChild(this.speechContainer);

          this.state = SuitGuy.STATES.PAUSING;
          this.lastState = -1;
          this.aisle = aisle;
          this.speed = 25;
          this.frame = 0;
          this.timer = 0;
          // How many fist pumps to do before advancing
          this.fistCount = 3;
          // Pause time between raising/lowering the fist
          this.fistDelay = 0.25;
        }

        spawn(gameScreen) {
          this.aisle.behindCounter.addChild(this.sprite);
          this.gameScreen = gameScreen;
          this.sprite.position.x = 30;
        }

        setImage(name) {
          let img = getImage(Resource.SPRITES, 'bluesuit_' + name);
          this.sprite.texture = img;
        }

        update(dt) {
          let stateChanged = this.state !== this.lastState;
          this.lastState = this.state;

          // Check for any papers to sign
          for (let paper of this.aisle.papers) {
            if (paper.areSigned() || paper.sprite.x > this.sprite.x || paper.sprite.x + paper.sprite.width < this.sprite.x) {
              continue;
            }
            if (this.state === SuitGuy.STATES.ADVANCING || this.state === SuitGuy.STATES.PAUSING) {
              // Sign the papers
              this.gameScreen.removeThing(paper);
              this.state = SuitGuy.STATES.SLIDING_BACK;
              // Move out in front of the counter (only the top-half
              // of the body is rendered), so we can sign the papers
              // on the desk.
              this.setImage('sign1');
              this.aisle.inFrontCounter.addChild(this.sprite);
            } else {
              // Bounce the paper to the floor
              paper.velx *= -1;
              paper.falling = true;
            }
            return;
          }

          if (this.state === SuitGuy.STATES.ADVANCING) {
            // Move forward a little bit
            if (stateChanged) {
              this.setImage('fist');
              this.timer = 0.5;
            }
            this.sprite.position.x += dt * this.speed;
            // Have the suit guy bounce up and down to emulate walking.
            // These numbers are largely magic and just chosen to look good.
            this.sprite.position.y = -0.75 * Math.abs(Math.sin(this.timer * 10));
            this.timer -= dt;
            if (this.timer <= 0) {
              this.sprite.position.y = 0;
              this.state = SuitGuy.STATES.PAUSING;
            }
          } else if (this.state === SuitGuy.STATES.SIGNING) {
            if (stateChanged) {
              this.timer = 0.5;
              this.frame = 0;
              // Suit guy talks money while signing
              let img = getImage(Resource.SPRITES, 'speech_dollars');
              let balloon = new PIXI.Sprite(img);
              balloon.anchor.set(0.5, 1);
              this.speechContainer.addChild(balloon);
              this.counter = 8;
            }
            this.timer -= dt;
            if (this.timer <= 0) {
              this.frame = (this.frame + 1) % 2;
              if (this.frame === 0) this.setImage('sign2');else if (this.frame === 1) this.setImage('sign3');
              this.timer = 0.15;
            }
            this.counter -= dt;
            if (this.counter <= 0) {
              // Done signing the paper. Throw it back and continue
              // advancing.
              this.state = SuitGuy.STATES.ADVANCING;
              this.aisle.behindCounter.addChild(this.sprite);
              this.speechContainer.removeChildren();

              let speed = 50;
              let paper = new Sprites.PaperStack(this.aisle, {
                size: 'small',
                velx: speed
              });
              paper.sprite.position.set(this.sprite.position.x + 1, 0);
              this.gameScreen.addThing(paper);
            }
          } else if (this.state === SuitGuy.STATES.SLIDING_BACK) {
            if (stateChanged) {
              this.timer = 0.5;
            }
            this.timer -= dt;
            this.sprite.position.x -= 75 * dt;
            if (this.timer <= 0) {
              this.state = SuitGuy.STATES.SIGNING;
            }
            if (this.sprite.position.x < 0) {
              // Knocked off the screen
              // ...
            }
          } else if (this.state === SuitGuy.STATES.PAUSING) {
            if (stateChanged) {
              this.timer = 0;
              this.frame = 0;
              this.counter = this.fistCount;;
            }

            this.timer -= dt;
            if (this.timer <= 0) {
              this.timer = this.fistDelay;
              if (this.frame == 0) {
                this.setImage('throw');
                this.frame++;
              } else if (this.frame == 1) {
                this.setImage('fist');
                this.frame++;
              } else {
                this.frame = 0;
                this.counter--;
                if (this.counter <= 0) {
                  this.state = SuitGuy.STATES.ADVANCING;
                }
              }
            }
          }
        }
      }

      SuitGuy.STATES = {
        ADVANCING: 0,
        SIGNING: 1,
        SLIDING_BACK: 2,
        PAUSING: 3
      };

      module.exports = SuitGuy;
    }, { "./resource": 11, "./sprites": 12, "./thing": 14 }], 14: [function (require, module, exports) {
      /* officetemper - A game about temp work
       * Copyright (C) 2017  Peter Rogers
       *
       * This program is free software: you can redistribute it and/or modify
       * it under the terms of the GNU General Public License as published by
       * the Free Software Foundation, either version 3 of the License, or
       * (at your option) any later version.
       *
       * This program is distributed in the hope that it will be useful,
       * but WITHOUT ANY WARRANTY; without even the implied warranty of
       * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
       * GNU General Public License for more details.
       *
       * You should have received a copy of the GNU General Public License
       * along with this program.  If not, see <http://www.gnu.org/licenses/>.
       */

      const EventEmitter = require('events');

      class Thing {
        constructor() {
          this.events = new EventEmitter();
        }

        get on() {
          return this.events.on.bind(this.events);
        }

        update(dt) {}

        spawn(screen) {}

        despawn() {
          if (this.sprite && this.sprite.parent) {
            this.sprite.parent.removeChild(this.sprite);
          }
        }

        get width() {
          if (this.sprite) return this.sprite.width;
          return 0;
        }

        get height() {
          if (this.sprite) return this.sprite.height;
          return 0;
        }

        get position() {
          return this.sprite.position;
        }
      }

      module.exports = Thing;
    }, { "events": 1 }], 15: [function (require, module, exports) {
      /* officetemper - A game about temp work
       * Copyright (C) 2017  Peter Rogers
       *
       * This program is free software: you can redistribute it and/or modify
       * it under the terms of the GNU General Public License as published by
       * the Free Software Foundation, either version 3 of the License, or
       * (at your option) any later version.
       *
       * This program is distributed in the hope that it will be useful,
       * but WITHOUT ANY WARRANTY; without even the implied warranty of
       * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
       * GNU General Public License for more details.
       *
       * You should have received a copy of the GNU General Public License
       * along with this program.  If not, see <http://www.gnu.org/licenses/>.
       */

      const Tween = require("./tween");
      const Process = require("./process");
      const Resource = require("./resource");
      const { getImage, getSprite } = require('./resource');

      const SCALE = 1.3;

      class TitleScreen {
        constructor(controls) {
          this.stage = new PIXI.Container();
          this.process = new Process();
          this.controls = controls;
          this.done = false;
        }

        start() {
          let img = getImage(Resource.TITLE);
          img.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
          img.baseTexture.dispose();

          this.timer = 0;
          this.terranceX = 210;
          this.terranceY = 110;
          this.terrance = new PIXI.Sprite(getSprite("terrance_idle"));
          this.terrance.anchor.set(0.5, 1);
          this.terrance.scale.set(SCALE);
          this.terrance.position.set(this.terranceX + 50, this.terranceY);
          this.stage.addChild(this.terrance);

          this.sweaterX = 40;
          this.sweaterY = 110;
          this.sweaterGuy = new PIXI.Sprite(getSprite("sweater_drink1"));
          this.sweaterGuy.anchor.set(0.5, 1);
          this.sweaterGuy.scale.set(SCALE);
          this.sweaterGuy.position.set(this.sweaterX - 50, this.sweaterY);
          this.stage.addChild(this.sweaterGuy);

          this.title = new PIXI.Sprite(getImage(Resource.TITLE));
          this.title.scale.set(0.2);
          this.title.anchor.set(0.5, 0.5);
          this.title.position.set(125, 80);

          // Use a promise chain to handle the intro animation
          Promise.resolve().then(() => {
            return this.process.wait(1);
          }).then(() => {
            this.stage.addChild(this.title);
          }).then(() => {
            return this.process.wait(1);
          }).then(() => {
            // Have terrance and sweater guy slide in from the left and right
            let t1 = new Tween(this.terrance, {
              src: [this.terranceX + 50, this.terranceY],
              dest: [this.terranceX, this.terranceY],
              interpolate: Tween.LinearSlowdown,
              duration: 0.5
            });
            let t2 = new Tween(this.sweaterGuy, {
              src: [this.sweaterX - 50, this.sweaterY],
              dest: [this.sweaterX, this.sweaterY],
              interpolate: Tween.LinearSlowdown,
              duration: 0.5
            });
            return [this.process.add(t1), this.process.add(t2)];
          }).then(() => {
            return this.process.wait(1);
          }).then(() => {
            console.log("DONE");

            // Terrance gets frazzled, sweater guy drinks coffee
            this.process.add(dt => {
              let x = this.terranceX + 0.5 * Math.cos(this.timer * 75);
              let y = this.terranceY + 0.25 * Math.sin(this.timer * 50);
              this.terrance.texture = getSprite("terrance_frazzled");
              this.terrance.position.set(x, y);
              return true;
            });

            let frame = 0;
            this.process.add(dt => {
              let frames = [getSprite("sweater_drink2"), getSprite("sweater_drink1"), getSprite("sweater_drink1")];
              frame += 0.75 * dt;
              this.sweaterGuy.texture = frames[(frame | 0) % frames.length];
              return true;
            });
          }).then(() => {
            let x1 = -10;
            let x2 = 14;
            let x3 = 0;
            const paperPos = [[x1, -15, -3], [x2, -15, 6], [x3, 0, 5], [x2 + 10, 0, -5], [x1 - 1, -15, -10.5], [x2, -15, -1], [x3, 0, -2], [x1, -15, -17.5], [x3 + 1, 0, -10]];

            let papers = [];

            let lst = [];
            for (let n = 0; n < paperPos.length; n++) {
              let img = getSprite("paperstack_medium");
              let paper = new PIXI.Sprite(img);
              paper.scale.set(SCALE);
              paper.anchor.set(0.5, 1);

              this.stage.addChild(paper);

              let dx = paperPos[n][0];
              //let dy = paperPos[n][1];
              let stop = paperPos[n][2];
              let tween = new Tween(paper, {
                src: [this.terranceX + dx, stop * 5],
                dest: [this.terranceX + dx, this.terranceY + stop],
                interpolate: Tween.Linear,
                duration: 0.5 - stop * 0.008
              });
              lst.push(this.process.add(tween));
            }
            return lst;
          });
        }

        update(dt) {
          this.process.update(dt);
          this.timer += dt;

          if (this.controls.primary.justPressed) {
            this.done = true;
          }
        }

        getStage() {
          return this.stage;
        }

        isDone() {
          return this.done;
        }
      }

      module.exports = TitleScreen;
    }, { "./process": 10, "./resource": 11, "./tween": 16 }], 16: [function (require, module, exports) {
      /* officetemper - A game about temp work
       * Copyright (C) 2017  Peter Rogers
       *
       * This program is free software: you can redistribute it and/or modify
       * it under the terms of the GNU General Public License as published by
       * the Free Software Foundation, either version 3 of the License, or
       * (at your option) any later version.
       *
       * This program is distributed in the hope that it will be useful,
       * but WITHOUT ANY WARRANTY; without even the implied warranty of
       * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
       * GNU General Public License for more details.
       *
       * You should have received a copy of the GNU General Public License
       * along with this program.  If not, see <http://www.gnu.org/licenses/>.
       */

      const Thing = require('./thing');

      class Tween extends Thing {
        constructor(target, args) {
          super();
          this.target = target;
          this.src = args.src;
          this.dest = args.dest;
          this.interpolate = args.interpolate;
          this.duration = args.duration;
          this.elapsed = 0;
        }

        update(dt) {
          this.elapsed += dt;
          let param = this.elapsed / this.duration;
          if (param > 1) param = 1;

          let pos = this.interpolate(param, this.src, this.dest);
          this.target.position.set(pos[0], pos[1]);

          if (param >= 1) {
            this.events.emit('done');
            return false;
          }
          return true;
        }
      }

      Tween.Linear = function (param, src, dest) {
        //param = Math.pow(param, 0.25);
        let dx = param * (dest[0] - src[0]);
        let dy = param * (dest[1] - src[1]);
        return [src[0] + dx, src[1] + dy];
      };

      Tween.LinearSlowdown = function (param, src, dest) {
        param = Math.pow(param, 0.25);
        let dx = param * (dest[0] - src[0]);
        let dy = param * (dest[1] - src[1]);
        return [src[0] + dx, src[1] + dy];
      };

      module.exports = Tween;
    }, { "./thing": 14 }] }, {}, [7])(7);
});