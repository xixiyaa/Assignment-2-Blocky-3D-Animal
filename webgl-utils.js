//
// webgl-utils.js
//

function createWebGLContext(canvasId) {
  const canvas = document.getElementById(canvasId);
  let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    alert("Could not create WebGL context!");
    return null;
  }
  gl.enable(gl.DEPTH_TEST);
  return gl;
}

function createShader(gl, source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertexSrc, fragmentSrc) {
  const vs = createShader(gl, vertexSrc, gl.VERTEX_SHADER);
  const fs = createShader(gl, fragmentSrc, gl.FRAGMENT_SHADER);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
    console.error("Program link error:", gl.getProgramInfoLog(prog));
    return null;
  }
  return prog;
}
