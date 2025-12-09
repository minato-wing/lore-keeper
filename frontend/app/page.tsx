import Link from "next/link";
import { auth0 } from "@/lib/auth0";
import LoginButton from "@/components/LoginButton";
import LogoutButton from "@/components/LogoutButton";
import Profile from "@/components/Profile";

export default async function Home() {
  const session = await auth0.getSession();
  const user = session?.user;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <main className="flex flex-col items-center gap-8 p-8 text-center">
        <h1 className="text-5xl font-bold text-white">
          Lore Keeper AI
        </h1>
        <p className="max-w-2xl text-xl text-slate-300">
          断片的なメモを、矛盾のない『世界設定』へと昇華させるAIアシスタント
        </p>
        
        <div className="app-container">
          <div className="main-card-wrapper">
            <img
              src="https://cdn.auth0.com/quantum-assets/dist/latest/logos/auth0/auth0-lockup-en-ondark.png"
              alt="Auth0 Logo"
              className="auth0-logo"
            />
            <h2 className="main-title">Auth0 Authentication</h2>
            
            <div className="action-card">
              {user ? (
                <div className="logged-in-section">
                  <p className="logged-in-message">✅ Successfully logged in!</p>
                  <Profile />
                  <LogoutButton />
                  <Link
                    href="/campaigns"
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors mt-4"
                  >
                    キャンペーン一覧
                  </Link>
                </div>
              ) : (
                <>
                  <p className="action-text">
                    Welcome! Please log in to access your protected content.
                  </p>
                  <LoginButton />
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
