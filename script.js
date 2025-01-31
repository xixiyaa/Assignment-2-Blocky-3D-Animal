// XIFAN LUO
// 2021/10/14
// CSE 160 ASSIGNMENT 2
// script.js
//

// WebGL / shader program
let gl, program;
let a_positionLoc;
let uModelMatrixLoc, uGlobalRotationLoc, uColorLoc;

// Buffers
let cubeBuffer, sphereBuffer; // We'll treat the sphere as "moon"

// Scene / camera
let camAngleX = 0, camAngleY = 0, camAngleZ = 0;
let modelScale = 1.0;

// Performance
let perfDisplay, frameCount = 0, timeLastPerf = 0;

// Animations
let idleAnimation = true;    // whether we "look around" in idle
let animSpeed = 1;           // scaled by a slider
let showMoon = false;        // whether the moon is visible
let rollingMoon = false;     // shift‐click toggles this

// Joints (current angles)
let leftArmAngle=0, rightArmAngle=0, leftThighAngle=0, rightThighAngle=0;
let leftElbowAngle=0, rightElbowAngle=0, leftKneeAngle=0, rightKneeAngle=0;
let leftFootAngle=0, rightFootAngle=0;

// Joints with toggles for auto‐motion
let leftArmAnim = false, rightArmAnim = false, leftThighAnim = false, rightThighAnim = false;
let leftElbowAnim = false, rightElbowAnim = false, leftKneeAnim = false, rightKneeAnim = false;
let leftFootAnim = false, rightFootAnim = false;

// Time
let prevTime = 0;


// ---------------------------------------------------
// onLoad
// ---------------------------------------------------
window.onload = () => {
  gl = createWebGLContext("glCanvas");
  if(!gl) return;

  const vsSrc = document.getElementById("vertexShader").text;
  const fsSrc = document.getElementById("fragmentShader").text;
  program = createProgram(gl, vsSrc, fsSrc);
  gl.useProgram(program);

  a_positionLoc       = gl.getAttribLocation(program, "a_position");
  uModelMatrixLoc     = gl.getUniformLocation(program, "uModelMatrix");
  uGlobalRotationLoc  = gl.getUniformLocation(program, "uGlobalRotation");
  uColorLoc           = gl.getUniformLocation(program, "uColor");

  // Create geometry
  cubeBuffer = initCubeBuffer();
  sphereBuffer = initSphereBuffer(16,16); // for the "moon"

  // Set up UI
  setupUI();

  // Start the main animation loop
  requestAnimationFrame(tick);
};


// ---------------------------------------------------
// tick (render loop)
// ---------------------------------------------------
function tick(timestamp){
  const dt = (timestamp - prevTime) * 0.001; // ms -> seconds
  prevTime = timestamp;

  // Update performance
  updatePerformance(timestamp);

  // Possibly do idle "look around"
  if(idleAnimation){
    leftArmAngle = 30 * Math.sin(timestamp*0.001 * animSpeed);
    rightArmAngle= -30 * Math.sin(timestamp*0.001 * animSpeed);
  }

  // Animate joints if toggled
  if(leftArmAnim)    leftArmAngle    += 60 * dt * animSpeed;
  if(rightArmAnim)   rightArmAngle   += 60 * dt * animSpeed;
  if(leftThighAnim)  leftThighAngle  += 60 * dt * animSpeed;
  if(rightThighAnim) rightThighAngle += 60 * dt * animSpeed;
  if(leftElbowAnim)  leftElbowAngle  += 60 * dt * animSpeed;
  if(rightElbowAnim) rightElbowAngle += 60 * dt * animSpeed;
  if(leftKneeAnim)   leftKneeAngle   += 60 * dt * animSpeed;
  if(rightKneeAnim)  rightKneeAngle  += 60 * dt * animSpeed;
  if(leftFootAnim)   leftFootAngle   += 60 * dt * animSpeed;
  if(rightFootAnim)  rightFootAngle  += 60 * dt * animSpeed;

  // If rollingMoon is on, let's spin the camera Y angle
  if(rollingMoon){
    camAngleY += 50 * dt * animSpeed;
  }

  // Render
  renderScene();

  // Next frame
  requestAnimationFrame(tick);
}


// ---------------------------------------------------
// renderScene
// ---------------------------------------------------
function renderScene(){
  // Make sure we draw to the entire canvas
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.clearColor(0.2, 0.2, 0.2, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Build a global transform that includes camera angles & scale
  let globalM = mat4Create();
  globalM = mat4RotateX(globalM, camAngleX);
  globalM = mat4RotateY(globalM, camAngleY);
  globalM = mat4RotateZ(globalM, camAngleZ);
  globalM = mat4Scale(globalM, modelScale, modelScale, modelScale);

  gl.uniformMatrix4fv(uGlobalRotationLoc, false, globalM);

  // We'll center the figure near origin so it's inside [-1..1].
  let M = mat4Create(); // identity

  // "Torso" - small in clip space
  let torsoM = mat4Translate(M, 0, 0.15, 0);
  torsoM = mat4Scale(torsoM, 0.2, 0.3, 0.1);
  drawCube(torsoM, [0.2, 0.2, 1.0]); // Blue

  // "Head"
  let headM = mat4Translate(M, 0, 0.45, 0);
  headM = mat4Scale(headM, 0.15, 0.15, 0.1);
  drawCube(headM, [0.0, 1.0, 0.0]); // green

  // Left arm (shoulder)
  let leftArmM = mat4Translate(M, -0.22, 0.15, 0);
  leftArmM = mat4RotateZ(leftArmM, leftArmAngle);
  let leftArmCube = mat4Scale(leftArmM, 0.07, 0.18, 0.07);
  drawCube(leftArmCube, [1.0, 0.5, 0.5]);
  // Left elbow
  let leftElbowM = mat4Translate(leftArmM, 0, -0.20, 0);
  leftElbowM = mat4RotateZ(leftElbowM, leftElbowAngle);
  let leftForearm = mat4Scale(leftElbowM, 0.06, 0.15, 0.06);
  drawCube(leftForearm, [1.0, 0.3, 0.3]);

  // Right arm
  let rightArmM = mat4Translate(M, 0.22, 0.15, 0);
  rightArmM = mat4RotateZ(rightArmM, rightArmAngle);
  let rightArmCube = mat4Scale(rightArmM, 0.07, 0.18, 0.07);
  drawCube(rightArmCube, [1.0, 0.5, 0.0]);
  // Right elbow
  let rightElbowM = mat4Translate(rightArmM, 0, -0.20, 0);
  rightElbowM = mat4RotateZ(rightElbowM, rightElbowAngle);
  let rightForearm = mat4Scale(rightElbowM, 0.06, 0.15, 0.06);
  drawCube(rightForearm, [1.0, 0.3, 0.0]);

  // Left thigh
  let leftThighM = mat4Translate(M, -0.08, -0.15, 0);
  leftThighM = mat4RotateZ(leftThighM, leftThighAngle);
  let leftThighCube = mat4Scale(leftThighM, 0.07, 0.2, 0.07);
  drawCube(leftThighCube, [1.0, 0.0, 1.0]);
  // Left knee
  let leftKneeM = mat4Translate(leftThighM, 0, -0.22, 0);
  leftKneeM = mat4RotateZ(leftKneeM, leftKneeAngle);
  let leftShin = mat4Scale(leftKneeM, 0.06, 0.18, 0.06);
  drawCube(leftShin, [0.8, 0.0, 0.8]);
  // Left foot
  let leftFootM = mat4Translate(leftKneeM, 0, -0.2, 0);
  leftFootM = mat4RotateZ(leftFootM, leftFootAngle);
  leftFootM = mat4Scale(leftFootM, 0.08, 0.05, 0.08);
  drawCube(leftFootM, [0.6, 0.0, 0.6]);

  // Right thigh
  let rightThighM = mat4Translate(M, 0.08, -0.15, 0);
  rightThighM = mat4RotateZ(rightThighM, rightThighAngle);
  let rightThighCube = mat4Scale(rightThighM, 0.07, 0.2, 0.07);
  drawCube(rightThighCube, [1.0, 1.0, 0.0]);
  // Right knee
  let rightKneeM = mat4Translate(rightThighM, 0, -0.22, 0);
  rightKneeM = mat4RotateZ(rightKneeM, rightKneeAngle);
  let rightShin = mat4Scale(rightKneeM, 0.06, 0.18, 0.06);
  drawCube(rightShin, [0.8, 0.8, 0.0]);
  // Right foot
  let rightFootM = mat4Translate(rightKneeM, 0, -0.2, 0);
  rightFootM = mat4RotateZ(rightFootM, rightFootAngle);
  rightFootM = mat4Scale(rightFootM, 0.08, 0.05, 0.08);
  drawCube(rightFootM, [0.6, 0.6, 0.0]);

  // If showMoon, draw a sphere up to the right
  if(showMoon){
    let moonM = mat4Translate(M, 0.5, 0.6, 0);
    moonM = mat4Scale(moonM, 0.15, 0.15, 0.15);
    drawSphere(moonM, [0.9, 0.9, 0.9]); // grayish
  }
}


// ---------------------------------------------------
// drawCube
// ---------------------------------------------------
function drawCube(M, color){
  gl.uniformMatrix4fv(uModelMatrixLoc, false, M);
  gl.uniform3fv(uColorLoc, color);

  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer.vertexBuffer);
  gl.enableVertexAttribArray(a_positionLoc);
  gl.vertexAttribPointer(a_positionLoc, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeBuffer.indexBuffer);
  gl.drawElements(gl.TRIANGLES, cubeBuffer.numIndices, gl.UNSIGNED_SHORT, 0);
}


// ---------------------------------------------------
// drawSphere
// ---------------------------------------------------
function drawSphere(M, color){
  gl.uniformMatrix4fv(uModelMatrixLoc, false, M);
  gl.uniform3fv(uColorLoc, color);

  gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffer.vertexBuffer);
  gl.enableVertexAttribArray(a_positionLoc);
  gl.vertexAttribPointer(a_positionLoc, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereBuffer.indexBuffer);
  gl.drawElements(gl.TRIANGLES, sphereBuffer.numIndices, gl.UNSIGNED_SHORT, 0);
}


// ---------------------------------------------------
// initCubeBuffer
// ---------------------------------------------------
function initCubeBuffer(){
  const positions = new Float32Array([
    // front
    -0.5, -0.5,  0.5,
     0.5, -0.5,  0.5,
     0.5,  0.5,  0.5,
    -0.5,  0.5,  0.5,

    // back
    -0.5, -0.5, -0.5,
     0.5, -0.5, -0.5,
     0.5,  0.5, -0.5,
    -0.5,  0.5, -0.5,
  ]);

  const indices = new Uint16Array([
    0,1,2,  0,2,3,   
    4,6,5,  4,7,6,   
    4,5,1,  4,1,0,   
    3,2,6,  3,6,7,   
    1,5,6,  1,6,2,   
    4,0,3,  4,3,7    
  ]);

  let vBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuf);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  let iBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  return {
    vertexBuffer: vBuf,
    indexBuffer: iBuf,
    numIndices: indices.length
  };
}


// ---------------------------------------------------
// initSphereBuffer -- a basic UV sphere
// ---------------------------------------------------
function initSphereBuffer(stacks, slices){
  let verts = [];
  let idx = [];
  for(let i=0; i<=stacks; i++){
    let phi = Math.PI * i / stacks;
    let y = Math.cos(phi);
    let r = Math.sin(phi);

    for(let j=0; j<=slices; j++){
      let theta = 2.0 * Math.PI * j / slices;
      let x = r * Math.cos(theta);
      let z = r * Math.sin(theta);
      verts.push(x, y, z);
    }
  }

  let numVertsPerRow = slices + 1;
  for(let i=0; i<stacks; i++){
    for(let j=0; j<slices; j++){
      let p1 = i * numVertsPerRow + j;
      let p2 = p1 + numVertsPerRow;
      idx.push(p1, p2, p1+1);
      idx.push(p1+1, p2, p2+1);
    }
  }

  let vBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

  let iBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);

  return {
    vertexBuffer: vBuf,
    indexBuffer: iBuf,
    numIndices: idx.length
  };
}


// ---------------------------------------------------
// setupUI
// ---------------------------------------------------
function setupUI(){
  perfDisplay = document.getElementById("perfDisplay");

  // Idle On/Off
  document.getElementById("idleOnBtn").onclick = ()=> { idleAnimation = true; };
  document.getElementById("idleOffBtn").onclick = ()=> { idleAnimation = false; };

  // Anim Speed
  let speedSlider = document.getElementById("animSpeedSlider");
  let speedVal    = document.getElementById("animSpeedVal");
  speedSlider.oninput = ()=>{
    animSpeed = parseFloat(speedSlider.value);
    speedVal.textContent = animSpeed.toFixed(2);
  };

  // Moon On/Off
  document.getElementById("moonOnBtn").onclick = ()=>{ showMoon = true; };
  document.getElementById("moonOffBtn").onclick= ()=>{ showMoon = false; };

  // Camera controls
  document.getElementById("resetCamBtn").onclick = ()=>{
    camAngleX=0; camAngleY=0; camAngleZ=0; modelScale=1.0;
    document.getElementById("camXSlider").value=0;
    document.getElementById("camYSlider").value=0;
    document.getElementById("camZSlider").value=0;
    document.getElementById("camSizeSlider").value=1.0;
  };
  document.getElementById("camXSlider").oninput = (ev)=>{ camAngleX = ev.target.value; };
  document.getElementById("camYSlider").oninput = (ev)=>{ camAngleY = ev.target.value; };
  document.getElementById("camZSlider").oninput = (ev)=>{ camAngleZ = ev.target.value; };
  document.getElementById("camSizeSlider").oninput = (ev)=>{ modelScale = ev.target.value; };

  // Joint Sliders + On/Off toggles
  hookupJoint("leftArm",    v=>leftArmAngle=v,    ()=>leftArmAnim=true,  ()=>leftArmAnim=false);
  hookupJoint("rightArm",   v=>rightArmAngle=v,   ()=>rightArmAnim=true, ()=>rightArmAnim=false);
  hookupJoint("leftThigh",  v=>leftThighAngle=v,  ()=>leftThighAnim=true,()=>leftThighAnim=false);
  hookupJoint("rightThigh", v=>rightThighAngle=v, ()=>rightThighAnim=true,()=>rightThighAnim=false);

  hookupJoint("leftElbow",  v=>leftElbowAngle=v,  ()=>leftElbowAnim=true, ()=>leftElbowAnim=false);
  hookupJoint("rightElbow", v=>rightElbowAngle=v, ()=>rightElbowAnim=true,()=>rightElbowAnim=false);
  hookupJoint("leftKnee",   v=>leftKneeAngle=v,   ()=>leftKneeAnim=true,  ()=>leftKneeAnim=false);
  hookupJoint("rightKnee",  v=>rightKneeAngle=v,  ()=>rightKneeAnim=true, ()=>rightKneeAnim=false);

  hookupJoint("leftFoot",   v=>leftFootAngle=v,   ()=>leftFootAnim=true,  ()=>leftFootAnim=false);
  hookupJoint("rightFoot",  v=>rightFootAngle=v,  ()=>rightFootAnim=true, ()=>rightFootAnim=false);

  // Shift+Click -> roll moon
  let canvas = document.getElementById("glCanvas");
  canvas.addEventListener("click", ev=>{
    if(ev.shiftKey){
      rollingMoon = !rollingMoon; 
    }
  });
}

// Helper for hooking up a single joint’s slider + ON/OFF
function hookupJoint(name, setValueFn, onAnimFn, offAnimFn){
  let slider = document.getElementById(name+"Slider");
  if(!slider) return;
  slider.oninput = ()=> {
    setValueFn(parseFloat(slider.value));
  };
  let onBtn = document.getElementById(name+"OnBtn");
  let offBtn= document.getElementById(name+"OffBtn");
  if(onBtn) onBtn.onclick = onAnimFn;
  if(offBtn) offBtn.onclick = offAnimFn;
}


// ---------------------------------------------------
// updatePerformance
// ---------------------------------------------------
function updatePerformance(t){
  frameCount++;
  if(t - timeLastPerf >= 1000){ 
    let fps = (frameCount * 1000.0)/(t - timeLastPerf);
    let ms = (t - timeLastPerf)/frameCount;
    perfDisplay.textContent = `ms: ${ms.toFixed(1)} fps: ${fps.toFixed(1)}`;
    timeLastPerf = t;
    frameCount=0;
  }
}
