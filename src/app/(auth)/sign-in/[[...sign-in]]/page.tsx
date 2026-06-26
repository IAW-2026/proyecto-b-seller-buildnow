import { SignIn } from "@clerk/nextjs";
import { Building2 } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-orange-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-200">
            <Building2 size={28} className="text-white" />
          </div>
        </div>
        <h2 className="mt-5 text-center text-3xl font-bold tracking-tight text-gray-900">
          Bienvenido de nuevo
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Ingresá a tu panel de control de BuildNow Seller.
        </p>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex justify-center">
        <SignIn 
          forceRedirectUrl="/seller/dashboard"
          signUpUrl="/sign-up"
          appearance={{
            elements: {
              rootBox: "mx-auto w-full",
              card: "bg-white shadow-sm rounded-2xl border border-gray-100 w-full p-8",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              logoBox: "hidden",
              socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50 text-gray-600 font-medium",
              formFieldLabel: "text-sm font-medium text-gray-700",
              formFieldInput: "block w-full rounded-xl border border-gray-200 bg-white py-2.5 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all",
              formButtonPrimary: "group flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-orange-200 hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-500 transition-all",
              footerActionText: "text-gray-500",
              footerActionLink: "font-medium text-orange-600 hover:text-orange-500 transition-colors",
              dividerLine: "bg-gray-200",
              dividerText: "text-gray-400 text-sm",
              identityPreviewText: "text-gray-900 font-medium",
              identityPreviewEditButtonIcon: "text-orange-500 hover:text-orange-600",
              formFieldAction: "text-orange-600 hover:text-orange-500 font-medium",
              formFieldErrorText: "text-red-500 text-sm mt-1",
            }
          }}
        />
      </div>
    </div>
  );
}
