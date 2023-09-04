import { rest } from "msw";
const user = {
  id: 1,
  email: "test@example.com",
  username: "example",
  avatar: "",
  banner: "",
  displayname: "",
  description: "",
  posts: [
    {
      id: 1,
      content: "test",
      authorId: 1,
      createdAt: "2023-09-03T16:01:49.169Z",
      image: null,
      replyId: null,
      author: {
        id: 1,
        email: "test@example.com",
        username: "example",
        avatar: "",
        banner: "",
        displayname: "",
        description: "",
        followers: [],
        following: [],
      },
      likes: [],
      reposts: [],
      reply: null,
      replies: [],
    },
  ],
};

export const handlers = [
  rest.get("/api/profile", (req, res, ctx) => {
    return res(
      ctx.json({
        user,
      }),
    );
  }),
  rest.get("/api/post", (req, res, ctx) => {
    return res(
      ctx.json({
        post: user.posts[0],
      }),
    );
  }),
];
