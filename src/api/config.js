const COHORT = "frontend-st-cohort-201";
const TOKEN = "d003d199-0f54-4d34-9c57-6ef355155088";

export const apiConfig = {
  link: `https://mesto.nomoreparties.co/v1/${COHORT}`,
  headers: {
    authorization: TOKEN,
    "Content-Type": "application/json",
  },
};
