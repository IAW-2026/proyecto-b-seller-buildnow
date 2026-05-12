import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
            Unite a BuildNow
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Comenzá a vender tus materiales de construcción.
          </p>
        </div>
        
        <div className="flex justify-center">
          <SignUp 
            forceRedirectUrl="/redirect"
            appearance={{
              elements: {
                rootBox: "mx-auto w-full",
                card: "bg-zinc-900 border border-zinc-800 shadow-xl",
                headerTitle: "text-white",
                headerSubtitle: "text-zinc-400",
                socialButtonsBlockButton: "bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700",
                formFieldLabel: "text-zinc-300",
                formFieldInput: "bg-zinc-950 border-zinc-800 text-white",
                formButtonPrimary: "bg-orange-600 hover:bg-orange-500",
                footerActionText: "text-zinc-400",
                footerActionLink: "text-orange-500 hover:text-orange-400",
                dividerLine: "bg-zinc-800",
                dividerText: "text-zinc-500"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
