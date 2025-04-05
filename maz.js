// Import Matter.js modules
const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

// Maze configuration
const cellsHorizontal = 20; // Number of horizontal cells in the grid
const cellsVertical = 20; // Number of vertical cells in the grid
const width = window.innerWidth; // Use full window width
const height = window.innerHeight; // Use full window height
const unitLengthX = width / cellsHorizontal; // Width of each cell
const unitLengthY = width / cellsVertical; // Height of each cell (using width to maintain square cells)

// Initialize physics engine
const engine = Engine.create();
engine.world.gravity.y = 0; // Disable gravity (top-down view)
const { world } = engine; // Reference to the physics world

// Set up renderer
const render = Render.create({
  element: document.body, // Attach to document body
  engine: engine, // Connect to physics engine
  options: {
    wireframes: false, // Show solid shapes (not wireframes)
    width, // Render width
    height, // Render height
  },
});

// Start the renderer and physics runner
Render.run(render);
Runner.run(Runner.create(), engine);

// Create boundary walls (top, bottom, left, right)
const walls = [
  Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }), // Top wall
  Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }), // Bottom wall
  Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }), // Left wall
  Bodies.rectangle(width, height / 2, 2, height, { isStatic: true }), // Right wall
];
World.add(world, walls); // Add walls to physics world

/* MAZE GENERATION ALGORITHM (Depth-First Search) */

// Fisher-Yates shuffle algorithm for randomizing arrays
const shuffle = (arr) => {
  let counter = arr.length;
  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);
    counter--;
    [arr[counter], arr[index]] = [arr[index], arr[counter]]; // Swap elements
  }
  return arr;
};

// Create grid representations:
const grid = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false)); // Visited cells tracker

const verticals = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false)); // Vertical walls between cells

const horizontals = Array(cellsVertical - 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false)); // Horizontal walls between cells

// Start maze generation from random cell
const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

// Recursive maze generation function
const stepThroughCell = (row, column) => {
  if (grid[row][column]) return; // Skip already visited cells

  grid[row][column] = true; // Mark current cell as visited

  // Visit neighbors in random order
  const neighbors = shuffle([
    [row - 1, column, "up"],
    [row, column + 1, "right"],
    [row + 1, column, "down"],
    [row, column - 1, "left"],
  ]);

  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;

    // Skip out-of-bounds neighbors
    if (
      nextRow < 0 ||
      nextRow >= cellsVertical ||
      nextColumn < 0 ||
      nextColumn >= cellsHorizontal
    )
      continue;

    if (grid[nextRow][nextColumn]) continue; // Skip visited neighbors

    // Remove wall between current cell and neighbor
    if (direction === "left") verticals[row][column - 1] = true;
    else if (direction === "right") verticals[row][column] = true;
    else if (direction === "up") horizontals[row - 1][column] = true;
    else if (direction === "down") horizontals[row][column] = true;

    stepThroughCell(nextRow, nextColumn); // Recursively visit neighbor
  }
};

// Generate the maze
stepThroughCell(startRow, startColumn);

/* CREATE PHYSICAL WALLS BASED ON MAZE STRUCTURE */

// Create horizontal walls
horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) return; // Skip where there's no wall

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX / 2,
      rowIndex * unitLengthY + unitLengthY,
      unitLengthX,
      5, // Thin horizontal wall
      {
        label: "wall",
        isStatic: true,
        render: {
          fillStyle: "#FF0000", // Red color
          strokeStyle: "#FFFFFF", // White border
          visible: true,
        },
      }
    );
    World.add(world, wall);
  });
});

// Create vertical walls
verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) return; // Skip where there's no wall

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      5,
      unitLengthY, // Thin vertical wall
      {
        label: "wall",
        isStatic: true,
        render: {
          fillStyle: "#FF0000", // Red color
          strokeStyle: "#FFFFFF", // White border
          visible: true,
        },
      }
    );
    World.add(world, wall);
  });
});

/* GAME ELEMENTS */

// Create goal area
const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * 0.7,
  unitLengthY * 0.7,
  {
    label: "goal",
    isStatic: true,
    render: {
      fillStyle: "#00FF00", // Green color
      strokeStyle: "#FFFFFF", // White border
      visible: true,
    },
  }
);
World.add(world, goal);

// Create player ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
  label: "ball",
  render: {
    fillStyle: "yellow", // Yellow ball
    strokeStyle: "#000000", // Black border
    lineWidth: 2,
  },
});
World.add(world, ball);

/* PLAYER CONTROLS */
document.addEventListener("keydown", (event) => {
  const { x, y } = ball.velocity;
  const force = 5; // Movement force

  switch (event.key.toUpperCase()) {
    case "W": // Move up
      Body.setVelocity(ball, { x, y: y - force });
      break;
    case "D": // Move right
      Body.setVelocity(ball, { x: x + force, y });
      break;
    case "S": // Move down
      Body.setVelocity(ball, { x, y: y + force });
      break;
    case "A": // Move left
      Body.setVelocity(ball, { x: x - force, y });
      break;
  }
});

/* WIN CONDITION */
Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    // Check if ball collided with goal
    if (
      (collision.bodyA.label === "ball" && collision.bodyB.label === "goal") ||
      (collision.bodyA.label === "goal" && collision.bodyB.label === "ball")
    ) {
      // Show winner message
      document.querySelector(".winner").classList.remove("hidden");

      // Make walls fall (enable gravity and make walls dynamic)
      world.gravity.y = 1;
      world.bodies.forEach((body) => {
        if (body.label === "wall") {
          Body.setStatic(body, false);
        }
      });
    }
  });
});
