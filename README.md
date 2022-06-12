# GestureController

This module will allow you to easily add direction based touch gestures to any HTML Element. Multiple instances can exist on a page.

## How to Use

The constructor can be called with no parameters. This will attach the controller to `document.body` :

```
let g = new GestureController();
```

Or pass a reference to an element :

```
let g = new GestureController(document.getElementById('your-element');
```

An `options` object can be used to override some default behavior. Supported options are :

- `element` : A reference to an HTML Element. 
   Default: `document.body`

- `holdTime` : How long a touch must be held to trigger a `hold` event. 
   Default: `600` milliseconds.

- `threshold` : The number of pixels a touch point must travel to be count as movement. 
    Default: `5`

## Events

The controller will emit events for `up`, `down`, `left`, & `right` swipes. With each of these gestures a `move` event is also emitted.

The native `click` and `contextmenu` events will still fire on your target if using a mouse but be suppressed for touch inputs and the controller will emit `tap` and `hold` events instead.

Each event passes an object to the handler with details about the gesture including :

- start : x,y coordinates of touch start position
- end : x,y coordinates of touch end position
- delta : difference between start and end x,y coordinates
- angle : movement direction in degress
- distance : number of pixels travelled
- duration : input time in milliseconds
- velocity : pixels travelled per millisecond
- direction : the computed direction, eg. `up`
- edge : which edge the swipe started from, if applicable

## Example

A [test page](test.html) is included in this repository.