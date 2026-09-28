import { redirect } from "next/navigation";

// Temporary: force everything through the (app) group once we clean up
export default function RootPage() {
  // For now just show the same simple shell until auth is ready
  redirect("/money"); // temporary — we will change this
}
