//
// matrix.js
//

function mat4Create() {
  return [1,0,0,0,
          0,1,0,0,
          0,0,1,0,
          0,0,0,1];
}

function mat4Multiply(a, b) {
  let out = new Array(16);
  for (let row=0; row<4; row++){
    for (let col=0; col<4; col++){
      out[col*4+row] = 0;
      for (let i=0; i<4; i++){
        out[col*4+row] += a[i*4+row] * b[col*4+i];
      }
    }
  }
  return out;
}

function mat4Translate(m, tx, ty, tz){
  let t = mat4Create();
  t[12] = tx; t[13] = ty; t[14] = tz;
  return mat4Multiply(m, t);
}

function mat4Scale(m, sx, sy, sz){
  let s = mat4Create();
  s[0] = sx; s[5] = sy; s[10] = sz;
  return mat4Multiply(m, s);
}

function mat4RotateX(m, angleDeg){
  let c = Math.cos(angleDeg * Math.PI/180);
  let s = Math.sin(angleDeg * Math.PI/180);
  let r = [
    1,  0,  0, 0,
    0,  c,  s, 0,
    0, -s,  c, 0,
    0,  0,  0, 1
  ];
  return mat4Multiply(m, r);
}

function mat4RotateY(m, angleDeg){
  let c = Math.cos(angleDeg * Math.PI/180);
  let s = Math.sin(angleDeg * Math.PI/180);
  let r = [
     c, 0, -s, 0,
     0, 1,  0, 0,
     s, 0,  c, 0,
     0, 0,  0, 1
  ];
  return mat4Multiply(m, r);
}

function mat4RotateZ(m, angleDeg){
  let c = Math.cos(angleDeg * Math.PI/180);
  let s = Math.sin(angleDeg * Math.PI/180);
  let r = [
     c, s, 0, 0,
    -s, c, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1
  ];
  return mat4Multiply(m, r);
}
