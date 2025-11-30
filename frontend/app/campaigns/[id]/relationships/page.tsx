'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { api, Character, Relationship } from '@/lib/api'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import AuthGuard from '@/components/AuthGuard'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
} from 'reactflow'
import 'reactflow/dist/style.css'

function RelationshipsContent() {
  const params = useParams()
  const campaignId = params.id as string
  const [characters, setCharacters] = useState<Character[]>([])
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    source_character_id: '',
    target_character_id: '',
    relation_type: 'friend',
    description: '',
  })

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => {
    loadData()
  }, [campaignId])

  useEffect(() => {
    if (characters.length > 0 && relationships.length >= 0) {
      buildGraph()
    }
  }, [characters, relationships])

  const loadData = async () => {
    try {
      const [charactersData, relationshipsData] = await Promise.all([
        api.characters.list(campaignId),
        api.relationships.list(campaignId),
      ])
      setCharacters(charactersData)
      setRelationships(relationshipsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const buildGraph = () => {
    const newNodes: Node[] = characters.map((char, index) => ({
      id: char.id,
      type: 'default',
      data: { label: char.name },
      position: {
        x: Math.cos((index / characters.length) * 2 * Math.PI) * 300 + 400,
        y: Math.sin((index / characters.length) * 2 * Math.PI) * 300 + 300,
      },
      style: {
        background: '#1e293b',
        color: '#fff',
        border: '2px solid #3b82f6',
        borderRadius: '8px',
        padding: '10px',
      },
    }))

    const newEdges: Edge[] = relationships.map((rel) => ({
      id: rel.id,
      source: rel.source_character_id,
      target: rel.target_character_id,
      label: rel.relation_type,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3b82f6' },
      labelStyle: { fill: '#fff', fontWeight: 700 },
      labelBgStyle: { fill: '#1e293b' },
    }))

    setNodes(newNodes)
    setEdges(newEdges)
  }

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.relationships.create({
        campaign_id: campaignId,
        ...formData,
      })
      setFormData({
        source_character_id: '',
        target_character_id: '',
        relation_type: 'friend',
        description: '',
      })
      setShowCreateForm(false)
      loadData()
    } catch (error) {
      console.error('Failed to create relationship:', error)
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
      <div className="max-w-7xl mx-auto">
        <Link
          href={`/campaigns/${campaignId}`}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          キャンペーンに戻る
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">相関図</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            関係を追加
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreate} className="bg-slate-800 p-6 rounded-lg mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">新しい関係</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 mb-2">キャラクター（From）</label>
                <select
                  value={formData.source_character_id}
                  onChange={(e) =>
                    setFormData({ ...formData, source_character_id: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">選択してください</option>
                  {characters.map((char) => (
                    <option key={char.id} value={char.id}>
                      {char.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-2">キャラクター（To）</label>
                <select
                  value={formData.target_character_id}
                  onChange={(e) =>
                    setFormData({ ...formData, target_character_id: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">選択してください</option>
                  {characters.map((char) => (
                    <option key={char.id} value={char.id}>
                      {char.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-2">関係性</label>
                <select
                  value={formData.relation_type}
                  onChange={(e) =>
                    setFormData({ ...formData, relation_type: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="friend">友人</option>
                  <option value="rival">ライバル</option>
                  <option value="family">家族</option>
                  <option value="enemy">敵対</option>
                  <option value="mentor">師弟</option>
                  <option value="lover">恋人</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-2">詳細</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
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

        <div className="bg-slate-800 rounded-lg" style={{ height: '600px' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <Controls />
            <Background />
          </ReactFlow>
        </div>

        {characters.length === 0 && (
          <div className="text-center text-slate-400 mt-12">
            <p className="text-xl">キャラクターがありません</p>
            <p className="mt-2">まずキャラクターを作成してください</p>
          </div>
        )}
      </div>
    </div>
  )
}


export default function RelationshipsPage() {
  return (
    <AuthGuard>
      <RelationshipsContent />
    </AuthGuard>
  )
}
