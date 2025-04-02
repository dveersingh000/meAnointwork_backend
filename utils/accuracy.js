import stringSimilarity from 'string-similarity';

export const calculateAccuracy = (reference, userInput) => {
  const accuracy = stringSimilarity.compareTwoStrings(reference.trim(), userInput.trim());
  return Math.round(accuracy * 100); // convert to percentage
};
