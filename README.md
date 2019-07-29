# GestureController

This small library will allow you to easily add direction based touch gestures any HTML Element.

Multiple instances can exist on a page.

## How to Use

```
<script type="module">
  import { GestureController } from './GestureController.js';
  
  let g = new GestureController({
    element : document.getElementById('your-element'), // optional : document body will be used if omitted
    holdTime : 500, // optional : length of time a touch event must be held for a long-press, defaults to 600ms
    threshold : 5 // optional : the number pixels a touch event must travel before being considered a move event, default is 5
  });

  g.on('left', s => {
    console.log('swiped left');
  });
  
  g.on('right', s => {
    console.log('swiped right');
  });
  
  g.on('up', s => {
    console.log('swiped up');
  });
  
  g.on('down', s => {
    console.log('swiped down');
  });
  
  g.on('tap', s => {
    console.log('tap');
  });
  
  g.on('hold', s => {
    console.log('hold');
  });

  g.on('move', s => {
    // triggered on every move event
    console.log(s);
  });
</script>
```
