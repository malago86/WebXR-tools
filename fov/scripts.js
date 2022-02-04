
var checkerboard;
var ctx;
var canvas;
var running = false;

var gyroPos = new THREE.Vector3();
var sensorPos = new THREE.Quaternion();

var thumbstickMoving = false;

var sceneNumber = 0;

var fov = 20;


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

        text += "</ul>"
        // document.getElementById("timeOverlay").innerHTML = text;
        // document.getElementById("time").setAttribute("value", "Time: " + clock.toFixed(3) + "\n\
        //     Width: " + window.innerWidth + "\n\
        //     Height: " + window.innerHeight + "\n\
        //     Gyro: " + gyroPos.x.toFixed(2) + "x, " + gyroPos.y.toFixed(2) + "y, " + gyroPos.z.toFixed(2) + "z" + "\n\
        //     Accel: " + sensorPos.x.toFixed(2) + "x, " + sensorPos.y.toFixed(2) + "y, " + sensorPos.z.toFixed(2) + "z");
    }
});

AFRAME.registerComponent('button-listener', {
    init: function () {
        var el = this.el;

        el.addEventListener('abuttondown', function (evt) {
            changeCircle(1);
        });

        el.addEventListener('bbuttondown', function (evt) {
            changeCircle(-1);
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
    });

    $(document).on('keypress', function (event) {
        let keycode = (event.keyCode ? event.keyCode : event.which);
        if (keycode == '97') { //a
            changeCircle(0.1);
        } else if (keycode == "98") { //b
            changeCircle(-0.1);
        }
    });

    $("#reset").click(function (event) {
        $(".fov-circle").each(function (i, e) {
            fov = 20;
            e.setAttribute("geometry", "radiusInner", fov * Math.tan(1 * Math.PI / 180));
            e.setAttribute("geometry", "radiusOuter", (fov + 1) * Math.tan(1 * Math.PI / 180));
            document.getElementById("size-text").setAttribute("text", "value", fov.toFixed(1));
        })
    });

    $(".fov-circle").each(function (i, e) {
        e.setAttribute("geometry", "radiusInner", fov * Math.tan(1 * Math.PI / 180));
        e.setAttribute("geometry", "radiusOuter", (fov + 1) * Math.tan(1 * Math.PI / 180));
        document.getElementById("size-text").setAttribute("text", "value", fov.toFixed(1));
    });
});

function changeCircle(dir) {

    $(".fov-circle").each(function (i, e) {
        // scale = this.object3D.scale;
        // scale.x += dir;
        // scale.y += dir;
        // this.object3D.scale = scale;
        // document.getElementById("size-text").setAttribute("text", "value", Math.round(1000 * 0.33 / Math.tan(1 * Math.PI / 180) * this.object3D.scale.x) / 1000);
        fov += dir;
        e.setAttribute("geometry", "radiusInner", fov * Math.tan(1 * Math.PI / 180));
        e.setAttribute("geometry", "radiusOuter", (fov + 1) * Math.tan(1 * Math.PI / 180));
        document.getElementById("size-text").setAttribute("text", "value", fov.toFixed(1));
    })
}