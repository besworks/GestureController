# GestureController

This module will allow you to easily add direction based touch gestures to any HTML Element. Multiple instances can exist on a page.

## How to Use

The constructor can be called with no parameters. This will attach the controller to `document.body` :

```
let gc = new GestureController();
```

Or pass a reference to an element :

```
let el = document.getElementById('your-element');
let gc = new GestureController(el);
```

An **options** object can be used to override some default behavior. The supported properties are :

- `element` : A reference to an HTML Element that the controller will attach to.
- `holdTime` : How long (in milliseconds) a touch must be held to trigger a `hold` event.
- `threshold` : The number of pixels a touch point must travel to be count as movement.

The example below shows the default values.

```
let gc = new GestureController({
  element: document.body,
  holdTime: 600,
  threshold: 5
});
```

## Events

The controller will emit events for `up`, `down`, `left`, & `right` swipes. With each of these gestures a `move` event is also emitted.

The native `click` and `contextmenu` events will still fire on your target if using a mouse but are suppressed for touch inputs and the controller will emit `tap` and `hold` events instead.

To attach an event handler, use the `on(eventType)` method.

```
gc.on('up', details => alert('swiped up'));
```

Each event passes an object to the handler with details about the gesture including :

- `start` : x,y coordinates of touch start position
- `end` : x,y coordinates of touch end position
- `delta` : difference between start and end x,y coordinates
- `angle` : movement direction in degress
- `distance` : number of pixels travelled
- `duration` : input time in milliseconds
- `velocity` : pixels travelled per millisecond
- `direction` : the computed direction, eg. `up`
- `edge` : which edge the swipe started from, if applicable

## Example

A [test page](test.html) is included in this repository.