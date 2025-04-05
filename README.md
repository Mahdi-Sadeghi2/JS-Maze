# Maze Ball Game 🏰⚽

A physics-based maze game where players navigate a ball through a randomly generated maze to reach the goal. Built with Matter.js.

## Features ✨

- 🌀 **Procedural Maze Generation**: Unique maze every game using Depth-First Search algorithm
- 🎮 **Keyboard Controls**: Intuitive WASD key movement
- ⚖️ **Physics Simulation**: Realistic ball movement and collisions
- 🏁 **Win Condition**: Walls collapse dramatically when reaching the goal
- 🎨 **Color-Coded Elements**: Visual distinction between walls, ball, and goal

## How to Play 🕹️

1. Use **WASD** keys to move the ball:
   - **W**: Move Up
   - **A**: Move Left
   - **S**: Move Down
   - **D**: Move Right
2. Navigate through the maze
3. Reach the green goal area to win
4. Watch walls collapse in celebration!

## Technical Implementation 🛠️

### Core Systems

- **Matter.js Physics Engine**: Handles all collisions and movement
- **Recursive Backtracking Algorithm**: Generates random mazes
- **Event-Driven Architecture**: Handles user input and win conditions

### Key Components

| Component | Description                      |
| --------- | -------------------------------- |
| Ball      | Player-controlled physics object |
| Walls     | Maze boundaries (red)            |
| Goal      | Destination area (green)         |
| Boundary  | Invisible container walls        |
