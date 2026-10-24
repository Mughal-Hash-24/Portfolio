export type MusicTrack = {
  id: string;
  title: string;
  src: string;
  kind: "background" | "disc";
};

const devBackgroundTracks: MusicTrack[] = [
  {
    id: "bg-game-a-familiar-room",
    title: "A Familiar Room",
    src: "/audio/_dev/music/game/a_familiar_room.mp3",
    kind: "background",
  },
  {
    id: "bg-game-an-ordinary-day",
    title: "An Ordinary Day",
    src: "/audio/_dev/music/game/an_ordinary_day.mp3",
    kind: "background",
  },
  {
    id: "bg-game-ancestry",
    title: "Ancestry",
    src: "/audio/_dev/music/game/ancestry.mp3",
    kind: "background",
  },
  {
    id: "bg-game-below-and-above",
    title: "Below And Above",
    src: "/audio/_dev/music/game/below_and_above.mp3",
    kind: "background",
  },
  {
    id: "bg-game-broken-clocks",
    title: "Broken Clocks",
    src: "/audio/_dev/music/game/broken_clocks.mp3",
    kind: "background",
  },
  {
    id: "bg-game-bromeliad",
    title: "Bromeliad",
    src: "/audio/_dev/music/game/bromeliad.mp3",
    kind: "background",
  },
  {
    id: "bg-game-clark",
    title: "Clark",
    src: "/audio/_dev/music/game/clark.mp3",
    kind: "background",
  },
  {
    id: "bg-game-comforting-memories",
    title: "Comforting Memories",
    src: "/audio/_dev/music/game/comforting_memories.mp3",
    kind: "background",
  },
  {
    id: "bg-game-creative-aria-math",
    title: "Creative: Aria Math",
    src: "/audio/_dev/music/game/creative/aria_math.mp3",
    kind: "background",
  },
  {
    id: "bg-game-creative-biome-fest",
    title: "Creative: Biome Fest",
    src: "/audio/_dev/music/game/creative/biome_fest.mp3",
    kind: "background",
  },
  {
    id: "bg-game-creative-blind-spots",
    title: "Creative: Blind Spots",
    src: "/audio/_dev/music/game/creative/blind_spots.mp3",
    kind: "background",
  },
  {
    id: "bg-game-creative-dreiton",
    title: "Creative: Dreiton",
    src: "/audio/_dev/music/game/creative/dreiton.mp3",
    kind: "background",
  },
  {
    id: "bg-game-creative-haunt-muskie",
    title: "Creative: Haunt Muskie",
    src: "/audio/_dev/music/game/creative/haunt_muskie.mp3",
    kind: "background",
  },
  {
    id: "bg-game-creative-taswell",
    title: "Creative: Taswell",
    src: "/audio/_dev/music/game/creative/taswell.mp3",
    kind: "background",
  },
  {
    id: "bg-game-crescent-dunes",
    title: "Crescent Dunes",
    src: "/audio/_dev/music/game/crescent_dunes.mp3",
    kind: "background",
  },
  {
    id: "bg-game-danny",
    title: "Danny",
    src: "/audio/_dev/music/game/danny.mp3",
    kind: "background",
  },
  {
    id: "bg-game-deeper",
    title: "Deeper",
    src: "/audio/_dev/music/game/deeper.mp3",
    kind: "background",
  },
  {
    id: "bg-game-dry-hands",
    title: "Dry Hands",
    src: "/audio/_dev/music/game/dry_hands.mp3",
    kind: "background",
  },
  { id: "bg-game-ebb", title: "Ebb", src: "/audio/_dev/music/game/ebb.mp3", kind: "background" },
  {
    id: "bg-game-echo-in-the-wind",
    title: "Echo In The Wind",
    src: "/audio/_dev/music/game/echo_in_the_wind.mp3",
    kind: "background",
  },
  {
    id: "bg-game-eld-unknown",
    title: "Eld Unknown",
    src: "/audio/_dev/music/game/eld_unknown.mp3",
    kind: "background",
  },
  {
    id: "bg-game-end-alpha",
    title: "End: Alpha",
    src: "/audio/_dev/music/game/end/alpha.mp3",
    kind: "background",
  },
  {
    id: "bg-game-end-boss",
    title: "End: Boss",
    src: "/audio/_dev/music/game/end/boss.mp3",
    kind: "background",
  },
  {
    id: "bg-game-end-the-end",
    title: "End: The End",
    src: "/audio/_dev/music/game/end/the_end.mp3",
    kind: "background",
  },
  {
    id: "bg-game-endless",
    title: "Endless",
    src: "/audio/_dev/music/game/endless.mp3",
    kind: "background",
  },
  {
    id: "bg-game-featherfall",
    title: "Featherfall",
    src: "/audio/_dev/music/game/featherfall.mp3",
    kind: "background",
  },
  {
    id: "bg-game-fireflies",
    title: "Fireflies",
    src: "/audio/_dev/music/game/fireflies.mp3",
    kind: "background",
  },
  {
    id: "bg-game-floating-dream",
    title: "Floating Dream",
    src: "/audio/_dev/music/game/floating_dream.mp3",
    kind: "background",
  },
  {
    id: "bg-game-haggstrom",
    title: "Haggstrom",
    src: "/audio/_dev/music/game/haggstrom.mp3",
    kind: "background",
  },
  { id: "bg-game-home", title: "Home", src: "/audio/_dev/music/game/home.mp3", kind: "background" },
  {
    id: "bg-game-infinite-amethyst",
    title: "Infinite Amethyst",
    src: "/audio/_dev/music/game/infinite_amethyst.mp3",
    kind: "background",
  },
  { id: "bg-game-key", title: "Key", src: "/audio/_dev/music/game/key.mp3", kind: "background" },
  {
    id: "bg-game-komorebi",
    title: "Komorebi",
    src: "/audio/_dev/music/game/komorebi.mp3",
    kind: "background",
  },
  {
    id: "bg-game-left-to-bloom",
    title: "Left To Bloom",
    src: "/audio/_dev/music/game/left_to_bloom.mp3",
    kind: "background",
  },
  {
    id: "bg-game-lilypad",
    title: "Lilypad",
    src: "/audio/_dev/music/game/lilypad.mp3",
    kind: "background",
  },
  {
    id: "bg-game-living-mice",
    title: "Living Mice",
    src: "/audio/_dev/music/game/living_mice.mp3",
    kind: "background",
  },
  {
    id: "bg-game-memories",
    title: "Memories",
    src: "/audio/_dev/music/game/memories.mp3",
    kind: "background",
  },
  {
    id: "bg-game-mice-on-venus",
    title: "Mice On Venus",
    src: "/audio/_dev/music/game/mice_on_venus.mp3",
    kind: "background",
  },
  {
    id: "bg-game-minecraft",
    title: "Minecraft",
    src: "/audio/_dev/music/game/minecraft.mp3",
    kind: "background",
  },
  {
    id: "bg-game-nether-ballad-of-the-cats",
    title: "Nether: Ballad Of The Cats",
    src: "/audio/_dev/music/game/nether/ballad_of_the_cats.mp3",
    kind: "background",
  },
  {
    id: "bg-game-nether-concrete-halls",
    title: "Nether: Concrete Halls",
    src: "/audio/_dev/music/game/nether/concrete_halls.mp3",
    kind: "background",
  },
  {
    id: "bg-game-nether-crimson-forest-chrysopoeia",
    title: "Nether: Chrysopoeia",
    src: "/audio/_dev/music/game/nether/crimson_forest/chrysopoeia.mp3",
    kind: "background",
  },
  {
    id: "bg-game-nether-dead-voxel",
    title: "Nether: Dead Voxel",
    src: "/audio/_dev/music/game/nether/dead_voxel.mp3",
    kind: "background",
  },
  {
    id: "bg-game-nether-nether-wastes-rubedo",
    title: "Nether: Rubedo",
    src: "/audio/_dev/music/game/nether/nether_wastes/rubedo.mp3",
    kind: "background",
  },
  {
    id: "bg-game-nether-soulsand-valley-so-below",
    title: "Nether: So Below",
    src: "/audio/_dev/music/game/nether/soulsand_valley/so_below.mp3",
    kind: "background",
  },
  {
    id: "bg-game-nether-warmth",
    title: "Nether: Warmth",
    src: "/audio/_dev/music/game/nether/warmth.mp3",
    kind: "background",
  },
  {
    id: "bg-game-nightly",
    title: "Nightly",
    src: "/audio/_dev/music/game/nightly.mp3",
    kind: "background",
  },
  {
    id: "bg-game-one-more-day",
    title: "One More Day",
    src: "/audio/_dev/music/game/one_more_day.mp3",
    kind: "background",
  },
  {
    id: "bg-game-os-piano",
    title: "OS Piano",
    src: "/audio/_dev/music/game/os_piano.mp3",
    kind: "background",
  },
  {
    id: "bg-game-oxygene",
    title: "Oxygene",
    src: "/audio/_dev/music/game/oxygene.mp3",
    kind: "background",
  },
  {
    id: "bg-game-pokopoko",
    title: "Pokopoko",
    src: "/audio/_dev/music/game/pokopoko.mp3",
    kind: "background",
  },
  {
    id: "bg-game-puzzlebox",
    title: "Puzzlebox",
    src: "/audio/_dev/music/game/puzzlebox.mp3",
    kind: "background",
  },
  {
    id: "bg-game-shores",
    title: "Shores",
    src: "/audio/_dev/music/game/shores.mp3",
    kind: "background",
  },
  {
    id: "bg-game-stand-tall",
    title: "Stand Tall",
    src: "/audio/_dev/music/game/stand_tall.mp3",
    kind: "background",
  },
  {
    id: "bg-game-subwoofer-lullaby",
    title: "Subwoofer Lullaby",
    src: "/audio/_dev/music/game/subwoofer_lullaby.mp3",
    kind: "background",
  },
  {
    id: "bg-game-swamp-aerie",
    title: "Swamp: Aerie",
    src: "/audio/_dev/music/game/swamp/aerie.mp3",
    kind: "background",
  },
  {
    id: "bg-game-swamp-firebugs",
    title: "Swamp: Firebugs",
    src: "/audio/_dev/music/game/swamp/firebugs.mp3",
    kind: "background",
  },
  {
    id: "bg-game-swamp-labyrinthine",
    title: "Swamp: Labyrinthine",
    src: "/audio/_dev/music/game/swamp/labyrinthine.mp3",
    kind: "background",
  },
  {
    id: "bg-game-sweden",
    title: "Sweden",
    src: "/audio/_dev/music/game/sweden.mp3",
    kind: "background",
  },
  {
    id: "bg-game-watcher",
    title: "Watcher",
    src: "/audio/_dev/music/game/watcher.mp3",
    kind: "background",
  },
  {
    id: "bg-game-water-axolotl",
    title: "Water: Axolotl",
    src: "/audio/_dev/music/game/water/axolotl.mp3",
    kind: "background",
  },
  {
    id: "bg-game-water-dragon-fish",
    title: "Water: Dragon Fish",
    src: "/audio/_dev/music/game/water/dragon_fish.mp3",
    kind: "background",
  },
  {
    id: "bg-game-water-shuniji",
    title: "Water: Shuniji",
    src: "/audio/_dev/music/game/water/shuniji.mp3",
    kind: "background",
  },
  {
    id: "bg-game-wending",
    title: "Wending",
    src: "/audio/_dev/music/game/wending.mp3",
    kind: "background",
  },
  {
    id: "bg-game-wet-hands",
    title: "Wet Hands",
    src: "/audio/_dev/music/game/wet_hands.mp3",
    kind: "background",
  },
  {
    id: "bg-game-yakusoku",
    title: "Yakusoku",
    src: "/audio/_dev/music/game/yakusoku.mp3",
    kind: "background",
  },
  {
    id: "bg-menu-beginning-2",
    title: "Menu: Beginning 2",
    src: "/audio/_dev/music/menu/beginning_2.mp3",
    kind: "background",
  },
  {
    id: "bg-menu-floating-trees",
    title: "Menu: Floating Trees",
    src: "/audio/_dev/music/menu/floating_trees.mp3",
    kind: "background",
  },
  {
    id: "bg-menu-moog-city-2",
    title: "Menu: Moog City 2",
    src: "/audio/_dev/music/menu/moog_city_2.mp3",
    kind: "background",
  },
  {
    id: "bg-menu-mutation",
    title: "Menu: Mutation",
    src: "/audio/_dev/music/menu/mutation.mp3",
    kind: "background",
  },
];

const devDiscTracks: MusicTrack[] = [
  { id: "disc-11", title: "11", src: "/audio/_dev/records/11.mp3", kind: "disc" },
  { id: "disc-13", title: "13", src: "/audio/_dev/records/13.mp3", kind: "disc" },
  { id: "disc-5", title: "5", src: "/audio/_dev/records/5.mp3", kind: "disc" },
  { id: "disc-blocks", title: "Blocks", src: "/audio/_dev/records/blocks.mp3", kind: "disc" },
  { id: "disc-bounce", title: "Bounce", src: "/audio/_dev/records/bounce.mp3", kind: "disc" },
  { id: "disc-cat", title: "Cat", src: "/audio/_dev/records/cat.mp3", kind: "disc" },
  { id: "disc-chirp", title: "Chirp", src: "/audio/_dev/records/chirp.mp3", kind: "disc" },
  { id: "disc-creator", title: "Creator", src: "/audio/_dev/records/creator.mp3", kind: "disc" },
  {
    id: "disc-creator-music-box",
    title: "Creator Music Box",
    src: "/audio/_dev/records/creator_music_box.mp3",
    kind: "disc",
  },
  { id: "disc-far", title: "Far", src: "/audio/_dev/records/far.mp3", kind: "disc" },
  {
    id: "disc-lava-chicken",
    title: "Lava Chicken",
    src: "/audio/_dev/records/lava_chicken.mp3",
    kind: "disc",
  },
  { id: "disc-mall", title: "Mall", src: "/audio/_dev/records/mall.mp3", kind: "disc" },
  { id: "disc-mellohi", title: "Mellohi", src: "/audio/_dev/records/mellohi.mp3", kind: "disc" },
  {
    id: "disc-otherside",
    title: "Otherside",
    src: "/audio/_dev/records/otherside.mp3",
    kind: "disc",
  },
  { id: "disc-pigstep", title: "Pigstep", src: "/audio/_dev/records/pigstep.mp3", kind: "disc" },
  {
    id: "disc-precipice",
    title: "Precipice",
    src: "/audio/_dev/records/precipice.mp3",
    kind: "disc",
  },
  { id: "disc-relic", title: "Relic", src: "/audio/_dev/records/relic.mp3", kind: "disc" },
  { id: "disc-stal", title: "Stal", src: "/audio/_dev/records/stal.mp3", kind: "disc" },
  { id: "disc-strad", title: "Strad", src: "/audio/_dev/records/strad.mp3", kind: "disc" },
  { id: "disc-tears", title: "Tears", src: "/audio/_dev/records/tears.mp3", kind: "disc" },
  { id: "disc-wait", title: "Wait", src: "/audio/_dev/records/wait.mp3", kind: "disc" },
  { id: "disc-ward", title: "Ward", src: "/audio/_dev/records/ward.mp3", kind: "disc" },
];

const blobBase = "https://dmso7kb5nn1fjswd.public.blob.vercel-storage.com";

const toBlobTrack = (track: MusicTrack): MusicTrack => ({
  ...track,
  src: track.src.replace("/audio/_dev", `${blobBase}/audio`),
});

const blobBackgroundTracks = devBackgroundTracks.map(toBlobTrack);
const blobDiscTracks = devDiscTracks.map(toBlobTrack);

export const backgroundTracks =
  process.env.NODE_ENV === "production" ? blobBackgroundTracks : devBackgroundTracks;

export const discTracks = process.env.NODE_ENV === "production" ? blobDiscTracks : devDiscTracks;

export const defaultBackgroundTrack =
  backgroundTracks.find((track) => track.id === "bg-game-subwoofer-lullaby") ??
  backgroundTracks[0] ??
  null;

export const clickSound =
  process.env.NODE_ENV === "production"
    ? `${blobBase}/audio/ui/click.mp3`
    : "/audio/_dev/ui/click.mp3";
