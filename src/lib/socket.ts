// lib/socket.ts
import { io, Socket } from "socket.io-client";

let sock: Socket | null = null;

export function connectSocket() {
  if (sock?.connected || sock?.connect) return sock!;
  const url = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";
  const uid = (typeof window !== "undefined" && (localStorage.getItem("uid") || localStorage.getItem("userId"))) || "";
  sock = io(url, { transports: ["websocket"], withCredentials: true, query: { userId: String(uid) } });
  return sock!;
}
export function getSocket() { return sock; }
