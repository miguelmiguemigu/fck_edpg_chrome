(() => {
  "use strict";

  /* =====================================================
     BLOCK LIST (SINGLE SOURCE OF TRUTH)
  ===================================================== */
  const BLOCKED_EVENTS = new Set([
    // visibility
    "visibilitychange",
    "webkitvisibilitychange",

    // focus
    "blur",
    "focus",
    "focusin",
    "focusout",

    // page lifecycle
    "pagehide",
    "pageshow",
    "freeze",
    "resume",
    "beforeunload",

    // clipboard
    "copy",
    "cut",
    "paste",

    // selection
    "selectionchange",
    "selectstart",

    // mouse
    "mouseenter",
    "mouseleave",
    "mouseover",
    "mouseout",
    "mousemove",

    // pointer
    "pointerenter",
    "pointerleave",
    "pointerover",
    "pointerout",
    "pointermove",

    // keyboard inference
    "keydown",
    "keyup"
  ]);

  /* =====================================================
     HELPERS
  ===================================================== */
  const kill = e => {
    try {
      e.stopImmediatePropagation();
      e.preventDefault();
    } catch {}
    return false;
  };

  const define = (obj, prop, value) => {
    try {
      Object.defineProperty(obj, prop, {
        get: () => value,
        set: () => {},
        configurable: false
      });
    } catch {}
  };

  /* =====================================================
     VISIBILITY + FOCUS LIES
  ===================================================== */
  define(document, "hidden", false);
  define(document, "visibilityState", "visible");
  define(document, "webkitHidden", false);
  define(document, "webkitVisibilityState", "visible");

  document.hasFocus = () => true;

  /* =====================================================
     INLINE HANDLER NEUTRALIZATION
  ===================================================== */
  [
    // visibility
    "onvisibilitychange",
    "onwebkitvisibilitychange",

    // focus
    "onfocus",
    "onblur",
    "onfocusin",
    "onfocusout",

    // clipboard
    "oncopy",
    "oncut",
    "onpaste",

    // mouse / pointer
    "onmouseenter",
    "onmouseleave",
    "onmouseover",
    "onmouseout",
    "onmousemove",
    "onpointerenter",
    "onpointerleave",
    "onpointermove",

    // selection
    "onselectionchange"
  ].forEach(prop => {
    define(window, prop, null);
    define(document, prop, null);
    define(Element.prototype, prop, null);
    define(HTMLElement.prototype, prop, null);
  });

  /* =====================================================
     EVENT LISTENER SABOTAGE (CRITICAL)
     Stops element-level listeners (mouseenter/focusin/etc)
  ===================================================== */
  const realAdd = EventTarget.prototype.addEventListener;
  const realRemove = EventTarget.prototype.removeEventListener;

  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (BLOCKED_EVENTS.has(type)) return;
    return realAdd.call(this, type, listener, options);
  };

  EventTarget.prototype.removeEventListener = function(type, listener, options) {
    if (BLOCKED_EVENTS.has(type)) return;
    return realRemove.call(this, type, listener, options);
  };

  /* =====================================================
     CAPTURE-PHASE TERMINATION
     (for bubbling events like focusin/focusout)
  ===================================================== */
  BLOCKED_EVENTS.forEach(evt => {
    window.addEventListener(evt, kill, true);
    document.addEventListener(evt, kill, true);
  });

  /* =====================================================
     CLIPBOARD API BLOCK
  ===================================================== */
  if (navigator.clipboard) {
    const deny = () =>
      Promise.reject(new DOMException("Blocked", "NotAllowedError"));
    try {
      navigator.clipboard.readText = deny;
      navigator.clipboard.writeText = deny;
      navigator.clipboard.read = deny;
      navigator.clipboard.write = deny;
    } catch {}
  }

})();
