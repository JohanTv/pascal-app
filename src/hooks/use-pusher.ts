"use client";

import type { Channel } from "pusher-js";
import Pusher from "pusher-js";
import { useEffect, useState } from "react";

let pusherInstance: Pusher | null = null;

export function usePusher() {
  const [pusher, setPusher] = useState<Pusher | null>(null);

  useEffect(() => {
    if (!pusherInstance) {
      pusherInstance = new Pusher(
        process.env.NEXT_PUBLIC_PUSHER_APP_KEY || "",
        {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "",
          authEndpoint: "/api/pusher/auth",
        },
      );
    }

    setPusher(pusherInstance);

    return () => {
      // Don't disconnect on unmount, keep global instance
    };
  }, []);

  return pusher;
}

export function usePusherChannel(channelName: string) {
  const pusher = usePusher();
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    if (!pusher) return;

    const ch = pusher.subscribe(channelName);
    setChannel(ch);

    return () => {
      pusher.unsubscribe(channelName);
    };
  }, [pusher, channelName]);

  return channel;
}
