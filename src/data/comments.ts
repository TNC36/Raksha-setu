export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  body: string;
  createdAt: string;
}

export const DEFAULT_COMMENTS: Comment[] = [
  {
    id: "cmt-1",
    postId: "post-1",
    userId: "demo-user-2",
    userName: "Rahul Mehta",
    body: "Confirmed — I tried taking that road and had to turn back. Water is knee-deep near the junction.",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "cmt-2",
    postId: "post-1",
    userId: "demo-user-3",
    userName: "Anjali Patel",
    body: "Thank you for the heads-up. Routing through Helmet Road instead.",
    createdAt: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: "cmt-3",
    postId: "post-2",
    userId: "demo-user-3",
    userName: "Anjali Patel",
    body: "Heading there now with my family. Is there space for elderly people?",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "cmt-4",
    postId: "post-2",
    userId: "demo-user-2",
    userName: "Rahul Mehta",
    body: "Yes, there is a separate area near the entrance with seating. Volunteers will help.",
    createdAt: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: "cmt-5",
    postId: "post-4",
    userId: "demo-user-2",
    userName: "Rahul Mehta",
    body: "I can bring 20 water bottles tonight. Where should I drop them off?",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];
