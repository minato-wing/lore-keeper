'use client'

import { useEffect, useState } from 'react'
import { api, Campaign } from '@/lib/api'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import AuthGuard from '@/components/AuthGuard'

function CampaignsContent() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      const data = await api.campaigns.list()
      setCampaigns(data)
    } catch (error) {
      console.error('Failed to load campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.campaigns.create({ title, description })
      setTitle('')
      setDescription('')
      setShowCreateForm(false)
      loadCampaigns()
    } catch (error) {
      console.error('Failed to create campaign:', error)
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">キャンペーン一覧</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            新規作成
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreate} className="bg-slate-800 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">新しいキャンペーン</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-2">タイトル</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-2">説明</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/campaigns/${campaign.id}`}
              className="bg-slate-800 p-6 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <h3 className="text-xl font-bold text-white mb-2">{campaign.title}</h3>
              {campaign.description && (
                <p className="text-slate-400 line-clamp-3">{campaign.description}</p>
              )}
              <p className="text-slate-500 text-sm mt-4">
                作成日: {new Date(campaign.created_at).toLocaleDateString('ja-JP')}
              </p>
            </Link>
          ))}
        </div>

        {campaigns.length === 0 && !showCreateForm && (
          <div className="text-center text-slate-400 mt-12">
            <p className="text-xl">キャンペーンがありません</p>
            <p className="mt-2">「新規作成」ボタンから最初のキャンペーンを作成しましょう</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CampaignsPage() {
  return (
    <AuthGuard>
      <CampaignsContent />
    </AuthGuard>
  )
}
