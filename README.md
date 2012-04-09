Canvas Animation Playground
===========================

## A browser playground for creating HTML5 canvas animations in real-time

The Canvas Animation Playground is an experimental tool for creating HTML5 canvas animations. Just type in JavaScript code and it will be interpreted for the &lt;canvas&gt; box on the right side. The function "CanvasAnimationLoop()" gets called on every browser frame via "requestAnimationFrame". Animations can be exported as stand-alone HTML files. The editor can be customized in its appearance so there are themes and some other editor options. The Canvas Animation Playground is based on HTMLiveCode, CodeMirror and HTML5's localStorage.

<img src="http://matthias-schuetz.github.com/canvas-animation-playground/canvas-animation-playground.png" />

## Demo
<a href="http://htmlivecode.com/canvas-animation-playground">Click here for a live demonstration.</a>

## Usage

The usage is the same as for HTMLiveCode and the Canvas Animation Playground doesn't have an own name as JavaScript object. So after loading all necessary files of the folders "js" and "css" in your main file, HTMLiveCode is available in the global namespace and must be instantiated as an object. You don't need any HTML markup as the editor will be attached to the &lt;body&gt; element. You don't need to specify any options since HTMLiveCode can be started with default settings. The editor should be instantiated when the DOM is ready. For example, use the "DOMContentLoaded" event to make sure that everything has been loaded.

### Defaults

```javascript
/*
 * HTMLiveCode instantiation (all arguments are optional)
 * 
 * @param Object settings Object which contains all options
 *        settings:
 *        @param Boolean gutter Toggles gutter and line numbers
 *        @param Boolean wordWrap Toggles word wrapping
 *        @param String theme Sets color theme (either "bright" or "dark")
 *        @param Boolean log Toggles log window
 *        @param Number logFlushLimit The log window gets flushed when it
 *                       contains 300 messages. This is for performance
 *                       reasons but you can change the amount of messages
 *                       after which the log window gets flushed.
 *        @param Number logWindowHeight Sets height of log window
 */

var liveEditor = new HTMLiveCode(settings);
```

### Examples (for instantiating the editor itself)

```javascript
// Default settings
window.addEventListener("DOMContentLoaded", function() {
	window.liveEditor = new HTMLiveCode();
	window.liveEditor.init();
});

// Custom options
window.addEventListener("DOMContentLoaded", function() {
	window.liveEditor = new HTMLiveCode({
		gutter: false,
		wordWrap: false,
		theme: "dark",
		log: true,
		logFlushLimit: 400,
		logWindowHeight: 200
	});
	window.liveEditor.init();
});
```

### Examples (for canvas animations)

After adding the editor to your HTML document, you are able to use the tool itself. The Canvas Animation Playground does some basic work for you and creates a &lt;canvas&gt; element. All JavaScript code is interpreted and rendered to this &lt;canvas&gt; element. There are some global objects and functions you may want to use:

* **CanvasAnimationLoop():** The main loop function which gets called every frame
* **CVS:** The &lt;canvas&gt; element itself
* **CTX:** canvas.getContext("2d")
* **LOG(message):** Send message to log window
* **CLEARLOG():** Clear log window

A basic animation is built up as follows. It's very important that all variables you want to use must be declared above the "CanvasAnimationLoop()" function.

```javascript
// Globals and functions go here
var size = 10,
posX = null,
posY = null,
circlePosX = CVS.width / 2,
circlePosY = CVS.height / 2,
angle = 0;

function exampleFunc() {
	angle += 0.05;
	posX = circlePosX + Math.cos(angle) * 150;
	posY = circlePosY + Math.sin(angle) * 150;
}

// Main loop function (function name is important)
var CanvasAnimationLoop = function(){
	CTX.save();
	CTX.clearRect(0, 0, CVS.width, CVS.height);

	CTX.fillStyle = "black";
	CTX.fillRect(0, 0, CVS.width, CVS.height);
	
	exampleFunc();
	
	CTX.fillStyle = "red";
	CTX.fillRect(posX, posY, size, size);

	CTX.restore();
};
```

## Shortcuts
The Canvas Animation Playground comes with some default shortcuts:

* **ALT-M:** Toggle menu bar
* **ALT-T:** Toggle theme
* **ALT-I:** Increase font size
* **ALT-O:** Decrease font size
* **ALT-0:** Reset font size
* **ALT-G:** Toggle gutter
* **ALT-W:** Toggle word wrap
* **ALT-L:** Toggle log window

## Notes
* **Compatibility:** The Canvas Animation Playground and HTMLiveCode were developed with HTML5 in mind. So they work in modern browsers and Internet Explorer from version 9 on.

## License

The Canvas Animation Playground and HTMLiveCode are released under the MIT license.