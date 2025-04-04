export const calculateAccuracy = (reference, input) => {
  const clean = (txt) =>
    txt
      .trim()
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map(line => line.trim().toLowerCase());

  const refLines = clean(reference);
  const inputLines = clean(input);

  const totalLines = refLines.length;
  let matching = 0;

  for (let i = 0; i < totalLines; i++) {
    if (!inputLines[i]) continue;
    const refLine = refLines[i];
    const inpLine = inputLines[i];
    const dist = levenshteinDistance(refLine, inpLine);
    const maxLen = Math.max(refLine.length, inpLine.length);
    const lineAccuracy = 1 - dist / maxLen;

    if (lineAccuracy >= 0.9) matching++; // consider this line accurate
  }

  const accuracy = (matching / totalLines) * 100;
  return parseFloat(accuracy.toFixed(2));
};
