const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const directory = process.argv[2];

if (!fs.existsSync(directory)) {
  console.error('error: directory not found');
  console.log('usage: node rename-images.js [directory]');
  process.exit(1);
}

const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

function calculateMD5(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('md5');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

async function renameImages() {
  const fileNames = [];
  try {
    const files = fs.readdirSync(directory);

    if (files.length === 0) {
      console.log('error: directory is empty');
      return;
    }

    console.log(`start to process directory: ${directory}`);

    for (const file of files) {
      const filePath = path.join(directory, file);
      const ext = path.extname(file).toLowerCase();

      if (imageExtensions.includes(ext)) {
        const md5Hash = calculateMD5(filePath);
        const newFileName = `cover-${md5Hash.substring(0, 6)}${ext}`;
        const newFilePath = path.join(directory, newFileName);

        fileNames.push(newFileName);

        if (file !== newFileName) {
          fs.renameSync(filePath, newFilePath);
          console.log(`Renamed: ${file} -> ${newFileName}`);
        }
      }
    }
    console.log('process completed!');
    console.log(JSON.stringify(fileNames, null, 2));
  } catch (error) {
    console.error('error: ', error);
  }
}

renameImages();
