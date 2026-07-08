import PusherClient from 'pusher-js';

// Singleton instance to prevent multiple connections (Only on client-side)
export const pusherClient = typeof window !== 'undefined' 
  ? new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY || "dummy-key", {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1",
    })
  : (null as unknown as PusherClient);
