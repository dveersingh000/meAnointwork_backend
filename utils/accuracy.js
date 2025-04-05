export const calculateAccuracy = (reference, input) => {
  const clean = (text) =>
    text
      .replace(/\s+/g, ' ') // normalize whitespace
      .replace(/[^\w\s]/g, '') // remove punctuation
      .trim()
      .toLowerCase();

  const ref = clean(reference);
  const inp = clean(input);

  const distance = levenshteinDistance(ref, inp);
  const maxLen = Math.max(ref.length, inp.length);
  const accuracy = maxLen === 0 ? 0 : ((1 - distance / maxLen) * 100).toFixed(2);

  return parseFloat(accuracy);
};

// Levenshtein distance function
function levenshteinDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] =
          1 +
          Math.min(
            dp[i - 1][j], // delete
            dp[i][j - 1], // insert
            dp[i - 1][j - 1] // substitute
          );
      }
    }
  }

  return dp[a.length][b.length];
}
