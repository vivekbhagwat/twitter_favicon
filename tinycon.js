/*
 * Tinycon - A small library for manipulating the Favicon
 * Tom Moor, http://tommoor.com
 * Copyright (c) 2012 Tom Moor
 * MIT Licensed
 * @version 0.1
*/

(function(){

  var Tinycon = {};
  var currentFavicon = null;
  var originalFavicon = null;
  var originalTitle = document.title;
  var faviconImage = null;
  var canvas = null;
  var options = {};
  var defaults = {
    width: 7,
    height: 9,
    font: '9px Helvetica Neue',
    colour: '#ffffff',
    background: '#000000',
    fallback: true
  };

  var ua = function(browser){
    var agent = navigator.userAgent.toLowerCase();
    return agent.indexOf(browser) !== -1;
  };

  var browser = {
    chrome: ua('chrome'),
    webkit: ua('chrome') || ua('safari'),
    safari: ua('safari') && !ua('chrome'),
    mozilla: ua('mozilla') && !ua('chrome') && !ua('safari')
  };

  // private
  var getFaviconTag = function(){

    var links = document.getElementsByTagName('link');

    for(var i=0; i < links.length; i++) {
      if (links[i].getAttribute('rel') === 'icon') {
        return links[i];
      }
    }

    return false;
  };

  var removeFaviconTag = function(){

    var links = document.getElementsByTagName('link');
    var head = document.getElementsByTagName('head')[0];

    for(var i=0; i < links.length; i++) {
      if (links[i].getAttribute('rel') === 'icon') {
        head.removeChild(links[i]);
      }
    }
  };

  var getCurrentFavicon = function(){

    if (!originalFavicon || !currentFavicon) {
      var tag = getFaviconTag();
      originalFavicon = currentFavicon = tag ? tag.getAttribute('href') : '/favicon.ico';
    }

    return currentFavicon;
  };

  var getCanvas = function (){

    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.width = 16;
      canvas.height = 16;
    }

    return canvas;
  };

  var setFaviconTag = function(url){
    removeFaviconTag();

    var link = document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'icon';
    link.href = url;
    document.getElementsByTagName('head')[0].appendChild(link);
  };

  var log = function(message){
    if (window.console) window.console.log(message);
  };

  var drawFavicon = function(num, colour) {

    // fallback to updating the browser title if unsupported
    if (!getCanvas().getContext || (!browser.chrome && !browser.mozilla)) {
      return updateTitle(num);
    }

    var context = getCanvas().getContext("2d");
    var colour = colour || '#000000';
    var num = num || 0;

    faviconImage = new Image();
    faviconImage.onload = function() {

      // clear canvas
      context.clearRect(0, 0, 16, 16);

      // draw original favicon
      context.drawImage(faviconImage, 0, 0);

      // draw bubble over the top
      if (num > 0) drawBubble(context, num, colour);

      // refresh tag in page
      refreshFavicon();
    };

    faviconImage.src = getCurrentFavicon();
  };

  var updateTitle = function(num) {

    if (options.fallback) {
      if (num > 0) {
        document.title = '('+num+') ' + originalTitle;
      } else {
        document.title = originalTitle;
      }
    }
  };

  var drawBubble = function(context, num, colour) {

    // bubble needs to be larger for double digits
    var len = (num+"").length-1;
    var width = options.width + (6*len);
    var w = 16-width;
    var h = 16-options.height;

    // webkit seems to render fonts lighter than firefox
    context.font = (browser.webkit ? 'bold ' : '') + options.font;
    context.fillStyle = options.background;
    context.strokeStyle = options.background;
    context.lineWidth = 1;

    // bubble
    context.fillRect(w,h,width-1,options.height);

    // rounded left
    context.beginPath();
    context.moveTo(w-0.5,h+1);
    context.lineTo(w-0.5,15);
    context.stroke();

    // rounded right
    context.beginPath();
    context.moveTo(15.5,h+1);
    context.lineTo(15.5,15);
    context.stroke();

    // bottom shadow
    context.beginPath();
    context.strokeStyle = "rgba(0,0,0,0.3)";
    context.moveTo(w,16);
    context.lineTo(15,16);
    context.stroke();

    // number
    context.fillStyle = options.colour;
    context.textAlign = "right";
    context.textBaseline = "top";

    // unfortunately webkit/mozilla are a pixel different in text positioning
    context.fillText(num, 15, browser.webkit ? 6 : 7);
  };

  var refreshFavicon = function(){
    // check support
    if (!getCanvas().getContext) return;

    setFaviconTag(getCanvas().toDataURL());
  };


  // public
  Tinycon.setOptions = function(custom){
    options = {};

    for(var i in defaults){
      options[i] = custom[i] ? custom[i] : defaults[i];
    }
    return this;
  };

  Tinycon.setImage = function(url){
    currentFavicon = url;
    refreshFavicon();
    return this;
  };

  Tinycon.setBubble = function(num, colour){

    // validate
    if(isNaN(num)) return log('Bubble must be a number');

    drawFavicon(num, colour);
    return this;
  };

  Tinycon.reset = function(){
    Tinycon.setImage(originalFavicon);
  };

  Tinycon.setOptions(defaults);
  window.Tinycon = Tinycon;

  var prevCount = 0;
  document.addEventListener("DOMSubtreeModified", function(event){
    var bar = document.getElementsByClassName('new-tweets-bar')[0]
    var curCount = bar ? parseInt(bar.innerText, 10) : 0;
    if (curCount != prevCount) {
      Tinycon.setBubble(curCount < 50 ? curCount : curCount < 100 ? "50+" : "100+");
      prevCount = curCount;
    }
  });
})();
