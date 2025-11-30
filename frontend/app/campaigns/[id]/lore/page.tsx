'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { api, LoreEntry } from '@/lib/api'
import Link from 'next/link'
import { ArrowLeft, Plus, AlertTriangle } from 'lucide-react'
import AuthGuard from '@/components/AuthGuard'

function LoreContent() {
  const params = useParams()
  const campaignId = params.id as string
  const [loreEntries, setLoreEntries] = useState<LoreEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showConsistencyCheck, setShowConsistencyCheck] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    category: 'History',
    content: '',
  })
  const [checkContent, setCheckContent] = useState('')
  const [checkResult, setCheckResult] = useState<{
    is_consistent: boolean
    warnings: string[]
  } | null>(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    loadLoreEntries()
  }, [campaignId])

  const loadLoreEntries = async () => {
    try {
      const data = await api.loreEntries.list(campaignId)
      setLoreEntries(data)
    } catch (error) {
      console.error('Failed to load lore entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.loreEntries.create({
        campaign_id: campaignId,
        ...formData,
      })
      setFormData({ title: '', category: 'History', content: '' })
      setShowCreateForm(false)
      loadLoreEntries()
    } catch (error) {
      console.error('Failed to create lore entry:', error)
    }
  }

  const handleConsistencyCheck = async () => {
    setChecking(true)
    try {
      const result = await api.ai.consistencyCheck(campaignId, checkContent)
      setCheckResult(result)
    } catch (error) {
      console.error('Failed to check consistency:', error)
      alert('整合性チェックに失敗しました')
    } finally {
      setChecking(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この設定を削除しますか？')) return
    try {
      await api.loreEntries.delete(id)
      loadLoreEntries()
    } catch (error) {
      console.error('Failed to delete lore entry:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <Link
          href={`/campaigns/${campaignId}`}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          キャンペーンに戻る
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">世界設定</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowConsistencyCheck(!showConsistencyCheck)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <AlertTriangle size={20} />
              整合性チェック
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              新規作成
            </button>
          </div>
        </div>

        {showConsistencyCheck && (
          <div className="bg-slate-800 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle size={24} className="text-yellow-400" />
              整合性チェック
            </h2>
            <p className="text-slate-400 mb-4">
              新しい設定を入力すると、既存の設定との矛盾をAIがチェックします
            </p>
            <textarea
              value={checkContent}
              onChange={(e) => setCheckContent(e.target.value)}
              placeholder="チェックしたい新しい設定を入力してください"
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-4"
              rows={4}
            />
            <button
              onClick={handleConsistencyCheck}
              disabled={checking}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
            >
              {checking ? 'チェック中...' : 'チェック'}
            </button>

            {checkResult && (
              <div className="mt-6">
                <div
                  className={`p-4 rounded-lg ${
                    checkResult.is_consistent
                      ? 'bg-green-900/30 border border-green-500'
                      : 'bg-red-900/30 border border-red-500'
                  }`}
                >
                  <h3 className="text-xl font-bold text-white mb-2">
                    {checkResult.is_consistent ? '✅ 整合性OK' : '⚠️ 矛盾の可能性'}
                  </h3>
                  {checkResult.warnings.length > 0 && (
                    <div className="space-y-2">
                      {checkResult.warnings.map((warning, index) => (
                        <p key={index} className="text-slate-300">
                          • {warning}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {showCreateForm && (
          <form onSubmit={handleCreate} className="bg-slate-800 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">新しい設定</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-2">タイトル</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-2">カテゴリ</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="History">歴史</option>
                  <option value="Geography">地理</option>
                  <option value="Magic">魔法</option>
                  <option value="Item">アイテム</option>
                  <option value="Culture">文化</option>
                  <option value="Other">その他</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-2">内容</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  作成
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-6">
          {loreEntries.map((entry) => (
            <div key={entry.id} className="bg-slate-800 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">{entry.title}</h3>
                  {entry.category && (
                    <span className="inline-block mt-2 px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded-full">
                      {entry.category}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  削除
                </button>
              </div>
              <p className="text-slate-300 whitespace-pre-wrap">{entry.content}</p>
              <p className="text-slate-500 text-sm mt-4">
                作成日: {new Date(entry.created_at).toLocaleDateString('ja-JP')}
              </p>
            </div>
          ))}
        </div>

        {loreEntries.length === 0 && !showCreateForm && (
          <div className="text-center text-slate-400 mt-12">
            <p className="text-xl">世界設定がありません</p>
            <p className="mt-2">「新規作成」から最初の設定を追加しましょう</p>
          </div>
        )}
      </div>
    </div>
  )
}


export default function LorePage() {
  return (
    <AuthGuard>
      <LoreContent />
    </AuthGuard>
  )
}
