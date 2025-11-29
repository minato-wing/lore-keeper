import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <main className="flex flex-col items-center gap-8 p-8 text-center">
        <h1 className="text-5xl font-bold text-white">
          Lore Keeper AI
        </h1>
        <p className="max-w-2xl text-xl text-slate-300">
          断片的なメモを、矛盾のない『世界設定』へと昇華させるAIアシスタント
        </p>
        <div className="flex gap-4 mt-8">
          <Link
            href="/campaigns"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            キャンペーン一覧
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-colors"
          >
            ログイン
          </Link>
        </div>
      </main>
    </div>
  );
}
