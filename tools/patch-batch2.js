const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
let src = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const batch = JSON.parse(fs.readFileSync(path.join(root, 'batch2-games.json'), 'utf8'));

if (!src.includes('g.art||A(g.id)')) {
  src = src.replace(
    'const gameArt=g=>GAME_ART[g.id]||A(g.id);',
    'const gameArt=g=>GAME_ART[g.id]||g.art||A(g.id);'
  );
}

src = src.replace(
  "const categories=[['Tất cả','✨'],['Puzzle','🧩'],['Casual','⭐'],['Sports','⚽'],['Action','⚡']];",
  "const categories=[['Tất cả','✨'],['Puzzle','🧩'],['Casual','⭐'],['Sports','⚽'],['Action','⚡'],['Runner','🏃'],['Racing','🏎️'],['Defense','🛡️']];"
);

// Replace home category grid block with expanded categories.
src = src.replace(
  "${section('Danh mục game')}<div class=\"category-grid\">${[['Puzzle','puzzle'],['Casual','casual'],['Sports','sports'],['Action','action']].map(([name,img])=>`<button class=\"category-tile\" data-category=\"${name}\"><img src=\"${A(img)}\" alt=\"\">${name}</button>`).join('')}</div>",
  "${section('Danh mục game')}<div class=\"category-grid\">${[['Puzzle','puzzle.webp'],['Casual','casual.webp'],['Sports','sports.webp'],['Action','action.webp'],['Runner','runner.webp'],['Racing','racing.webp'],['Defense','defense.webp']].map(([name,img])=>`<button class=\"category-tile\" data-category=\"${name}\"><img src=\"assets/${img}\" alt=\"\">${name}</button>`).join('')}</div>"
);

// Append batch games before the closing of games array if not already present.
if (!src.includes("id:'itch-drop-merge-beach'")) {
  const marker = "{id:'paragliding',name:'Paragliding',category:'Sports',cost:1,rating:'4.7',url:'https://h5-paragliding.helloboss.online/',openInTab:true,desc:'Lượn dù và thu thập điểm trên bầu trời.',how:['Điều khiển hướng bay.','Thu thập vòng và tránh chướng ngại.','Bay xa nhất có thể để ghi điểm.']}\n];";
  if (!src.includes(marker)) {
    throw new Error('Could not find paragliding marker to append batch games');
  }
  const extra = batch
    .map((g) => {
      const how = JSON.stringify(g.how);
      return `{id:'${g.id}',name:${JSON.stringify(g.name)},category:'${g.category}',cost:1,rating:'${g.rating}',url:'${g.url}',openInTab:true,art:'${g.art}',desc:${JSON.stringify(g.desc)},how:${how}}`;
    })
    .join(',\n');
  src = src.replace(marker, marker.replace('\n];', ',\n' + extra + '\n];'));
}

// Ensure shouldOpenInTab respects openInTab (already does).

fs.writeFileSync(path.join(root, 'app.js'), src);
console.log('patched app.js, total games now should include', batch.length, 'batch2 titles');
console.log('has drop-merge', src.includes('itch-drop-merge-beach'));
console.log('has categories runner', src.includes("['Runner','🏃']"));
