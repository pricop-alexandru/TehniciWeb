const fs = require('fs');
const path = require('path');
const sass = require('sass'); 

// Prepare the workspace
const folderScss = path.join(__dirname, 'Resources', 'scss');
const folderCss = path.join(__dirname, 'Resources', 'css');
const folderBackup = path.join(__dirname, 'Resources', 'backup');

// Function for compiling SCSS files
function compileazaScss(caleScss, caleCss) {
  const scssFile = path.resolve(caleScss);
  const cssFile = path.resolve(caleCss);

  // Save in backup
  const backupFolder = path.join(folderBackup, path.dirname(caleCss));
  if (!fs.existsSync(backupFolder)) {
    fs.mkdirSync(backupFolder, { recursive: true });
  }
  const backupFile = path.join(backupFolder, path.basename(caleCss));
  if (fs.existsSync(caleCss)) {
    fs.copyFileSync(caleCss, backupFile);
  }

  // Compile SCSS to CSS
  const result = sass.renderSync({ file: scssFile });
  fs.writeFileSync(cssFile, result.css);
}

// Initial compilation
fs.readdirSync(folderScss).forEach((file) => {
  const scssFile = path.join(folderScss, file);
  const cssFile = path.join(folderCss, path.basename(file, '.scss') + '.css');
  compileazaScss(scssFile, cssFile);
});