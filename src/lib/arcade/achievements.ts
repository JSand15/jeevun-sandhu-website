import type { Achievement, AchievementId } from "./types";

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-contact",
    name: "FIRST CONTACT",
    description: "You showed up. Respect.",
    icon: "coin",
    xp: 25,
  },
  {
    id: "scroll-master",
    name: "SCROLL MASTER",
    description: "You made it to the bottom of the page. Full send.",
    icon: "controller",
    xp: 30,
  },
  {
    id: "explorer",
    name: "EXPLORER",
    description: "4 pages deep. You're actually looking around.",
    icon: "star",
    xp: 50,
  },
  {
    id: "completionist",
    name: "COMPLETIONIST",
    description: "You've seen every page on this site. That's dedication.",
    icon: "crown",
    xp: 150,
  },
  {
    id: "code-peeker",
    name: "CODE PEEKER",
    description: "You went and looked at the source. Smart move.",
    icon: "key",
    xp: 75,
    secret: true,
  },
  {
    id: "konami",
    name: "KONAMI",
    description: "Up up down down left right left right B A. You know the code.",
    icon: "star",
    xp: 100,
    secret: true,
  },
  {
    id: "night-owl",
    name: "NIGHT OWL",
    description: "Browsing this site past midnight. Same honestly.",
    icon: "ghost",
    xp: 60,
    secret: true,
  },
  {
    id: "gamer",
    name: "GAMER",
    description: "You turned the sound on. That's the real experience.",
    icon: "floppy",
    xp: 40,
  },
  {
    id: "high-scorer",
    name: "HIGH SCORER",
    description: "New personal best. Somebody's competitive.",
    icon: "trophy",
    xp: 80,
  },
  {
    id: "recruiter",
    name: "RECRUITER",
    description: "You found the good stuff. Let's talk.",
    icon: "diamond",
    xp: 90,
    secret: true,
  },
  {
    id: "speedrun",
    name: "SPEEDRUN",
    description: "Zero to hired in record time. No wasted moves.",
    icon: "skull",
    xp: 120,
    secret: true,
  },
  {
    id: "tycoon",
    name: "TYCOON",
    description: "You played every game on this site. Go build something.",
    icon: "chest",
    xp: 150,
  },
  {
    id: "collector",
    name: "COLLECTOR",
    description: "Every achievement on this site, unlocked. You didn't have to go this hard.",
    icon: "heart",
    xp: 200,
    secret: true,
  },
];

export function getAchievement(id: AchievementId): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
