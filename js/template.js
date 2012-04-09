var HTMLiveCodeTemplate = '// WELCOME TO THE CANVAS ANIMATION PLAYGROUND!\n\
// Global variables and functions go here. It\'s important that all variables\n\
// must be declared here (if even they don\'t have an initial value. Otherwise,\n\
// your animation will not run.\n\
\n\
// VARIABLES\n\
var circlePosX = (CVS.width / 2),\n\
circlePosY = (CVS.height / 2),\n\
circleAngle = 0,\n\
circleCount = 80,\n\
circleSpacing = 0.03,\n\
circleRGB = "255, 165, 0",\n\
arcRadius = 140,\n\
rotationSpeed = 1,\n\
circles = [],\n\
circle = null,\n\
circleGradient = null,\n\
bgGradient = null;\n\
\n\
// FUNCTIONS\n\
function createTrail() {\n\
	for (i = 0; i < circleCount; i++) {\n\
		circleAngle += circleSpacing;\n\
\n\
		circle = {\n\
			x: circlePosX + Math.cos(circleAngle) * arcRadius,\n\
			y: circlePosY + Math.sin(circleAngle) * arcRadius,\n\
			angle: circleAngle,\n\
			size: ((circles.length / circleCount) * 12) + 4,\n\
			alpha: circles.length / circleCount\n\
		}\n\
			\n\
		if (circles.length < circleCount) {\n\
			circles.push(circle);\n\
		}\n\
	}\n\
}\n\
	\n\
createTrail();\n\
\n\
// CANVAS ANIMATION LOOP (CALLED EVERY FRAME)\n\
var CanvasAnimationLoop = function() {\n\
	CTX.save();\n\
	CTX.clearRect(0, 0, CVS.width, CVS.height);\n\
	bgGradient = CTX.createLinearGradient(0, 0, 0, CVS.height);\n\
	bgGradient.addColorStop(0, "#200e29");\n\
	bgGradient.addColorStop(1, "#40112f");\n\
	CTX.fillStyle = bgGradient;\n\
	CTX.fillRect(0, 0, CVS.width, CVS.height);\n\
	\n\
	for (i = 0; i < circles.length; i++) {\n\
		var circle = circles[i];\n\
\n\
		CTX.beginPath();		\n\
		CTX.arc(\n\
			circle.x,\n\
			circle.y,\n\
			circle.size,\n\
			0,\n\
			Math.PI * 2\n\
		);\n\
\n\
		circle.angle += rotationSpeed / 10;\n\
		circle.x = circlePosX + Math.cos(circle.angle) * arcRadius;\n\
		circle.y = circlePosY + Math.sin(circle.angle) * arcRadius;\n\
\n\
		circleGradient = CTX.createRadialGradient(\n\
			circle.x,\n\
			circle.y,\n\
			0,\n\
			circle.x,\n\
			circle.y,\n\
			circle.size\n\
		);\n\
\n\
		circleGradient.addColorStop(0, "rgba(255, 255, 255, " + circle.alpha + ")");\n\
		circleGradient.addColorStop(0.4, "rgba(" + circleRGB + ", " + (circle.alpha - 0.4) + ")");\n\
		circleGradient.addColorStop(1, "rgba(" + circleRGB + ", 0)");\n\
		CTX.fillStyle = circleGradient;\n\
\n\
		CTX.fill();\n\
	}\n\
\n\
	CTX.restore();\n\
};';