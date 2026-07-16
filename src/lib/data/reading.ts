export interface Book {
  title: string;
  author: string;
  status: "reading" | "favorite";
  takeaway?: string;
}

export const books: Book[] = [
  {
    title: "Shoe Dog",
    author: "Phil Knight",
    status: "reading",
  },
  {
    title: "Steve Jobs",
    author: "Walter Isaacson",
    status: "favorite",
    takeaway:
      "Made me rethink how much the small details actually matter. The best builders obsess over the parts nobody else even notices.",
  },
  {
    title: "The Algebra of Wealth",
    author: "Scott Galloway",
    status: "favorite",
    takeaway:
      "Wealth is more of a formula than luck. Focus, time, and not betting everything on one swing matter way more than people think.",
  },
  {
    title: "Buy Back Your Time",
    author: "Dan Martell",
    status: "favorite",
    takeaway:
      "Your time is worth more than you think. Buy back the hours that don't need to be yours.",
  },
];

export const readingNote =
  "Right now I mostly read founder stories and business basics. Trying to build the kind of judgment you can't get from a classroom.";

export const alsoReadNote =
  "I've also read a bunch of other productivity books along the way. Too many to list, but they've all fed into how I think about building and getting things done.";
