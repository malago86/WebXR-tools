// Run everything inside window load event handler, to make sure
// DOM is fully loaded and styled before trying to manipulate it,
// and to not mess up the global scope. We are giving the event
// handler a name (setupWebGL) so that we can refer to the
// function object within the function itself.
// window.addEventListener("load", function setupWebGL(evt) {
//     "use strict"

//     // Cleaning after ourselves. The event handler removes
//     // itself, because it only needs to run once.
//     window.removeEventListener(evt.type, setupWebGL, false);

//     // References to the document elements.
//     var canvas = document.querySelector("canvas");

//     // Getting the WebGL rendering context.
//     var gl = canvas.getContext("webgl")
//         || canvas.getContext("experimental-webgl");

//     // If failed, inform user of failure. Otherwise, initialize
//     // the drawing buffer (the viewport) and clear the context
//     // with a solid color.
//     if (!gl) {
//         // paragraph.innerHTML = "Failed to get WebGL context. "
//         //     + "Your browser or device may not support WebGL.";
//         return;
//     }
//     // paragraph.innerHTML =
//     //     "Congratulations! Your browser supports WebGL. ";
//     gl.viewport(0, 0,
//         gl.drawingBufferWidth, gl.drawingBufferHeight);
//     // Set the clear color to darkish green.
//     gl.clearColor(0.5, 0.5, 0.0, 1.0);
//     // Clear the context with the newly set color. This is
//     // the function call that actually does the drawing.
//     gl.clear(gl.COLOR_BUFFER_BIT);

// }, false);
// window.addEventListener("load", function setupWebGL(evt) {
//     "use strict"
// }, false)
// window.addEventListener("load", main(), false);
var checkerboard;
var ctx;
var canvas;
var running = false;

var gyroPos = new THREE.Vector3();
var sensorPos = new THREE.Quaternion();

var thumbstickMoving = false;

var sceneNumber = 0;


AFRAME.registerComponent("rotation-reader", {
    tick: function (time, timeDelta) {

        this.el.object3D.getWorldPosition(gyroPos);
        this.el.object3D.getWorldQuaternion(sensorPos);

        let text = "<ul>";
        clock = time * 0.001;
        text += "<li>Time: " + clock.toFixed(5) + "</li>";
        text += "<li>Width: " + window.innerWidth + "</li>";
        text += "<li>Height: " + window.innerHeight + "</li>";
        text += "<li>Gyro: " + gyroPos.x.toFixed(4) + "x, " + gyroPos.y.toFixed(4) + "y, " + gyroPos.z.toFixed(4) + "z" + "</li>";
        text += "<li>Accel: " + sensorPos.x.toFixed(4) + "x, " + sensorPos.y.toFixed(4) + "y, " + sensorPos.z.toFixed(4) + "z" + "</li>";


        var fs2 = document.querySelector('#flyingspot2');
        text += "<li>Spot #3: " + fs2.object3D.position.x.toFixed(4) + "</li>";
        text += "</ul>"
        document.getElementById("timeOverlay").innerHTML = text;
        document.getElementById("time").setAttribute("value", "Time: " + clock.toFixed(3) + "\n\
            Width: " + window.innerWidth + "\n\
            Height: " + window.innerHeight + "\n\
            Gyro: " + gyroPos.x.toFixed(2) + "x, " + gyroPos.y.toFixed(2) + "y, " + gyroPos.z.toFixed(2) + "z" + "\n\
            Accel: " + sensorPos.x.toFixed(2) + "x, " + sensorPos.y.toFixed(2) + "y, " + sensorPos.z.toFixed(2) + "z");
    }
});

AFRAME.registerComponent('button-listener', {
    init: function () {
        var el = this.el;

        el.addEventListener('abuttondown', function (evt) {
            $(".flying").each(function (fs) {
                // this.object3D.position.x = 0;
                if (running)
                    this.pause();
                else
                    this.play()
            });
            running = !running;
        });

        el.addEventListener('trackpadchanged', function (evt) {
            $(".flying").each(function (fs) {
                // this.object3D.position.x = 0;
                if (running)
                    this.pause();
                else
                    this.play()
            });
            running = !running;
        });

        el.addEventListener('triggerdown', function (evt) {
            $(".flying").each(function (fs) {
                this.object3D.position.x = 0;
            });
            running = false;
        });

        el.addEventListener('gripdown', function (evt) {
            document.querySelector('a-scene').exitVR();
            location.reload();
        });
    }
});

AFRAME.registerComponent('thumbstick-logging', {
    init: function () {
        this.el.addEventListener('thumbstickmoved', this.logThumbstick);
        this.el.addEventListener('thumbsticktouchstart', function () {
            thumbstickMoving = true;
        });
        this.el.addEventListener('thumbsticktouchend', function () {
            thumbstickMoving = false;
        });
    },
    logThumbstick: function (evt) {
        if (evt.detail.y > 0.95) {
            console.log("DOWN");
            if (thumbstickMoving) {
                if (sceneNumber == 0) {
                    $("#white-balance").attr("visible", "false");
                    $("#main").attr("visible", "true");
                } else if (sceneNumber == 1) {
                    $("#main").attr("visible", "false");
                    $("#alignment").attr("visible", "true");
                } else {
                    $("#alignment").attr("visible", "false");
                    $("#white-balance").attr("visible", "true");
                }
                sceneNumber = sceneNumber == 2 ? 0 : sceneNumber + 1;
                thumbstickMoving = false;
            }
        }
        if (evt.detail.y < -0.95) { console.log("UP"); }
        if (evt.detail.x < -0.95) {
            console.log("LEFT");
            if (thumbstickMoving) {
                $(".flying").each(function (fs) {
                    this.setAttribute("flyaway", "speed: " + (this.getAttribute("flyaway").speed / 2));
                });
                thumbstickMoving = false;
            }
        }
        if (evt.detail.x > 0.95) {
            console.log("RIGHT");
            if (thumbstickMoving) {
                $(".flying").each(function (fs) {
                    this.setAttribute("flyaway", "speed: " + (this.getAttribute("flyaway").speed * 2));
                });
                thumbstickMoving = false;
            }
        }
    }
});

AFRAME.registerComponent("flyaway", {
    schema: {
        speed: { type: "number" }
    },
    init: function () { },
    update: function () { },
    tick: function (el) {
        if (running) {
            this.el.object3D.position.x += this.data.speed;
            if (this.el.object3D.position.x > 0.2) {
                this.el.object3D.position.x = -this.el.object3D.position.x
            }
        }
    },
    remove: function () { },
    pause: function () { },
    play: function () { }
});


function createCheckerBoard(width, height) {
    var myImageData = ctx.createImageData(width, height);
    var matrix = [];
    for (var i = 0; i < width; i++) {
        matrix[i] = [];
        for (var j = 0; j < height; j++) {
            if (i % 2 && j % 2 == 0 || i % 2 == 0 && j % 2) {
                matrix[i][j] = 0;
            } else {
                matrix[i][j] = 255;
            }
        }
    }
    return matrix;
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

$(document).ready(function () {
    addAlignmentSquares();
    function addAlignmentSquares(n = 10) {
        for (row = 0; row < n / 2; row++) {
            for (col = 0; col < n / 2; col++) {
                x = col * 0.05;
                y = row * 0.05;
                $("#alignment").append('<a-entity class="alignment-square" material="color: white; " geometry="primitive: plane; width: .02; height: .02; "\
            position = "'+ x + ' ' + y + ' -1" ></a-entity>');
                $("#alignment").append('<a-entity class="alignment-square" material="color: white; " geometry="primitive: plane; width: .02; height: .02; "\
            position = "'+ -x + ' ' + y + ' -1" ></a-entity>');
                $("#alignment").append('<a-entity class="alignment-square" material="color: white; " geometry="primitive: plane; width: .02; height: .02; "\
            position = "'+ x + ' ' + -y + ' -1" ></a-entity>');
                $("#alignment").append('<a-entity class="alignment-square" material="color: white; " geometry="primitive: plane; width: .02; height: .02; "\
            position = "'+ -x + ' ' + -y + ' -1" ></a-entity>');
            }
        }
    }
    $("#fullscreen").click(function (event) {
        toggleFullScreen();
    });
    $("#play").click(function (event) {
        $(".flying").each(function (fs) {
            // this.object3D.position.x = 0;
            if (running)
                this.pause();
            else
                this.play()
        });
        running = !running;
    });
    $("#reset").click(function (event) {
        $(".flying").each(function (fs) {
            this.object3D.position.x = 0;
        });
        running = false;
    });

    $("#faster").click(function (event) {
        $(".flying").each(function (fs) {
            this.setAttribute("flyaway", "speed: " + (this.getAttribute("flyaway").speed * 2));
        });
    });

    $("#slower").click(function (event) {
        $(".flying").each(function (fs) {
            this.setAttribute("flyaway", "speed: " + (this.getAttribute("flyaway").speed / 2));
        });
        event.preventDefault();
    });

    $('html').keypress(function (e) {
        console.log(e.key);
        document.getElementById("keypressed").setAttribute("text", "value", e.key);
        $("#keypressed").attr("text", "value", e.key);
    });


});