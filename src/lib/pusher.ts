import PusherServer from "pusher";
import PusherClient from "pusher-js";

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

/**
 * Creates or retrieves a singleton client instance for the given key/cluster.
 */
export const getPusherClient = () => {
  if (typeof window === "undefined") {
    // Return dummy when accessed on server side
    return null;
  }
  
  if (!window.pusherClient) {
    window.pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
  }
  
  return window.pusherClient;
};

// Declare global type for window extension
declare global {
  interface Window {
    pusherClient?: PusherClient;
  }
}
