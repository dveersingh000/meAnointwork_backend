// ✅ Fix for CommonJS compatibility
import pkg from 'natural';
import fs from 'fs';
import path from 'path';
import cosineSimilarity from 'compute-cosine-similarity';

const { TfIdf } = pkg;

const directoryPath = './plagiarism';

function getTxtFiles(dir) {
  return fs.readdirSync(dir).filter(file => file.endsWith('.txt'));
}

function getTFIDFVectors(files) {
  const tfidf = new TfIdf();
  const docs = [];

  files.forEach(file => {
    const content = fs.readFileSync(path.join(directoryPath, file), 'utf-8');
    tfidf.addDocument(content);
    docs.push({ file, content });
  });

  const vectors = docs.map((doc, index) => {
    const terms = [];
    tfidf.listTerms(index).forEach(item => {
      terms.push(item.tfidf);
    });
    return terms;
  });

  return { docs, vectors };
}

function compareVectors(docs, vectors) {
  const results = {};

  for (let i = 0; i < docs.length; i++) {
    for (let j = i + 1; j < docs.length; j++) {
      const sim = cosineSimilarity(vectors[i], vectors[j]);
      if (sim > 0) {
        const key = `${docs[i].file} ~ ${docs[j].file}`;
        results[key] = +sim.toFixed(2);
      }
    }
  }

  return results;
}

// 🧠 This function is for internal usage (imported in controller)
export function checkPlagiarismForFile(targetFileName) {
  const files = getTxtFiles(directoryPath);
  const { docs, vectors } = getTFIDFVectors(files);
  const all = compareVectors(docs, vectors);

  // Filter results only where target file is involved
  const filtered = Object.entries(all).reduce((acc, [key, val]) => {
    if (key.includes(targetFileName)) acc[key] = val;
    return acc;
  }, {});

  return filtered;
}

// Optional run for testing CLI
// runPlagiarismCheck();
