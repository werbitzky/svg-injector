(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.SVGInjector = {}));
}(this, (function (exports) { 'use strict';

    var cloneSvg = function cloneSvg(sourceSvg) {
      return sourceSvg.cloneNode(true);
    };

    var isLocal = function isLocal() {
      return window.location.protocol === 'file:';
    };

    var svgCache = new Map();

    var requestQueue = {};
    var queueRequest = function queueRequest(url, callback) {
      requestQueue[url] = requestQueue[url] || [];
      requestQueue[url].push(callback);
    };
    var processRequestQueue = function processRequestQueue(url) {
      var _loop_1 = function _loop_1(i, len) {
        setTimeout(function () {
          if (Array.isArray(requestQueue[url])) {
            var cacheValue = svgCache.get(url);
            var callback = requestQueue[url][i];

            if (cacheValue instanceof SVGSVGElement || cacheValue instanceof HTMLElement) {
              callback(null, cloneSvg(cacheValue));
            }

            if (cacheValue instanceof Error) {
              callback(cacheValue);
            }

            if (i === requestQueue[url].length - 1) {
              delete requestQueue[url];
            }
          }
        }, 0);
      };

      for (var i = 0, len = requestQueue[url].length; i < len; i++) {
        _loop_1(i);
      }
    };

    var loadSvg = function loadSvg(url, callback) {
      if (svgCache.has(url)) {
        var cacheValue = svgCache.get(url);

        if (cacheValue instanceof SVGSVGElement || cacheValue instanceof HTMLElement) {
          callback(null, cloneSvg(cacheValue));
          return;
        }

        if (cacheValue instanceof Error) {
          callback(cacheValue);
          return;
        }

        queueRequest(url, callback);
        return;
      }

      svgCache.set(url, undefined);
      queueRequest(url, callback);
      var httpRequest = new XMLHttpRequest();

      httpRequest.onreadystatechange = function () {
        try {
          if (httpRequest.readyState === 4) {
            if (httpRequest.status === 404 || httpRequest.responseXML === null) {
              throw new Error(isLocal() ? 'Note: SVG injection ajax calls do not work locally without adjusting security setting in your browser. Or consider using a local webserver.' : 'Unable to load SVG file: ' + url);
            }

            if (httpRequest.status === 200 || isLocal() && httpRequest.status === 0) {
              if (httpRequest.responseXML instanceof Document) {
                if (httpRequest.responseXML.documentElement) {
                  svgCache.set(url, httpRequest.responseXML.documentElement);
                }
              }

              processRequestQueue(url);
            } else {
              throw new Error('There was a problem injecting the SVG: ' + httpRequest.status + ' ' + httpRequest.statusText);
            }
          }
        } catch (error) {
          svgCache.set(url, error);
          processRequestQueue(url);
        }
      };

      httpRequest.open('GET', url);

      if (httpRequest.overrideMimeType) {
        httpRequest.overrideMimeType('text/xml');
      }

      httpRequest.send();
    };

    var idCounter = 0;

    var uniqueId = function uniqueId() {
      return ++idCounter;
    };

    var __spreadArrays = undefined && undefined.__spreadArrays || function () {
      for (var s = 0, i = 0, il = arguments.length; i < il; i++) {
        s += arguments[i].length;
      }

      for (var r = Array(s), k = 0, i = 0; i < il; i++) {
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) {
          r[k] = a[j];
        }
      }

      return r;
    };
    var injectedElements = [];
    var ranScripts = {};
    var svgNamespace = 'http://www.w3.org/2000/svg';
    var xlinkNamespace = 'http://www.w3.org/1999/xlink';

    var injectElement = function injectElement(el, evalScripts, renumerateIRIElements, beforeEach, callback) {
      var imgUrl = el.getAttribute('data-src') || el.getAttribute('src');

      if (!imgUrl) {
        callback(new Error('Attempted to inject a file with a non-svg extension: ' + imgUrl));
        return;
      }

      if (injectedElements.indexOf(el) !== -1) {
        injectedElements.splice(injectedElements.indexOf(el), 1);
        el = null;
        return;
      }

      injectedElements.push(el);
      el.setAttribute('src', '');
      loadSvg(imgUrl, function (error, svg) {
        if (!svg) {
          injectedElements.splice(injectedElements.indexOf(el), 1);
          el = null;
          callback(error);
          return;
        }

        var imgId = el.getAttribute('id');

        if (imgId) {
          svg.setAttribute('id', imgId);
        }

        var imgTitle = el.getAttribute('title');

        if (imgTitle) {
          svg.setAttribute('title', imgTitle);
        }

        var imgWidth = el.getAttribute('width');

        if (imgWidth) {
          svg.setAttribute('width', imgWidth);
        }

        var imgHeight = el.getAttribute('height');

        if (imgHeight) {
          svg.setAttribute('height', imgHeight);
        }

        var mergedClasses = Array.from(new Set(__spreadArrays((svg.getAttribute('class') || '').split(' '), ['injected-svg'], (el.getAttribute('class') || '').split(' ')))).join(' ').trim();
        svg.setAttribute('class', mergedClasses);
        var imgStyle = el.getAttribute('style');

        if (imgStyle) {
          svg.setAttribute('style', imgStyle);
        }

        svg.setAttribute('data-src', imgUrl);
        var imgData = [].filter.call(el.attributes, function (at) {
          return /^data-\w[\w-]*$/.test(at.name);
        });
        Array.prototype.forEach.call(imgData, function (dataAttr) {
          if (dataAttr.name && dataAttr.value) {
            svg.setAttribute(dataAttr.name, dataAttr.value);
          }
        });

        if (renumerateIRIElements) {
          var iriElementsAndProperties_1 = {
            clipPath: ['clip-path'],
            'color-profile': ['color-profile'],
            cursor: ['cursor'],
            filter: ['filter'],
            linearGradient: ['fill', 'stroke'],
            marker: ['marker', 'marker-start', 'marker-mid', 'marker-end'],
            mask: ['mask'],
            path: [],
            pattern: ['fill', 'stroke'],
            radialGradient: ['fill', 'stroke']
          };
          var element_1;
          var elements_1;
          var properties_1;
          var currentId_1;
          var newId_1;
          Object.keys(iriElementsAndProperties_1).forEach(function (key) {
            element_1 = key;
            properties_1 = iriElementsAndProperties_1[key];
            elements_1 = svg.querySelectorAll(element_1 + '[id]');

            var _loop_1 = function _loop_1(a, elementsLen) {
              currentId_1 = elements_1[a].id;
              newId_1 = currentId_1 + '-' + uniqueId();
              var referencingElements;
              Array.prototype.forEach.call(properties_1, function (property) {
                referencingElements = svg.querySelectorAll('[' + property + '*="' + currentId_1 + '"]');

                for (var b = 0, referencingElementLen = referencingElements.length; b < referencingElementLen; b++) {
                  var attrValue = referencingElements[b].getAttribute(property);

                  if (attrValue && !attrValue.match(new RegExp('url\\(#' + currentId_1 + '\\)'))) {
                    continue;
                  }

                  referencingElements[b].setAttribute(property, 'url(#' + newId_1 + ')');
                }
              });
              var allLinks = svg.querySelectorAll('[*|href]');
              var links = [];

              for (var c = 0, allLinksLen = allLinks.length; c < allLinksLen; c++) {
                var href = allLinks[c].getAttributeNS(xlinkNamespace, 'href');

                if (href && href.toString() === '#' + elements_1[a].id) {
                  links.push(allLinks[c]);
                }
              }

              for (var d = 0, linksLen = links.length; d < linksLen; d++) {
                links[d].setAttributeNS(xlinkNamespace, 'href', '#' + newId_1);
              }

              elements_1[a].id = newId_1;
            };

            for (var a = 0, elementsLen = elements_1.length; a < elementsLen; a++) {
              _loop_1(a);
            }
          });
        }

        svg.removeAttribute('xmlns:a');
        var scripts = svg.querySelectorAll('script');
        var scriptsToEval = [];
        var script;
        var scriptType;

        for (var i = 0, scriptsLen = scripts.length; i < scriptsLen; i++) {
          scriptType = scripts[i].getAttribute('type');

          if (!scriptType || scriptType === 'application/ecmascript' || scriptType === 'application/javascript' || scriptType === 'text/javascript') {
            script = scripts[i].innerText || scripts[i].textContent;

            if (script) {
              scriptsToEval.push(script);
            }

            svg.removeChild(scripts[i]);
          }
        }

        if (scriptsToEval.length > 0 && (evalScripts === 'always' || evalScripts === 'once' && !ranScripts[imgUrl])) {
          for (var l = 0, scriptsToEvalLen = scriptsToEval.length; l < scriptsToEvalLen; l++) {
            new Function(scriptsToEval[l])(window);
          }

          ranScripts[imgUrl] = true;
        }

        var styleTags = svg.querySelectorAll('style');
        Array.prototype.forEach.call(styleTags, function (styleTag) {
          styleTag.textContent += '';
        });
        svg.setAttribute('xmlns', svgNamespace);
        svg.setAttribute('xmlns:xlink', xlinkNamespace);
        beforeEach(svg);

        if (el.parentNode) {
          el.parentNode.replaceChild(svg, el);
        }

        injectedElements.splice(injectedElements.indexOf(el), 1);
        el = null;
        callback(null, svg);
      });
    };

    var SVGInjector = function SVGInjector(elements, _a) {
      var _b = _a === void 0 ? {} : _a,
          _c = _b.afterAll,
          afterAll = _c === void 0 ? function () {
        return undefined;
      } : _c,
          _d = _b.afterEach,
          afterEach = _d === void 0 ? function () {
        return undefined;
      } : _d,
          _e = _b.beforeEach,
          beforeEach = _e === void 0 ? function () {
        return undefined;
      } : _e,
          _f = _b.evalScripts,
          evalScripts = _f === void 0 ? 'never' : _f,
          _g = _b.renumerateIRIElements,
          renumerateIRIElements = _g === void 0 ? true : _g;

      if (elements && 'length' in elements) {
        var elementsLoaded_1 = 0;

        for (var i = 0, j = elements.length; i < j; i++) {
          injectElement(elements[i], evalScripts, renumerateIRIElements, beforeEach, function (error, svg) {
            afterEach(error, svg);

            if (elements && 'length' in elements && elements.length === ++elementsLoaded_1) {
              afterAll(elementsLoaded_1);
            }
          });
        }
      } else if (elements) {
        injectElement(elements, evalScripts, renumerateIRIElements, beforeEach, function (error, svg) {
          afterEach(error, svg);
          afterAll(1);
          elements = null;
        });
      } else {
        afterAll(0);
      }
    };

    exports.SVGInjector = SVGInjector;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=svg-injector.umd.development.js.map
