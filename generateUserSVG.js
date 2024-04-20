const fs = require('fs');

// Read the JSON file
const userData = JSON.parse(fs.readFileSync('userdata.json', 'utf8'));

// Generate SVG content with user stats
const svgContent = `
<svg width="400" height="200">
  <text x="10" y="30">XP: ${userData.user_data.xp}</text>
  <text x="10" y="60">Level: ${userData.user_data.level}</text>
  <text x="10" y="90">Gitcoins: ${userData.user_data.gitcoins}</text>
</svg>
`;

// Write SVG content to a new file
fs.writeFileSync('userstats.svg', svgContent);
