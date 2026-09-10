import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const images = [
  {
    url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1920&q=80',
    filename: 'bg1.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1920&q=80',
    filename: 'bg2.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&q=80',
    filename: 'bg3.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1920&q=80',
    filename: 'bg4.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1920&q=80',
    filename: 'bg5.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1920&q=80',
    filename: 'bg6.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1920&q=80',
    filename: 'bg7.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=1920&q=80',
    filename: 'bg8.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1920&q=80',
    filename: 'bg9.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1920&q=80',
    filename: 'bg10.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1920&q=80',
    filename: 'bg11.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&q=80',
    filename: 'bg12.jpg'
  }
];

const downloadImage = (url, filename) => {
  return new Promise((resolve, reject) => {
    const filepath = path.join(__dirname, 'src', 'assets', 'images', 'backgrounds', filename);
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
};

const downloadAllImages = async () => {
  for (const image of images) {
    try {
      await downloadImage(image.url, image.filename);
    } catch (error) {
      console.error(`Error downloading ${image.filename}:`, error);
    }
  }
};

downloadAllImages(); 