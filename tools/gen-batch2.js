const fs = require('fs');
const path = require('path');

function slugFrom(ref) {
  if (/^https?:\/\//i.test(ref)) return ref;
  const s = String(ref).replace(/\s+by\s+NguyenHongNam$/i, '').trim();
  return 'https://nguyenhongnam.itch.io/' + s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function idFrom(url) {
  const u = url.replace(/.*itch\.io\//, '').replace(/\/$/, '');
  return ('itch-' + u).replace(/[^a-z0-9-]/g, '').slice(0, 40);
}

function mapCat(raw) {
  const t = (raw || '').toLowerCase();
  if (t.includes('tower') || t.includes('defend')) return 'Defense';
  if (t.includes('driving') || t.includes('vehicle')) return 'Racing';
  if (t.includes('runner')) return 'Runner';
  if (t.includes('sport')) return 'Sports';
  if (t.includes('shooter') || t.includes('action')) return 'Action';
  if (t.includes('puzzle') || t.includes('merge') || t.includes('match')) return 'Puzzle';
  return 'Casual';
}

const rows = [
  ['Watermelon Merge', 'Puzzle/Merge', 'https://nguyenhongnam.itch.io/drop-merge-beach'],
  ['Fall Rush', 'Runner/Hyper-casual', 'Tumble rush by NguyenHongNam'],
  ['2D Zombie Age', 'Shooter/Action', 'Old VS Zombie by NguyenHongNam'],
  ['Tank n Jets', 'Shooter/Action', 'Tank Adventure by NguyenHongNam'],
  ['Arrow Aim', 'Shooter/Action', 'Arrow Run by NguyenHongNam'],
  ['Angry Plants Fighting', 'Shooter/Action', 'PlantVSZom by NguyenHongNam'],
  ['Vehicle Factory', 'Driving/Vehicle', 'Car Garage by NguyenHongNam'],
  ['Fast Driver 3D', 'Driving/Vehicle', 'Car Driver by NguyenHongNam'],
  ['Fall Boys', 'Runner/Hyper-casual', 'Fall Run by NguyenHongNam'],
  ['Fortress Defense', 'Tower Defense', 'Tower Defend by NguyenHongNam'],
  ['Gangster War', 'Shooter/Action', 'GunFight by NguyenHongNam'],
  ['Magic Forest', 'Casual/Adventure', 'Match 3 Forest by NguyenHongNam'],
  ['Parkour Mania', 'Runner/Hyper-casual', 'Parkuor by NguyenHongNam'],
  ['Pong Ball', 'Sports/Arcade', 'ping pong by NguyenHongNam'],
  ['Hero Tower Wars', 'Tower Defense', 'Tower Hero by NguyenHongNam'],
  ['Merge Evolution', 'Puzzle/Merge', 'Submarin by NguyenHongNam'],
  ['Prehistoric Adventure', 'Casual/Adventure', 'Adventure by NguyenHongNam'],
  ['Zombie Slayer', 'Shooter/Action', 'ZombieShooting by NguyenHongNam'],
  ['Daddy Shark Adventure', 'Casual/Adventure', 'Shark by NguyenHongNam'],
  ['Penguin.io', 'Casual/Adventure', 'penguinIO by NguyenHongNam'],
  ['Brain Master', 'Puzzle/Match-3', 'Brain Game by NguyenHongNam'],
  ['Find The Differences', 'Puzzle/Match-3', 'Find diff by NguyenHongNam'],
  ['Super Kick', 'Runner/Hyper-casual', 'Kick Ball by NguyenHongNam'],
  ['Save My Pet', 'Casual/Adventure', 'Save the pet by NguyenHongNam'],
  ['Onet Connect', 'Puzzle/Match-3', 'Onet Puzzle by NguyenHongNam'],
  ['Tiles Match 3', 'Puzzle/Match-3', 'Tile Match by NguyenHongNam'],
  ['Squid Sniper', 'Shooter/Action', 'SquidGame by NguyenHongNam'],
  ['Weapon Transformer', 'Khác', 'Weapon Transformer by NguyenHongNam'],
  ['Farm Legend', 'Casual/Adventure', 'Farm by NguyenHongNam'],
  ['Talking Cat', 'Casual/Adventure', 'Talking Cat by NguyenHongNam'],
  ['Model Dress Up', 'Casual/Adventure', 'DressUpIdol by NguyenHongNam'],
  ['Space Defender', 'Shooter/Action', 'Space defend by NguyenHongNam'],
  ['Pirate Defense', 'Tower Defense', 'Pirate defend by NguyenHongNam'],
  ['Merge Muscle Tycoon', 'Puzzle/Merge', 'Gym Merge by NguyenHongNam'],
  ['Water Sorting Puzzle', 'Hyper-casual/Puzzle', 'Sorting Water by NguyenHongNam'],
  ['Weapon Strike', 'Hyper-casual', 'Throw Knife by NguyenHongNam'],
  ['Merge Miners', 'Hyper-casual/Merge', 'Merge Miners by NguyenHongNam'],
  ['Draw Missing Part', 'Hyper-casual/Puzzle', 'Draw Missing by NguyenHongNam'],
  ['Stickman Hook', 'Hyper-casual/Puzzle', 'Stickman Hook by NguyenHongNam'],
  ['Draw Save Puzzle', 'Casual/Puzzle', 'Draw Puzzle by NguyenHongNam'],
  ['Nail Coloring', 'Casual', 'Nail Coloring by NguyenHongNam'],
  ['Idle Restaurant', 'Casual/Simulation', 'Idle Restaurant by NguyenHongNam'],
  ['Wednesday Escape', 'Casual/Puzzle', 'Escape by NguyenHongNam'],
  ['Saw Hero', 'Hyper-casual', 'Saw Hero by NguyenHongNam'],
  ['Dark VS Light', 'Hyper-casual', 'DarkVSLight by NguyenHongNam'],
  ['Aquapark Factory', 'Hyper-casual', 'Aquapark by NguyenHongNam'],
  ['Adventure Of King', 'Casual/Adventure', 'king adventure by NguyenHongNam'],
  ['Archer Defense', 'Casual/Tower-defend', 'ArrowDefend by NguyenHongNam'],
  ['Tiny Metal Shooter', 'Casual/Shooter', 'Tiny Shooter by NguyenHongNam'],
];

const palette = {
  Puzzle: ['#7c5cff', '#b7a4ff'],
  Casual: ['#19b5a8', '#8be0d8'],
  Sports: ['#2f7bff', '#9bbcff'],
  Action: ['#ff5a3d', '#ffb199'],
  Racing: ['#ff8a1f', '#ffd19a'],
  Defense: ['#5b6bff', '#c3c9ff'],
  Runner: ['#00a878', '#8fe0c4'],
};

function svgThumb(name, cat) {
  const [a, b] = palette[cat] || palette.Casual;
  const title = name.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const short = title.length > 18 ? title.slice(0, 17) + '…' : title;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
<rect width="640" height="400" rx="36" fill="url(#g)"/>
<circle cx="520" cy="80" r="70" fill="rgba(255,255,255,.18)"/>
<circle cx="90" cy="320" r="90" fill="rgba(255,255,255,.12)"/>
<rect x="48" y="250" width="544" height="110" rx="24" fill="rgba(20,16,48,.28)"/>
<text x="70" y="300" fill="#fff" font-family="Nunito,Arial,sans-serif" font-size="28" font-weight="800">${short}</text>
<text x="70" y="338" fill="rgba(255,255,255,.9)" font-family="Nunito,Arial,sans-serif" font-size="20" font-weight="700">${cat}</text>
</svg>`;
}

function svgCat(kind) {
  const map = {
    runner: { bg: '#e8fff6', stroke: '#00a878', paths: '<path d="M10 16c2-4 5-6 8-6"/><circle cx="15" cy="7" r="2.2"/><path d="M9 22l3-6 4 2 3 6M12 16l-3 3M16 18l3 3"/>' },
    racing: { bg: '#fff4e8', stroke: '#ff8a1f', paths: '<path d="M4 15h16l-2-5H7L4 15Z"/><circle cx="8" cy="16.5" r="2"/><circle cx="16" cy="16.5" r="2"/><path d="M7 10l1-3h8l1 3"/>' },
    defense: { bg: '#eef0ff', stroke: '#5b6bff', paths: '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z"/><path d="M9 12l2 2 4-4"/>' },
  };
  const m = map[kind];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24"><rect width="24" height="24" rx="7" fill="${m.bg}"/><g fill="none" stroke="${m.stroke}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${m.paths}</g></svg>`;
}

const root = path.join(__dirname, '..');
const assets = path.join(root, 'assets');
fs.mkdirSync(assets, { recursive: true });
fs.writeFileSync(path.join(assets, 'runner.svg'), svgCat('runner'));
fs.writeFileSync(path.join(assets, 'racing.svg'), svgCat('racing'));
fs.writeFileSync(path.join(assets, 'defense.svg'), svgCat('defense'));

const descMap = {
  Puzzle: 'Thử thách tư duy với lối chơi puzzle hấp dẫn.',
  Casual: 'Trải nghiệm game casual dễ chơi, dễ nghiện.',
  Sports: 'Cùng tranh tài trong các thử thách thể thao.',
  Action: 'Hành động tốc độ cao và phản xạ nhanh.',
  Racing: 'Lái xe, vượt chướng ngại và chinh phục đường đua.',
  Defense: 'Xây tháp, phòng thủ và đẩy lùi làn sóng kẻ địch.',
  Runner: 'Chạy không dừng, né tránh và phá kỷ lục.',
};

const games = [];
for (const [name, rawCat, ref] of rows) {
  const url = slugFrom(ref);
  const id = idFrom(url);
  const category = mapCat(rawCat);
  const file = `assets/${id}.svg`;
  fs.writeFileSync(path.join(root, file), svgThumb(name, category));
  games.push({
    id,
    name,
    category,
    cost: 1,
    rating: '4.7',
    url,
    openInTab: true,
    art: file,
    desc: descMap[category],
    how: ['Chạm để điều khiển trong game.', 'Hoàn thành mục tiêu để ghi điểm.', 'Chơi lại để phá kỷ lục của bạn.'],
  });
}

fs.writeFileSync(path.join(root, 'batch2-games.json'), JSON.stringify(games, null, 2));
console.log('games', games.length);
console.log('cats', [...new Set(games.map((g) => g.category))].sort().join(', '));
