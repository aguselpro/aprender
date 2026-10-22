(() => {
  "use strict";

  const cards = [...document.querySelectorAll(".voxel-game")];
  const instances = new Map();
  const positions = [[-3.5, -7.5], [0, -7.5], [3.5, -7.5]];
  const treeVariants = {
    oak: { name: "Roble", trunk: [1, 1, 1], leaves: [1, 1, 1], height: 4.2, shape: "round", logs: 2, biome: "Bosque templado" },
    darkOak: { name: "Roble oscuro", trunk: [0.68, 0.49, 0.3], leaves: [0.48, 0.72, 0.3], height: 4.5, shape: "wide", logs: 4, biome: "Bosque oscuro" },
    spruce: { name: "Abeto", trunk: [0.77, 0.66, 0.49], leaves: [0.39, 0.66, 0.48], height: 5.7, shape: "conifer", logs: 2, biome: "Taiga" },
    jungle: { name: "Jungla", trunk: [0.68, 0.51, 0.34], leaves: [0.3, 0.78, 0.32], height: 7.2, shape: "tall", logs: 4, biome: "Jungla" },
    acacia: { name: "Acacia", trunk: [0.98, 0.57, 0.29], leaves: [0.71, 0.76, 0.31], height: 4.6, shape: "flat", logs: 2, biome: "Sabana" },
    birch: { name: "Abedul", trunk: [0.88, 0.85, 0.72], leaves: [0.61, 0.79, 0.42], height: 4.2, shape: "round", logs: 2, biome: "Bosque de abedules" },
    megaSpruce: { name: "Abeto gigante", trunk: [0.68, 0.53, 0.36], leaves: [0.31, 0.59, 0.38], height: 8, shape: "mega", logs: 6, biome: "Taiga gigante" },
    cherry: { name: "Cerezo", trunk: [0.88, 0.58, 0.57], leaves: [1, 0.68, 0.82], height: 5, shape: "blossom", logs: 2, biome: "Bosque de cerezos" },
    crimson: { name: "Árbol carmesí", trunk: [0.78, 0.18, 0.29], leaves: [0.8, 0.22, 0.39], height: 5.5, shape: "nether", logs: 3, biome: "Bosque carmesí" },
    warped: { name: "Árbol retorcido", trunk: [0.19, 0.61, 0.63], leaves: [0.21, 0.72, 0.69], height: 5.2, shape: "nether", logs: 3, biome: "Bosque retorcido" },
    mangrove: { name: "Manglar", trunk: [0.55, 0.34, 0.22], leaves: [0.31, 0.68, 0.34], height: 4.4, shape: "roots", logs: 3, biome: "Manglar" },
    snowySpruce: { name: "Abeto nevado", trunk: [0.7, 0.6, 0.47], leaves: [0.72, 0.86, 0.82], height: 5.8, shape: "conifer", logs: 2, biome: "Taiga nevada" }
  };
  const sceneryTrees = [
    { x: -10, z: -13, type: "oak" }, { x: 10, z: -15, type: "oak" }, { x: -14, z: -23, type: "oak" },
    { x: -18, z: -21, type: "darkOak" }, { x: -20, z: -23, type: "darkOak" }, { x: -18, z: -23, type: "darkOak" }, { x: -20, z: -21, type: "darkOak" },
    { x: -7, z: -31, type: "spruce" }, { x: 7, z: -34, type: "spruce" },
    { x: 33, z: -18, type: "jungle" }, { x: 35, z: -21, type: "jungle" },
    { x: 34, z: 5, type: "acacia" }, { x: 37, z: 7, type: "acacia" },
    { x: 13, z: -26, type: "birch" }, { x: 15, z: -28, type: "birch" },
    { x: -22, z: -19, type: "megaSpruce" }, { x: 10, z: -30, type: "cherry" },
    { x: 45, z: -35, type: "crimson" }, { x: 50, z: -36, type: "warped" },
    { x: 48, z: 0, type: "mangrove" }, { x: 51, z: 2, type: "mangrove" },
    { x: 25, z: -50, type: "snowySpruce" }
  ].map(tree => ({ ...tree, alive: true }));
  const islandRegions = [
    { x: 0, z: -11, radiusX: 24, radiusZ: 25, biome: "Bosque templado" },
    { x: -28, z: -36, radiusX: 16, radiusZ: 15, biome: "Taiga nevada" },
    { x: 22, z: -43, radiusX: 18, radiusZ: 15, biome: "Montañas" },
    { x: 34, z: -20, radiusX: 13, radiusZ: 11, biome: "Jungla" },
    { x: 34, z: 5, radiusX: 11, radiusZ: 11, biome: "Sabana" },
    { x: 51, z: 4, radiusX: 11, radiusZ: 11, biome: "Manglar" },
    { x: 55, z: -42, radiusX: 13, radiusZ: 12, biome: "Bosque del Nether" }
  ];
  const islandTiles = [];
  const islandCellSize = 4.5;
  islandRegions.forEach((island, islandIndex) => {
    const columns = Math.ceil(island.radiusX / islandCellSize);
    const rows = Math.ceil(island.radiusZ / islandCellSize);
    for (let row = -rows; row <= rows; row += 1) {
      for (let column = -columns; column <= columns; column += 1) {
        const noise = Math.sin((column + islandIndex * 13) * 12.9898 + (row - islandIndex * 7) * 78.233) * 43758.5453;
        const jitter = noise - Math.floor(noise);
        const x = island.x + column * islandCellSize;
        const z = island.z + row * islandCellSize;
        const edge = (x - island.x) ** 2 / island.radiusX ** 2 + (z - island.z) ** 2 / island.radiusZ ** 2;
        if (edge > 0.88 + jitter * 0.17) continue;
        islandTiles.push({
          x,
          z,
          top: 0,
          size: islandCellSize + 0.15,
          key: `${islandIndex}:${column}:${row}`,
          beach: edge > 0.62,
          biome: island.biome
        });
      }
    }
  });
  const treeCollisionRadius = 1.05;
  const mountains = [
    { x: -23, z: -32, width: 18, height: 15, depth: 15 },
    { x: -7, z: -39, width: 21, height: 19, depth: 18 },
    { x: 12, z: -42, width: 22, height: 23, depth: 20 },
    { x: 29, z: -34, width: 19, height: 17, depth: 16 }
  ];
  const mountainBlocks = [];
  mountains.forEach((mountain, mountainIndex) => {
    const seed = (mountainIndex + 1) * 17;
    const layers = Math.floor(mountain.height / 2);
    for (let layer = 0; layer < layers; layer += 1) {
      const inset = layer * 1.5;
      const topLayer = layer === layers - 1;
      const cellSize = topLayer ? 2.5 : 4.5;
      for (let row = -Math.ceil((mountain.depth - inset) / cellSize / 2); row <= Math.ceil((mountain.depth - inset) / cellSize / 2); row += 1) {
        for (let column = -Math.ceil((mountain.width - inset) / cellSize / 2); column <= Math.ceil((mountain.width - inset) / cellSize / 2); column += 1) {
          const noise = Math.sin((column + seed) * 12.9898 + (row - seed) * 78.233) * 43758.5453;
          const jitter = (noise - Math.floor(noise)) * 0.6;
          const x = mountain.x + column * cellSize + jitter;
          const z = mountain.z + row * cellSize - jitter;
          const halfWidth = (mountain.width - inset) / 2;
          const halfDepth = (mountain.depth - inset) / 2;
          if (Math.abs(x - mountain.x) > halfWidth || Math.abs(z - mountain.z) > halfDepth) continue;
          const scale = cellSize * (0.82 + jitter * 0.2);
          const snowyPeak = topLayer && mountain.height >= 19;
          mountainBlocks.push({
            x,
            z,
            y: 0.5 + layer * 1.8,
            size: scale,
            key: `mountain:${mountainIndex}:${layer}:${row}:${column}`,
            textureType: layer === 0 ? "dirt" : snowyPeak ? "snow" : topLayer ? "grass" : "stone",
            material: layer === 0 ? "dirt" : "stone",
            tint: topLayer ? [0.91, 1, 0.86] : [0.88, 0.92, 0.9]
          });
        }
      }
    }
  });
  const vertexShaderSource = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec2 aUv;
    uniform mat4 uMvp;
    varying vec3 vNormal;
    varying vec2 vUv;
    void main() {
      gl_Position = uMvp * vec4(aPosition, 1.0);
      vNormal = aNormal;
      vUv = aUv;
    }
  `;
  const fragmentShaderSource = `
    precision mediump float;
    uniform sampler2D uTexture;
    uniform vec3 uTint;
    uniform bool uTextured;
    varying vec3 vNormal;
    varying vec2 vUv;
    void main() {
      vec4 texel = uTextured ? texture2D(uTexture, vUv) : vec4(1.0);
      if (uTextured && texel.a < 0.12) discard;
      float light = max(dot(normalize(vNormal), normalize(vec3(-0.4, 0.8, 0.3))), 0.48);
      gl_FragColor = vec4(texel.rgb * uTint * light, texel.a);
    }
  `;

  function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    if (!shader) throw new Error("No se pudo crear un shader WebGL.");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || "Error de compilación WebGL.";
      gl.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  }

  function createProgram(gl) {
    const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = gl.createProgram();
    if (!program) throw new Error("No se pudo crear el programa WebGL.");
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program) || "No se pudo enlazar el programa WebGL.";
      gl.deleteProgram(program);
      throw new Error(message);
    }
    return program;
  }

  function createCubeBuffer(gl) {
    const vertices = [];
    const faces = [
      { normal: [0, 0, 1], corners: [[-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5]] },
      { normal: [0, 0, -1], corners: [[0.5, -0.5, -0.5], [-0.5, -0.5, -0.5], [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5]] },
      { normal: [1, 0, 0], corners: [[0.5, -0.5, 0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [0.5, 0.5, 0.5]] },
      { normal: [-1, 0, 0], corners: [[-0.5, -0.5, -0.5], [-0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [-0.5, 0.5, -0.5]] },
      { normal: [0, 1, 0], corners: [[-0.5, 0.5, 0.5], [0.5, 0.5, 0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5]] },
      { normal: [0, -1, 0], corners: [[-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, -0.5, 0.5], [-0.5, -0.5, 0.5]] }
    ];
    const order = [0, 1, 2, 0, 2, 3];
    const uv = [[0, 1], [1, 1], [1, 0], [0, 0]];
    faces.forEach(face => order.forEach(index => {
      vertices.push(...face.corners[index], ...face.normal, ...uv[index]);
    }));
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error("No se pudo crear la geometría de los bloques.");
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    return buffer;
  }

  function createTexture(gl, url, onFailure) {
    const texture = gl.createTexture();
    if (!texture) throw new Error(`No se pudo crear la textura ${url}.`);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    const image = new Image();
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    };
    image.onerror = () => onFailure(`No se pudo cargar la textura ${url}.`);
    image.src = url;
    return texture;
  }

  function createPixelTexture(gl, colors, seed) {
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se pudo generar la textura del paisaje.");
    let randomSeed = seed;
    const random = () => {
      randomSeed = (randomSeed * 16807) % 2147483647;
      return (randomSeed - 1) / 2147483646;
    };
    for (let y = 0; y < 16; y += 1) {
      for (let x = 0; x < 16; x += 1) {
        const color = colors[Math.floor(random() * colors.length)];
        if (color) {
          context.fillStyle = color;
          context.fillRect(x, y, 1, 1);
        }
      }
    }
    const texture = gl.createTexture();
    if (!texture) throw new Error("No se pudo crear una textura del paisaje.");
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    return texture;
  }

  function multiplyMatrices(a, b) {
    const result = new Float32Array(16);
    for (let column = 0; column < 4; column += 1) {
      for (let row = 0; row < 4; row += 1) {
        result[column * 4 + row] =
          a[row] * b[column * 4] +
          a[4 + row] * b[column * 4 + 1] +
          a[8 + row] * b[column * 4 + 2] +
          a[12 + row] * b[column * 4 + 3];
      }
    }
    return result;
  }

  function perspective(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2);
    const range = 1 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * range, -1,
      0, 0, 2 * far * near * range, 0
    ]);
  }

  function normalize(vector) {
    const length = Math.hypot(...vector) || 1;
    return vector.map(value => value / length);
  }

  function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }

  function lookAt(eye, direction) {
    const forward = normalize(direction);
    const side = normalize(cross(forward, [0, 1, 0]));
    const up = cross(side, forward);
    return new Float32Array([
      side[0], up[0], -forward[0], 0,
      side[1], up[1], -forward[1], 0,
      side[2], up[2], -forward[2], 0,
      -(side[0] * eye[0] + side[1] * eye[1] + side[2] * eye[2]),
      -(up[0] * eye[0] + up[1] * eye[1] + up[2] * eye[2]),
      forward[0] * eye[0] + forward[1] * eye[1] + forward[2] * eye[2],
      1
    ]);
  }

  function modelMatrix(position, scale) {
    return new Float32Array([
      scale[0], 0, 0, 0,
      0, scale[1], 0, 0,
      0, 0, scale[2], 0,
      position[0], position[1], position[2], 1
    ]);
  }

  function getQuestion(key) {
    if (key === "vowels") {
      const [word, missingIndex] = vowelExercises[Math.min(vowelIndex, vowelExercises.length - 1)];
      const answer = word[missingIndex].toLocaleUpperCase("es");
      return {
        title: vowelIndex >= vowelExercises.length
          ? "¡Completaste las vocales!"
          : `¿Qué vocal falta en ${word.slice(0, missingIndex)}_${word.slice(missingIndex + 1)}?`,
        answer,
        choices: ["A", "E", "I", "O", "U"]
      };
    }
    const quiz = quizzes[key];
    const result = key === "sum"
      ? quiz.left + quiz.right
      : key === "subtract"
        ? quiz.left - quiz.right
        : quiz.left * quiz.right;
    const operator = key === "subtract" ? "−" : key === "multiply" ? "×" : "+";
    const wrong = [];
    for (let distance = 1; wrong.length < 2; distance += 1) {
      const above = result + distance;
      const below = result - distance;
      if (above !== result && !wrong.includes(above)) wrong.push(above);
      if (below >= 0 && below !== result && !wrong.includes(below) && wrong.length < 2) wrong.push(below);
    }
    return {
      title: `¿Cuánto es ${quiz.left} ${operator} ${quiz.right}?`,
      answer: String(result),
      choices: [String(result), ...wrong]
    };
  }

  function shuffle(values) {
    const result = [...values];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [result[index], result[swap]] = [result[swap], result[index]];
    }
    return result;
  }

  function setFeedback(game, message, type = "") {
    game.feedback.className = `voxel-feedback${type ? ` ${type}` : ""}`;
    game.feedback.textContent = message;
  }

  function setQuestion(game) {
    const question = getQuestion(game.key);
    game.question.textContent = question.title;
    const living = game.trees.filter(tree => tree.alive);
    const choices = shuffle(question.choices);
    const correctIndex = Math.floor(Math.random() * living.length);
    game.correctAnswer = question.answer;
    living.forEach((tree, index) => {
      tree.answer = index === correctIndex ? question.answer : choices.find(choice => choice !== question.answer && !living.some(other => other !== tree && other.answer === choice)) || choices[index % choices.length];
    });
    living.forEach(tree => {
      if (tree.label) tree.label.textContent = tree.answer;
    });
    game.roundSolved = false;
    game.nextButton.hidden = true;
    game.replantButton.hidden = living.length > 0;
    if (living.length) setFeedback(game, "Apunta a un tronco y haz clic para talarlo. WASD mueve; el mouse gira la cámara.");
    else setFeedback(game, "No quedan árboles. Pulsa «Replantar bosque» cuando quieras empezar otro.", "correct");
  }

  function makeTree(game, slot) {
    const [x, z] = positions[slot];
    const label = document.createElement("span");
    label.className = "voxel-tree-label";
    label.setAttribute("aria-hidden", "true");
    game.viewport.append(label);
    return { id: `${Date.now()}-${Math.random()}`, x, z, alive: true, answer: "", label };
  }

  function projectLabel(game, tree, view, projection, width, height) {
    if (!tree.alive || !tree.label) return;
    const labelHeight = 1.5;
    const viewPosition = [
      view[0] * tree.x + view[4] * labelHeight + view[8] * tree.z + view[12],
      view[1] * tree.x + view[5] * labelHeight + view[9] * tree.z + view[13],
      view[2] * tree.x + view[6] * labelHeight + view[10] * tree.z + view[14],
      view[3] * tree.x + view[7] * labelHeight + view[11] * tree.z + view[15]
    ];
    const clipX = projection[0] * viewPosition[0] + projection[4] * viewPosition[1] + projection[8] * viewPosition[2] + projection[12] * viewPosition[3];
    const clipY = projection[1] * viewPosition[0] + projection[5] * viewPosition[1] + projection[9] * viewPosition[2] + projection[13] * viewPosition[3];
    const clipW = -viewPosition[2];
    if (clipW <= 0) {
      tree.label.hidden = true;
      return;
    }
    const x = (clipX / clipW + 1) * width / 2;
    const y = (1 - clipY / clipW) * height / 2;
    tree.label.hidden = x < -50 || x > width + 50 || y < -30 || y > height + 30;
    tree.label.style.left = `${x}px`;
    tree.label.style.top = `${y}px`;
  }

  function rayIntersectsBox(origin, direction, center, halfSize, maxDistance) {
    let near = -Infinity;
    let far = Infinity;
    let nearNormal = null;
    let farNormal = null;
    for (let axis = 0; axis < 3; axis += 1) {
      const minimum = center[axis] - halfSize[axis];
      const maximum = center[axis] + halfSize[axis];
      if (Math.abs(direction[axis]) < 0.0001) {
        if (origin[axis] < minimum || origin[axis] > maximum) return null;
        continue;
      }
      let first = (minimum - origin[axis]) / direction[axis];
      let second = (maximum - origin[axis]) / direction[axis];
      let firstNormal = [0, 0, 0];
      let secondNormal = [0, 0, 0];
      firstNormal[axis] = -1;
      secondNormal[axis] = 1;
      if (first > second) {
        [first, second] = [second, first];
        [firstNormal, secondNormal] = [secondNormal, firstNormal];
      }
      if (first > near) {
        near = first;
        nearNormal = firstNormal;
      }
      if (second < far) {
        far = second;
        farNormal = secondNormal;
      }
      if (near > far) return null;
    }
    const fromInside = near < 0;
    const distance = fromInside ? far : near;
    const normal = fromInside ? farNormal : nearNormal;
    return distance >= 0 && distance <= maxDistance && normal
      ? { distance, normal }
      : null;
  }

  function sceneryTreeCollides(game, x, z) {
    return game.sceneryTrees.some(tree => tree.alive && Math.hypot(x - tree.x, z - tree.z) < treeCollisionRadius + 0.9);
  }

  function mountainHeightAt(game, x, z) {
    return mountainBlocks.reduce((height, block) => {
      if (game.removedTerrain.has(block.key)) return height;
      if (Math.abs(block.x - x) <= block.size / 2 && Math.abs(block.z - z) <= block.size / 2) {
        return Math.max(height, block.y + 1);
      }
      return height;
    }, -0.25);
  }

  function collidesWithTrunk(x, z, tree) {
    return tree.alive && Math.hypot(x - tree.x, z - tree.z) < treeCollisionRadius;
  }

  function collidesWithSceneryTree(game, x, z) {
    return game.sceneryTrees.some(tree => tree.alive && Math.hypot(x - tree.x, z - tree.z) < 1.25);
  }

  function createGame(card) {
    const key = card.dataset.voxelGame;
    const canvas = card.querySelector(".voxel-canvas");
    const viewport = card.querySelector(".voxel-viewport");
    const controls = card.querySelector(".voxel-touch-controls");
    const replantButton = document.createElement("button");
    replantButton.type = "button";
    replantButton.dataset.action = "replant";
    replantButton.textContent = "Replantar bosque";
    replantButton.hidden = true;
    controls.append(replantButton);
    const fullscreenButton = document.createElement("button");
    fullscreenButton.type = "button";
    fullscreenButton.textContent = "⛶ Pantalla completa";
    fullscreenButton.setAttribute("aria-label", "Abrir el juego en pantalla completa");
    controls.append(fullscreenButton);
    const craftButton = document.createElement("button");
    craftButton.type = "button";
    craftButton.textContent = "Crafteo";
    craftButton.setAttribute("aria-expanded", "false");
    controls.append(craftButton);
    const craftPanel = document.createElement("div");
    craftPanel.className = "voxel-craft-panel";
    craftPanel.hidden = true;
    controls.append(craftPanel);
    const weatherDisplay = document.createElement("span");
    weatherDisplay.className = "voxel-weather-display";
    weatherDisplay.setAttribute("aria-live", "polite");
    viewport.append(weatherDisplay);
    const resourcesDisplay = document.createElement("span");
    resourcesDisplay.className = "voxel-resources-display";
    resourcesDisplay.setAttribute("aria-live", "polite");
    viewport.append(resourcesDisplay);
    const rainLayer = document.createElement("span");
    rainLayer.className = "voxel-rain";
    rainLayer.setAttribute("aria-hidden", "true");
    viewport.append(rainLayer);
    const hotbar = document.createElement("div");
    hotbar.className = "voxel-hotbar";
    hotbar.setAttribute("role", "group");
    hotbar.setAttribute("aria-label", "Inventario de nueve espacios");
    const handItem = document.createElement("img");
    handItem.className = "voxel-hand-item";
    handItem.src = "netherite-axe-hacha-de-netherite.png";
    handItem.alt = "Hacha de netherite en la mano";
    handItem.draggable = false;
    const handPickaxe = document.createElement("span");
    handPickaxe.className = "voxel-hand-pickaxe";
    handPickaxe.textContent = "⛏";
    handPickaxe.hidden = true;
    handPickaxe.setAttribute("aria-hidden", "true");
    viewport.append(hotbar, handItem, handPickaxe);
    const inventorySlots = [];
    for (let index = 0; index < 9; index += 1) {
      const slot = document.createElement("button");
      slot.type = "button";
      slot.className = `voxel-inventory-slot${index === 0 ? " selected" : ""}`;
      slot.setAttribute("aria-label", index === 0 ? "Espacio 1, hacha de netherite seleccionada" : `Espacio ${index + 1}, vacío`);
      slot.setAttribute("aria-pressed", String(index === 0));
      slot.dataset.slot = String(index);
      if (index === 0) {
        const axeIcon = document.createElement("img");
        axeIcon.src = "netherite-axe-hacha-de-netherite.png";
        axeIcon.alt = "";
        axeIcon.draggable = false;
        slot.append(axeIcon);
      } else if (index >= 2 && index < 6) {
        const blockIcon = document.createElement("span");
        blockIcon.className = `voxel-block-icon voxel-block-icon-${index - 1}`;
        blockIcon.setAttribute("aria-hidden", "true");
        slot.append(blockIcon);
      }
      const count = document.createElement("span");
      count.className = "voxel-slot-count";
      slot.append(count);
      slot.countLabel = count;
      hotbar.append(slot);
      inventorySlots.push(slot);
    }
    const gl = canvas.getContext("webgl", { antialias: true, alpha: false }) ||
      canvas.getContext("experimental-webgl", { antialias: true, alpha: false });
    if (!gl) throw new Error("Este navegador no tiene WebGL activado.");
    const program = createProgram(gl);
    const buffer = createCubeBuffer(gl);
    const attributes = {
      position: gl.getAttribLocation(program, "aPosition"),
      normal: gl.getAttribLocation(program, "aNormal"),
      uv: gl.getAttribLocation(program, "aUv")
    };
    const uniforms = {
      mvp: gl.getUniformLocation(program, "uMvp"),
      tint: gl.getUniformLocation(program, "uTint"),
      textured: gl.getUniformLocation(program, "uTextured"),
      texture: gl.getUniformLocation(program, "uTexture")
    };
    const feedback = card.querySelector("[data-game-feedback]");
    const controlsHint = card.querySelector(".voxel-controls > p");
    canvas.setAttribute("aria-label", "WASD mover, mouse mirar, espacio saltar, Shift agacharse, clic izquierdo romper/talar y clic derecho colocar");
    controlsHint.textContent = controlsHint.textContent
      .replace("clic talar", "clic izquierdo romper/talar · clic derecho colocar") +
      " · R siguiente pregunta";
    const game = {
      key,
      card,
      canvas,
      viewport,
      gl,
      program,
      buffer,
      attributes,
      uniforms,
      feedback,
      question: card.querySelector("[data-game-question]"),
      score: card.querySelector("[data-game-score]"),
      nextButton: card.querySelector('[data-action="next"]'),
      replantButton,
      fullscreenButton,
      craftButton,
      craftPanel,
      weatherDisplay,
      resourcesDisplay,
      hotbar,
      handItem,
      handPickaxe,
      inventorySlots,
      selectedSlot: 0,
      trees: [],
      sceneryTrees: sceneryTrees.map(tree => ({ ...tree })),
      yaw: 0,
      pitch: 0,
      x: 0,
      y: 0,
      z: 1.5,
      verticalSpeed: 0,
      grounded: true,
      keys: new Set(),
      touchForward: 0,
      touchTurn: 0,
      crouchToggle: false,
      dragging: false,
      lastPointer: null,
      correctAnswer: "",
      roundSolved: false,
      nextQuestionPending: false,
      chopped: 0,
      lastFrame: performance.now(),
      woodTexture: null,
      leavesTexture: null,
      grassTexture: null,
      dirtTexture: null,
      stoneTexture: null,
      oakLeavesTexture: null,
      snowTexture: null,
      sandTexture: null,
      plankTexture: null,
      buildBlocks: [],
      removedTerrain: new Set(),
      materials: { logs: 0, planks: 0, sticks: 0, dirt: 24, grass: 24, stone: 16, sand: 16, doors: 0, fences: 0, tables: 0, apples: 0 },
      slotNineMaterial: "fences",
      weather: "soleado",
      nextWeatherChange: performance.now() + 18000 + Math.random() * 12000,
      nextLightning: performance.now() + 24000 + Math.random() * 26000,
      lightningUntil: 0,
      lightningClassTimer: 0,
      rainOffset: 0,
      rainLayer
    };
    inventorySlots.forEach((slot, index) => {
      if (index < 6) slot.setAttribute("aria-label", `Espacio ${index + 1}, ${["hacha de netherite", "pico", "bloque de pasto", "bloque de tierra", "bloque de piedra", "bloque de arena"][index]}${index === 0 ? " seleccionado" : ""}`);
    });
    game.chopped = key === "vowels" ? vowelIndex : quizzes[key].count;
    game.score.textContent = `Árboles correctos: ${game.chopped}`;
    game.trees = positions.map((_, index) => makeTree(game, index));
    game.woodTexture = createTexture(gl, "basic-oak-log.png", message => setFeedback(game, message, "incorrect"));
    game.leavesTexture = createTexture(gl, "birch-leaves.png", message => setFeedback(game, message, "incorrect"));
    game.grassTexture = createPixelTexture(gl, ["#527f32", "#5c8b37", "#648f3b", "#47732d", "#719943"], 971);
    game.dirtTexture = createPixelTexture(gl, ["#765234", "#805a39", "#6c492f", "#8a6240"], 1421);
    game.stoneTexture = createPixelTexture(gl, ["#777b78", "#858985", "#6d716f", "#92958f"], 2017);
    game.oakLeavesTexture = createPixelTexture(gl, [
      "#245b28", "#2d682d", "#367332", "#3d7d36", "#4b853b", "#579044", null
    ], 3203);
    game.snowTexture = createPixelTexture(gl, ["#e8f4f7", "#ffffff", "#d6e7ec", "#f4fbfc", "#c9dce2"], 4001);
    game.sandTexture = createPixelTexture(gl, ["#c8b276", "#d8c58a", "#bba568", "#e0d09a", "#cfbb7d"], 4817);
    game.plankTexture = createPixelTexture(gl, ["#a87542", "#bd8951", "#98683d", "#c89960"], 6007);
    inventorySlots.forEach((slot, index) => {
      if (index === 1) {
        const pickaxeIcon = document.createElement("span");
        pickaxeIcon.className = "voxel-tool-icon";
        pickaxeIcon.textContent = "⛏";
        pickaxeIcon.setAttribute("aria-hidden", "true");
        slot.append(pickaxeIcon);
      } else if (index >= 6) {
        const itemIcon = document.createElement("span");
        itemIcon.className = `voxel-item-icon voxel-item-icon-${index}`;
        itemIcon.textContent = ["", "", "", "", "", "", "▧", "▥", "▤"][index];
        itemIcon.setAttribute("aria-hidden", "true");
        slot.append(itemIcon);
      }
    });
    setupCrafting(game);
    updateInventoryDisplay(game);
    handItem.addEventListener("error", () => {
      setFeedback(game, "No se pudo cargar netherite-axe-hacha-de-netherite.png.", "incorrect");
    }, { once: true });
    inventorySlots.forEach((slot, index) => slot.addEventListener("click", () => selectSlot(game, index)));
    canvas.addEventListener("pointerdown", event => {
      canvas.focus();
      game.dragging = true;
      game.lastPointer = [event.clientX, event.clientY];
      if (event.button === 0) {
        interactWithTarget(game);
      } else if (event.button === 2) {
        event.preventDefault();
        placeBuildBlock(game);
      }
      if (typeof canvas.requestPointerLock === "function") {
        const request = canvas.requestPointerLock();
        if (request && typeof request.catch === "function") {
          request.catch(() => setFeedback(game, "Mouse no disponible: puedes girar arrastrando sobre el juego."));
        }
      }
    });
    window.addEventListener("pointerup", () => {
      game.dragging = false;
      game.touchForward = 0;
      game.touchTurn = 0;
    });
    canvas.addEventListener("pointermove", event => {
      if (document.pointerLockElement === canvas) {
        game.yaw += event.movementX * 0.0025;
        game.pitch = Math.max(-1.3, Math.min(1.3, game.pitch - event.movementY * 0.0025));
      } else if (game.dragging && game.lastPointer) {
        game.yaw += (event.clientX - game.lastPointer[0]) * 0.004;
        game.pitch = Math.max(-1.3, Math.min(1.3, game.pitch - (event.clientY - game.lastPointer[1]) * 0.004));
        game.lastPointer = [event.clientX, event.clientY];
      }
    });
    canvas.addEventListener("pointercancel", () => { game.dragging = false; });
    canvas.addEventListener("contextmenu", event => event.preventDefault());
    fullscreenButton.addEventListener("click", async () => {
      try {
        if (document.fullscreenElement === card) {
          await document.exitFullscreen();
        } else {
          await card.requestFullscreen();
        }
      } catch (error) {
        setFeedback(game, "No se pudo activar la pantalla completa en este navegador.");
        console.error("No se pudo activar la pantalla completa:", error);
      }
    });
    document.addEventListener("fullscreenchange", () => {
      const isFullscreen = document.fullscreenElement === card;
      fullscreenButton.textContent = isFullscreen ? "⛶ Salir de pantalla completa" : "⛶ Pantalla completa";
      fullscreenButton.setAttribute("aria-label", isFullscreen
        ? "Salir de pantalla completa"
        : "Abrir el juego en pantalla completa");
    });
    window.addEventListener("keydown", event => {
      const active = document.pointerLockElement === canvas ||
        document.activeElement === canvas ||
        card.contains(document.activeElement) ||
        document.fullscreenElement === card;
      if (!active) return;
      const code = event.code;
      if (/^Digit[1-9]$/.test(code)) {
        selectSlot(game, Number(code.slice(-1)) - 1);
        event.preventDefault();
        return;
      }
      if (code === "KeyR" && game.roundSolved) {
        if (!game.trees.some(tree => tree.alive)) {
          game.trees = positions.map((_, index) => makeTree(game, index));
          game.replantButton.hidden = true;
        }
        advanceQuestion(game);
        event.preventDefault();
        return;
      }
      if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "ShiftLeft", "ShiftRight", "ControlLeft", "ControlRight"].includes(code)) {
        if (code === "Space" && !game.keys.has(code)) jump(game);
        game.keys.add(code);
        event.preventDefault();
      }
    });
    window.addEventListener("keyup", event => game.keys.delete(event.code));
    card.querySelectorAll("[data-turn]").forEach(button => {
      button.addEventListener("pointerdown", event => {
        event.preventDefault();
        game.touchTurn = Number(button.dataset.turn);
      });
    });
    card.querySelectorAll("[data-move]").forEach(button => {
      button.addEventListener("pointerdown", event => {
        event.preventDefault();
        game.touchForward = Number(button.dataset.move);
      });
    });
    card.querySelectorAll("[data-jump]").forEach(button => button.addEventListener("click", () => jump(game)));
    card.querySelectorAll("[data-crouch]").forEach(button => button.addEventListener("click", () => { game.crouchToggle = !game.crouchToggle; }));
    card.querySelector('[data-action="chop"]').addEventListener("click", () => chop(game));
    game.nextButton.addEventListener("click", () => {
      if (!game.roundSolved) return;
      if (!game.trees.some(tree => tree.alive)) {
        game.trees = positions.map((_, index) => makeTree(game, index));
      }
      advanceQuestion(game);
    });
    game.replantButton.addEventListener("click", () => {
      if (game.trees.some(tree => tree.alive)) return;
      game.trees = positions.map((_, index) => makeTree(game, index));
      if (game.roundSolved && !keyIsComplete(game.key)) advanceQuestion(game);
      else setQuestion(game);
      setFeedback(game, "Bosque replantado. Encuentra la respuesta correcta.", "correct");
    });
    instances.set(key, game);
    setQuestion(game);
    requestAnimationFrame(time => renderFrame(game, time));
    return game;
  }

  function selectSlot(game, index) {
    game.selectedSlot = index;
    game.inventorySlots.forEach((slot, slotIndex) => {
      const selected = slotIndex === index;
      slot.classList.toggle("selected", selected);
      slot.setAttribute("aria-pressed", String(selected));
      const item = ["hacha de netherite", "pico", "bloque de pasto", "bloque de tierra", "bloque de piedra", "bloque de arena", "tablones", "puerta", game.slotNineMaterial === "tables" ? "mesa de crafteo" : "valla"][slotIndex];
      slot.setAttribute("aria-label", `Espacio ${slotIndex + 1}, ${item}${selected ? " seleccionado" : ""}`);
    });
    game.handItem.hidden = index !== 0;
    game.handPickaxe.hidden = index !== 1;
  }

  function buildTexture(game) {
    if (game.selectedSlot === 2) return game.grassTexture;
    if (game.selectedSlot === 3) return game.dirtTexture;
    if (game.selectedSlot === 4) return game.stoneTexture;
    if (game.selectedSlot === 5) return game.sandTexture;
    if (game.selectedSlot === 6) return game.plankTexture;
    if (game.selectedSlot === 7) return game.plankTexture;
    if (game.selectedSlot === 8) return game.plankTexture;
    return null;
  }

  function buildMaterialForSlot(game, index) {
    if (index === 8) return game.slotNineMaterial;
    return ["", "", "grass", "dirt", "stone", "sand", "planks", "doors", "fences"][index] || "";
  }

  function setupCrafting(game) {
    const recipes = [
      { name: "4 tablones", inputs: { logs: 1 }, output: { planks: 4 } },
      { name: "4 palos", inputs: { planks: 2 }, output: { sticks: 4 } },
      { name: "1 puerta de madera", inputs: { planks: 6 }, output: { doors: 1 } },
      { name: "3 vallas", inputs: { planks: 4, sticks: 2 }, output: { fences: 3 } },
      { name: "1 mesa de crafteo", inputs: { planks: 4 }, output: { tables: 1 } }
    ];
    game.craftButton.addEventListener("click", () => {
      game.craftPanel.hidden = !game.craftPanel.hidden;
      game.craftButton.setAttribute("aria-expanded", String(!game.craftPanel.hidden));
      if (!game.craftPanel.hidden) renderCraftingRecipes(game, recipes);
    });
    game.craftPanel.addEventListener("click", event => {
      const button = event.target.closest("[data-recipe-index]");
      if (!button) return;
      const recipe = recipes[Number(button.dataset.recipeIndex)];
      if (!recipe || !Object.entries(recipe.inputs).every(([item, count]) => game.materials[item] >= count)) return;
      Object.entries(recipe.inputs).forEach(([item, count]) => { game.materials[item] -= count; });
      Object.entries(recipe.output).forEach(([item, count]) => { game.materials[item] += count; });
      if (recipe.output.tables) game.slotNineMaterial = "tables";
      if (recipe.output.fences) game.slotNineMaterial = "fences";
      game.inventorySlots[8].querySelector(".voxel-item-icon").textContent = game.slotNineMaterial === "tables" ? "▦" : "▤";
      updateInventoryDisplay(game);
      renderCraftingRecipes(game, recipes);
      setFeedback(game, `Crafteaste: ${recipe.name}.`);
    });
    game.craftingRecipes = recipes;
  }

  function renderCraftingRecipes(game, recipes) {
    game.craftPanel.replaceChildren();
    const heading = document.createElement("strong");
    heading.textContent = "Crafteo para construir";
    game.craftPanel.append(heading);
    recipes.forEach((recipe, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.recipeIndex = String(index);
      const ingredients = Object.entries(recipe.inputs)
        .map(([item, count]) => `${count} ${
          item === "logs" ? "troncos" : item === "planks" ? "tablones" : item === "sticks" ? "palos" : item
        }`)
        .join(" + ");
      button.textContent = `${recipe.name} — ${ingredients}`;
      button.disabled = !Object.entries(recipe.inputs).every(([item, count]) => game.materials[item] >= count);
      game.craftPanel.append(button);
    });
  }

  function updateInventoryDisplay(game) {
    const materialNames = [
      ["logs", "troncos"], ["planks", "tablones"], ["sticks", "palos"], ["grass", "pasto"],
      ["stone", "piedra"], ["dirt", "tierra"], ["sand", "arena"],
      ["doors", "puertas"], ["fences", "vallas"], ["tables", "mesas"], ["apples", "manzanas"]
    ];
    game.resourcesDisplay.textContent = materialNames
      .map(([key, label]) => `${label}: ${game.materials[key]}`)
      .join(" · ");
    game.inventorySlots.forEach((slot, index) => {
      const item = buildMaterialForSlot(game, index);
      const count = item ? game.materials[item] : 0;
      slot.countLabel.textContent = count ? String(count) : "";
      if (item) {
        const label = {
          grass: "bloque de pasto", dirt: "bloque de tierra", stone: "bloque de piedra",
          sand: "bloque de arena", planks: "tablones", doors: "puerta",
          fences: "valla", tables: "mesa de crafteo"
        }[item] || item;
        slot.setAttribute("aria-label", `Espacio ${index + 1}, ${label}${index === game.selectedSlot ? " seleccionado" : ""}, ${count}`);
      }
    });
    if (!game.craftPanel.hidden && game.craftingRecipes) renderCraftingRecipes(game, game.craftingRecipes);
  }

  function blockHeightAt(game, x, z) {
    return game.buildBlocks.reduce((height, block) => {
      if (Math.abs(block.x - x) < 0.72 && Math.abs(block.z - z) < 0.72) {
        return Math.max(height, block.y + 0.5);
      }
      return height;
    }, -0.25);
  }

  function islandTileAt(game, x, z) {
    return islandTiles.find(tile =>
      !game.removedTerrain.has(tile.key) &&
      Math.abs(tile.x - x) <= tile.size / 2 &&
      Math.abs(tile.z - z) <= tile.size / 2
    ) || null;
  }

  function supportHeightAt(game, x, z) {
    const tile = islandTileAt(game, x, z);
    return Math.max(-0.25, mountainHeightAt(game, x, z), tile?.top ?? -0.25, blockHeightAt(game, x, z));
  }

  function aimRay(game) {
    const eyeHeight = game.crouchToggle || game.keys.has("ShiftLeft") || game.keys.has("ShiftRight") ? 1.15 : 1.65;
    return {
      origin: [game.x, game.y + eyeHeight, game.z],
      direction: [
        Math.sin(game.yaw) * Math.cos(game.pitch),
        Math.sin(game.pitch),
        -Math.cos(game.yaw) * Math.cos(game.pitch)
      ]
    };
  }

  function findTargetedObject(game) {
    const { origin, direction } = aimRay(game);
    const maxDistance = 12;
    let closest = null;
    const consider = (center, size, type, details = {}) => {
      const intersection = rayIntersectsBox(origin, direction, center, size, maxDistance);
      if (intersection && (!closest || intersection.distance < closest.distance)) {
        closest = { ...intersection, center, type, ...details };
      }
    };

    islandTiles.forEach(tile => {
      if (game.removedTerrain.has(tile.key)) return;
      consider([tile.x, tile.top - 0.5, tile.z], [tile.size / 2, 0.5, tile.size / 2], "terrain-block", { tile });
    });
    mountainBlocks.forEach(block => {
      if (game.removedTerrain.has(block.key)) return;
      consider([block.x, block.y, block.z], [block.size / 2, 1, block.size / 2], "mountain-block", { block });
    });
    game.trees.forEach(tree => {
      if (!tree.alive) return;
      [0.5, 1.5, 2.5].forEach(y => consider([tree.x, y, tree.z], [0.5, 0.5, 0.5], "quiz-tree", { tree }));
      [
        [[tree.x, 2.9, tree.z], [1.85, 0.45, 1.85]],
        [[tree.x, 3.8, tree.z], [1.6, 0.45, 1.6]],
        [[tree.x, 4.7, tree.z], [1.2, 0.45, 1.2]],
        [[tree.x, 5.5, tree.z], [0.85, 0.4, 0.85]]
      ].forEach(([center, size]) => consider(center, size, "quiz-tree", { tree }));
    });
    game.sceneryTrees.forEach(tree => {
      if (!tree.alive) return;
      const variant = treeVariants[tree.type];
      const height = variant.height;
      consider([tree.x, height / 2, tree.z], [0.48, height / 2, 0.48], "scenery-tree", { tree });
      const crown = tree.type === "acacia" ? [2.1, 0.45, 1.7] : tree.type === "megaSpruce" ? [1.2, 1.2, 1.2] : [1.4, 0.7, 1.4];
      consider([tree.x, height - 0.3, tree.z], crown, "scenery-tree", { tree });
    });
    game.buildBlocks.forEach((block, index) => {
      consider([block.x, block.y, block.z], [0.5, 0.5, 0.5], "build-block", { blockIndex: index });
    });
    return closest ? { ...closest, origin, direction } : null;
  }

  function interactWithTarget(game) {
    const target = findTargetedObject(game);
    if (!target) {
      setFeedback(game, "Apunta con la + a un bloque dentro de tu alcance.");
      return;
    }
    if (target.type === "quiz-tree") {
      chop(game, target.tree);
      return;
    }
    if (target.type === "scenery-tree") {
      if (game.selectedSlot !== 0) {
        setFeedback(game, "Selecciona el hacha (espacio 1) para talar árboles.");
        return;
      }
      target.tree.alive = false;
      game.materials.logs += treeVariants[target.tree.type].logs;
      if (target.tree.type === "oak" && Math.random() < 0.25) game.materials.apples += 1;
      updateInventoryDisplay(game);
      setFeedback(game, `${treeVariants[target.tree.type].name}: recogiste ${treeVariants[target.tree.type].logs} troncos.`);
      return;
    }
    if (target.type === "terrain-block") {
      if (game.selectedSlot !== 1) {
        setFeedback(game, "Selecciona el pico (espacio 2) para minar los bloques del terreno.");
        return;
      }
      game.removedTerrain.add(target.tile.key);
      const minedMaterial = target.tile.beach ? "sand" : "dirt";
      game.materials[minedMaterial] += 1;
      updateInventoryDisplay(game);
      setFeedback(game, `Bloque minado. Recogiste 1 ${minedMaterial === "sand" ? "arena" : "tierra"}.`);
      return;
    }
    if (target.type === "mountain-block") {
      if (game.selectedSlot !== 1) {
        setFeedback(game, "Selecciona el pico (espacio 2) para minar las montañas.");
        return;
      }
      game.removedTerrain.add(target.block.key);
      game.materials[target.block.material] += 1;
      updateInventoryDisplay(game);
      setFeedback(game, `Bloque de montaña minado. Recogiste 1 ${target.block.material === "stone" ? "piedra" : "tierra"}.`);
      return;
    }
    if (target.type === "build-block") {
      const [block] = game.buildBlocks.splice(target.blockIndex, 1);
      if (block.material && Object.prototype.hasOwnProperty.call(game.materials, block.material)) {
        game.materials[block.material] += 1;
      }
      updateInventoryDisplay(game);
      setFeedback(game, "Bloque roto.");
      return;
    }
    setFeedback(game, "Ese bloque del paisaje no se puede romper.");
  }

  function updateWeather(game, time, elapsed) {
    if (time >= game.nextWeatherChange) {
      game.weather = Math.random() < 0.4 ? "tormenta" : "soleado";
      game.nextWeatherChange = time + 18000 + Math.random() * 26000;
      game.rainLayer.classList.toggle("active", game.weather === "tormenta");
    }
    const altitude = Math.max(game.y, mountainHeightAt(game, game.x, game.z));
    const climate = altitude >= 14 ? "Cima nevada" : altitude >= 7 ? "Montaña fresca" : "Pradera templada";
    const biome = islandRegions
      .map(island => ({
        name: island.biome,
        distance: (game.x - island.x) ** 2 / island.radiusX ** 2 + (game.z - island.z) ** 2 / island.radiusZ ** 2
      }))
      .filter(island => island.distance <= 1.1)
      .sort((a, b) => a.distance - b.distance)[0]?.name || "Océano";
    game.weatherDisplay.textContent = `${biome} · ${climate} · ${game.weather === "tormenta" ? "Lluvia" : "Despejado"} · ${Math.round(altitude)} m`;
    if (game.weather === "tormenta" && time >= game.nextLightning) {
      game.lightningUntil = time + 180;
      game.nextLightning = time + 10000 + Math.random() * 22000;
      game.viewport.classList.add("lightning");
      window.clearTimeout(game.lightningClassTimer);
      game.lightningClassTimer = window.setTimeout(() => game.viewport.classList.remove("lightning"), 190);
    }
    if (game.weather === "tormenta") {
      game.rainOffset = (game.rainOffset + elapsed * 360) % 100;
      game.rainLayer.style.backgroundPositionY = `${game.rainOffset}px`;
    }
  }

  function placeBuildBlock(game) {
    const texture = buildTexture(game);
    if (!texture) {
      setFeedback(game, "Selecciona un bloque o material de construcción en el inventario.");
      return;
    }
    if (game.buildBlocks.length >= 400) {
      setFeedback(game, "Llegaste al límite de 400 bloques construidos en este bosque.");
      return;
    }
    const material = buildMaterialForSlot(game, game.selectedSlot);
    if (!material || game.materials[material] < 1) {
      setFeedback(game, "No tienes unidades de ese material. Consigue recursos o usa Crafteo.");
      return;
    }
    const target = findTargetedObject(game);
    if (!target) {
      setFeedback(game, "Apunta con la + a una superficie para colocar el bloque a su lado.");
      return;
    }
    const hit = [
      target.origin[0] + target.direction[0] * target.distance,
      target.origin[1] + target.direction[1] * target.distance,
      target.origin[2] + target.direction[2] * target.distance
    ];
    const [normalX, normalY, normalZ] = target.normal;
    const position = [
      normalX ? hit[0] + normalX * 0.5 : Math.round(hit[0]),
      normalY ? hit[1] + normalY * 0.5 : Math.round(hit[1] - 0.5) + 0.5,
      normalZ ? hit[2] + normalZ * 0.5 : Math.round(hit[2])
    ];
    const [x, y, z] = position;
    if (game.buildBlocks.some(block => Math.abs(block.x - x) < 0.1 && Math.abs(block.y - y) < 0.1 && Math.abs(block.z - z) < 0.1)) {
      setFeedback(game, "Ya hay un bloque en ese lugar.");
      return;
    }
    const overlapsPlayer = Math.abs(x - game.x) < 0.85 &&
      Math.abs(z - game.z) < 0.85 &&
      y + 0.5 > game.y &&
      y - 0.5 < game.y + 1.8;
    if (overlapsPlayer) {
      setFeedback(game, "No puedes colocar un bloque dentro de tu personaje.");
      return;
    }
    game.buildBlocks.push({ x, y, z, texture, material });
    game.materials[material] -= 1;
    updateInventoryDisplay(game);
    setFeedback(game, "Bloque colocado junto a la superficie que señalaste con la +.");
  }

  function advanceQuestion(game) {
    if (game.key === "vowels") {
      if (!keyIsComplete(game.key)) {
        vowelIndex = Math.min(vowelIndex + 1, vowelExercises.length);
        saveProgress();
        renderVowelExercise();
      }
    } else if (!keyIsComplete(game.key)) {
      createMathQuestion(game.key);
    }
    game.nextQuestionPending = false;
    setQuestion(game);
  }

  function jump(game) {
    if (game.grounded) {
      game.verticalSpeed = 7.8;
      game.grounded = false;
    }
  }

  function chop(game, targetTree) {
    if (game.roundSolved) return;
    const hit = targetTree ? { tree: targetTree } : findTargetedObject(game);
    if (!hit || !hit.tree) {
      setFeedback(game, "Apunta con la + al tronco de una respuesta dentro de tu alcance.");
      return;
    }
    if (hit.tree.answer !== game.correctAnswer) {
      setFeedback(game, `Ese árbol tiene ${hit.tree.answer}. Busca el resultado correcto.`, "incorrect");
      return;
    }
    hit.tree.alive = false;
    hit.tree.label?.remove();
    hit.tree.label = null;
    game.roundSolved = true;
    game.nextQuestionPending = true;
    game.chopped += 1;
    game.score.textContent = `Árboles correctos: ${game.chopped}`;
    setFeedback(game, "¡Correcto! Talaste la respuesta. Pulsa R o «Siguiente pregunta».", "correct");
    game.nextButton.hidden = true;
    if (keyIsComplete(game.key)) {
      game.nextButton.hidden = true;
    } else if (game.trees.some(tree => tree.alive)) {
      game.nextButton.hidden = false;
    }
    if (!game.trees.some(tree => tree.alive)) {
      game.replantButton.hidden = keyIsComplete(game.key);
      setFeedback(game, keyIsComplete(game.key)
        ? "¡Excelente! Completaste todos los ejercicios de este nivel."
        : "¡Correcto! No quedan árboles. Pulsa R para la siguiente pregunta y replantar.", "correct");
    }
    if (game.key === "vowels") {
      updateNextLevelButtons();
    } else {
      const quiz = quizzes[game.key];
      quiz.count = Math.min(quiz.count + 1, 30);
      saveProgress();
      updateNextLevelButtons();
    }
  }

  function keyIsComplete(key) {
    return key === "vowels"
      ? vowelIndex >= vowelExercises.length
      : quizzes[key].count >= 30;
  }

  function renderCube(game, viewProjection, position, scale, texture, tint, textured) {
    const gl = game.gl;
    gl.uniformMatrix4fv(game.uniforms.mvp, false, multiplyMatrices(viewProjection, modelMatrix(position, scale)));
    gl.uniform3fv(game.uniforms.tint, tint);
    gl.uniform1i(game.uniforms.textured, textured ? 1 : 0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.drawArrays(gl.TRIANGLES, 0, 36);
  }

  function drawLandscape(game, viewProjection) {
    renderCube(game, viewProjection, [0, -0.43, -8], [180, 0.75, 180], game.sandTexture, [0.25, 0.52, 0.78], true);
    islandTiles.forEach(tile => {
      if (game.removedTerrain.has(tile.key)) return;
      const snowy = tile.biome === "Taiga nevada" && !tile.beach;
      const texture = tile.beach ? game.sandTexture : snowy ? game.snowTexture : game.grassTexture;
      const tint = tile.biome === "Jungla" ? [0.76, 0.94, 0.72]
        : tile.biome === "Sabana" ? [0.94, 0.84, 0.59]
          : tile.biome === "Manglar" ? [0.75, 0.9, 0.72]
            : tile.biome === "Bosque del Nether" ? [0.92, 0.68, 0.75]
              : [1, 1, 1];
      renderCube(game, viewProjection, [tile.x, tile.top - 0.5, tile.z], [tile.size, 1, tile.size], texture, snowy ? [1, 1, 1] : tint, true);
    });

    mountainBlocks.forEach(block => {
      if (game.removedTerrain.has(block.key)) return;
      const texture = block.textureType === "dirt" ? game.dirtTexture
        : block.textureType === "snow" ? game.snowTexture
          : block.textureType === "grass" ? game.grassTexture
            : game.stoneTexture;
      renderCube(
        game,
        viewProjection,
        [block.x, block.y, block.z],
        [block.size, 2, block.size],
        texture,
        block.tint,
        true
      );
    });

    game.sceneryTrees.forEach(tree => drawSceneryTree(game, viewProjection, tree));

    const grassTufts = [[-6, -4], [6, -5], [-8, -10], [8, -11], [-5, -15], [5, -17], [-12, -8], [12, -9]];
    grassTufts.forEach(([x, z], index) => {
      const height = 0.45 + (index % 2) * 0.18;
      renderCube(game, viewProjection, [x, height / 2, z], [0.11, height, 0.11], game.grassTexture, [0.55, 1.15, 0.35], true);
      renderCube(game, viewProjection, [x + 0.12, height / 2, z], [0.11, height * 0.8, 0.11], game.grassTexture, [0.52, 1.1, 0.32], true);
    });
    game.buildBlocks.forEach(block => {
      if (block.material === "doors") {
        renderCube(game, viewProjection, [block.x, block.y, block.z], [0.9, 1, 0.16], block.texture, [1, 1, 1], true);
      } else if (block.material === "fences") {
        renderCube(game, viewProjection, [block.x - 0.32, block.y, block.z], [0.16, 1, 0.16], block.texture, [1, 1, 1], true);
        renderCube(game, viewProjection, [block.x + 0.32, block.y, block.z], [0.16, 1, 0.16], block.texture, [1, 1, 1], true);
        renderCube(game, viewProjection, [block.x, block.y - 0.2, block.z], [0.8, 0.12, 0.16], block.texture, [1, 1, 1], true);
        renderCube(game, viewProjection, [block.x, block.y + 0.22, block.z], [0.8, 0.12, 0.16], block.texture, [1, 1, 1], true);
      } else {
        renderCube(game, viewProjection, [block.x, block.y, block.z], [1, 1, 1], block.texture, [1, 1, 1], true);
      }
    });
  }

  function drawSceneryTree(game, viewProjection, tree) {
    if (!tree.alive) return;
    const variant = treeVariants[tree.type];
    const { x, z } = tree;
    const height = variant.height;
    const trunkScale = tree.type === "darkOak" || tree.type === "megaSpruce" ? 1.15 : 0.75;
    if (variant.shape === "flat") {
      [0, 1, 2].forEach(section => {
        renderCube(
          game,
          viewProjection,
          [x + section * 0.32, 0.8 + section * 1.45, z],
          [trunkScale, 1.8, trunkScale],
          game.woodTexture,
          variant.trunk,
          true
        );
      });
    } else {
      renderCube(game, viewProjection, [x, height / 2, z], [trunkScale, height, trunkScale], game.woodTexture, variant.trunk, true);
    }
    if (variant.shape === "conifer" || variant.shape === "mega") {
      const tiers = variant.shape === "mega" ? 5 : 4;
      for (let tier = 0; tier < tiers; tier += 1) {
        const width = (tiers - tier) * (variant.shape === "mega" ? 0.82 : 0.68);
        const y = height * 0.4 + tier * (height * 0.12);
        renderCube(game, viewProjection, [x, y, z], [width, 0.95, width], game.oakLeavesTexture, variant.leaves, true);
      }
      return;
    }
    const crownY = height - 0.35;
    const crownWidth = variant.shape === "wide" ? 3.8 : variant.shape === "flat" ? 3.7 : 2.8;
    const crownHeight = variant.shape === "flat" ? 0.8 : variant.shape === "tall" ? 1.6 : 1.2;
    renderCube(game, viewProjection, [x, crownY, z], [crownWidth, crownHeight, variant.shape === "flat" ? 2.7 : crownWidth], game.oakLeavesTexture, variant.leaves, true);
    renderCube(game, viewProjection, [x, crownY + 0.9, z], [crownWidth * 0.78, crownHeight, crownWidth * 0.78], game.oakLeavesTexture, variant.leaves, true);
    if (variant.shape === "roots") {
      [-1, 1].forEach(direction => {
        renderCube(game, viewProjection, [x + direction * 0.75, 0.28, z], [0.28, 0.55, 0.28], game.woodTexture, variant.trunk, true);
        renderCube(game, viewProjection, [x, 0.28, z + direction * 0.75], [0.28, 0.55, 0.28], game.woodTexture, variant.trunk, true);
      });
    }
  }

  function drawScene(game, width, height) {
    const gl = game.gl;
    const eyeHeight = game.crouchToggle || game.keys.has("ShiftLeft") || game.keys.has("ShiftRight") ? 1.15 : 1.65;
    const eye = [game.x, game.y + eyeHeight, game.z];
    const direction = [
      Math.sin(game.yaw) * Math.cos(game.pitch),
      Math.sin(game.pitch),
      -Math.cos(game.yaw) * Math.cos(game.pitch)
    ];
    const view = lookAt(eye, direction);
    const projection = perspective(Math.PI / 3, width / height, 0.1, 120);
    const viewProjection = multiplyMatrices(projection, view);
    gl.viewport(0, 0, width, height);
    const lightning = performance.now() < game.lightningUntil;
    gl.clearColor(lightning ? 0.9 : 0.66, lightning ? 0.92 : 0.83, lightning ? 1 : 0.98, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(game.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, game.buffer);
    const stride = 8 * Float32Array.BYTES_PER_ELEMENT;
    gl.enableVertexAttribArray(game.attributes.position);
    gl.vertexAttribPointer(game.attributes.position, 3, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(game.attributes.normal);
    gl.vertexAttribPointer(game.attributes.normal, 3, gl.FLOAT, false, stride, 3 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(game.attributes.uv);
    gl.vertexAttribPointer(game.attributes.uv, 2, gl.FLOAT, false, stride, 6 * Float32Array.BYTES_PER_ELEMENT);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(game.uniforms.texture, 0);
    drawLandscape(game, viewProjection);
    game.trees.forEach(tree => {
      if (!tree.alive) return;
      renderCube(game, viewProjection, [tree.x, 0.5, tree.z], [1, 1, 1], game.woodTexture, [1, 1, 1], true);
      renderCube(game, viewProjection, [tree.x, 1.5, tree.z], [1, 1, 1], game.woodTexture, [1, 1, 1], true);
      renderCube(game, viewProjection, [tree.x, 2.5, tree.z], [1, 1, 1], game.woodTexture, [1, 1, 1], true);
      renderCube(game, viewProjection, [tree.x, 2.9, tree.z], [3.7, 0.9, 3.7], game.leavesTexture, [0.9, 1, 0.85], true);
      renderCube(game, viewProjection, [tree.x, 3.8, tree.z], [3.2, 0.9, 3.2], game.leavesTexture, [0.9, 1, 0.85], true);
      renderCube(game, viewProjection, [tree.x, 4.7, tree.z], [2.4, 0.9, 2.4], game.leavesTexture, [0.9, 1, 0.85], true);
      renderCube(game, viewProjection, [tree.x, 5.5, tree.z], [1.7, 0.8, 1.7], game.leavesTexture, [0.9, 1, 0.85], true);
      projectLabel(game, tree, view, projection, game.canvas.clientWidth, game.canvas.clientHeight);
    });
    if (game.weather === "tormenta") {
      for (let drop = 0; drop < 18; drop += 1) {
        const offsetX = ((drop * 37) % 15) - 7;
        const offsetZ = ((drop * 53) % 15) - 7;
        const falling = (performance.now() * 0.018 + drop * 1.7) % 10;
        renderCube(
          game,
          viewProjection,
          [game.x + offsetX, game.y + 8 - falling, game.z + offsetZ],
          [0.025, 0.55, 0.025],
          game.stoneTexture,
          [0.58, 0.72, 0.9],
          true
        );
      }
    }
  }

  function updateMovement(game, elapsed) {
    const keys = game.keys;
    const forwardInput = Number(keys.has("KeyW") || keys.has("ArrowUp")) -
      Number(keys.has("KeyS") || keys.has("ArrowDown")) + game.touchForward;
    const sideInput = Number(keys.has("KeyD") || keys.has("ArrowRight")) -
      Number(keys.has("KeyA") || keys.has("ArrowLeft"));
    const length = Math.hypot(forwardInput, sideInput) || 1;
    const forward = forwardInput / length;
    const side = sideInput / length;
    const crouched = game.crouchToggle || keys.has("ShiftLeft") || keys.has("ShiftRight");
    const running = keys.has("ControlLeft") || keys.has("ControlRight");
    const speed = crouched ? 1.295 : running ? 5.612 : 4.317;
    game.yaw += game.touchTurn * elapsed * 1.8;
    const dx = (Math.sin(game.yaw) * forward + Math.cos(game.yaw) * side) * speed * elapsed;
    const dz = (-Math.cos(game.yaw) * forward + Math.sin(game.yaw) * side) * speed * elapsed;
    const movementSteps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.18));
    const stepX = dx / movementSteps;
    const stepZ = dz / movementSteps;
    const stepHeight = 1.01;
    const movementIsClear = (x, z) => {
      if (game.trees.some(tree => collidesWithTrunk(x, z, tree)) || collidesWithSceneryTree(game, x, z)) return false;
      const targetHeight = supportHeightAt(game, x, z);
      const jumpClearsStep = game.verticalSpeed > 0 && game.y + game.verticalSpeed * elapsed >= targetHeight - 0.18;
      return targetHeight <= game.y + stepHeight || jumpClearsStep;
    };
    for (let step = 0; step < movementSteps; step += 1) {
      const targetX = game.x + stepX;
      const targetZ = game.z + stepZ;
      if (movementIsClear(targetX, game.z)) game.x = targetX;
      if (movementIsClear(game.x, targetZ)) game.z = targetZ;
    }
    const nextY = game.y + game.verticalSpeed * elapsed;
    game.y += game.verticalSpeed * elapsed;
    game.verticalSpeed -= 24 * elapsed;
    const groundHeight = supportHeightAt(game, game.x, game.z);
    if (nextY <= groundHeight) {
      game.y = groundHeight;
      game.verticalSpeed = 0;
      game.grounded = true;
    } else {
      game.grounded = false;
    }
  }

  function renderFrame(game, time) {
    const elapsed = Math.min((time - game.lastFrame) / 1000, 0.05);
    game.lastFrame = time;
    updateWeather(game, time, elapsed);
    updateMovement(game, elapsed);
    const rect = game.canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * pixelRatio));
      const height = Math.max(1, Math.round(rect.height * pixelRatio));
      if (game.canvas.width !== width || game.canvas.height !== height) {
        game.canvas.width = width;
        game.canvas.height = height;
      }
      drawScene(game, width, height);
    }
    requestAnimationFrame(nextTime => renderFrame(game, nextTime));
  }

  window.addEventListener("learning-question-change", event => {
    const game = instances.get(event.detail.key);
    if (game) setQuestion(game);
  });
  cards.forEach(card => {
    try {
      createGame(card);
    } catch (error) {
      const feedback = card.querySelector("[data-game-feedback]");
      feedback.className = "voxel-feedback incorrect";
      feedback.textContent = `No se pudo iniciar el juego 3D: ${error.message}`;
      console.error(`Error al iniciar el juego 3D de ${card.dataset.voxelGame}:`, error);
    }
  });
})();
