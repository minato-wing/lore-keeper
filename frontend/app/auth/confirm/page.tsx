'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Mail, RefreshCw } from 'lucide-react'

export default function ConfirmEmailPage() {
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')

  const handleResendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setResending(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) throw error

      setMessage('確認メールを再送信しました。メールボックスを確認してください。')
    } catch (error: any) {
      setMessage(`エラー: ${error.message}`)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-8">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <Mail size={64} className="text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">
            メールを確認してください
          </h1>
          <p className="text-slate-300 mb-2">
            確認メールを送信しました。
          </p>
          <p className="text-slate-400 text-sm">
            メール内のリンクをクリックしてアカウントを有効化してください。
          </p>
        </div>

        <div className="bg-slate-700 p-4 rounded-lg mb-6">
          <h2 className="text-white font-semibold mb-2">メールが届かない場合</h2>
          <ul className="text-slate-300 text-sm space-y-1 list-disc list-inside">
            <li>迷惑メールフォルダを確認してください</li>
            <li>メールアドレスが正しいか確認してください</li>
            <li>数分待ってから再度確認してください</li>
          </ul>
        </div>

        <form onSubmit={handleResendEmail} className="space-y-4 mb-6">
          <div>
            <label className="block text-slate-300 mb-2 text-sm">
              確認メールを再送信
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレスを入力"
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={resending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} className={resending ? 'animate-spin' : ''} />
            {resending ? '送信中...' : '確認メールを再送信'}
          </button>
        </form>

        {message && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              message.includes('エラー')
                ? 'bg-red-900/30 border border-red-500 text-red-300'
                : 'bg-green-900/30 border border-green-500 text-green-300'
            }`}
          >
            {message}
          </div>
        )}

        <div className="text-center space-y-2">
          <Link
            href="/login"
            className="block text-blue-400 hover:text-blue-300 transition-colors"
          >
            ログインページに戻る
          </Link>
          <Link
            href="/"
            className="block text-slate-400 hover:text-white transition-colors"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
