import { redirect } from "next/navigation";

export default function JoinPage() {
  // Team invitations no longer supported - redirect to sign up
  redirect("/auth/sign-in");
}
