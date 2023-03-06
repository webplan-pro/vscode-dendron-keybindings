const fs = require("fs");

// Get keybindings from package.json from current working directory
const keybindings = JSON.parse(fs.readFileSync("package.json", "utf8"))
  .contributes.keybindings;

// Markdown content structure
const headerContent = `| Name | Description | Command | Mac | Windows | Linux |
| :---------: | :---------: | :---------: | :---------: | :---------: | :----------: |
`;
const rowContent = (
  accumulatedContent,
  row
) => `${accumulatedContent} | ${row.name} | ${row.description} | ${row.command} | ${row.mac} | ${row.win} | ${row.linux} |
`;

// Generate markdown
const generateContent = (accumulatedContent, row) =>
  rowContent(accumulatedContent, row);
const markdownOutput = keybindings.reduce(generateContent, headerContent);

// Save markdown to external file
fs.writeFileSync("keybindings.md", markdownOutput);
