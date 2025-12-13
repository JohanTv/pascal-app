import Pusher from "pusher";

const pusherSingleton = () => {
  const client = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
    secret: process.env.PUSHER_APP_SECRET!,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    useTLS: true,
  });

  return client;
};

declare global {
  var pusherGlobal: undefined | ReturnType<typeof pusherSingleton>;
}

const pusherServer = globalThis.pusherGlobal ?? pusherSingleton();

export default pusherServer;

if (process.env.NODE_ENV !== "production") {
  globalThis.pusherGlobal = pusherServer;
}
