# Scripts and connections

A script is a named method on a morph. Its original source is stored with the morph. this is the receiver. world, the morph classes, pt, Color, connect, inspect, and $('name') are in scope.

```javascript
const ball = world.addMorph(new Ellipse({name: 'ball'}));
ball.addScript(function onMouseDown(evt) {
  this.fill = Color.random();
});
ball.addScript(function step() {
  this.rotation += 0.02;
});
ball.startStepping(40, 'step');
```

startStepping uses the world’s one animation scheduler. stopStepping removes that morph’s step. Pause freezes the scheduler and managed user timers. setTimeout and setInterval in script scope use that scheduler and are removed when their main run is replaced. clearTimeout or clearInterval cancels their returned timer handle.

Scripts are recompiled when loaded, so use morph names and public serialized properties instead of closed-over local variables. All user functions and converters pass through the same Acorn instrumentation and loop guard.

## Binding values

```javascript
const slider = world.addMorph(new Slider({name: 'slider', value: 80}));
const box = world.addMorph(new Morph({name: 'box'}));
const binding = connect(slider, 'value', box, 'opacity', {
  converter: value => value / 100
});
slider.value = 50; // box.opacity becomes 0.5
binding.disconnect();
```

If the target property is a method, the binding calls it with the converted value. Otherwise it assigns that property. Connections are triggered by changes, not immediately at creation. Converter source and connection endpoints are saved with the world. Reentrant cycles stop at the active connection.

Use disconnect(source, property, target, method) to match and remove a binding, or disconnectAll(morph) for every binding touching a morph. Connections to scripted morphs are removed on re-run. Object editor lists connections and can create or disconnect them.
