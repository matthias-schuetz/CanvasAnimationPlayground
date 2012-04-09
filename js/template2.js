var HTMLiveCodeTemplate2 = '// VARIABLES\n\
var steps = 600,\n\
step = 0,\n\
depth = CVS.width * 2,\n\
pos = 0,\n\
gradientStatic = null,\n\
gradientAnimation = null,\n\
delta = [],\n\
xy = [],\n\
corners = [\n\
	[0, 0, 0, depth],\n\
	[CVS.width, 0, CVS.width - depth, 0],\n\
	[CVS.width, CVS.height, CVS.width, CVS.height - depth],\n\
	[0, CVS.height, depth, CVS.height],\n\
	[0, 0, 0, depth]\n\
];\n\
\n\
// FUNCTIONS\n\
function rotateGradient() {\n\
	if (step === 0) {\n\
		for (i = 0; i < 4; i++) {\n\
			delta[i] = (corners[pos + 1][i] - corners[pos][i]) / steps;\n\
		}\n\
	}\n\
\n\
	if (step <= steps) {\n\
		for (i = 0; i < 4; i++) {\n\
			xy[i] = corners[pos][i] + delta[i] * step;\n\
		}\n\
		\n\
		gradientAnimation = CTX.createLinearGradient(xy[0], xy[1], xy[2], xy[3]);\n\
		gradientAnimation.addColorStop(0, "rgba(" + colorMinMax(100, 190, 1) + ", " + colorMinMax(80, 180, 2) + ", " + colorMinMax(0, 255, 3) + ", 1)");\n\
		gradientAnimation.addColorStop(1, "rgba(0, 100, 200, 0.5)");\n\
		step++;\n\
	} else {\n\
		step = 0;\n\
		pos++;\n\
		if (pos >= 4) pos = 0;\n\
	}\n\
}\n\
\n\
function colorMinMax(min, max, id) {\n\
	window["color" + id] = window["color" + id] || min;\n\
	window["colorSign" + id] = window["colorSign" + id] || 1;\n\
	window["color" + id] += 1 * window["colorSign" + id];\n\
	\n\
	if (window["color" + id] > (max - 1) ||\n\
		window["color" + id] < (min + 1)) {\n\
		window["colorSign" + id] = -window["colorSign" + id];\n\
	}\n\
\n\
	return window["color" + id];\n\
}\n\
\n\
// CANVAS ANIMATION LOOP (CALLED EVERY FRAME)\n\
var CanvasAnimationLoop = function() {\n\
	CTX.save();\n\
	CTX.clearRect(0, 0, CVS.width, CVS.height);\n\
\n\
	rotateGradient();\n\
	CTX.fillStyle = gradientAnimation;\n\
	CTX.fillRect(0, 0, CVS.width, CVS.height);\n\
	CTX.globalAlpha = 0.5;\n\
	gradientStatic = CTX.createLinearGradient(0, 0, 0, CVS.height);\n\
	gradientStatic.addColorStop(0, "#c0ffee");\n\
	gradientStatic.addColorStop(0.5, "rgba(0, " + colorMinMax(120, 255, 4) + ", " + colorMinMax(100, 255, 5) + ", 1)");\n\
	gradientStatic.addColorStop(1, "rgba(0, 250, " + colorMinMax(100, 255, 6) + ", 1)");\n\
	CTX.fillStyle = gradientStatic;\n\
	CTX.fillRect(0, 0, CVS.width, CVS.height);\n\
\n\
	CTX.restore();\n\
};';