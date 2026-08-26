import { useCallback, useEffect, useRef, useState } from 'react'
import Ably from 'ably'
import { getToken } from './auth'

function normalizeMembers(presenceMembers) {
  const unique = new Map()
  for (const member of presenceMembers || []) {
    if (!member?.clientId || unique.has(member.clientId)) continue
    const data = member.data || {}
    unique.set(member.clientId, {
      clientId: member.clientId,
      username: data.username,
      name: data.name,
      team: data.team,
    })
  }
  return [...unique.values()]
}

export function useDraftRoom({ enabled, session }) {
  const [members, setMembers] = useState([])
  const [joined, setJoined] = useState(false)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState(null)
  const channelRef = useRef(null)
  const joinedRef = useRef(false)
  const joiningRef = useRef(false)

  const join = useCallback(async () => {
    if (!channelRef.current || joinedRef.current || joiningRef.current || !session) return
    const channel = channelRef.current
    joiningRef.current = true
    setJoining(true)
    setError(null)
    try {
      await channel.presence.enter({
        username: session.username,
        name: session.name,
        team: session.team,
      })
      if (channelRef.current !== channel) return
      joinedRef.current = true
      setJoined(true)
    } catch (joinError) {
      setError(joinError?.message || 'Could not join the draft room.')
    } finally {
      joiningRef.current = false
      setJoining(false)
    }
  }, [session])

  const leave = useCallback(async () => {
    const channel = channelRef.current
    if (!channel || !joinedRef.current) return
    try {
      await channel.presence.leave()
    } catch {
      // The connection may already be closed during cleanup.
    }
    joinedRef.current = false
    setJoined(false)
  }, [])

  const token = getToken()

  useEffect(() => {
    if (!enabled) {
      setMembers([])
      setJoined(false)
      setJoining(false)
      setError(null)
      joinedRef.current = false
      joiningRef.current = false
      return undefined
    }

    let cancelled = false
    let ably
    let channel
    try {
      ably = new Ably.Realtime({
        authUrl: '/api/ably-token',
        authHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      channel = ably.channels.get('draft-room')
    } catch (connectionError) {
      setError(connectionError?.message || 'Could not connect to the draft room.')
      return undefined
    }
    channelRef.current = channel

    const syncMembers = async () => {
      try {
        const presenceMembers = await channel.presence.get()
        if (!cancelled) setMembers(normalizeMembers(presenceMembers))
      } catch (syncError) {
        if (!cancelled) setError(syncError?.message || 'Could not load the draft room.')
      }
    }
    const onPresenceChange = () => {
      syncMembers()
    }

    Promise.resolve().then(() => channel.presence.subscribe(onPresenceChange)).catch(syncError => {
      if (!cancelled) setError(syncError?.message || 'Could not listen to the draft room.')
    })
    syncMembers()

    return () => {
      cancelled = true
      if (joinedRef.current) {
        channel.presence.leave().catch(() => {})
      }
      joinedRef.current = false
      joiningRef.current = false
      setJoined(false)
      setJoining(false)
      channelRef.current = null
      ably.close()
    }
  }, [enabled, token, session?.username, session?.name, session?.team])

  if (!enabled) {
    return { members: [], joined: false, joining: false, error: null, join, leave }
  }
  return { members, joined, joining, error, join, leave }
}
