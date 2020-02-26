"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var cloneSvg=function(e){return e.cloneNode(!0)},isLocal=function(){return"file:"===window.location.protocol},svgCache=new Map,requestQueue={},queueRequest=function(e,t){requestQueue[e]=requestQueue[e]||[],requestQueue[e].push(t)},processRequestQueue=function(e){for(var t=function(t,r){setTimeout((function(){if(Array.isArray(requestQueue[e])){var r=svgCache.get(e),n=requestQueue[e][t];(r instanceof SVGSVGElement||r instanceof HTMLElement)&&n(null,cloneSvg(r)),r instanceof Error&&n(r),t===requestQueue[e].length-1&&delete requestQueue[e]}}),0)},r=0,n=requestQueue[e].length;r<n;r++)t(r)},loadSvg=function(e,t){if(svgCache.has(e)){var r=svgCache.get(e);return r instanceof SVGSVGElement||r instanceof HTMLElement?void t(null,cloneSvg(r)):r instanceof Error?void t(r):void queueRequest(e,t)}svgCache.set(e,void 0),queueRequest(e,t);var n=new XMLHttpRequest;n.onreadystatechange=function(){try{if(4===n.readyState){if(404===n.status||null===n.responseXML)throw new Error(isLocal()?"Note: SVG injection ajax calls do not work locally without adjusting security setting in your browser. Or consider using a local webserver.":"Unable to load SVG file: "+e);if(!(200===n.status||isLocal()&&0===n.status))throw new Error("There was a problem injecting the SVG: "+n.status+" "+n.statusText);n.responseXML instanceof Document&&n.responseXML.documentElement&&svgCache.set(e,n.responseXML.documentElement),processRequestQueue(e)}}catch(t){svgCache.set(e,t),processRequestQueue(e)}},n.open("GET",e),n.overrideMimeType&&n.overrideMimeType("text/xml"),n.send()},idCounter=0,uniqueId=function(){return++idCounter},__spreadArrays=function(){for(var e=0,t=0,r=arguments.length;t<r;t++)e+=arguments[t].length;var n=Array(e),i=0;for(t=0;t<r;t++)for(var s=arguments[t],a=0,o=s.length;a<o;a++,i++)n[i]=s[a];return n},injectedElements=[],ranScripts={},svgNamespace="http://www.w3.org/2000/svg",xlinkNamespace="http://www.w3.org/1999/xlink",injectElement=function(e,t,r,n,i){var s=e.getAttribute("data-src")||e.getAttribute("src");if(s){if(-1!==injectedElements.indexOf(e))return injectedElements.splice(injectedElements.indexOf(e),1),void(e=null);injectedElements.push(e),e.setAttribute("src",""),loadSvg(s,(function(a,o){if(!o)return injectedElements.splice(injectedElements.indexOf(e),1),e=null,void i(a);var l=e.getAttribute("id");l&&o.setAttribute("id",l);var u=e.getAttribute("title");u&&o.setAttribute("title",u);var c=e.getAttribute("width");c&&o.setAttribute("width",c);var f=e.getAttribute("height");f&&o.setAttribute("height",f);var d=Array.from(new Set(__spreadArrays((o.getAttribute("class")||"").split(" "),["injected-svg"],(e.getAttribute("class")||"").split(" ")))).join(" ").trim();o.setAttribute("class",d);var v=e.getAttribute("style");v&&o.setAttribute("style",v),o.setAttribute("data-src",s);var p=[].filter.call(e.attributes,(function(e){return/^data-\w[\w-]*$/.test(e.name)}));if(Array.prototype.forEach.call(p,(function(e){e.name&&e.value&&o.setAttribute(e.name,e.value)})),r){var h,g,m,A,b={clipPath:["clip-path"],"color-profile":["color-profile"],cursor:["cursor"],filter:["filter"],linearGradient:["fill","stroke"],marker:["marker","marker-start","marker-mid","marker-end"],mask:["mask"],path:[],pattern:["fill","stroke"],radialGradient:["fill","stroke"]};Object.keys(b).forEach((function(e){g=b[e];for(var t=function(e,t){var r;A=(m=h[e].id)+"-"+uniqueId(),Array.prototype.forEach.call(g,(function(e){for(var t=0,n=(r=o.querySelectorAll("["+e+'*="'+m+'"]')).length;t<n;t++){var i=r[t].getAttribute(e);i&&!i.match(new RegExp("url\\(#"+m+"\\)"))||r[t].setAttribute(e,"url(#"+A+")")}}));for(var n=o.querySelectorAll("[*|href]"),i=[],s=0,a=n.length;s<a;s++){var l=n[s].getAttributeNS(xlinkNamespace,"href");l&&l.toString()==="#"+h[e].id&&i.push(n[s])}for(var u=0,c=i.length;u<c;u++)i[u].setAttributeNS(xlinkNamespace,"href","#"+A);h[e].id=A},r=0,n=(h=o.querySelectorAll(e+"[id]")).length;r<n;r++)t(r)}))}o.removeAttribute("xmlns:a");for(var w,y,E=o.querySelectorAll("script"),S=[],j=0,q=E.length;j<q;j++)(y=E[j].getAttribute("type"))&&"application/ecmascript"!==y&&"application/javascript"!==y&&"text/javascript"!==y||((w=E[j].innerText||E[j].textContent)&&S.push(w),o.removeChild(E[j]));if(S.length>0&&("always"===t||"once"===t&&!ranScripts[s])){for(var x=0,k=S.length;x<k;x++)new Function(S[x])(window);ranScripts[s]=!0}var C=o.querySelectorAll("style");Array.prototype.forEach.call(C,(function(e){e.textContent+=""})),o.setAttribute("xmlns",svgNamespace),o.setAttribute("xmlns:xlink",xlinkNamespace),n(o),e.parentNode&&e.parentNode.replaceChild(o,e),injectedElements.splice(injectedElements.indexOf(e),1),e=null,i(null,o)}))}else i(new Error("Attempted to inject a file with a non-svg extension: "+s))},SVGInjector=function(e,t){var r=void 0===t?{}:t,n=r.afterAll,i=void 0===n?function(){}:n,s=r.afterEach,a=void 0===s?function(){}:s,o=r.beforeEach,l=void 0===o?function(){}:o,u=r.evalScripts,c=void 0===u?"never":u,f=r.renumerateIRIElements,d=void 0===f||f;if(e&&"length"in e)for(var v=0,p=0,h=e.length;p<h;p++)injectElement(e[p],c,d,l,(function(t,r){a(t,r),e&&"length"in e&&e.length===++v&&i(v)}));else e?injectElement(e,c,d,l,(function(t,r){a(t,r),i(1),e=null})):i(0)};exports.SVGInjector=SVGInjector;
//# sourceMappingURL=svg-injector.cjs.production.js.map