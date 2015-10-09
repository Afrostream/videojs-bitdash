/*! videojs-bitdash - v0.0.0 - 2015-10-09
* Copyright (c) 2015 benjipott; Licensed Apache-2.0 */
videojs.Bitdash = videojs.Html5.extend({
  init: function (player, options, ready) {
    videojs.Html5.call(this, player, options, ready);
    var video = document.getElementById('video').getElementsByTagName('video')[0];
    player.trigger('loadedmetadata');
  }
});

videojs.Bitdash.prototype.bitdashPlayer = {};

videojs.Bitdash.extend = function (original, context, key) {
  for (key in context) {
    if (context.hasOwnProperty(key)) {
      if (Object.prototype.toString.call(context[key]) === '[object Object]') {
        original[key] = videojs.Bitdash.extend(original[key] || {}, context[key]);
      }
      else {
        original[key] = context[key];
      }
    }
  }
  return original;
};

videojs.Bitdash.prototype.setSrc = function (src) {
  // Make sure source URL is absolute.
  this.bitdashPlayer.load(src);
};

videojs.Bitdash.prototype.load = function () {
  this.bitdashPlayer.load(this.player().currentSrc());
};


videojs.Bitdash.prototype.dispose = function () {
  this.bitdashPlayer.destroy();
  videojs.Html5.prototype.dispose.call(this);
};

videojs.Bitdash.extractMime = function (filename) {
  var reg = /(\/[^?]+).*/;
  var filePath = filename.match(reg);

  var parts = filePath[1].split('.');
  var type = (parts.length > 1) ? parts.pop() : 'mp4';
  return type;
};

videojs.Bitdash.extractType = function (source) {
  var type = videojs.Bitdash.extractMime(source.src);
  var rtType = {};
  switch (type) {
    case 'm3u8':
      rtType.type = 'application/vnd.apple.mpegurl';
      rtType.format = 'hls';
      break;
    case 'mpd':
      rtType.type = 'application/dash+xml';
      rtType.format = 'dash';
      break;
  }
  return rtType;
};

videojs.Bitdash.prototype.onClick = function (event) {
};

videojs.Bitdash.prototype.createEl = function () {
  var player = this.player_,
    el = player.tag,
    sources = {};
  videojs.Html5.disposeMediaElement(el);

  el = videojs.createEl('div', {
    id: player.id() + '_bitdash_api',
    className: 'vjs-tech'
  });//videojs.Html5.prototype.createEl.call(this);


  // associate the player with the new tag
  el.player = player;

  videojs.insertFirst(el, player.el());

  videojs.obj.each(player.options_.sources, function (key, source) {
    var typeSrc = videojs.Bitdash.extractType(source);
    sources[typeSrc.format] = source.src;
  });

  var conf = {
    key: this.options().key,
    source: sources,
    playback: {
      autoplay: player.options().autoplay,
      muted: player.options().muted,
      audioLanguage: ['fr', 'en'],
      subtitleLanguage: 'fr'
    },
    style: {
      width: '100%',
      height: '100%',
      //aspectratio: '16:9',
      controls: false
    }
  };

  this.bitdashPlayer = new bitdash(el.id).setup(conf);
  this.bitdashPlayer.addEventHandler('onReady', videojs.bind(this, function (data) {
    this.triggerReady();
  }));
  this.bitdashPlayer.addEventHandler('onPlay', videojs.bind(this, this.onPlay));
  this.bitdashPlayer.addEventHandler('onError', videojs.bind(this, this.onError));
  this.bitdashPlayer.addEventHandler('onVolumeChange', videojs.bind(this, this.onVolumeChange));
  this.bitdashPlayer.addEventHandler('onMute', videojs.bind(this, this.onVolumeChange));
  this.bitdashPlayer.addEventHandler('onUnmute', videojs.bind(this, this.onVolumeChange));
  this.bitdashPlayer.addEventHandler('onSeek', videojs.bind(this, this.onSeek));
  this.bitdashPlayer.addEventHandler('onStopBuffering', videojs.bind(this, this.onStopBuffering));
  this.bitdashPlayer.addEventHandler('onFullscreenEnter', videojs.bind(this, this.onFullscreenChange));
  this.bitdashPlayer.addEventHandler('onFullscreenExit', videojs.bind(this, this.onFullscreenChange));
  this.bitdashPlayer.addEventHandler('onPlaybackFinished', videojs.bind(this, this.onEnded));
  this.bitdashPlayer.addEventHandler('onTimeChanged', videojs.bind(this, this.onTimeChanged));
  this.bitdashPlayer.addEventHandler('onVideoPlaybackQualityChange', videojs.bind(this, this.onQualityChange));

  return el;
};

videojs.Bitdash.prototype.onQualityChange = function (e) {
  this.trigger('bitratechange');
};

videojs.Bitdash.prototype.onTimeChanged = function (e) {
  this.trigger('durationchange');
};

videojs.Bitdash.prototype.onFullscreenChange = function (e) {
  this.trigger('fullscreenchange');
};

videojs.Bitdash.prototype.onPlay = function (e) {
  this.trigger('play');
};

videojs.Bitdash.prototype.onError = function (e) {
  this.trigger('error');
};
videojs.Bitdash.prototype.onEnded = function (e) {
  this.trigger('ended');
};
videojs.Bitdash.prototype.onVolumeChange = function (e) {
  this.trigger('volumechange');
};
videojs.Bitdash.prototype.onStopBuffering = function (e) {
  this.trigger('seeked');
};
videojs.Bitdash.prototype.onSeek = function (e) {
  this.trigger('seeking');
};

videojs.Bitdash.prototype.play = function () {
  this.bitdashPlayer.play();
};
videojs.Bitdash.prototype.pause = function () {
  this.bitdashPlayer.pause();
};
videojs.Bitdash.prototype.paused = function () {
  return this.bitdashPlayer.isPaused();
};
videojs.Bitdash.prototype.currentTime = function () {
  return this.bitdashPlayer.getCurrentTime();
};
videojs.Bitdash.prototype.duration = function () {
  return this.bitdashPlayer.getDuration();
};
videojs.Bitdash.prototype.setCurrentTime = function (seconds) {
  this.bitdashPlayer.seek(seconds);
};
videojs.Bitdash.prototype.buffered = function () {
  return this.bitdashPlayer.isStalled();
};

videojs.Bitdash.prototype.volume = function () {
  return this.bitdashPlayer.getVolume() / 100;
};
videojs.Bitdash.prototype.setVolume = function (percentAsDecimal) {
  this.bitdashPlayer.setVolume(percentAsDecimal * 100);
};
videojs.Bitdash.prototype.muted = function () {
  return this.bitdashPlayer.isMuted();
};
videojs.Bitdash.prototype.setMuted = function (muted) {
  if (muted) {
    this.bitdashPlayer.mute();
  } else {
    this.bitdashPlayer.unmute();
  }
};
videojs.Bitdash.prototype.enterFullScreen = function () {
  this.bitdashPlayer.enterFullScreen();
};
videojs.Bitdash.prototype.exitFullScreen = function () {
  this.bitdashPlayer.exitFullScreen();
};
//
//videojs.Bitdash.prototype.poster = function(){ return this.el_.poster; };
//videojs.Bitdash.prototype.setPoster = function(val){ this.el_.poster = val; };
//
//videojs.Bitdash.prototype.preload = function(){ return this.el_.preload; };
//videojs.Bitdash.prototype.setPreload = function(val){ this.el_.preload = val; };
//
//videojs.Bitdash.prototype.autoplay = function(){ return this.el_.autoplay; };
//videojs.Bitdash.prototype.setAutoplay = function(val){ this.el_.autoplay = val; };
//
//videojs.Bitdash.prototype.controls = function(){ return this.el_.controls; };
//videojs.Bitdash.prototype.setControls = function(val){ this.el_.controls = !!val; };
//
//videojs.Bitdash.prototype.loop = function(){ return this.el_.loop; };
//videojs.Bitdash.prototype.setLoop = function(val){ this.el_.loop = val; };
//
//videojs.Bitdash.prototype.error = function(){ return this.el_.error; };
//videojs.Bitdash.prototype.seeking = function(){ return this.el_.seeking; };
//videojs.Bitdash.prototype.seekable = function(){ return this.el_.seekable; };
//videojs.Bitdash.prototype.ended = function(){ return this.el_.ended; };
//videojs.Bitdash.prototype.defaultMuted = function(){ return this.el_.defaultMuted; };
//
//videojs.Bitdash.prototype.playbackRate = function(){ return this.el_.playbackRate; };
//videojs.Bitdash.prototype.setPlaybackRate = function(val){ this.el_.playbackRate = val; };
//
//videojs.Bitdash.prototype.networkState = function(){ return this.el_.networkState; };
//videojs.Bitdash.prototype.readyState = function(){ return this.el_.readyState; };

/**
 * Whether the browser has built-in HLS support.
 */
videojs.Bitdash.supportsNativeHls = (function () {
  var
    video = document.createElement('video'),
    xMpegUrl,
    vndMpeg;

  // native HLS is definitely not supported if HTML5 video isn't
  if (!videojs.Html5.isSupported()) {
    return false;
  }

  xMpegUrl = video.canPlayType('application/x-mpegURL');
  vndMpeg = video.canPlayType('application/vnd.apple.mpegURL');
  return (/probably|maybe/).test(xMpegUrl) ||
    (/probably|maybe/).test(vndMpeg);
})();

videojs.Bitdash.isSupported = function () {
  // Only use the HLS tech if native HLS isn't available
  return !videojs.Bitdash.supportsNativeHls &&
    window.Uint8Array;
};

videojs.Bitdash.canPlaySource = function (srcObj) {
  var mpegurlRE = /^application\/dash\+xml/i;
  return mpegurlRE.test(srcObj.type);
};

videojs.options.techOrder.unshift('bitdash');


// Add Source Handler pattern functions to this tech
videojs.MediaTechController.withSourceHandlers(videojs.Bitdash);

/**
 * The default native source handler.
 * This simply passes the source to the video element. Nothing fancy.
 * @param  {Object} source   The source object
 * @param  {videojs.Flash} tech  The instance of the Flash tech
 */
/*jshint sub:true*/
videojs.Bitdash['nativeSourceHandler'] = {};

/**
 * Check Flash can handle the source natively
 * @param  {Object} source  The source object
 * @return {String}         'probably', 'maybe', or '' (empty string)
 */
videojs.Bitdash['nativeSourceHandler']['canHandleSource'] = function (source) {/*jshint sub:true*/
  return true;
};

/**
 * Pass the source to the flash object
 * Adaptive source handlers will have more complicated workflows before passing
 * video data to the video element
 * @param  {Object} source    The source object
 * @param  {videojs.Flash} tech   The instance of the Flash tech
 */
videojs.Bitdash['nativeSourceHandler']['handleSource'] = function (source, tech) {/*jshint sub:true*/
  tech.setSrc(source);
};

/**
 * Clean up the source handler when disposing the player or switching sources..
 * (no cleanup is needed when supporting the format natively)
 */
videojs.Bitdash['nativeSourceHandler']['dispose'] = function () {/*jshint sub:true*/
};

// Register the native source handler
videojs.Bitdash['registerSourceHandler'](videojs.Bitdash['nativeSourceHandler']);
/*jshint sub:true*/
