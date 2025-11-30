const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface Campaign {
  id: string
  user_id: string
  title: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Character {
  id: string
  campaign_id: string
  name: string
  role: string
  attributes: Record<string, any>
  background?: string
  created_at: string
  updated_at: string
}

export interface Relationship {
  id: string
  campaign_id: string
  source_character_id: string
  target_character_id: string
  relation_type: string
  description?: string
  created_at: string
}

export interface LoreEntry {
  id: string
  campaign_id: string
  title: string
  category?: string
  content: string
  created_at: string
  updated_at: string
}

import { supabase } from './supabase'

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  // Get current session from Supabase
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export const api = {
  campaigns: {
    list: () => fetchAPI('/api/campaigns'),
    get: (id: string) => fetchAPI(`/api/campaigns/${id}`),
    create: (data: { title: string; description?: string }) =>
      fetchAPI('/api/campaigns', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { title: string; description?: string }) =>
      fetchAPI(`/api/campaigns/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchAPI(`/api/campaigns/${id}`, { method: 'DELETE' }),
  },
  characters: {
    list: (campaignId: string) =>
      fetchAPI(`/api/characters?campaign_id=${campaignId}`),
    get: (id: string) => fetchAPI(`/api/characters/${id}`),
    create: (data: {
      campaign_id: string
      name: string
      role?: string
      attributes?: Record<string, any>
      background?: string
    }) =>
      fetchAPI('/api/characters', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (
      id: string,
      data: {
        name: string
        role?: string
        attributes?: Record<string, any>
        background?: string
      }
    ) =>
      fetchAPI(`/api/characters/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchAPI(`/api/characters/${id}`, { method: 'DELETE' }),
  },
  relationships: {
    list: (campaignId: string) =>
      fetchAPI(`/api/relationships?campaign_id=${campaignId}`),
    create: (data: {
      campaign_id: string
      source_character_id: string
      target_character_id: string
      relation_type: string
      description?: string
    }) =>
      fetchAPI('/api/relationships', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (
      id: string,
      data: { relation_type: string; description?: string }
    ) =>
      fetchAPI(`/api/relationships/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchAPI(`/api/relationships/${id}`, { method: 'DELETE' }),
  },
  loreEntries: {
    list: (campaignId: string) =>
      fetchAPI(`/api/lore-entries?campaign_id=${campaignId}`),
    get: (id: string) => fetchAPI(`/api/lore-entries/${id}`),
    create: (data: {
      campaign_id: string
      title: string
      category?: string
      content: string
    }) =>
      fetchAPI('/api/lore-entries', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (
      id: string,
      data: { title: string; category?: string; content: string }
    ) =>
      fetchAPI(`/api/lore-entries/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchAPI(`/api/lore-entries/${id}`, { method: 'DELETE' }),
  },
  ai: {
    deepDive: (input: Record<string, any>) =>
      fetchAPI('/api/ai/deep-dive', {
        method: 'POST',
        body: JSON.stringify({ input }),
      }),
    consistencyCheck: (campaignId: string, newContent: string) =>
      fetchAPI('/api/ai/consistency-check', {
        method: 'POST',
        body: JSON.stringify({ campaign_id: campaignId, new_content: newContent }),
      }),
  },
}
