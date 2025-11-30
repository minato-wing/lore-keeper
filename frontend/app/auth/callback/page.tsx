'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const errorDescription = searchParams.get('error_description')

        if (error) {
          setStatus('error')
          setMessage(errorDescription || error)
          return
        }

        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          
          if (exchangeError) {
            setStatus('error')
            setMessage(exchangeError.message)
            return
          }

          if (data.session) {
            // Session is automatically stored by Supabase client
            setStatus('success')
            setMessage('メールアドレスの確認が完了しました！')
            
            setTimeout(() => {
              window.location.href = '/campaigns'
            }, 2000)
          }
        } else {
          setStatus('error')
          setMessage('無効な確認リンクです。')
        }
      } catch (error: any) {
        setStatus('error')
        setMessage(error.message || '確認中にエラーが発生しました。')
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-8">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-white mb-4">確認中...</h1>
            <p className="text-slate-400">メールアドレスを確認しています</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-white mb-4">確認完了！</h1>
            <p className="text-slate-300 mb-6">{message}</p>
            <p className="text-slate-400 text-sm">自動的にリダイレクトされます...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 text-6xl mb-4">✗</div>
            <h1 className="text-2xl font-bold text-white mb-4">エラー</h1>
            <p className="text-red-300 mb-6">{message}</p>
            <div className="space-y-4">
              <Link
                href="/login"
                className="block w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
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
          </>
        )}
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-8">
        <div className="bg-slate-800 p-8 rounded-lg shadow-xl max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-white mb-4">読み込み中...</h1>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
