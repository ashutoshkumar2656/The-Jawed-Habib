const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: fs.createReadStream('C:\\Users\\vk010\\.gemini\\antigravity\\brain\\80d3cfeb-438a-44b4-a995-35570d660099\\.system_generated\\logs\\transcript_full.jsonl'),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  if (line.includes('"step_index":1493')) {
    const data = JSON.parse(line);
    fs.writeFileSync('scripts/last_user_prompt.txt', data.content, 'utf8');
    console.log('Saved to scripts/last_user_prompt.txt');
    process.exit(0);
  }
});
