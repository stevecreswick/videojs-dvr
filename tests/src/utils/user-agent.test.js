import method from './../../../src/utils/user-agent';

describe('User Agent', () => {
  let doc;
  beforeEach(() => {
    doc = { a: 'b' };
  });

  describe('#domIsReal', () => {
    it('returns true if the window document is the same as the document', () => {
      const win = {
        document: doc
      };

      const userAgent = method(win, doc);

      expect(userAgent.domIsReal).toBe(true);
    });

    it('returns true if the window document is different than the document', () => {
      const win = {
        document: { virtual: 'dom' }
      };

      const userAgent = method(win, doc);

      expect(userAgent.domIsReal).toBe(false);
    });
  });

  describe('#isTouchEnabled', () => {
    it('returns true if dom is real and ontouchstart exists', () => {
      const win = {
        document: doc,
        ontouchstart: true
      };

      const userAgent = method(win, doc);
      expect(userAgent.isTouchEnabled).toBe(true);
    });

    it('returns true if maxTouchPoints exists in the navigator', () => {
      const win = {
        document: doc,
        navigator: {
          maxTouchPoints: true
        }
      };

      const userAgent = method(win, doc);
      expect(userAgent.isTouchEnabled).toBe(true);
    });

    it('returns true if DocumentTouch exists', () => {
      class DocumentTouch {}
      const doc = new DocumentTouch();

      const win = {
        document: doc,
        DocumentTouch
      };

      const userAgent = method(win, doc);
      expect(userAgent.isTouchEnabled).toBe(true);
    });

    it('returns false if the window is missing touch enabled methods', () => {
      const win = {
        document: doc
      };

      const userAgent = method(win, doc);

      expect(userAgent.isTouchEnabled).toBe(false);
    });
  });

  describe('#isEdge', () => {
    it('returns true if the user agent string contains edge', () => {
      const win = {
        document: doc,
        navigator: {
          userAgent: 'Edge'
        }
      };

      const userAgent = method(win, doc);

      expect(userAgent.isEdge).toBe(true);
    });

    it('returns true if the user agent does not contain edge', () => {
      const win = {
        document: doc,
        navigator: {
          userAgent: 'Chrome'
        }
      };

      const userAgent = method(win, doc);

      expect(userAgent.isEdge).toBe(false);
    });
  });

  describe('#isChrome', () => {
    it.each([['Chrome'], ['CriOS']])('returns true if the user agent string contains %p', agent => {
      const win = {
        document: doc,
        navigator: {
          userAgent: agent
        }
      };

      const userAgent = method(win, doc);

      expect(userAgent.isChrome).toBe(true);
    });

    it('returns false if the user agent does not contain Chrome or CriOS', () => {
      const win = {
        document: doc,
        navigator: {
          userAgent: 'Safari'
        }
      };

      const userAgent = method(win, doc);

      expect(userAgent.isChrome).toBe(false);
    });
  });

  describe('#isSafari', () => {
    it('returns true if contains Safari and not other browser', () => {
      const win = {
        document: doc,
        navigator: {
          userAgent: 'Safari'
        }
      };

      const userAgent = method(win, doc);

      expect(userAgent.isSafari).toBe(true);
    });

    it('returns false if the user agent does not contain Safari', () => {
      const win = {
        document: doc,
        navigator: {
          userAgent: 'Chrome'
        }
      };

      const userAgent = method(win, doc);

      expect(userAgent.isSafari).toBe(false);
    });
  });

  describe('#isAndroid', () => {
    it('return true if the user agent contains Android', () => {
      const win = {
        document: doc,
        navigator: {
          userAgent: 'Android'
        }
      };

      const userAgent = method(win, doc);

      expect(userAgent.isAndroid).toBe(true);
    });

    it('return false if the user agent does not contain Android', () => {
      const win = {
        document: doc,
        navigator: {
          userAgent: 'Safari'
        }
      };

      const userAgent = method(win, doc);

      expect(userAgent.isAndroid).toBe(false);
    });
  });

  describe('#isIpod', () => {
    it('returns true if the user agent contains iPod', () => {
      const win = {
        document: doc,
        navigator: {
          userAgent: 'iPod'
        }
      };

      const userAgent = method(win, doc);

      expect(userAgent.isIpod).toBe(true);
    });

    it('returns true if the user agent does not contain iPod', () => {
      const win = {
        document: doc,
        navigator: {
          userAgent: 'iPhone'
        }
      };

      const userAgent = method(win, doc);

      expect(userAgent.isIpod).toBe(false);
    });
  });

  describe('#isIpad', () => {
    it('returns true if iPad is in the user agent', () => {
      const win = {
        document: doc,
        navigator: {
          userAgent: 'iPad'
        }
      };

      const userAgent = method(win, doc);

      expect(userAgent.isIpad).toBe(true);
    });

    it('returns true if browser is Safari and touch is enabled', () => {
      const win = {
        document: doc,
        ontouchstart: true,
        navigator: {
          userAgent: 'Safari'
        }
      };

      const userAgent = method(win, doc);

      expect(userAgent.isIpad).toBe(true);
    });

    it('should return false if not Safari and no iPad or Safari in user agent', () => {
      const win = {
        document: doc,
        navigator: {
          userAgent: 'Chrome'
        }
      };

      const userAgent = method(win, doc);

      expect(userAgent.isIpad).toBe(false);
    });
  });

  describe('#isIphone', () => {
    it('returns true if user agent contains iPhone and not iPad', () => {
      const win = {
        document: doc,
        navigator: {
          userAgent: 'iphone'
        }
      };

      const userAgent = method(win, doc);

      expect(userAgent.isIphone).toBe(true);
    });

    it('returns false if also passes test for iPad', () => {
      const win = {
        document: doc,
        ontouchstart: true,
        navigator: {
          userAgent: 'iphone Safari'
        }
      };

      const userAgent = method(win, doc);

      expect(userAgent.isIphone).toBe(false);
    });

    it('returns false if iPhone missing in user agent', () => {
      const win = {
        document: doc,
        navigator: {
          userAgent: 'Nope'
        }
      };

      const userAgent = method(win, doc);

      expect(userAgent.isIphone).toBe(false);
    });
  });

  describe('#isIos', () => {
    const iOsUserAgents = [['iPad'], ['iPhone'], ['iPod']];
    it.each(iOsUserAgents)('returns true for any iOs User Agent', agent => {
      const win = {
        document: doc,
        navigator: {
          userAgent: agent
        }
      };

      const userAgent = method(win, doc);

      expect(userAgent.isIos).toBe(true);
    });
  });

  describe('#isMobile', () => {
    const mobileUserAgents = [['iPad'], ['iPhone'], ['iPod'], ['Android']];

    it.each(mobileUserAgents)('returns true for a mobile user agent', agent => {
      const win = {
        document: doc,
        navigator: {
          userAgent: agent
        }
      };

      const userAgent = method(win, doc);

      expect(userAgent.isMobile).toBe(true);
    });
  });
});
