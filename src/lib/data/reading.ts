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
      "Competition is overrated — the goal is to build something valuable enough that competition stops mattering.",
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
      "Founders rarely feel as certain in the moment as they look in hindsight.",
  },
  {
    title: "The Almanack of Naval Ravikant",
    author: "Eric Jorgenson",
    status: "reading",
  },
];

export const readingNote =
  "I read mostly founder stories and business fundamentals right now — trying to build the judgment that doesn't come from a classroom.";
