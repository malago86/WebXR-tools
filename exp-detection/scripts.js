var checkerboard;
var ctx;
var canvas;
var running = false;

var gyroPos = new THREE.Vector3();
var sensorPos = new THREE.Quaternion();

var thumbstickMoving = false;

var sceneNumber = 0;
var prev_time = 0;

var responses = [];
var present = true, contrast = 1, position = [0, 0, -50];
var stimulusOn = -1, stimulusOff = -1;

var maxTrials = 0;

var positionVariation = 70;

var acceptingResponses = false;

var doubleQuit = false;

var backgroundColor = "#7F7F7F";

AFRAME.registerComponent('button-listener', {
    init: function () {
        var el = this.el;

        el.addEventListener('abuttondown', function (evt) {
            if (acceptingResponses)
                newTrial(true);
        });

        el.addEventListener('bbuttondown', function (evt) {
            if (acceptingResponses)
                newTrial(false);
        });

        el.addEventListener('trackpadchanged', function (evt) {

        });

        el.addEventListener('triggerdown', function (evt) {

        });

        el.addEventListener('gripdown', function (evt) {
            if (doubleQuit == false) {
                doubleQuit = true;
                setTimeout(function () {
                    doubleQuit = false;
                }, 1000);
            }
            else {
                document.querySelector('a-scene').exitVR();
                location.reload();
            }
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


    $("#fullscreen").click(function (event) {
        toggleFullScreen();
    });

    // $('html').keypress(function (e) {
    //     document.getElementById("keypressed").setAttribute("text", "value", e.key);
    //     $("#keypressed").attr("text", "value", e.key);
    // });
    $("#main").append('<a-plane id="noise-vr" material="transparent:true;opacity:0" width="100" height="100" position="0 0 -50.1"></a-plane>');

    var gabor = createGabor(100, 0.1, 45, 10, 0.5, 1);
    $("#gabor").append(gabor);
    rr = gabor.toDataURL("image/png").split(';base64,')[1];
    $("#main").append('<a-plane id="gabor-vr" material="src:url(data:image/png;base64,' + rr + ');transparent:true" width="10" height="10" position="0 0 -50"></a-plane>');

    // cues
    $("#main").append('<a-plane class="cue" material="color:black; transparent:true" width=".5" height="3" position="0 -7 -50"></a-plane>');
    $("#main").append('<a-plane class="cue" material="color:black; transparent:true" width=".5" height="3" position="0 7 -50"></a-plane>');
    $("#main").append('<a-plane class="cue" material="color:black; transparent:true" width="3" height=".5" position="-7 0 -50"></a-plane>');
    $("#main").append('<a-plane class="cue" material="color:black; transparent:true" width="3" height=".5" position="7 0 -50"></a-plane>');



    stimulusOn = Date.now();
    acceptingResponses = true;
    maxTrials = parseInt($("#num-trials").val());
    $("#info").on("keypress", function (e) {
        e.stopPropagation();
    });
    $(document).on('keypress', function (event) {
        let keycode = (event.keyCode ? event.keyCode : event.which);
        if (acceptingResponses) {
            if (keycode == '97') {
                newTrial(true);
            } else if (keycode == "98") {
                newTrial(false);
            }
        }
    });

    $("#myEnterVRButton").click(function () {
        maxTrials = parseInt($("#num-trials").val());
        stimulusOn = Date.now();
    });

    $("#size-std").keyup(function () {
        var gabor = createGabor(100, $("#frequency").val(), 45, $("#size-std").val(), 0.5, 1);
        $("#gabor").html(gabor);
        rr = gabor.toDataURL("image/png").split(';base64,')[1];
        document.getElementById("gabor-vr").setAttribute("material", "src", "url(data:image/png;base64," + rr + ")");
    });

    $("#frequency").keyup(function () {
        var gabor = createGabor(100, $("#frequency").val(), 45, $("#size-std").val(), 0.5, 1);
        $("#gabor").html(gabor);
        rr = gabor.toDataURL("image/png").split(';base64,')[1];
        document.getElementById("gabor-vr").setAttribute("material", "src", "url(data:image/png;base64," + rr + ")");
    });

    $("#background-noise").change(function () {
        showNoise();
    });

    $("#gaussian-sigma").keyup(function () {
        showNoise();
    });

    $("#noise-params").keyup(function () {
        showNoise();
    });

    $('#background-color').minicolors({
        control: 'hue',
        change: function () {
            backgroundColor = $('#background-color').val();
            $("#sky").attr("color", backgroundColor);
        },
    });

});

function showNoise() {
    if ($("#background-noise").prop("checked")) {
        $("#noise-params").show();
        var noise = createNoiseField(1000, 128, parseFloat($("#noise-sigma").val()), parseFloat($("#gaussian-sigma").val()));
        rr = noise.toDataURL("image/png").split(';base64,')[1];
        document.getElementById("noise-vr").setAttribute("material", "src", "url(data:image/png;base64," + rr + ")");
        document.getElementById("noise-vr").setAttribute("material", "opacity", "1");
    } else {
        $("#noise-params").hide();
        document.getElementById("noise-vr").setAttribute("material", "opacity", "0");
    }
}

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

function createNoiseField(side, mean, std, gaussian) {
    var noise = document.createElement("canvas");
    noise.setAttribute("id", "noise");
    noise.width = side;
    noise.height = side;
    var ctx = noise.getContext("2d");
    ctx.createImageData(side, side);
    idata = ctx.getImageData(0, 0, side, side);
    for (var x = 0; x < side; x++) {
        for (var y = 0; y < side; y++) {
            amp = (Math.random() - 0.5) * std;
            idata.data[(y * side + x) * 4] = mean + amp;     // red
            idata.data[(y * side + x) * 4 + 1] = mean + amp; // green
            idata.data[(y * side + x) * 4 + 2] = mean + amp; // blue
            idata.data[(y * side + x) * 4 + 3] = 255;
        }
    }

    if (gaussian > 0) {
        kernel = makeGaussKernel(gaussian);
        for (var ch = 0; ch < 3; ch++) {
            gauss_internal(idata, kernel, ch, false);
        }
    }
    ctx.putImageData(idata, 0, 0);

    return noise;
}

function makeGaussKernel(sigma) {
    const GAUSSKERN = 6.0;
    var dim = parseInt(Math.max(3.0, GAUSSKERN * sigma));
    var sqrtSigmaPi2 = Math.sqrt(Math.PI * 2.0) * sigma;
    var s2 = 2.0 * sigma * sigma;
    var sum = 0.0;

    var kernel = new Float32Array(dim - !(dim & 1)); // Make it odd number
    for (var j = 0, i = -parseInt(kernel.length / 2); j < kernel.length; i++, j++) {
        kernel[j] = Math.exp(-(i * i) / (s2)) / sqrtSigmaPi2;
        sum += kernel[j];
    }
    // Normalize the gaussian kernel to prevent image darkening/brightening
    for (var i = 0; i < dim; i++) {
        kernel[i] /= sum;
    }
    return kernel;
}

/**
* Internal helper method
* @param pixels - the Canvas pixels
* @param kernel - the Gaussian blur kernel
* @param ch - the color channel to apply the blur on
* @param gray - flag to show RGB or Grayscale image
*/
function gauss_internal(pixels, kernel, ch, gray) {
    var data = pixels.data;
    var w = pixels.width;
    var h = pixels.height;
    var buff = new Uint8Array(w * h);
    var mk = Math.floor(kernel.length / 2);
    var kl = kernel.length;

    // First step process columns
    for (var j = 0, hw = 0; j < h; j++, hw += w) {
        for (var i = 0; i < w; i++) {
            var sum = 0;
            for (var k = 0; k < kl; k++) {
                var col = i + (k - mk);
                col = (col < 0) ? 0 : ((col >= w) ? w - 1 : col);
                sum += data[(hw + col) * 4 + ch] * kernel[k];
            }
            buff[hw + i] = sum;
        }
    }

    // Second step process rows
    for (var j = 0, offset = 0; j < h; j++, offset += w) {
        for (var i = 0; i < w; i++) {
            var sum = 0;
            for (k = 0; k < kl; k++) {
                var row = j + (k - mk);
                row = (row < 0) ? 0 : ((row >= h) ? h - 1 : row);
                sum += buff[(row * w + i)] * kernel[k];
            }
            var off = (j * w + i) * 4;
            (!gray) ? data[off + ch] = sum :
                data[off] = data[off + 1] = data[off + 2] = sum;
        }
    }
}

function createGabor(side, frequency, orientation, std, phase, contrast) {
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
            idata.data[(y * side + x) * 4 + 3] = 255 * f * contrast;
        }
    }
    ctx.putImageData(idata, 0, 0);
    return gabor;
}

function contrastImage(imageData, contrast) {

    var data = imageData.data;
    var factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (var i = 0; i < data.length; i += 4) {
        data[i] = factor * (data[i] - 128) + 128;
        data[i + 1] = factor * (data[i + 1] - 128) + 128;
        data[i + 2] = factor * (data[i + 2] - 128) + 128;
    }
    return imageData;
}

function newTrial(response) {
    stimulusOff = Date.now();
    acceptingResponses = false;

    str = present == response ? "Correct!" : "Incorrect!";
    document.getElementById("bottom-text").setAttribute("text", "value", str + "\n\n" + (responses.length + 1) + "/" + maxTrials);
    document.getElementById("bottom-text").setAttribute("position", "0 0 -50");
    document.getElementById("gabor-vr").setAttribute("visible", "false");
    Array.from(document.getElementsByClassName("cue")).forEach(function (e) { e.setAttribute("material", "opacity", "0") });
    document.getElementById("sky").setAttribute("color", "rgb(0,0,0)");
    responses.push({
        present: present,
        contrast: contrast,
        frequency: parseFloat($("#frequency").val()),
        size_std: parseFloat($("#size-std").val()),
        position: position,
        trialTime: stimulusOff - stimulusOn,
        response: response
    });

    // NEW TRIAL INFO

    present = Math.random() < 0.5;

    if (!present) {
        contrast = 0;
    } else {
        contrast = parseInt(Math.random() * 10 + 1) / 10 * parseFloat($("#max-contrast").val()); // between 0 and 0.1
    }

    // contrast = 0.2;
    angle = Math.random() * 360;

    gabor = createGabor(100, $("#frequency").val(), angle, $("#size-std").val(), 0.5, contrast);

    setTimeout(function () {
        if (responses.length == maxTrials) {
            // END EXPERIMENT!
            document.getElementById("bottom-text").setAttribute("text", "value", "EXPERIMENT FINISHED!\n\nThanks for playing :)");
            json = {};
            $("#info").find(".input").each(function () {
                if ($(this).attr("type") == "checkbox")
                    if ($(this).prop("checked"))
                        json[$(this).attr("id")] = true;
                    else
                        json[$(this).attr("id")] = false;
                else
                    json[$(this).attr("id")] = Number.isNaN(parseFloat($(this).val())) ? $(this).val() : parseFloat($(this).val())
            });
            json["responses"] = responses;

            downloadObjectAsJson(json, json["participant"] + "-" + Date.now());
        } else {
            rr = gabor.toDataURL("image/png").split(';base64,')[1];
            document.getElementById("gabor-vr").setAttribute("material", "src", "url(data:image/png;base64," + rr + ")");

            document.getElementById("bottom-text").setAttribute("text", "value", "Press A for present, B for absent");
            document.getElementById("bottom-text").setAttribute("position", "0 -25 -50");
            document.getElementById("gabor-vr").setAttribute("visible", "true");
            document.getElementById("sky").setAttribute("color", backgroundColor);
            acceptingResponses = true;
            if ($("#random-location").prop("checked")) {
                position = [Math.random() * positionVariation - positionVariation / 2, Math.random() * positionVariation - positionVariation / 2, -50];
                document.getElementById("gabor-vr").setAttribute("position", position.join(" "));
                Array.from(document.getElementsByClassName("cue")).forEach(function (e) { e.setAttribute("material", "opacity", "0") });
            } else {
                Array.from(document.getElementsByClassName("cue")).forEach(function (e) { e.setAttribute("material", "opacity", "1") });
            }
            stimulusOn = Date.now();
        }
    }, 1000);

}

function downloadObjectAsJson(exportObj, exportName) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}