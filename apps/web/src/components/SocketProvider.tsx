/**
 * SocketProvider — mounts the global socket connection.
 * Place once at the app root. The socket only connects when authenticated.
 */
import { useSocket } from '../hooks/useSocket';

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  // Just calling the hook is enough — it manages the singleton socket.
  useSocket();
  return <>{children}</>;
}
