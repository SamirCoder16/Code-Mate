import { useReducer } from "react"
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

const App = () => {
   
  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <button>
            Sign in to continue
          </button>
        </SignInButton>
      </SignedOut>
    </div>
  );
};

export default App;