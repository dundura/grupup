import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center">
      <SignIn />
    </div>
  );
}
