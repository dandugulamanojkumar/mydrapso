export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getRandomVideos(videos, count = 10) {
  const shuffled = shuffleArray(videos);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
