import document from 'global/document';
import window from 'global/window';
import videojs from 'video.js';
import getUserAgent from './utils/user-agent';

const userAgent = getUserAgent(window, document);
const { isMobile } = userAgent;

const DEFAULT_START_TIME = 0;
const DEFAULT_TIME_LIVE = 60 * 60;

const DEFAULT_DVR_OPTIONS = {
  startTime: DEFAULT_START_TIME,
  timeLive: DEFAULT_TIME_LIVE
};

let timeLive = DEFAULT_START_TIME;
let customTime = DEFAULT_TIME_LIVE;

const Button = videojs.getComponent('Button');
const Component = videojs.getComponent('Component');
const ProgressControl = videojs.getComponent('ProgressControl');
const SeekBar = ProgressControl.getComponent('SeekBar');
const PlayProgressBar = ProgressControl.getComponent('PlayProgressBar');
const MouseTimeDisplay = videojs.getComponent('MouseTimeDisplay');
const LoadProgressBar = ProgressControl.getComponent('LoadProgressBar');

// get the percent width of a time compared to the total end
const percentify = function(time, end) {
  const percent = time / end || 0;

  return `${(percent >= 1 ? 1 : percent) * 100}%`;
};

/**
 * Button to seek forward to the current time.
 */
class LiveButton extends Button {
  /**
   * Creates an instance of this class.
   * @param {object<Player>} player The Video.js `Player` object that this class should be attached to.
   * @param {object} options An object containing options for the button.
   */
  constructor(player, options) {
    super(player, options);
    this.el().innerHTML = '<span class="liveText">LIVE</span>';

    if (!player.paused()) {
      this.addClass('onair');
    }
  }

  /**
   * Builds the default DOM `className`.
   * @returns {string} The DOM `className` for this object.
   */
  buildCSSClass() {
    return `vjs-live-button ${super.buildCSSClass()}`;
  }

  /**
   * Handles a button click.
   * @param {EventTarget~Event} event The event that caused this function to be called.
   */
  handleClick() {
    // takes event param
    const currentTime = this.player_.seekable().end(0);

    this.player_.currentTime(currentTime);
    this.player_.play();
  }
}

LoadProgressBar.prototype.update = function() {
  // takes event param
  const buffered = this.player_.buffered();
  const duration = this.player_.duration();
  const bufferedEnd = this.player_.bufferedEnd();
  const children = this.partEls_;

  // update the width of the progress bar
  if (percentify(bufferedEnd, duration) !== 0) {
    this.el_.style.width = percentify(bufferedEnd, duration);
  }

  // add child elements to represent the individual buffered time ranges
  for (let i = 0; i < buffered.length; i++) {
    const start = buffered.start(i);
    const end = buffered.end(i);
    let part = children[i];

    if (!part) {
      part = this.el_.appendChild(document.createElement('div'));
      children[i] = part;
    }

    if (percentify(start, bufferedEnd) !== 0) {
      // set the percent based on the width of the progress bar (bufferedEnd)
      part.style.left = percentify(start, bufferedEnd);
    }

    if (percentify(end - start, bufferedEnd) !== 0) {
      part.style.width = percentify(end - start, bufferedEnd);
    }
  }

  // remove unused buffered range elements
  for (let i = children.length; i > buffered.length; i--) {
    this.el_.removeChild(children[i - 1]);
  }

  children.length = buffered.length;
};

SeekBar.prototype.update_ = function(currentTime, percent) {
  const duration = this.player_.duration();
  const time = this.player_.scrubbing() ? this.player_.getCache().currentTime : this.player_.currentTime();

  this.el_.setAttribute('aria-valuenow', (percent * 100).toFixed(2));

  if (duration !== Number.POSITIVE_INFINITY) {
    this.el_.setAttribute('aria-valuetext', `-${videojs.formatTime(duration - time, duration)}`);
  }

  // Update the `PlayProgressBar`.
  this.bar.update(videojs.dom.getBoundingClientRect(this.el_), percent);
};

SeekBar.prototype.handleMouseMove = function(event) {
  const calculate = 1 - this.calculateDistance(event);

  let newTime2 = this.player_.seekable().end(0) - calculate * customTime;

  // Don't let video end while scrubbing.
  if (newTime2 === this.player_.duration()) {
    newTime2 = newTime2 - 0.1;
  }

  // Set new time (tell player to seek to new time)
  this.player_.currentTime(newTime2);

  this.update();
};

PlayProgressBar.prototype.update = function update(seekBarRect, seekBarPoint) {
  const duration = this.player_.duration();

  // If there is an existing rAF ID, cancel it so we don't over-queue.
  if (this.rafId_) {
    this.cancelAnimationFrame(this.rafId_);
  }

  this.rafId_ = this.requestAnimationFrame(() => {
    const time = this.player_.scrubbing() ? this.player_.getCache().currentTime : this.player_.currentTime();

    const content = videojs.formatTime(duration - time, duration);

    // timeTooltip is not added on mobile devices
    if (!isMobile && seekBarPoint !== 0 && duration !== Number.POSITIVE_INFINITY) {
      this.getChild('timeTooltip').update(seekBarRect, seekBarPoint, `-${content}`);
    }
  });
};

MouseTimeDisplay.prototype.update = function update(seekBarRect, seekBarPoint) {
  // If there is an existing rAF ID, cancel it so we don't over-queue.
  if (this.rafId_) {
    this.cancelAnimationFrame(this.rafId_);
  }

  this.rafId_ = this.requestAnimationFrame(() => {
    const content2 = videojs.formatTime(customTime - seekBarPoint * customTime, customTime);

    this.el_.style.left = `${seekBarRect.width * seekBarPoint}px`;

    // timeTooltip is not added on mobile devices
    if (!isMobile && seekBarPoint !== 0 && this.player_.duration() !== Number.POSITIVE_INFINITY) {
      this.getChild('timeTooltip').update(seekBarRect, seekBarPoint, `-${content2}`);
    }
  });
};

/**
 * Initializes DVR when the player sends a ready event
 * @param {object<Player>} player A Video.js player object.
 * @param {object} options
 */
const onPlayerReady = player => {
  player.addClass('vjs-dvr');

  player.controlBar.addClass('vjs-dvr-control-bar');

  const Slider = player.controlBar.progressControl.seekBar.__proto__;

  Slider.__proto__.update = function update() {
    if (!this.el_) {
      return;
    }

    let progress;

    progress =
      this.name_ === 'VolumeBar'
        ? this.getPercent()
        : 1 - (this.player_.duration() - this.player_.currentTime()) / customTime;

    const bar = this.bar;

    if (!bar) {
      return;
    }

    // Protect against no duration and other division issues
    if (typeof progress !== 'number' || progress !== progress || progress < 0 || progress === Infinity) {
      progress = 0;
    }

    if (progress > 1) {
      progress = 1;
    }

    // Convert to a percentage for setting
    const percentage = `${(progress * 100).toFixed(2)}%`;
    const style = bar.el().style;

    if (progress !== 0) {
      if (this.vertical()) {
        style.height = percentage;
      } else {
        style.width = percentage;
      }
    }

    return progress;
  };

  if (player.controlBar.progressControl) {
    player.controlBar.progressControl.addClass('vjs-dvr-progress-control');
  }

  player.controlBar.liveButton = player.controlBar.addChild('liveButton');

  player.controlBar.el().insertBefore(player.controlBar.liveButton.el(), player.controlBar.progressControl.el());
};

/**
 * Initializes DVR when the player sends a ready event
 * @param {object<Player>} player A Video.js player object.
 * @param {object} event
 */
const onTimeUpdate = player => {
  const time = player.seekable();

  if (!time || !time.length) {
    return;
  }

  if (time.end(0) - player.currentTime() < 20) {
    player.controlBar.liveButton.addClass('onair');
  } else {
    player.controlBar.liveButton.removeClass('onair');
  }

  player.duration(player.seekable().end(0));

  if (!timeLive) {
    timeLive = customTime = player.seekable().end(0);
  }
};

/**
 * Adds dvr capability to videojs player
 * @param {object} options
 */
const dvr = function(options = {}) {
  this.on('timeupdate', e => {
    onTimeUpdate(this, e);
  });

  this.on('pause', () => {
    this.controlBar.liveButton.removeClass('onair');
  });

  this.ready(() => {
    onPlayerReady(this, videojs.mergeOptions(DEFAULT_DVR_OPTIONS, options));
  });
};

Component.registerComponent('LiveButton', LiveButton);

videojs.registerPlugin('dvr', dvr);

export default dvr;
