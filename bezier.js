var instructions = [
    "Welcome to the Bezier Curve Drawing Program!",
    "",
    "To use this program, follow these instructions:",
    "",
    "1. To START A NEW CURVE:",
    "       *Swipe your finger, or",
    "       *Left-click and drag your mouse.",
    "",
    "2. To UNDO the last curve:",
    "       *Click the undo button, or",
    "       *Right-click your mouse.",
    "",
    "Have fun drawing Bezier curves!"
];

var config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 1000,
    scene: {
        create: create
    }
};

var game = new Phaser.Game(config);
var curves = []; // Store all the curves
var current_curve = []; // Store the current curve
var graphics = null; // Store the graphics object
var pointCountText = null; // Store the text object for point count
var isDrawing = false;

function create() {
    this.add.text(10, 10, instructions.join('\n'), { fontSize: '20px', color: '#e0ff50' });

    graphics = this.add.graphics(); // Assign the graphics object

    // Display the point count text
    pointCountText = this.add.text(
        60, // X position
        config.height - 60, // Y position
        "Curves: 0", // Initial text
        { fontSize: '16px', color: '#ffffff' }
    );

    // Add the undo button
    var undoButton = this.add.rectangle(
        config.width - 100, // X position
        config.height - 60, // Y position
        140, // Width
        70, // Height
        0x000000, // Fill color
        0.2 // Fill alpha
    ).setInteractive();

    undoButton.setStrokeStyle(2, 0x808080); // Add grey outline to the button

    undoButton.on('pointerdown', function () {
        curves.pop();
        updateCurve();
    });

    var buttonText = this.add.text(
        undoButton.x, // X position
        undoButton.y, // Y position
        "Undo", // Button text
        { fontSize: '16px', color: '#ffffff' }
    );
    Phaser.Display.Align.In.Center(buttonText, undoButton); // Center the text within the button rectangle
    
    this.input.on('pointerdown', function (pointer) {
        if (!undoButton.getBounds().contains(pointer.x, pointer.y)) {
            if (pointer.button === 0) { // left-click
                if (isDrawing) {
                    finishCurve();
                }
                
                if (!undoButton.getBounds().contains(pointer.x, pointer.y)) { // Check if pointer is not over the undo button
                    isDrawing = true;
                    var point = { x: pointer.x, y: pointer.y };
                    current_curve = [point]; // Start a new curve
                }
            } else if (pointer.button === 2) { // right-click
                curves.pop();
                updateCurve();
            }
        }
    }, this);

    this.input.on('pointermove', function (pointer) {
        if (isDrawing && pointer.isDown && pointer.button === 0) { // left-click and mouse is moving
            var point = { x: pointer.x, y: pointer.y };
            current_curve.push(point);
            updateCurve();
        }
    }, this);

    this.input.on('pointerup', function (pointer) {
        if (isDrawing && pointer.button === 0) { // left-click
            finishCurve();
        }
    }, this);

    // Prevent the default right-click context menu
    this.game.canvas.oncontextmenu = function (e) { e.preventDefault(); };
}

function finishCurve() {
    isDrawing = false;
    curves.push(current_curve); // Store the current curve
    current_curve = []; // Start a new curve
    updateCurve();
}

function bezier(control_points, t) {
    let n = control_points.length - 1; // The order of the curve
    if (n == 0) return control_points[0]; // If only one point, return it

    let new_points = [];
    for (let i = 0; i < n; i++) {
        // Calculate intermediate control points
        let x = (1 - t) * control_points[i].x + t * control_points[i + 1].x;
        let y = (1 - t) * control_points[i].y + t * control_points[i + 1].y;
        new_points.push({ x: x, y: y });
    }

    return bezier(new_points, t); // Recursive call
}

function updateCurve() {
    graphics.clear();

    // Draw all the curves
    for (let j = 0; j < curves.length; j++) {
        let control_points = curves[j];
        drawCurve(control_points);
    }

    // Draw the current curve
    if (current_curve.length > 0) {
        drawCurve(current_curve);
    }

    // Update the curve count text
    pointCountText.setText("Curves: " + curves.length);
}

function drawCurve(control_points) {
    // Draw grey lines between the grey control points
    graphics.lineStyle(1, 0x404040);
    for (let i = 1; i < control_points.length ; i++) {
        graphics.lineBetween(control_points[i - 1].x, control_points[i - 1].y, control_points[i].x, control_points[i].y);
    }

    // Draw a small grey circle at the control point
    for (let i = 0; i < control_points.length ; i++) {
        graphics.fillStyle(0x404040);
        graphics.fillCircle(control_points[i].x, control_points[i].y, 5);
    }

    // Draw the Bezier curve
    if (control_points.length > 1) {
        graphics.lineStyle(2, 0xff0000);
        var prevPoint = bezier(control_points, 0);
        for (let t = 0; t <= 1; t += 0.01) {
            var point = bezier(control_points, t);
            graphics.lineBetween(prevPoint.x, prevPoint.y, point.x, point.y);
            prevPoint = point;
        }
        // Draw a line to the last control point
        var lastPoint = control_points[control_points.length - 1];
        graphics.lineBetween(prevPoint.x, prevPoint.y, lastPoint.x, lastPoint.y);
    }
}