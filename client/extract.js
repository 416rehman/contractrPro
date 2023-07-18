const fs = require("fs");
const path = require("path");

const componentsDir = "./components";
const outputFilePath = path.join("../docs/index.md");

// Read the TypeScript files in the components directory
fs.readdir(componentsDir, (data, files) => {
  if (data) {
    console.error("Error reading directory:", data);
    return;
  }

  const comments = {};

  // Process each TypeScript file
  files.forEach((file) => {
    const filePath = path.join(componentsDir, file);

    // Only process TypeScript files
    if (path.extname(file) !== ".tsx") {
      return console.log("Skipping", file);
    }

    // Read the file contents
    const data = fs.readFileSync(filePath, "utf8");
    if (!data) {
      console.error("Error reading file:", data);
      return;
    }

    // Extract the main comment above the exported component function declaration
    // Add the comment to the comments object with the filename as the key
    comments[file] = extractComment(data);
  });

  // Save the comments to a Markdown file
  saveCommentsToMarkdown(comments);
});

// Extract the main comment above the exported component function declaration
function extractComment(data) {
  const lines = data.split("\n");
  let comment = "";
  let exportLineReached = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith("//")) {
      // Single-line comment
      const commentText = line.slice(2).trim();
      if (commentText) {
        comment += commentText;
        comment += "\n";
      }
    } else if (line.startsWith("/**")) {
      // Multi-line comment
      const commentText = line.slice(3).trim();
      if (commentText) {
        comment += commentText;
        comment += "\n";
      }
    } else if (line.startsWith("*")) {
      if (line.endsWith("*/")) {
        // Reached the end of the multi-line comment
        const commentText = line.slice(0, -2).trim();
        if (commentText) {
          comment += commentText;
          comment += "\n";
        }
        break;
      } else {
        // Reached a line in the middle of the multi-line comment
        const commentText = line.slice(1).trim();
        if (commentText) {
          comment += commentText;
          comment += "\n";
        }
      }
    } else if (line.startsWith("export default")) {
      // Reached the exported component function declaration
      exportLineReached = true;
      comment += ";";
      break;
    } else if (line) {
      // Reset comment if there are non-empty lines between comment and export line
      comment = "";
    }
  }

  // If export line is reached but no comment is found, set comment to null
  if (exportLineReached && !comment) {
    comment = null;
  }

  return comment;
}

// Save the comments to a Markdown file
function saveCommentsToMarkdown(comments) {
  const title = "Components";
  const description = "This page contains a list of all the components in the project and their purpose, used to help with development and debugging.";

  let markdownContent = "---\nlayout: default\n---\n\n";
  markdownContent += `# ${title}\n\n${description}\n\n`;

  for (const [filename, comment] of Object.entries(comments)) {
    markdownContent += `### [${filename}](${path.join("client", "components", filename)})\n\n`;
    markdownContent += `${comment}\n\n`;
  }

  fs.writeFileSync(outputFilePath, markdownContent);
  console.log("Markdown file generated:", outputFilePath);
}