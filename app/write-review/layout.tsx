import { PrivateRoute } from "store/context/auth/PrivateRoute";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PrivateRoute>{children}</PrivateRoute>;
}
