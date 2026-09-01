import { DisasterType } from "./disasters";

export interface Post {
  id: string;
  userId: string;
  userName: string;
  title: string;
  body: string;
  disaster: DisasterType | "General";
  imageUrl?: string;
  createdAt: string;
  likes: string[];
}

export const DEFAULT_POSTS: Post[] = [
  {
    id: "post-1",
    userId: "demo-user-1",
    userName: "Priya Sharma",
    title: "Waterlogging near Alkapuri — roads impassable",
    body: "The main road through Alkapuri is completely submerged. Cars are stuck and water is rising fast. If you are in the area, please avoid this route and head towards higher ground near the community hall.",
    disaster: "Flood",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    likes: ["user-2", "user-3"],
  },
  {
    id: "post-2",
    userId: "demo-user-2",
    userName: "Rahul Mehta",
    title: "Shelter at Sayaji Baug is open and has supplies",
    body: "Just arrived at Sayaji Baug open ground. The shelter is operational with water, blankets, and basic first-aid. Around 200 people here so far. Volunteers are coordinating arrivals.",
    disaster: "Flood",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    likes: ["user-1"],
  },
  {
    id: "post-3",
    userId: "demo-user-3",
    userName: "Anjali Patel",
    title: "Cracks visible on building near Fatehgunj",
    body: "Multiple hairline cracks appeared on the outer wall of a three-storey residential building near Fatehgunj after the tremors. Residents have evacuated. Please stay away from the structure.",
    disaster: "Earthquake",
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    likes: [],
  },
  {
    id: "post-4",
    userId: "demo-user-1",
    userName: "Priya Sharma",
    title: "Volunteer coordination for Vadodara relief",
    body: "Setting up a volunteer group to help distribute supplies at the Stadium Emergency Centre. If you can help with water, food packets, or blankets, please reach out. Together we can get through this.",
    disaster: "General",
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    likes: ["user-2", "user-3", "user-4"],
  },
];
