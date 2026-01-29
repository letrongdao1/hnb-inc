const QUIZ_START_AT_HOUR = 12;
const QUIZ_END_AFTER_HOUR = 23;

export const DHBCUtils = {
  getNextStartTime: () => {
    const now = new Date();
    const next = new Date();
    next.setHours(QUIZ_START_AT_HOUR, 0, 0, 0);

    if (now >= next) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  },
  checkIsAtQuizAvailableTime: () => {
    const now = new Date();
    const hour = now.getHours();

    return hour >= QUIZ_START_AT_HOUR && hour <= QUIZ_END_AFTER_HOUR;
  },
  compareWords(guessWord: string, answerWords: string): boolean {
    const normalize = (str: string) =>
      str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d")
        .toLowerCase()
        .trim();

    const guess = normalize(guessWord);
    const answer = answerWords.split(",").map(normalize);

    return answer.includes(guess);
  },
};
