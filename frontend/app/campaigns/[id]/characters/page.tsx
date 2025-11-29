'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { api, Character } from '@/lib/api'
import Link from 'next/link'
import { ArrowLeft, Plus, Sparkles } from 'lucide-react'

export default function CharactersPage() {
  const params = useParams()
  const campaignId = params.id as string
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showDeepDive, setShowDeepDive] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    role: 'NPC',
    background: '',
  })
  const [deepDiveInput, setDeepDiveInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [generatingAI, setGeneratingAI] = useState(false)

  useEffect(() => {
    loadCharacters()
  }, [campaignId])

  const loadCharacters = async () => {
    try {
      const data = await api.characters.list(campaignId)
      setCharacters(data)
    } catch (error) {
      console.error('Failed to load characters:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.characters.create({
        campaign_id: campaignId,
        ...formData,
      })
      setFormData({ name: '', role: 'NPC', background: '' })
      setShowCreateForm(false)
      loadCharacters()
    } catch (error) {
      console.error('Failed to create character:', error)
    }
  }

  const handleDeepDive = async () => {
    setGeneratingAI(true)
    try {
      const input = JSON.parse(deepDiveInput)
      const result = await api.ai.deepDive(input)
      setSuggestions(result.suggestions)
    } catch (error) {
      console.error('Failed to generate deep dive:', error)
      alert('AI生成に失敗しました。入力形式を確認してください。')
    } finally {
      setGeneratingAI(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このキャラクターを削除しますか？')) return
    try {
      await api.characters.delete(id)
      loadCharacters()
    } catch (error) {
      console.error('Failed to delete character:', error)
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
          <h1 className="text-4xl font-bold text-white">キャラクター</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDeepDive(!showDeepDive)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Sparkles size={20} />
              AI深掘り
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

        {showDeepDive && (
          <div className="bg-slate-800 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles size={24} className="text-purple-400" />
              AI深掘り生成
            </h2>
            <p className="text-slate-400 mb-4">
              キャラクターの断片情報を入力すると、AIが詳細設定を提案します
            </p>
            <textarea
              value={deepDiveInput}
              onChange={(e) => setDeepDiveInput(e.target.value)}
              placeholder='{"name": "アルド", "race": "エルフ", "job": "パン屋", "personality": "頑固"}'
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              rows={4}
            />
            <button
              onClick={handleDeepDive}
              disabled={generatingAI}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {generatingAI ? '生成中...' : '生成'}
            </button>

            {suggestions.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-xl font-bold text-white">提案:</h3>
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="bg-slate-700 p-4 rounded-lg">
                    <p className="text-slate-300">{suggestion}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showCreateForm && (
          <form onSubmit={handleCreate} className="bg-slate-800 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">新しいキャラクター</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-2">名前</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-2">役割</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PC">PC (プレイヤーキャラクター)</option>
                  <option value="NPC">NPC</option>
                  <option value="Villain">敵対者</option>
                  <option value="Ally">味方</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-2">背景</label>
                <textarea
                  value={formData.background}
                  onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
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
          {characters.map((character) => (
            <div
              key={character.id}
              className="bg-slate-800 p-6 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{character.name}</h3>
                  <span className="text-sm text-slate-400">{character.role}</span>
                </div>
                <button
                  onClick={() => handleDelete(character.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  削除
                </button>
              </div>
              {character.background && (
                <p className="text-slate-300 line-clamp-4">{character.background}</p>
              )}
            </div>
          ))}
        </div>

        {characters.length === 0 && !showCreateForm && (
          <div className="text-center text-slate-400 mt-12">
            <p className="text-xl">キャラクターがありません</p>
            <p className="mt-2">「新規作成」または「AI深掘り」から作成しましょう</p>
          </div>
        )}
      </div>
    </div>
  )
}
