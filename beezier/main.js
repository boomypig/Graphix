import { initShaderProgram } from "./shader.js";
import { drawCircle, drawLineStrip } from "./shapes2d.js";
import { randomDouble } from "./random.js";

main();
async function main() {
  console.log("This is working");

  //
  // start gl
  //
  const canvas = document.getElementById("glcanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // ADD BUTTON
  const addCurveButton = document.createElement("button");
  addCurveButton.innerText = "Add Curve";

  addCurveButton.style.position = "absolute";
  addCurveButton.style.top = "10px";
  addCurveButton.style.left = "10px";
  document.body.appendChild(addCurveButton);

  // WEIGHT SLIDER
  const sliderContainer = document.createElement("div");
  sliderContainer.style.position = "absolute";
  sliderContainer.style.display = "none";
  sliderContainer.style.backgroundColor = "white";
  sliderContainer.style.border = "1px solid black";
  sliderContainer.style.padding = "10px";
  sliderContainer.style.zIndex = "1000"; // Ensure it's above the canvas

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = 0;
  slider.max = 10;
  slider.step = 0.1;

  const minInput = document.createElement("input");
  minInput.type = "number";
  minInput.value = slider.min;
  minInput.style.width = "60px";

  const maxInput = document.createElement("input");
  maxInput.type = "number";
  maxInput.value = slider.max;
  maxInput.style.width = "60px";

  const valueDisplay = document.createElement("span");
  valueDisplay.textContent = slider.value;

  sliderContainer.appendChild(slider);
  sliderContainer.appendChild(document.createElement("br"));
  sliderContainer.appendChild(minInput);
  sliderContainer.appendChild(maxInput);
  sliderContainer.appendChild(document.createElement("br"));
  sliderContainer.appendChild(valueDisplay);
  document.body.appendChild(sliderContainer);

  let currentCurve = null;
  let currentWeightIndex = null;

  const gl = canvas.getContext("webgl");
  if (!gl) {
    alert("Your browser does not support WebGL");
  }
  gl.clearColor(0.75, 0.85, 0.8, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //
  // Create shaders
  //
  const vertexShaderText = await (await fetch("simple.vs")).text();
  const fragmentShaderText = await (await fetch("simple.fs")).text();
  const shaderProgram = initShaderProgram(
    gl,
    vertexShaderText,
    fragmentShaderText,
  );

  //
  // load a projection matrix onto the shader
  //
  const projectionMatrixUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uProjectionMatrix",
  );
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const projectionMatrix = mat4.create();
  let yhigh = 10;
  let ylow = -yhigh;
  let xlow = ylow;
  let xhigh = yhigh;
  if (aspect >= 1) {
    xlow *= aspect;
    xhigh *= aspect;
  } else {
    ylow /= aspect;
    yhigh /= aspect;
  }
  mat4.ortho(projectionMatrix, xlow, xhigh, ylow, yhigh, -1, 1);
  gl.uniformMatrix4fv(projectionMatrixUniformLocation, false, projectionMatrix);

  //
  // load a modelview matrix onto the shader
  //
  const modelViewMatrixUniformLocation = gl.getUniformLocation(
    shaderProgram,
    "uModelViewMatrix",
  );
  const modelViewMatrix = mat4.create();
  gl.uniformMatrix4fv(modelViewMatrixUniformLocation, false, modelViewMatrix);

  //
  // Create content to display
  //

  let circleX = 5;
  let circleY = 5;
  let locked = false;
  //for bezier, locked will equal [1,2,3,4] depending on which circle the mouse clicked on
  //let clickedCurve = -1;
  //let clicked Point = -1;

  class Point2 {
    constructor(x = randomDouble(-10, 10), y = randomDouble(-10, 10)) {
      this.x = x;
      this.y = y;
    }
  }

  class Bezier {
    constructor(gl, shaderProgram) {
      this.gl = gl;
      this.shaderProgram = shaderProgram;
      this.p0 = new Point2();
      this.p1 = new Point2();
      this.p2 = new Point2();
      this.p3 = new Point2();

      this.w0 = 1;
      this.w1 = 1;
      this.w2 = 1;
      this.w3 = 1;

      this.color = [Math.random(), Math.random(), Math.random(), 1];

      this.picked = false;

      this.points = [this.p0, this.p1, this.p2, this.p3];
    }

    evaluate(t) {
      //let px = this.p0.x*(1-t)*(1-t)*(1-t) + 3*this.p1.x*(1-t)*(1-t)*t + 3*this.p2.x*(1-t)*t*t + this.p3.x*t*t*t;
      //let py = this.p0.y*(1-t)*(1-t)*(1-t) + 3*this.p1.y*(1-t)*(1-t)*t + 3*this.p2.y*(1-t)*t*t + this.p3.y*t*t*t;

      // let px = (this.p0.x*(1-t)*(1-t) + 2*this.p1.x*(1-t)*t + this.p2.x*t*t);
      // let py = (this.p0.y*(1-t)*(1-t) + 2*this.p1.y*(1-t)*t + this.p2.y*t*t);

      // let px = (w0*this.p0.x*(1-t)*(1-t) + w1*2*this.p1.x*(1-t)*t + w2*this.p2.x*t*t) / (w0*(1-t)*(1-t) + w1*2*t*(1-t) + w2*t*t);
      // let py = (w0*this.p0.y*(1-t)*(1-t) + w1*2*this.p1.y*(1-t)*t + w2*this.p2.y*t*t) / (w0*(1-t)*(1-t) + w1*2*t*(1-t) + w2*t*t);

      let px =
        (this.w0 * this.p0.x * (1 - t)**3 +
          this.w1 * 3 * this.p1.x * (1 - t)**2 * t +
          this.w2 * 3 * this.p2.x * (1 - t) * t**2 +
          this.w3 * this.p3.x * t**3) /
        (this.w0 * (1 - t)**3+
          this.w1 * 3 * (1 - t)**2 * t +
          this.w2 * 3 * (1 - t) * t**2 +
          this.w3 * t**3);
      let py =
        (this.w0 * this.p0.y * (1 - t)**3 +
          this.w1 * 3 * this.p1.y * (1 - t)**2 * t +
          this.w2 * 3 * this.p2.y * (1 - t) * t**2 +
          this.w3 * this.p3.y * t**3) /
        (this.w0 * (1 - t)**3 +
          this.w1 * 3 * (1 - t)**2 * t +
          this.w2 * 3 * (1 - t) * t**2 +
          this.w3 * t**3);

      let p = new Point2(px, py);
      return p;
    }

    drawCurve() {
      let vertices = [];
      for (let t = 0; t <= 1; t += 0.0125) {
        let p = this.evaluate(t);
        vertices.push(p.x, p.y);
      }
      drawLineStrip(this.gl, this.shaderProgram, vertices);
    }

    drawControlPoints() {
      for (let p of this.points) {
        drawCircle(this.gl, this.shaderProgram, p.x, p.y, 1, this.color);
      }
    }

    isPicked(xWorld, yWorld) {
      for (let p of this.points) {
        const dist = Math.sqrt((xWorld - p.x) ** 2 + (yWorld - p.y) ** 2);
        if (dist < 1) {
          this.picked = p;
          return 1;
        }
      }
      return 0;
    }

    setPoint(xWorld, yWorld) {
      this.picked.x = xWorld;
      this.picked.y = yWorld;
    }
  }

  //
  // Register Listeners
  //

  addCurveButton.addEventListener("click", () => {
    curves.push(new Bezier(gl, shaderProgram));
  });

  addEventListener("click", click);
  function click(event) {
    console.log("click");
    const xWorld =
      xlow + (event.offsetX / gl.canvas.clientWidth) * (xhigh - xlow);
    const yWorld =
      ylow +
      ((gl.canvas.clientHeight - event.offsetY) / gl.canvas.clientHeight) *
        (yhigh - ylow);
    // Do whatever you want here, in World Coordinates.
  }

  addEventListener("mousedown", mousedown);
  function mousedown(event) {
    console.log("click");
    const xWorld =
      xlow + (event.offsetX / gl.canvas.clientWidth) * (xhigh - xlow);
    const yWorld =
      ylow +
      ((gl.canvas.clientHeight - event.offsetY) / gl.canvas.clientHeight) *
        (yhigh - ylow);
    // Do whatever you want here, in World Coordinates.
    for (let curve of curves) {
      if (curve.isPicked(xWorld, yWorld)) {
        break;
      }
    }
  }

  addEventListener("mouseup", mouseup);
  function mouseup(event) {
    console.log("click");
    const xWorld =
      xlow + (event.offsetX / gl.canvas.clientWidth) * (xhigh - xlow);
    const yWorld =
      ylow +
      ((gl.canvas.clientHeight - event.offsetY) / gl.canvas.clientHeight) *
        (yhigh - ylow);
    // Do whatever you want here, in World Coordinates.
    for (let curve of curves) {
      if (curve.picked) {
        curve.picked = false;
      }
    }
  }

  addEventListener("mousemove", mousemove);
  function mousemove(event) {
    const xWorld =
      xlow + (event.offsetX / gl.canvas.clientWidth) * (xhigh - xlow);
    const yWorld =
      ylow +
      ((gl.canvas.clientHeight - event.offsetY) / gl.canvas.clientHeight) *
        (yhigh - ylow);
    // Do whatever you want here, in World Coordinates.
    for (let curve of curves) {
      if (curve.picked) {
        curve.setPoint(xWorld, yWorld);
      }
    }
  }

  canvas.addEventListener("contextmenu", function (event) {
    event.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    const xWorld = xlow + (offsetX / canvas.clientWidth) * (xhigh - xlow);
    const yWorld =
      ylow +
      ((canvas.clientHeight - offsetY) / canvas.clientHeight) * (yhigh - ylow);

    let found = false;
    for (let curve of curves) {
      if (curve.isPicked(xWorld, yWorld)) {
        const index = curve.points.indexOf(curve.picked);
        if (index === -1) continue;

        currentCurve = curve;
        currentWeightIndex = index;
        const weight = curve[`w${index}`];

        slider.value = weight;
        minInput.value = slider.min;
        maxInput.value = slider.max;
        valueDisplay.textContent = weight;

        const screenX = ((xWorld - xlow) / (xhigh - xlow)) * canvas.clientWidth;
        const screenY =
          canvas.clientHeight -
          ((yWorld - ylow) / (yhigh - ylow)) * canvas.clientHeight;

        sliderContainer.style.left = `${screenX + 10}px`;
        sliderContainer.style.top = `${screenY - 10}px`;
        sliderContainer.style.display = "block";

        curve.picked = false; // Reset to prevent interference
        found = true;
        break;
      }
    }

    if (!found) {
      sliderContainer.style.display = "none";
      currentCurve = null;
      currentWeightIndex = null;
    }
  });

  slider.addEventListener("input", function () {
    valueDisplay.textContent = slider.value;
    if (currentCurve && currentWeightIndex !== null) {
      currentCurve[`w${currentWeightIndex}`] = parseFloat(slider.value);
    }
  });

  minInput.addEventListener("change", function () {
    const newMin = parseFloat(minInput.value);
    const currentMax = parseFloat(maxInput.value);
    if (newMin > currentMax) {
      alert("Min cannot be greater than max");
      minInput.value = slider.min;
      return;
    }
    slider.min = newMin;
    if (slider.value < newMin) {
      slider.value = newMin;
      valueDisplay.textContent = newMin;
      if (currentCurve && currentWeightIndex !== null) {
        currentCurve[`w${currentWeightIndex}`] = newMin;
      }
    }
  });

  maxInput.addEventListener("change", function () {
    const newMax = parseFloat(maxInput.value);
    const currentMin = parseFloat(minInput.value);
    if (newMax < currentMin) {
      alert("Max cannot be less than min");
      maxInput.value = slider.max;
      return;
    }
    slider.max = newMax;
    if (slider.value > newMax) {
      slider.value = newMax;
      valueDisplay.textContent = newMax;
      if (currentCurve && currentWeightIndex !== null) {
        currentCurve[`w${currentWeightIndex}`] = newMax;
      }
    }
  });

  // Close slider when clicking outside
  document.addEventListener("click", function (event) {
    if (!sliderContainer.contains(event.target)) {
      sliderContainer.style.display = "none";
      currentCurve = null;
      currentWeightIndex = null;
    }
  });

  //
  // Main render loop
  //
  let bezier = new Bezier(gl, shaderProgram);
  let curves = [];
  curves.push(bezier);

  let previousTime = 0;
  function redraw(currentTime) {
    currentTime *= 0.001; // milliseconds to seconds
    let DT = currentTime - previousTime;
    if (DT > 0.1) DT = 0.1;
    previousTime = currentTime;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //drawCircle(gl, shaderProgram, circleX, circleY, 1);
    // drawRectangle(gl, shaderProgram, 0,0,2,1, [1,0,0,1]); // override the default color with red.
    // drawTriangle(gl, shaderProgram, -1,0, -1,2, -2,3);
    // drawLineStrip(gl, shaderProgram, [0,0,-1,-1,-2,-1])

    for (let curve of curves) {
      curve.drawCurve();
      curve.drawControlPoints();
    }

    requestAnimationFrame(redraw);
  }
  requestAnimationFrame(redraw);
}

// parametric
// points: A, B
// P(T) = A(1-T) + BT
// where T is the ratio [0,1] of the distance on line between A and B

//where T is greater than 1
//ex. A: T_0=5, B: T_1=8
// if T < T_0:
//		T = T_0
// if T > T_1:
//		T = T_1
// ratio = (T - T_0)/(T_1 - T_0)

//higher degree
// deg 1: P(T) = P_0(1-T) + P_1(T)
// deg 2: P(T) = P_0(1-T)^2 + 2 * P_1(1-T) + P_2(T^2)
// deg 3: P(T) = P_0(1-T)^3 * T^0 + 3 * P_1(1-T)^2 * T^1 + 3 * P_2(1-T)^1 * T^2 + P_3(1-T)^0 * T^3
// ^^^ Pascal's traingle: 1 3 3 1
//possible test question: expand to deg 4

//Continuity:
// if we want to connect 2 different bezier curves, we use continuity points
// where the connecting endpoints need to be the same(C_0), and their tangent needs to be the same(C_1) for the points to line up and transtion smoothly
