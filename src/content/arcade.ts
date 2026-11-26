export type ArcadeGame = {
  slug: string;
  title: string;
  tagline: string;
  /** Two lines printed on the cassette label. */
  label: string;
  year: string;
  stack: string[];
  engine: "pygame" | "sfml";
  /** Native window ratio, so the glass can match the game. */
  aspect: string;
  controls: string;
  source: string;
  accent: string;
};

/**
 * Every cabinet in the arcade. `slug` matches the folder in public/arcade/ that
 * holds the WebAssembly build, so adding a game means adding an entry here and
 * building it with the tooling in games/tools/.
 */
export const arcadeGames: ArcadeGame[] = [
  {
    slug: "space-invaders",
    title: "Space Invaders",
    tagline: "Alien waves, projectiles, and power-ups",
    label:
      "Five alien types, each with its own health pool, descending in tightening waves. Bullets, drops and a boss level that earns its keep.",
    year: "2023",
    stack: ["Python", "Pygame"],
    engine: "pygame",
    aspect: "16 / 9",
    controls: "Mouse to aim, click to fire",
    source: "https://github.com/Mughal-Hash-24/Space-Invaders",
    accent: "#7fb2ff",
  },
  {
    slug: "two-birds-one-stone",
    title: "Two Birds One Stone",
    tagline: "Slingshot arcade with projectile physics",
    label:
      "A slingshot, seven hand-built levels and birds that will not sit still. The stone keeps its momentum, so bank shots are the whole game.",
    year: "2023",
    stack: ["Python", "Pygame"],
    engine: "pygame",
    aspect: "4 / 3",
    controls: "Mouse to aim, click to launch",
    source: "https://github.com/Mughal-Hash-24/Two-Birds-One-Stone",
    accent: "#ffc27a",
  },
  {
    slug: "socket-chess",
    title: "Socket Chess",
    tagline: "Full move validation, pass-and-play",
    label:
      "Complete legal-move generation — castling, check, stalemate, every pawn edge case except en passant. Built for two players over a socket; this cut is pass-and-play.",
    year: "2023",
    stack: ["Python", "Pygame"],
    engine: "pygame",
    aspect: "1 / 1",
    controls: "Click a piece, then a destination",
    source: "https://github.com/Mughal-Hash-24/Chess",
    accent: "#ffe9bd",
  },
  {
    slug: "2d-voxel-engine-v2",
    title: "2D Voxel Engine V2",
    tagline: "Terrain, enemies, and combat",
    label:
      "Perlin-generated terrain streamed in chunks, with enemies that path toward you and a fireball that answers back. The sequel the first engine wanted to be.",
    year: "2023",
    stack: ["Python", "Pygame"],
    engine: "pygame",
    aspect: "3 / 2",
    controls: "A / D to move, Space to jump, W to fade music",
    source: "https://github.com/Mughal-Hash-24/2D-Voxel-Engine-V2",
    accent: "#8fd56a",
  },
  {
    slug: "2d-voxel-engine",
    title: "2D Voxel Engine",
    tagline: "Interactive 2D voxel terrain",
    label:
      "The first pass: a block palette, a paint grid and a world you build by hand. Everything here became the foundation for V2.",
    year: "2023",
    stack: ["Python", "Pygame"],
    engine: "pygame",
    aspect: "5 / 4",
    controls: "Mouse and keyboard",
    source: "https://github.com/Mughal-Hash-24/2D-Voxel-Engine",
    accent: "#b8dcff",
  },
  {
    slug: "flappy-bird",
    title: "Flappy Bird",
    tagline: "Keyboard-controlled flight and obstacles",
    label:
      "Gravity, a jump impulse and an endless run of pipes. No pixel art, by its author's own admission — the mechanic had to carry it.",
    year: "2023",
    stack: ["Python", "Pygame"],
    engine: "pygame",
    aspect: "4 / 3",
    controls: "Up to flap, Enter to restart",
    source: "https://github.com/Mughal-Hash-24/Flappy-Bird",
    accent: "#ffb8dc",
  },
  {
    slug: "pong",
    title: "Pong",
    tagline: "Two-player paddle and ball arcade",
    label:
      "Two paddles, one ball, and an angle that changes with where you hit. The original two-player argument, rebuilt in a hundred lines.",
    year: "2023",
    stack: ["Python", "Pygame"],
    engine: "pygame",
    aspect: "3 / 2",
    controls: "W / S and Up / Down for the paddles",
    source: "https://github.com/Mughal-Hash-24/Pong",
    accent: "#cfe0ff",
  },
  {
    slug: "snake",
    title: "Snake",
    tagline: "Grid movement, food, and scoring",
    label:
      "A grid, a tail that grows, and the rule that you are your own worst obstacle. Ten points a bean and no way to stop cleanly.",
    year: "2023",
    stack: ["Python", "Pygame"],
    engine: "pygame",
    aspect: "4 / 3",
    controls: "Arrow keys to steer, Enter to restart",
    source: "https://github.com/Mughal-Hash-24/Snake",
    accent: "#a8ccff",
  },
  {
    slug: "save-the-ball",
    title: "Save the Ball",
    tagline: "Bouncing-ball survival game",
    label:
      "A Chrome Dino descendant where the dino is a ball and the cacti are thorns. Jump, land, keep the streak alive as the speed climbs.",
    year: "2023",
    stack: ["Python", "Pygame"],
    engine: "pygame",
    aspect: "4 / 3",
    controls: "Space to bounce",
    source: "https://github.com/Mughal-Hash-24/Save-The-Ball",
    accent: "#ffd9a6",
  },
  {
    slug: "bean-collector",
    title: "Bean Collector",
    tagline: "Timed coffee-bean arcade game",
    label:
      "The first program its author ever shipped. Move the mug, catch the beans, beat the clock — written in May 2023 with an AI looking over his shoulder.",
    year: "2023",
    stack: ["Python", "Pygame"],
    engine: "pygame",
    aspect: "1 / 1",
    controls: "Arrow keys to move the mug",
    source: "https://github.com/Mughal-Hash-24/Bean-Collector",
    accent: "#ffc98f",
  },
  {
    slug: "atari-breakout",
    title: "Atari Breakout",
    tagline: "Paddle, ball, and randomized bricks",
    label:
      "Six rows of bricks in three colours, generated fresh each run. The paddle's edge sets the return angle, so placement beats speed.",
    year: "2023",
    stack: ["Python", "Pygame"],
    engine: "pygame",
    aspect: "4 / 3",
    controls: "Left / Right to move the paddle",
    source: "https://github.com/Mughal-Hash-24/Atari-Breakout",
    accent: "#ffab4f",
  },
  {
    slug: "bresenham-visualizer",
    title: "Bresenham Visualizer",
    tagline: "Integer line drawing on a 120×80 grid",
    label:
      "Bresenham's integer line algorithm, made clickable. Two points in, a stepped line out, on a grid of 9,600 pixels you can toggle by hand.",
    year: "2023",
    stack: ["C++", "SFML 2.6.2"],
    engine: "sfml",
    aspect: "3 / 2",
    controls: "Click two pixels to draw, Escape to clear",
    source: "https://github.com/Mughal-Hash-24/Line-Drawing-Algorithm",
    accent: "#ffe2a8",
  },
  {
    slug: "chess-board-prototype",
    title: "Chess Board Prototype",
    tagline: "8×8 board with move validation",
    label:
      "A textured board and twelve pieces with real movement rules attached — the groundwork for a fuller engine, kept as the prototype it is.",
    year: "2023",
    stack: ["C++", "SFML 2.6.2"],
    engine: "sfml",
    aspect: "1 / 1",
    controls: "Click a piece, then a destination",
    source: "https://github.com/Mughal-Hash-24/ChessEngine",
    accent: "#f2d9a6",
  },
  {
    slug: "buzz-bomberz",
    title: "Buzz Bomberz",
    tagline: "Intellivision-inspired arcade shooter",
    label:
      "Mattel's 1983 bee shooter, rebuilt with escalating levels, a hive full of infant bees and a boss that summons them at the sixty-second mark.",
    year: "2024",
    stack: ["C++", "SFML"],
    engine: "sfml",
    aspect: "4 / 3",
    controls: "Arrow keys to move, Space to fire",
    source: "https://github.com/Mughal-Hash-24/Buzz_Bomberz_in_cpp",
    accent: "#ff8fb8",
  },
  {
    slug: "gaianox",
    title: "Gaianox",
    tagline: "Procedural 2D world prototype",
    label:
      "Perlin noise, nine chunk types streamed around the player, binary saves and a camera that tracks. A world generator wearing a platformer.",
    year: "2025",
    stack: ["C++17", "SFML"],
    engine: "sfml",
    aspect: "16 / 9",
    controls: "A / D to walk, Space to jump",
    source: "https://github.com/Mughal-Hash-24/Gaianox",
    accent: "#4fd4ff",
  },
];

export const arcadeCount = arcadeGames.length;
