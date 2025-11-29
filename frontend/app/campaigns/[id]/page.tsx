'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { api, Campaign, Character } from '@/lib/api'
import Link from 'next/link'
import { ArrowLeft, Users, BookOpen, Network } from 'lucide-react'

export default function CampaignDetailPage() {
  const params = useParams()
  const campaignId = params.id as string
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [campaignId])

  const loadData = async () => {
    try {
      const [campaignData, charactersData] = await Promise.all([
        api.campaigns.get(campaignId),
        api.characters.list(campaignId),
      ])
      setCampaign(campaignData)
      setCharacters(charactersData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">キャンペーンが見つかりません</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/campaigns"
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          キャンペーン一覧に戻る
        </Link>

        <div className="bg-slate-800 p-8 rounded-lg mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">{campaign.title}</h1>
          {campaign.description && (
            <p className="text-slate-300 text-lg">{campaign.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href={`/campaigns/${campaignId}/characters`}
            className="bg-slate-800 p-6 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <Users size={32} className="text-blue-400" />
              <h2 className="text-2xl font-bold text-white">キャラクター</h2>
            </div>
            <p className="text-slate-400">
              {characters.length}人のキャラクター
            </p>
          </Link>

          <Link
            href={`/campaigns/${campaignId}/lore`}
            className="bg-slate-800 p-6 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <BookOpen size={32} className="text-green-400" />
              <h2 className="text-2xl font-bold text-white">世界設定</h2>
            </div>
            <p className="text-slate-400">
              設定資料を管理
            </p>
          </Link>

          <Link
            href={`/campaigns/${campaignId}/relationships`}
            className="bg-slate-800 p-6 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center gap-4 mb-4">
              <Network size={32} className="text-purple-400" />
              <h2 className="text-2xl font-bold text-white">相関図</h2>
            </div>
            <p className="text-slate-400">
              人間関係を可視化
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
