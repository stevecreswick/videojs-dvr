// Derived from: https://github.com/videojs/video.js/blob/master/src/js/utils/browser.js
import _ from 'lodash';

class UserAgent {
  constructor(win, doc) {
    this._win = win;
    this._doc = doc;
    this._userAgent = _.get(win, 'navigator.userAgent', '');
  }

  // Utils
  get domIsReal() {
    return this._win.document === this._doc;
  }

  get isTouchEnabled() {
    return (
      this.domIsReal &&
      ('ontouchstart' in this._win ||
        _.get(this._win, 'navigator.maxTouchPoints', false) ||
        (_.get(this._win, 'DocumentTouch', false) && this._win.document instanceof _.get(this._win, 'DocumentTouch')))
    );
  }

  // Browsers
  get isEdge() {
    return /Edge/i.test(this._userAgent);
  }

  get isChrome() {
    return !this.isEdge && (/Chrome/i.test(this._userAgent) || /CriOS/i.test(this._userAgent));
  }

  get isSafari() {
    return /Safari/i.test(this._userAgent) && !this.isChrome && !this.isAndroid && !this.isEdge;
  }

  // Devices
  get isAndroid() {
    return /Android/i.test(this._userAgent);
  }

  get isIpod() {
    return /iPod/i.test(this._userAgent);
  }

  get isIpad() {
    return /iPad/i.test(this._userAgent) || (this.isSafari && this.isTouchEnabled);
  }

  get isIphone() {
    return /iPhone/i.test(this._userAgent) && !this.isIpad;
  }

  get isIos() {
    return this.isIpod || this.isIphone || this.isIpad;
  }

  get isMobile() {
    return this.isIos || this.isAndroid;
  }
}

export default (win, doc) => {
  return new UserAgent(win, doc);
};
