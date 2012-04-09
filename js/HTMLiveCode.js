var HTMLiveCode = function() {
	var settings = arguments[0] || {},
	_codeMirrorInstance = null,
	_codeView = null,
	_codeScrollView = null,
	_livePreview = document.createElement("canvas"),
	_logView = document.createElement("div"),
	_logMessageView = document.createElement("div"),
	_resizeBar = document.createElement("div"),
	_resizeArea = document.createElement("div"),
	_fontsizeStylesheet = document.createElement("style"),
	_menuBar = document.getElementById("menu-bar"),
	_menuStartButton = document.createElement("div"),
	_introTooltip = document.getElementById("intro-tooltip"),
	_menuBtnStyleBright = document.getElementById("btn-style-bright"),
	_menuBtnStyleDark = document.getElementById("btn-style-dark"),
	_menuBtnFonsizeIncrease = document.getElementById("btn-fontsize-increase"),
	_menuBtnFonsizeDecrease = document.getElementById("btn-fontsize-decrease"),
	_menuBtnFonsizeReset = document.getElementById("btn-fontsize-reset"),
	_menuBtnOptionsGutter = document.getElementById("btn-options-gutter"),
	_menuBtnOptionsWordwrap = document.getElementById("btn-options-wordwrap"),
	_menuBtnOptionsLogwindow = document.getElementById("btn-options-logwindow"),
	_menuBtnResetCode = document.getElementById("btn-reset-code"),
	_menuBtnResetSettings = document.getElementById("btn-reset-settings"),
	_menuBtnExportAnimation = document.getElementById("btn-export"),
	_menuBtnExample1 = document.getElementById("btn-examples-sample1"),
	_menuBtnExample2 = document.getElementById("btn-examples-sample2"),
	_initialized = false,
	_logHeight = settings.logWindowHeight || 200,
	_logFlushLimit = settings.logFlushLimit || 300,
	_logMessageCount = 0,
	_resizeBarMouseDown = false,
	_resizeBarStartPosition = null,
	_resizeBarWidth = 6,
	_menuBarTimer = null,
	_codeViewStartWidth = null,
	_codeViewWidthRatio = 50,
	_livePreviewWidthRatio = 50,
	_livePreviewTempWidth = 0,
	_livePreviewTempHeight = 0,
	_browserWidth = parseInt(window.innerWidth),
	_browserHeight = parseInt(window.innerHeight),
	_editorStorageSettings = {},
	_editorDefaultSettings = {
		theme: settings.theme || "bright",
		fontSize: 1,
		wordWrap: settings.wordWrap === false ? false : true,
		gutter: settings.gutter === false ? false : true,
		log: settings.log === true ? true : false,
		codeViewWidth: parseInt(window.innerWidth) / 2,
		livePreviewWidth: (parseInt(window.innerWidth) / 2) - _resizeBarWidth
	};
	
	var _createGlobals = function() {
		window.CVS = _livePreview;
		window.CTX = _livePreview.getContext("2d");
		window.LOG = function(message) {
			_logController.write(message);
		};
		window.CLEARLOG = function() {
			_logMessageView.innerHTML = "";
		};
	}

	var _updateViews = function() {
		var codeMirrorContent = _codeMirrorInstance.getValue();
		
		try {
			_livePreviewTempWidth = _livePreview.getAttribute("width");
			_livePreviewTempHeight = _livePreview.getAttribute("height");
			document.body.removeChild(_livePreview);
			document.body.appendChild(_livePreview);
			_livePreview.setAttribute("width", _livePreviewTempWidth);
			_livePreview.setAttribute("height", _livePreviewTempHeight);
			eval(codeMirrorContent);

			_canvasController.render = function(){
				try{
					CanvasAnimationLoop();
				} catch(e) {}
			};
		} catch(e) {}
	}
	
	var _foldFunc = CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder);

	var _fadeOut = function(obj, duration) {
		obj.style.opacity = 1;

		var alphaDifference = parseFloat((1 / duration) * 13),
		fadeOutTimer = setInterval(function(){
			var alpha = obj.style.opacity;

			if (alpha - alphaDifference > 0) {
				obj.style.opacity -= alphaDifference;
			} else {
				obj.style.opacity = 0;
				obj.style.display = "none";
				clearInterval(fadeOutTimer);
			}
		}, 13);
	}
	
	var _cloneObject = function(obj) {
		if (typeof obj !== "object" || obj === null) {
			return obj;
		} else {
			var objClone = obj.constructor();

			for (var property in obj) {
				if (obj.hasOwnProperty(property)) objClone[property] = obj[property];
			}

			return objClone;
		}
	}
	
	var _canvasController = {
		animate: function() {
			requestAnimationFrame(_canvasController.animate);
			_canvasController.render();
		},
		render: function() {
			CanvasAnimationLoop();
		}
	}
	
	var _settingsController = {
		updateStorageSetting: function(settingKey, settingValue) {
			_editorStorageSettings[settingKey] = settingValue;
			window.localStorage.setItem("htmlivecodeCanvasSettings", JSON.stringify(_editorStorageSettings));
		},
		checkStorageSetting: function(settingValue) {
			return (settings[settingValue] !== null && typeof settings[settingValue] !== "undefined") ? settings[settingValue] : (_editorStorageSettings[settingValue] !== null && typeof _editorStorageSettings[settingValue] !== "undefined") ? _editorStorageSettings[settingValue] : _editorDefaultSettings[settingValue];
		},
		applySettings: function() {
			_codeMirrorInstance.setOption("lineNumbers", _settingsController.checkStorageSetting("gutter"));
			_codeMirrorInstance.setOption("lineWrapping", _settingsController.checkStorageSetting("wordWrap"));
			_codeMirrorInstance.setOption("gutter", _settingsController.checkStorageSetting("gutter"));
			_codeMirrorInstance.setOption("theme", _settingsController.checkStorageSetting("theme"));
			_updateViews();
			_codeView.style.width = _settingsController.checkStorageSetting("codeViewWidth") + "px";
			_livePreview.setAttribute("width", _settingsController.checkStorageSetting("livePreviewWidth"));
			_codeViewWidthRatio = (parseInt(_codeView.style.width) / _browserWidth) * 100;
			_livePreviewWidthRatio = (parseInt(_livePreview.getAttribute("width")) / _browserWidth) * 100;
			_resizeController.finishResizeAreas();
			_fontsizeStylesheet.removeChild(_fontsizeStylesheet.childNodes[0])
			_fontsizeStylesheet.appendChild(document.createTextNode(".CodeMirror{font-size:" + parseFloat(_editorStorageSettings.fontSize) + "em;}"));
			_codeMirrorInstance.refresh();
		}
	}
	
	var _resizeController = {
		init: function() {
			window.addEventListener("mouseup", function() {
				_resizeBarMouseDown = false;
				_codeViewWidthRatio = (parseInt(_codeView.style.width) / _browserWidth) * 100;
				_livePreviewWidthRatio = (parseInt(_livePreview.getAttribute("width")) / _browserWidth) * 100;
				_resizeArea.style.display = "none";
				window.removeEventListener("mousemove", _resizeController.resizeMouseMoveHandler);
			});
			
			window.addEventListener("mouseout", function() {
				if (!_resizeBarMouseDown) document.body.style.cursor = "default";
			});
			
			window.addEventListener("resize", function() {
				_resizeController.resizeAreas();
			});

			_resizeBar.addEventListener("mousedown", _resizeController.resizeMouseDownHandler);
			_resizeBar.addEventListener("mouseover", _resizeController.resizeMouseOverHandler);
			_resizeBar.addEventListener("mouseout", _resizeController.resizeMouseOutHandler);
			_resizeArea.addEventListener("mousedown", function(evt) {
				evt.preventDefault();
			});
		},
		resizeAreas : function() {
			_browserWidth = parseInt(window.innerWidth),
			_browserHeight = parseInt(window.innerHeight);

			if (_codeView.style.width == "") {
				_codeView.style.width = (_browserWidth / 2) + "px";
				_livePreview.setAttribute("width", (_browserWidth / 2) - _resizeBarWidth);
			} else {
				_codeView.style.width = ((_codeViewWidthRatio / 100) * _browserWidth) + "px";
				_livePreview.setAttribute("width", _browserWidth - parseFloat(_codeView.style.width) - _resizeBarWidth);
			}
			
			if (_settingsController.checkStorageSetting("log")) {
				_codeScrollView.style.height = (_browserHeight - _logHeight) + "px";
			}

			_resizeController.finishResizeAreas();
		},
		finishResizeAreas: function() {
			if (parseInt(_codeView.style.width) <= 200) {
				_codeView.style.width = "200px";
				_livePreview.setAttribute("width", _browserWidth - 200 - _resizeBarWidth);
			}

			if (parseInt(_codeView.style.width) >= (_browserWidth - 200 - _resizeBarWidth)) { 
				_codeView.style.width = (_browserWidth - 200 - _resizeBarWidth) + "px";
				_livePreview.setAttribute("width", 200);
			}
			
			_livePreview.setAttribute("height", window.innerHeight);
			_settingsController.updateStorageSetting("codeViewWidth", parseFloat(_codeView.style.width));
			_settingsController.updateStorageSetting("livePreviewWidth", parseFloat(_livePreview.getAttribute("width")));
			_resizeBar.style.left = parseFloat(_codeView.style.width) + "px";
			_editorDefaultSettings.codeViewWidth = parseInt(window.innerWidth) / 2;
			_editorDefaultSettings.livePreviewWidth = (parseInt(window.innerWidth) / 2) - _resizeBarWidth;
			_updateViews();
			_codeMirrorInstance.refresh();
		},
		resizeMouseMoveHandler: function(evt) {
			var mouseDistance = parseInt(evt.pageX) - _resizeBarStartPosition;
			_codeView.style.width = (_codeViewStartWidth + mouseDistance) + "px";
			_livePreview.setAttribute("width", (_browserWidth - _codeViewStartWidth - mouseDistance) - _resizeBarWidth);
			_resizeController.finishResizeAreas();
		},
		resizeMouseDownHandler: function(evt) {
			_resizeBarMouseDown = true;
			_resizeBarStartPosition = parseInt(evt.pageX);
			_codeViewStartWidth = parseInt(_codeView.style.width);
			_resizeArea.style.display = "block";
			window.addEventListener("mousemove", _resizeController.resizeMouseMoveHandler);
			evt.preventDefault();
		},
		resizeMouseOverHandler: function(evt) {
			document.body.style.cursor = "ew-resize";
		},
		resizeMouseOutHandler: function(evt) {
			if (!_resizeBarMouseDown) document.body.style.cursor = "default";
		}
	}
	
	var _menuController = {
		init: function() {
			_menuStartButton.setAttribute("id", "menu-startbutton");
			_codeView.appendChild(_menuStartButton);

			window.addEventListener("mousemove", function(evt){
				if ((evt.pageY - 40) < 150) {
					_menuStartButton.style.opacity = Math.abs(1 - ((evt.pageY - 42) / 100) / 1.5);
					if (_menuStartButton.style.opacity >= 1) _menuStartButton.style.opacity = 1;
				} else {
					_menuStartButton.style.opacity = 0;
				}
			});

			_menuController.setButtonStates();
			_menuStartButton.addEventListener("mouseover", _menuController.menuMouseOverHandler);
			_menuBar.addEventListener("mouseover", _menuController.menuMouseOverHandler);
			_menuBar.addEventListener("mouseout", _menuController.menuMouseOutHandler);

			_menuBtnStyleBright.addEventListener("click", function(){
				_menuController.setTheme(_menuBtnStyleBright, "bright");
			});

			_menuBtnStyleDark.addEventListener("click", function(){
				_menuController.setTheme(_menuBtnStyleDark, "dark");
			});

			_menuBtnFonsizeIncrease.addEventListener("click", function(){
				_menuController.changeEditorFontsize(1);
			});
			
			_menuBtnFonsizeDecrease.addEventListener("click", function(){
				_menuController.changeEditorFontsize(-1);
			});
			
			_menuBtnFonsizeReset.addEventListener("click", function(){
				_menuController.changeEditorFontsize(0);
			});

			_menuBtnOptionsGutter.addEventListener("click", function(){
				_menuController.toggleGutter();
			});
			
			_menuBtnOptionsWordwrap.addEventListener("click", function(){
				_menuController.toggleWordWrap();
			});
			
			_menuBtnOptionsLogwindow.addEventListener("click", function(){
				_menuController.toggleLogWindow();
			});

			_menuBtnResetCode.addEventListener("click", function(){
				if (confirm("Reset code to default template? All changes will be lost.")) {
					window.localStorage.removeItem("htmlivecodeCanvasText");
					_codeMirrorInstance.setValue(HTMLiveCodeTemplate);
					_foldFunc(_codeMirrorInstance, 20);
					_foldFunc(_codeMirrorInstance, 50);
					_codeMirrorInstance.refresh();
				}
			});

			_menuBtnResetSettings.addEventListener("click", function(){
				if (confirm("Reset editor settings to default?")) {
					window.localStorage.removeItem("htmlivecodeCanvasSettings");
					_editorStorageSettings = _cloneObject(_editorDefaultSettings);
					_menuController.setButtonStates();
					_settingsController.applySettings();
					_codeMirrorInstance.refresh();
				}
			});
			
			_menuBtnExportAnimation.addEventListener("click", function(){
				try {
					document.body.removeChild(document.getElementById("animationExport"));
				} catch (e) {}
			
				var form = document.createElement("form"),
				canvasInput = document.createElement("input");
				form.setAttribute("action", "export");
				form.setAttribute("method", "post");
				form.setAttribute("id", "animationExport");
				document.body.appendChild(form);

				canvasInput.setAttribute("name", "canvas");
				canvasInput.setAttribute("type", "hidden");
				canvasInput.value = _codeMirrorInstance.getValue();
				form.appendChild(canvasInput);

				form.submit();
			});
			
			_menuBtnExample1.addEventListener("click", function(){
				if (confirm("Load example 1? All changes will be lost.")) {
					_menuController.loadExample(HTMLiveCodeTemplate, 1);
				}
			});
			
			_menuBtnExample2.addEventListener("click", function(){
				if (confirm("Load example 2? All changes will be lost.")) {
					_menuController.loadExample(HTMLiveCodeTemplate2, 2);
				}
			});
		},
		changeEditorFontsize: function(value) {
			var newFontsize = (Math.round(parseFloat(_editorStorageSettings.fontSize) * 100) / 100) + (value === 1 ? 0.1 : -0.1);
			newFontsize = (value === 0 ? 1 : newFontsize);
			if (parseFloat(newFontsize) < 0.1) newFontsize = 0.1;
			_fontsizeStylesheet.removeChild(_fontsizeStylesheet.childNodes[0])
			_fontsizeStylesheet.appendChild(document.createTextNode(".CodeMirror{font-size:" + newFontsize + "em;}"));
			_settingsController.updateStorageSetting("fontSize", newFontsize);
			_codeMirrorInstance.refresh();
		},
		toggleGutter: function() {
			var isActive = _menuBtnOptionsGutter.getAttribute("class") === "menu-button-active",
				gutterSetting = isActive ? false : true;
				_menuBtnOptionsGutter.setAttribute("class", isActive ? "menu-button" : "menu-button-active");
				_codeMirrorInstance.setOption("lineNumbers", gutterSetting);
				_codeMirrorInstance.setOption("gutter", gutterSetting);
				_settingsController.updateStorageSetting("gutter", gutterSetting);
		},
		toggleWordWrap: function() {
			var isActive = _menuBtnOptionsWordwrap.getAttribute("class") === "menu-button-active",
			wordwrapSetting = isActive ? false : true;
			_menuBtnOptionsWordwrap.setAttribute("class", isActive ? "menu-button" : "menu-button-active");
			_codeMirrorInstance.setOption("lineWrapping", wordwrapSetting);
			_settingsController.updateStorageSetting("wordWrap", wordwrapSetting);
		},
		toggleLogWindow: function() {
			var isActive = _menuBtnOptionsLogwindow.getAttribute("class") === "menu-button-active",
			logwindowSetting = isActive ? false : true;
			_menuBtnOptionsLogwindow.setAttribute("class", isActive ? "menu-button" : "menu-button-active");
			logwindowSetting ? _logController.show() : _logController.hide();
			_settingsController.updateStorageSetting("log", logwindowSetting);
		},
		setTheme: function(menuBtn, themeName) {
			var isActive = menuBtn.getAttribute("class") === "menu-button-active",
			oppositeMenuButton = (themeName == "dark" ? _menuBtnStyleBright : _menuBtnStyleDark);

			if (!isActive) {
				menuBtn.setAttribute("class", isActive ? "menu-button" : "menu-button-active");
				oppositeMenuButton.setAttribute("class", "menu-button");
			}

			_codeMirrorInstance.setOption("theme", themeName);
			_settingsController.updateStorageSetting("theme", themeName);
		},
		setButtonStates: function() {
			_menuBtnStyleBright.setAttribute("class", _settingsController.checkStorageSetting("theme") === "bright" ? "menu-button-active" : "menu-button");
			_menuBtnStyleDark.setAttribute("class", _settingsController.checkStorageSetting("theme") === "dark" ? "menu-button-active" : "menu-button");
			_menuBtnOptionsGutter.setAttribute("class", _settingsController.checkStorageSetting("gutter") === true ? "menu-button-active" : "menu-button");
			_menuBtnOptionsWordwrap.setAttribute("class", _settingsController.checkStorageSetting("wordWrap") === true ? "menu-button-active" : "menu-button");
			_menuBtnOptionsLogwindow.setAttribute("class", _settingsController.checkStorageSetting("log") === true ? "menu-button-active" : "menu-button");
		},
		hideMenuBar: function() {
			_menuBar.style.display = "none";
			_menuStartButton.style.display = "block";
		},
		showMenuBar: function() {
			_menuBarTimer = clearTimeout(_menuBarTimer);
			_menuBar.style.display = "block";
			_menuStartButton.style.display = "none";
		},
		loadExample: function(obj, id) {
			_codeMirrorInstance.setValue(obj);
			_codeMirrorInstance.refresh();

			switch (id) {
				case 1:
					_foldFunc(_codeMirrorInstance, 20);
					_foldFunc(_codeMirrorInstance, 50);
				break;

				case 2:
					_foldFunc(_codeMirrorInstance, 18);
					_foldFunc(_codeMirrorInstance, 41);
				break;
			}
		},
		menuMouseOverHandler: function() {
			_menuController.showMenuBar();
		},
		menuMouseOutHandler: function() {
			_menuBarTimer = setTimeout(_menuController.hideMenuBar, 800);
		}
	}
	
	var _logController = {
		init: function() {
			_logView.setAttribute("id", "log");
			_logView.style.height = _logHeight + "px";
			_logMessageView.setAttribute("id", "log-messages");
			_logMessageView.style.height = (_logHeight - 30) + "px";
			_logView.appendChild(_logMessageView);
			_codeView.appendChild(_logView);

			if (_settingsController.checkStorageSetting("log")) {
				_logController.show();
			}
		},
		hide: function() {
			_logView.style.display = "none";
			_codeScrollView.style.height = "100%";
		},
		show: function() {
			_logView.style.display = "block";
			_codeScrollView.style.height = (_browserHeight - _logHeight) + "px";
		},
		write: function(message) {
			_logMessageView.innerHTML = _logMessageView.innerHTML + message + "<br />";
			_logMessageView.scrollTop = _logMessageView.scrollHeight;
			_logMessageCount++;

			if (_logMessageCount > _logFlushLimit) {
				_logMessageCount = 0;
				_logMessageView.innerHTML = "";
			}
		}
	}

	return {
		init: function() {
			CodeMirror.keyMap.HTMLiveCode = {
				"Alt-0": function() { _menuController.changeEditorFontsize(0); },
				"Alt-I": function() { _menuController.changeEditorFontsize(1); },
				"Alt-O": function() { _menuController.changeEditorFontsize(-1); },
				"Alt-G": function() { _menuController.toggleGutter(); },
				"Alt-M": function() {
					if (_menuBar.style.display === "none" || _menuBar.style.display === "") {
						_menuController.showMenuBar();
					} else {
						_menuController.hideMenuBar();
					}
				},
				"Alt-T": function() {
					var brightThemeIsActive = _menuBtnStyleBright.getAttribute("class") === "menu-button-active";
					_menuController.setTheme(brightThemeIsActive ? _menuBtnStyleDark : _menuBtnStyleBright, brightThemeIsActive ? "dark" : "bright");
				},
				"Alt-W": function() { _menuController.toggleWordWrap(); },
				"Alt-L": function() { _menuController.toggleLogWindow(); },
				fallthrough: ["default"]
			};
		
			_codeMirrorInstance = CodeMirror(document.body, {
				mode: "text/javascript",
				indentWithTabs: true,
				lineWrapping: _editorDefaultSettings.wordWrap,
				gutter: _editorDefaultSettings.gutter,
				fixedGutter: true,
				lineNumbers: _editorDefaultSettings.gutter,
				matchBrackets: true,
				indentUnit: 4,
				tabSize: 4,
				tabMode: "indent",
				theme: _editorDefaultSettings.theme,
				keyMap: "HTMLiveCode",
				onHighlightComplete: function() {
					if (!_initialized) {
						_initialized = true;
						_codeView = _codeMirrorInstance.getWrapperElement();
						_codeScrollView = document.querySelector(".CodeMirror-scroll");
						
						if (window.localStorage.getItem("htmlivecodeCanvasText") !== null) {
							_codeMirrorInstance.setValue(window.localStorage.getItem("htmlivecodeCanvasText"));
						} else {
							_codeMirrorInstance.setValue(HTMLiveCodeTemplate);
							_foldFunc(_codeMirrorInstance, 20);
							_foldFunc(_codeMirrorInstance, 50);
						}

						if (window.localStorage.getItem("htmlivecodeCanvasSettings") !== null) {
							_editorStorageSettings = JSON.parse(window.localStorage.getItem("htmlivecodeCanvasSettings"));
							_settingsController.applySettings();
						} else {
							window.localStorage.setItem("htmlivecodeCanvasSettings", JSON.stringify(_editorDefaultSettings));
							_editorStorageSettings = _cloneObject(_editorDefaultSettings);
						}

						_resizeController.resizeAreas();
						_menuController.init();
						_resizeController.init();
						_logController.init();
						_createGlobals();
						_updateViews();	
						_canvasController.animate();
					}
				},
				onChange: function() {
					_updateViews();
					window.localStorage.setItem("htmlivecodeCanvasText", _codeMirrorInstance.getValue());
				},
				onGutterClick: _foldFunc
			});

			_resizeBar.setAttribute("id", "resize-control");
			document.body.appendChild(_resizeBar);
			
			_resizeArea.setAttribute("id", "resize-area");
			document.body.appendChild(_resizeArea);
			
			_livePreview.setAttribute("id", "live-preview");
			_livePreview.setAttribute("height", window.innerHeight);
			document.body.appendChild(_livePreview);

			_fontsizeStylesheet.setAttribute("type", "text/css");
			_fontsizeStylesheet.appendChild(document.createTextNode(".CodeMirror{font-size:"+ _editorDefaultSettings.fontSize +"em;}"));
			document.body.appendChild(_fontsizeStylesheet);

			if (window.localStorage.getItem("htmlivecodeCanvasText") === null) {
				_introTooltip.style.left = ((_browserWidth / 2) - 244) + "px";
				_introTooltip.style.display = "inline";
				setTimeout(function(){
					_fadeOut(_introTooltip, 2000);
				}, 3000);
			}
		},
		resizeAreas: _resizeController.resizeAreas
	}
};