var checkerboard;
var ctx;
var canvas;
var running = false;

var gyroPos = new THREE.Vector3();
var sensorPos = new THREE.Quaternion();

var thumbstickMoving = false;

var sceneNumber = 0;
var prev_time = 0;


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
                // $(".flying").each(function (fs) {
                //     speed = speed / 2;
                //     this.setAttribute("flyaway", "speed: " + speed);
                // });
                thumbstickMoving = false;
            }
        }
        if (evt.detail.x > 0.95) {
            console.log("RIGHT");
            if (thumbstickMoving) {
                // $(".flying").each(function (fs) {
                //     speed = speed * 2;
                //     this.setAttribute("flyaway", "speed: " + speed);
                // });
                thumbstickMoving = false;
            }
        }
    }
});

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

    $('html').keypress(function (e) {
        console.log(e.key);
        document.getElementById("keypressed").setAttribute("text", "value", e.key);
        $("#keypressed").attr("text", "value", e.key);
    });
    var gabor = createGabor(100, 0.1, 45, 10, 0.5);
    $("#gabor").append(gabor);
    rr = gabor.toDataURL("image/png").split(';base64,')[1];
    $("#main").append('<a-plane material="src:url(data:image/png;base64,' + rr + ');transparent:true" width="10" height="10" position="0 0 -50"></a-plane>');

});

function createGabor(side, frequency, orientation, std, phase) {
    /*
        Generates and returns a Gabor patch canvas.
        Arguments:
        side    		--	The size of the patch in pixels.
        frequency		--	The spatial frequency of the patch.
        orientation		--	The orientation of the patch in degrees.
        std 		--	The standard deviation of the Gaussian envelope.
        phase		--	The phase of the patch.
    */
    var gabor = document.createElement("canvas");
    gabor.setAttribute("id", "gabor");
    gabor.width = side;
    gabor.height = side;
    orientation = orientation * (Math.PI / 180);
    var ctx = gabor.getContext("2d");
    ctx.createImageData(side, side);
    idata = ctx.getImageData(0, 0, side, side);
    var amp, f, dx, dy;
    for (var x = 0; x < side; x++) {
        for (var y = 0; y < side; y++) {
            // The dx from the center
            dx = x - 0.5 * side;
            // The dy from the center
            dy = y - 0.5 * side;
            t = 0.001 + Math.atan2(dy, dx) + orientation;
            r = Math.sqrt(dx * dx + dy * dy);
            xx = r * Math.cos(t);
            yy = r * Math.sin(t);

            amp = 0.5 + 0.5 * Math.cos(2 * Math.PI * (xx * frequency + phase));
            f = Math.exp(-0.5 * Math.pow(xx / std, 2) - 0.5 * Math.pow(yy / std, 2));

            // console.log(amp);

            idata.data[(y * side + x) * 4] = 255 * (amp);     // red
            idata.data[(y * side + x) * 4 + 1] = 255 * (amp); // green
            idata.data[(y * side + x) * 4 + 2] = 255 * (amp); // blue
            idata.data[(y * side + x) * 4 + 3] = 255 * f;
        }
    }
    ctx.putImageData(idata, 0, 0);
    return gabor;
}