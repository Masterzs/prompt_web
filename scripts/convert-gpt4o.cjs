const fs = require('fs');
const path = require('path');
const { generateMediaFilename, getExtension, ensureDirectory, copyMediaFile } = require('./utils/media-helper.cjs');

const SOURCE_NAME = 'gpt4o';
const OUTPUT_IMAGE_DIR = path.join(__dirname, '../public/assets/image', SOURCE_NAME);
const OUTPUT_DATA_FILE = path.join(__dirname, '../src/data/gpt4o-prompts.json');
const INPUT_FILE = path.join(__dirname, '../gpt4o-image-prompts-master/data/prompts.json');
const hasChinese = (text = '') => /[\u4e00-\u9fff]/.test(text);

async function main() {
  // Create output directory
  ensureDirectory(OUTPUT_IMAGE_DIR);

  // Read input data
  const rawData = fs.readFileSync(INPUT_FILE, 'utf8');
  const data = JSON.parse(rawData);
  const items = data.items;

  const out = [];
  const nowIso = new Date().toISOString();

  let promptIndex = 1;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    let location = [];
    let imageUrl = null;

    // Copy images from local
    if (item.coverImage) {
      try {
        const coverImagePath = item.coverImage;
        const srcPath = path.join(__dirname, '../gpt4o-image-prompts-master', coverImagePath);
        const ext = getExtension(coverImagePath);
        const id = `${SOURCE_NAME}_${String(promptIndex).padStart(3, '0')}`;
        const filename = generateMediaFilename({ source: SOURCE_NAME, id, type: 'cover', index: 1, ext });
        const destPath = path.join(OUTPUT_IMAGE_DIR, filename.replace(`${SOURCE_NAME}/`, ''));

        if (fs.existsSync(srcPath)) {
          await copyMediaFile({ srcPath, destPath });
          location.push(filename);
          imageUrl = `/assets/image/${filename}`;
        } else {
          console.log(`  Cover image not found: ${srcPath}`);
        }
      } catch (err) {
        console.log(`  Failed to copy cover: ${err.message}`);
      }
    }

    // Copy additional images
    if (item.images && item.images.length > 1) {
      for (let j = 1; j < item.images.length; j++) {
        try {
          const imagePath = item.images[j];
          const srcPath = path.join(__dirname, '../gpt4o-image-prompts-master', imagePath);
          const ext = getExtension(imagePath);
          const id = `${SOURCE_NAME}_${String(promptIndex).padStart(3, '0')}`;
          const filename = generateMediaFilename({ source: SOURCE_NAME, id, type: 'image', index: j, ext });
          const destPath = path.join(OUTPUT_IMAGE_DIR, filename.replace(`${SOURCE_NAME}/`, ''));

          if (fs.existsSync(srcPath)) {
            await copyMediaFile({ srcPath, destPath });
            location.push(filename);
          } else {
            console.log(`  Image ${j} not found: ${srcPath}`);
          }
        } catch (err) {
          console.log(`  Failed to copy image ${j}: ${err.message}`);
        }
      }
    }

    // 只保留中文；若无中文则保留第一个作为兜底
    const chinesePrompts = (item.prompts || []).filter(hasChinese);
    const promptsToUse = chinesePrompts.length > 0
      ? chinesePrompts
      : (item.prompts && item.prompts.length ? [item.prompts[0]] : []);

    // Create prompt data
    for (let k = 0; k < promptsToUse.length; k++) {
      const promptContent = promptsToUse[k];
      const id = `${SOURCE_NAME}_${String(promptIndex).padStart(3, '0')}`;

      const prompt = {
        id,
        title: promptsToUse.length > 1 ? `${item.title} (${k + 1})` : item.title,
        content: promptContent,
        description: item.description?.slice(0, 30) + (item.description?.length > 30 ? '...' : ''),
        platform: 'gpt4o',
        category: 'drawing',
        tags: item.tags || [],
        sourceUrl: item.source?.url || 'https://youmind.com/zh-CN/nano-banana-pro-prompts?categories=profile-avatar',
        author: item.source?.name || 'gpt4o',
        createdAt: nowIso,
        updatedAt: nowIso,
        language: 'zh',
        imageUrl,
        location: location.slice() // Copy location array
      };

      out.push(prompt);
      promptIndex++;
    }
  }

  // Write output
  fs.writeFileSync(OUTPUT_DATA_FILE, JSON.stringify(out, null, 2));
  console.log(`Generated ${out.length} prompts to ${OUTPUT_DATA_FILE}`);
  console.log('GPT4o convert completed!');
}

main().catch(console.error);
