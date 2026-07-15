export interface Book {
  title: string;
  author: string;
  status: "reading" | "favorite" | "read";
  takeaway?: string;
}

// PLACEHOLDER: replace with Jeevun's actual reading list.
export const books: Book[] = [
  {
    title: "Zero to One",
    author: "Peter Thiel",
    status: "favorite",
    takeaway:
      "Competition is overrated. The goal is to build something so valuable that competition stops mattering.",
  },
  {
    title: "The Lean Startup",
    author: "Eric Ries",
    status: "favorite",
    takeaway:
      "Ship the smallest thing that lets you learn something real from a customer.",
  },
  {
    title: "Shoe Dog",
    author: "Phil Knight",
    status: "read",
    takeaway:
      "Founders rarely feel as sure in the moment as they look looking back on it.",
  },
  {
    title: "The Almanack of Naval Ravikant",
    author: "Eric Jorgenson",
    status: "reading",
  },
];

export const readingNote =
  "Right now I mostly read founder stories and business basics. Trying to build the kind of judgment you can't get from a classroom.";
