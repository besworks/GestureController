export class GestureController {
  static #VALID_EVENTS = Object.freeze([
    'tap', 'hold', 'release', 'move',
    'left', 'right', 'up', 'down'
  ]);

  #threshold;
  #element;
  #holdTime;
  #holdTimeout;
  #swipeState;
  #handlers;

  constructor(options = {}) {
    this.#threshold = options.threshold ?? 5;
    this.#element = options.element ?? document.body;
    this.#holdTime = options.holdTime ?? 600;
    this.#holdTimeout = null;
    this.#handlers = [];
    
    if (options.nodeName) {
      this.#element = options;
    } else {
      if (options.element) this.#element = options.element;
      if (options.threshold) this.#threshold = options.threshold;
      if (options.holdTime) this.#holdTime = options.holdTime;
    }

    this.#initializeEventListeners();
  }

  on(eventType, handler) {
    if (!GestureController.#VALID_EVENTS.includes(eventType)) {
      console.warn('invalid eventType specified ignoring handler:', eventType);
      return;
    }
    
    this.#handlers.push({
      type: eventType,
      handler: handler
    });
  }

  #emit(eventType) {
    this.#handlers.forEach(h => {
      if (h.type === eventType) {
        h.handler.call(null, this.#swipeState);
      }
    });
  }

  #createSwipe(touchEvent) {
    const initialTime = Date.now();
    const rect = this.#element.getBoundingClientRect();
    const x = parseInt(touchEvent.touches[0].clientX);
    const y = parseInt(touchEvent.touches[0].clientY);
    
    this.#holdTimeout = setTimeout(() => {
      this.#emit('hold');
    }, this.#holdTime);
    
    const edge = this.#detectEdge(x, y, rect);
    
    return {
      initialTime,
      start: { x, y },
      end: { x: null, y: null },
      edge,
      angle: null,
      direction: null,
      delta: { x: null, y: null }
    };
  }

  #detectEdge(x, y, rect) {
    const { top, bottom, left, right } = rect;
    const t = this.#threshold;

    if (y - t <= top && x - t <= left) return 'top-left';
    if (y - t <= top && x + t >= right) return 'top-right';
    if (y + t >= bottom && x - t <= left) return 'bottom-left';
    if (y + t >= bottom && x + t >= right) return 'bottom-right';
    if (y - t <= top) return 'top';
    if (y + t >= bottom) return 'bottom';
    if (x - t <= left) return 'left';
    if (x + t >= right) return 'right';
    return null;
  }

  #handleTouchStart = (event) => {
    this.#swipeState = this.#createSwipe(event);
  };

  #handleTouchMove = (event) => {
    clearTimeout(this.#holdTimeout);
    this.#swipeState.end = {
      x: parseInt(event.touches?.[0]?.clientX ?? 0),
      y: parseInt(event.touches?.[0]?.clientY ?? 0)
    };
  };

  #handleTouchEnd = (event) => {
    const currentTime = Date.now();
    this.#swipeState.duration = currentTime - this.#swipeState.initialTime;
    delete this.#swipeState.initialTime;
    
    if (this.#swipeState.duration < this.#holdTime) {
      clearTimeout(this.#holdTimeout);
      this.#holdTimeout = null;
    } else {
      this.#emit('release');
    }
    
    if (!this.#swipeState.end.x || !this.#swipeState.end.y) {
      if (!this.#holdTimeout) {
        this.#emit('tap');
      }
      return;
    }

    this.#calculateSwipeMetrics();
    this.#emit('move');
  };

  #calculateSwipeMetrics() {
    const { start, end } = this.#swipeState;
    this.#swipeState.delta = {
      x: parseInt(end.x - start.x),
      y: parseInt(end.y - start.y)
    };
    
    this.#swipeState.distance = parseInt(Math.hypot(this.#swipeState.delta.x, this.#swipeState.delta.y));
    this.#swipeState.velocity = this.#swipeState.distance / this.#swipeState.duration;
    
    this.#calculateAngleAndDirection();
  }

  #calculateAngleAndDirection() {
    const { delta } = this.#swipeState;
    
    if (this.#isSimpleSwipe(delta)) return;
    
    const dx = Math.abs(delta.x);
    const dy = Math.abs(delta.y);
    
    if (dx - this.#threshold <= 0 && dy - this.#threshold <= 0 && !this.#holdTimeout) {
      this.#emit('tap');
      return;
    }
    
    this.#calculateAngle(dx, dy);
    this.#determineDirection();
  }

  #isSimpleSwipe(delta) {
    if (delta.x === 0) {
      this.#swipeState.angle = delta.y < 0 ? 0 : 180;
      return true;
    }
    if (delta.y === 0) {
      this.#swipeState.angle = delta.x < 0 ? 270 : 90;
      return true;
    }
    return false;
  }

  #calculateAngle(dx, dy) {
    const radians = Math.atan(dy / dx);
    const degrees = parseInt(radians * (180 / Math.PI));
    const { delta } = this.#swipeState;

    if (delta.x < 0 && delta.y < 0) {
      this.#swipeState.angle = 360 - (90 - degrees);
    } else if (delta.x < 0 && delta.y > 0) {
      this.#swipeState.angle = 360 - degrees - 90;
    } else if (delta.x > 0 && delta.y > 0) {
      this.#swipeState.angle = degrees + 90;
    } else {
      this.#swipeState.angle = 90 - degrees;
    }
  }

  #determineDirection() {
    const { angle } = this.#swipeState;
    let direction;
    
    if (angle <= 45 || angle >= 315) {
      direction = 'up';
    } else if (angle > 45 && angle <= 135) {
      direction = 'right';
    } else if (angle > 135 && angle <= 225) {
      direction = 'down';
    } else if (angle > 225 && angle < 315) {
      direction = 'left';
    }
    
    this.#swipeState.direction = direction;
    this.#emit(direction);
  }

  #suppressClick = (event) => {
    if (event.pointerType === 'touch') {
      event.preventDefault();
    }
  };

  #disableContextMenu = (event) => {
    if (event.pointerType === 'touch') {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  };

  #initializeEventListeners() {
    this.#element.addEventListener('click', this.#suppressClick);
    this.#element.addEventListener('contextmenu', this.#disableContextMenu);
    this.#element.addEventListener('touchstart', this.#handleTouchStart, { passive: true });
    this.#element.addEventListener('touchmove', this.#handleTouchMove, { passive: true });
    this.#element.addEventListener('touchend', this.#handleTouchEnd);
  }
}
