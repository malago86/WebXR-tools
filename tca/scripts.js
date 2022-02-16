
var checkerboard;
var ctx;
var canvas;
var running = false;

var gyroPos = new THREE.Vector3();
var sensorPos = new THREE.Quaternion();

var thumbstickMoving = false;

var bar = false;
var step = 0.1;
var stepDva = 5;
var dva = 0;

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
            moveBar(step);
        });

        el.addEventListener('bbuttondown', function (evt) {
            moveBar(-step);
        });

        el.addEventListener('trackpadchanged', function (evt) {
            bar = !bar;
        });

        el.addEventListener('triggerdown', function (evt) {
            showCameraFov();
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

    $(document).keydown(function (event) {
        let keycode = event.originalEvent.key;
        // console.log(keycode);
        if (keycode == 'ArrowLeft') { //a
            moveBar(-step);
        } else if (keycode == "ArrowRight") { //b
            moveBar(step);
        } else if (keycode == "ArrowUp") { //b
            changeBar(true);
        } else if (keycode == "ArrowDown") { //b
            changeBar(false);
        } else if (keycode == "+") { //b
            moveAll(stepDva);
        } else if (keycode == "-") { //b
            moveAll(-stepDva);
        };
        return false;
    });
});

function changeBar(newBar) {
    bar = newBar;
    if (bar) {
        document.getElementById("selected-bar").object3D.position.y = -0.25;
        document.getElementById("selected-bar").setAttribute("color", "red");
    } else {
        document.getElementById("selected-bar").object3D.position.y = -0.3;
        document.getElementById("selected-bar").setAttribute("color", "#44CCFF");
    }
}

function moveAll(dir) {
    dva += dir;
    $(".bar").each(function (i, e) {
        e.object3D.position.x = dva;
    });
    console.log(dva);
    $(".bar2").each(function (i, e) {
        if (dva == 0)
            $(e).attr("visible", "false");
        else
            $(e).attr("visible", "true");
        e.object3D.position.x = -dva;
    });

    document.getElementById("dva-text").setAttribute("text", "value", Math.abs(dva) + " dva");
    // document.getElementById("dva-text").object3D.position.x = dva / 51;
    document.getElementById("displacement-red").setAttribute("text", "value", Math.abs($("#red")[0].object3D.position.x.toFixed(1)) + " (0 %)");
    document.getElementById("displacement-blue").setAttribute("text", "value", Math.abs($("#blue")[0].object3D.position.x.toFixed(1)) + " (0 %)");
}

function moveBar(dir) {
    if (bar) {
        $("#red")[0].object3D.position.x += dir;
        $("#red2")[0].object3D.position.x -= dir;
    } else {
        $("#blue")[0].object3D.position.x += dir;
        $("#blue2")[0].object3D.position.x -= dir;
    }
    if (dva > 0) {
        document.getElementById("displacement-red").setAttribute("text", "value", Math.abs($("#red")[0].object3D.position.x.toFixed(1)) +
            " (" + (Math.abs($("#red")[0].object3D.position.x.toFixed(1)) * 100 / dva - 100).toFixed(2) + " %)");
        document.getElementById("displacement-blue").setAttribute("text", "value", Math.abs($("#blue")[0].object3D.position.x.toFixed(1)) +
            " (" + (Math.abs($("#blue")[0].object3D.position.x.toFixed(1)) * 100 / dva - 100).toFixed(2) + " %)");
    } else {
        document.getElementById("displacement-red").setAttribute("text", "value", Math.abs($("#red")[0].object3D.position.x.toFixed(1)) +
            " (" + (Math.abs($("#red")[0].object3D.position.x.toFixed(1)) * 100).toFixed(2) + " %)");
        document.getElementById("displacement-blue").setAttribute("text", "value", Math.abs($("#blue")[0].object3D.position.x.toFixed(1)) +
            " (" + (Math.abs($("#blue")[0].object3D.position.x.toFixed(1)) * 100).toFixed(2) + " %)");
    }
}