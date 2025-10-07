import * as THREE from "three";
import * as TWEEN from '@tweenjs/tween.js';
import { Group } from '@tweenjs/tween.js';
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { TeapotGeometry } from "three/examples/jsm/Addons.js";

// Automatically resizes the window.
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    // labelRenderer.setSize(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// SCENE
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.000);

// // HTML INTEGRATION
// const labelRenderer = new CSS2DRenderer();
// labelRenderer.setSize(window.innerWidth, window.innerHeight);
// labelRenderer.domElement.style.position = "absolute";
// labelRenderer.domElement.style.top = "0px";
// labelRenderer.domElement.style.color = "#ffffff";
// labelRenderer.domElement.style.pointerEvents = "none";
// document.body.appendChild(labelRenderer.domElement);
// const p = document.createElement("p");
// p.style.whiteSpace = "pre";
// p.style.right = "120%";
// p.style.bottom = "100%";
// p.textContent = "Green: Linear\r\n" + "Pink: De Casteljau\r\n" + "Orange: Quadratic_Out\r\n" + "Blue: Catmull-Rom\r\n" + "Yellow: Quadratic_Out (built-in)\r\n" + "Cyan: Catmull-Rom (built-in)\r\n";
// const pPointLabel = new CSS2DObject(p);
// pPointLabel.center.x = 0;
// pPointLabel.center.y = 0;
// scene.add(pPointLabel);
// // const input = document.createElement("input");
// // input.type = "file";
// // input.name = "filename";
// // const cPointLabel = new CSS2DObject(input);
// // cPointLabel.position.set(0, 0, 0);
// // scene.add(cPointLabel);

// RENDERER SETUP
let renderer;
initializeRenderer();
function initializeRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);
    renderer.setClearColor("#000000");
}

// CAMERA
let camera;
initializeCamera();
function initializeCamera() {
    camera = new THREE.PerspectiveCamera(
        75, // FoV
        window.innerWidth / window.innerHeight, // Aspect Ratio
        0.1, // Near
        1000 // Far
    );
    camera.position.set(0, 0, 200);
    camera.rotation.x = rad(0);
    camera.rotation.y = rad(0);
    camera.rotation.z = rad(0);
    camera.position.set(100, -100, 100);
    camera.rotation.x = rad(45);
    camera.rotation.y = rad(30);
    camera.rotation.z = rad(30);
}

//
// Here be the Object(s)
//

// BALLS
const gravity = 100;
const us = 1; // Coefficient of restitution
let balls = [];
initializeBalls();
function initializeBalls() {

    var i = 0;
    while (i != 3) {
        balls[i] = new THREE.Mesh(
            new THREE.SphereGeometry(5, 32, 32, 0),
            new THREE.MeshPhongMaterial({
                color: 0xff8000,
                flatShading: false
            })
        );
        balls[i].castShadow = true;
        balls[i].receiveShadow = true;
        balls[i].velocity = new THREE.Vector3(0, 0, 0);
        balls[i].acceleration = new THREE.Vector3(0, 0, 0);
        balls[i].force = new THREE.Vector3(0, 0, 0);
        balls[i].momentum = new THREE.Vector3(0, 0, 0);
        balls[i].impulse = new THREE.Vector3(0, 0, 0);
        balls[i].posOld = new THREE.Vector3(0, 0, 0);
        balls[i].mass = 6;
        balls[i].radius = 5;
        scene.add(balls[i]);
        i++;
    }

    balls[0].position.set(0.0, -50.0, 0.0);
    balls[0].material.color.setHex(0xff8000);

    balls[1].position.set(6.0, 0.0, 0.0);
    balls[1].material.color.setHex(0xc0c000)

    balls[2].position.set(-6.0, 50.0, 0.0);
    balls[2].material.color.setHex(0xff4040)

    balls[0].impulse = new THREE.Vector3(0, 500, 0);
    balls[1].impulse = new THREE.Vector3(0, 0, 0);
    balls[2].impulse = new THREE.Vector3(0, 0, 0);
}

// WALLS (and floor)
let plane;
const coeffRest = 1; // Coefficient of restitution
let walls = [];
let pits = [];
initializeWalls(100, 150, 5);
function initializeWalls(w, l, border) {

    plane = new THREE.Mesh(
        new THREE.PlaneGeometry(w, l, 1, 1),
        new THREE.MeshPhongMaterial({
            color: 0x0080ff,
            flatShading: false
        })
    );
    plane.receiveShadow = true;
    scene.add(plane);
    plane.position.z = -5

    var i = 0;
    while (i != 6) {
        pits[i] = new THREE.Mesh(
            new THREE.CircleGeometry(10, 32),
            new THREE.MeshPhongMaterial({
                color: 0x000000,
                flatShading: false,
                side: THREE.DoubleSide
            })
        );
        pits[i].castShadow = true;
        pits[i].receiveShadow = true;
        pits[i].border = border;
        pits[i].position.z = -5;
        pits[i].radius = 10;
        scene.add(pits[i]);
        i++;
    }

    pits[0].position.set(w / 2, l / 2, -4.99);
    pits[1].position.set(-w / 2, l / 2, -4.99);
    pits[2].position.set(w / 2, 0 / 2, -4.99);
    pits[3].position.set(-w / 2, 0 / 2, -4.99);
    pits[4].position.set(w / 2, -l / 2, -4.99);
    pits[5].position.set(-w / 2, -l / 2, -4.99);


    var i = 0;
    while (i != 6) {
        walls[i] = new THREE.Mesh(
            new THREE.PlaneGeometry(1, 1),
            new THREE.MeshPhongMaterial({
                color: 0xffffff,
                flatShading: false,
                side: THREE.DoubleSide
            })
        );
        walls[i].castShadow = true;
        walls[i].receiveShadow = true;
        walls[i].border = border;
        scene.add(walls[i]);
        i++;
    }
    walls[0].scale.set(10, l / 2 - pits[0].radius * 2, 0.00001);
    walls[0].rotation.y = rad(90);
    walls[0].position.set(w / 2, -l / 4, 0.0);

    walls[5].scale.set(10, l / 2 - pits[0].radius * 2, 0.00001);
    walls[5].rotation.y = rad(90);
    walls[5].position.set(w / 2, l / 4, 0.0);

    walls[1].scale.set(10, l / 2 - pits[0].radius * 2, 0.00001);
    walls[1].rotation.y = rad(90);
    walls[1].position.set(-w / 2, -l / 4, 0.0);

    walls[4].scale.set(10, l / 2 - pits[0].radius * 2, 0.00001);
    walls[4].rotation.y = rad(90);
    walls[4].position.set(-w / 2, l / 4, 0.0);

    walls[2].scale.set(w - pits[0].radius * 2, 10, 0.00001);
    walls[2].rotation.x = -rad(90);
    walls[2].position.set(0, l / 2, 0.0);

    walls[3].scale.set(w - pits[0].radius * 2, 10, 0.00001);
    walls[3].rotation.x = -rad(90);
    walls[3].position.set(0, -l / 2, 0.0);
}

// LIGHT(S)
let ambientLight, spotLight;
initializeLights();
function initializeLights() {
    ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(ambientLight);

    spotLight = new THREE.SpotLight(0xffffff, 3, 0, rad(-60), 1, 0);
    spotLight.position.set(0, 0, 100);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.set(1024, 1024);
    spotLight.shadow.camera.near = 0.1;
    spotLight.shadow.camera.far = 1000;
    spotLight.rotation.x = rad(90);
    scene.add(spotLight);
}


// AUDIO
let listener, audioLoader, sound;
initializeAudio();
function initializeAudio() {
    listener = new THREE.AudioListener();
    camera.add(listener);
    audioLoader = new THREE.AudioLoader();
    sound = new THREE.Audio(listener);
    audioLoader.load("../sounds/ding.wav", function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(false);
        sound.setVolume(0.5);
        window.addEventListener("click", function () {
            sound.stop();
            sound.play();
        });
    });
}

// I'M STUFF

// ACTION!
var preTime = 0;
function animate(time) {
    requestAnimationFrame(function loop(time) {
        requestAnimationFrame(loop);
    })
    // labelRenderer.render(scene, camera);
    renderer.render(scene, camera);

    var dt = time - preTime;
    // console.log(preTime, time, dt);

    step1(balls);
    step2(balls, walls, pits, dt / 1000);
    step3(balls);

    preTime = time;
}

function step1(balls) {
    for (const ball of balls) {
        ball.force = new THREE.Vector3().addScaledVector(ball.velocity, -(1 - us) * ball.mass);
    }
}

function step2(balls, walls, pits, dtS) {

    // Integrate position
    for (const ball of balls) {
        ball.posOld = new THREE.Vector3().copy(ball.position);
        // console.log(dtS);
        ball.position.addScaledVector(ball.velocity, dtS);
        // console.log(ball.position);
    }

    let impulses = [];
    // Perform collision detection / response
    impulses = impulsives(balls, walls, pits, impulses);
    var implen = 0;
    for (var i = 0; i < balls.length; i++) {
        if (!impulses[i].equals(new THREE.Vector3())) {
            //  TODO: is "back up to point of collision" done this way?
            balls[i].position.copy(balls[i].posOld);
            sound.stop();
            sound.play();
            // console.log(impulses[i]);
            // implen += impulses[i].length();
        }
    }
    // console.log(impulses[0]);

    // Update Momentum
    for (var i = 0; i < balls.length; i++) {
        balls[i].momentum.addScaledVector(balls[i].force, dtS).add(impulses[i]).add(balls[i].impulse);
        balls[i].impulse = new THREE.Vector3(0, 0, 0);
        // console.log(balls[i].momentum);
    }
}

function step3(balls) {

    // Calculate velocities for next step (“divide” by mass
    for (const ball of balls) {
        ball.velocity.copy(new THREE.Vector3().addScaledVector(ball.momentum, 1 / ball.mass));
    }
}

function impulsives(balls, walls, pits, updateVelo) {
    for (var i = 0; i < balls.length; i++) {
        updateVelo[i] = new THREE.Vector3();
    }

    ballToPitCollision(balls, pits);
    updateVelo = ballToWallCollision(balls, walls, updateVelo);
    updateVelo = ballToBallCollision(balls, updateVelo);
    // console.log(updateVelo[0]);

    return updateVelo;
}

function ballToPitCollision(balls, pits) {
    for (var i = 0; i < balls.length; i++) {
        var ball = balls[i];
        for (var j = 0; j < pits.length; j++) {
            var jaw = pits[j];

            var bX = ball.position.x;
            var bY = ball.position.y;

            var jX = jaw.position.x;
            var jY = jaw.position.y;

            var dist = (((bX - jX) ** 2) + ((bY - jY) ** 2));
            // console.log(dist, pits[j].radius * 2);
            if (dist < pits[j].radius ** 2) {
                
                scene.remove(balls[i]);
                removeItem(balls, balls[i]);
            }
        }
    }
}

function removeItem(array, itemToRemove) {
    var index = array.indexOf(itemToRemove);
    if (index !== -1) {
        array.splice(index, 1);
    }
    // console.log("Updated Array: ", array);
}

function ballToWallCollision(balls, walls, updateVelo) {

    for (var i = 0; i < balls.length; i++) {
        var ball = balls[i];
        // if (i != 0) continue;
        var extremeNoFun = 0;
        for (var j = 0; j < walls.length; j++) {
            var jaw = walls[j];

            var C = new THREE.Vector3().copy(ball.position);
            var rawDist = new THREE.Vector3().subVectors(C, jaw.position);
            var noFunAllowed = jaw.scale.length() - ball.radius * 2;
            if (rawDist.length() > noFunAllowed) continue;
            
            var no = jaw.geometry.getAttribute("normal");
            var nmaybe = new THREE.Vector3(no.array[0], no.array[1], no.array[2]);
            var n = nmaybe.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(jaw.matrixWorld)).normalize();

            var d = new THREE.Vector3().multiplyVectors(rawDist, n);
            // if (j == 4) console.log(rawDist);

            if (d.length() <= ball.radius) {
                updateVelo[i].sub(new THREE.Vector3().multiplyVectors(n, ball.momentum).multiplyScalar(1 + coeffRest));
                extremeNoFun++;
                if (extremeNoFun > 1) console.log(noFunAllowed, rawDist.length());
            }
        }
    }

    return updateVelo;

}

function ballToBallCollision(balls, updateVelo) {

    for (var i = 0; i < balls.length; i++) {
        var ball = balls[i];
        // if (ball.velocity.equals(new THREE.Vector3())){
        //     continue;
        // }
        // if (ball.velocity.equals(new THREE.Vector3(0, 0, 0))){continue;}
        for (var j = i + 1; j < balls.length; j++) {
            if (i == j) {
                continue;
            }
            var jaw = balls[j];
            // console.log(ball.position.distanceTo(jaw.position));
            // Fortunately, this are rather simplifed here! Both balls have the same mass and radius, as well as no elasticity!
            if (ball.position.distanceTo(jaw.position) <= (ball.radius * 2)) {
                var v1 = new THREE.Vector3().copy(ball.velocity); // velocity would be prefered for collisions...!
                var v2 = new THREE.Vector3().copy(jaw.velocity);
                var n = new THREE.Vector3().subVectors(ball.position, jaw.position).normalize();
                // console.log(n);
                var Jay = new THREE.Vector3().addScaledVector(n, (new THREE.Vector3().copy(v1).dot(n) - new THREE.Vector3().copy(v2).dot(n)) * (1 + 1) * ball.mass / 2);

                // console.log(i, " hits ", j);
                updateVelo[i].sub(Jay);
                updateVelo[j].add(Jay);
                // console.log(Jay);
            }
        }
    }

    return updateVelo;
}

// Helper function; Converts degrees to radians.
function rad(x) {
    return x / 180 * Math.PI;
}