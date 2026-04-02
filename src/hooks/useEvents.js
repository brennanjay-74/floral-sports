import { useCallback, useEffect, useMemo, useState } from 'react';
import { addDays } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [error, setError] = useState('');

  const loadAll = useCallback(async () => {
    if (!user || !supabase) return;
    setLoading(true);

    const horizonStart = new Date().toISOString();
    const horizonEnd = addDays(new Date(), 120).toISOString();

    const [eventsRes, rsvpsRes, membersRes, commentsRes] = await Promise.all([
      supabase
        .from('events')
        .select('*')
        .gte('start_at', horizonStart)
        .lte('start_at', horizonEnd)
        .order('start_at', { ascending: true }),
      supabase.from('event_rsvps').select('*'),
      supabase.from('profiles').select('*').order('nickname', { ascending: true }),
      supabase.from('event_comments').select('*').order('created_at', { ascending: true }),
    ]);

    const firstError = eventsRes.error || rsvpsRes.error || membersRes.error || commentsRes.error;
    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    const membersById = Object.fromEntries((membersRes.data ?? []).map((member) => [member.id, member]));
    const commentsByEvent = (commentsRes.data ?? []).reduce((acc, comment) => {
      acc[comment.event_id] ??= [];
      acc[comment.event_id].push({ ...comment, profile: membersById[comment.user_id] });
      return acc;
    }, {});

    const eventsWithMeta = (eventsRes.data ?? []).map((event) => {
      const rsvps = (rsvpsRes.data ?? [])
        .filter((entry) => entry.event_id === event.id)
        .map((entry) => ({ ...entry, profile: membersById[entry.user_id] }));

      const myRsvp = rsvps.find((entry) => entry.user_id === user.id)?.status ?? 'not_going';
      return {
        ...event,
        rsvps,
        comments: commentsByEvent[event.id] ?? [],
        myRsvp,
      };
    });

    setEvents(eventsWithMeta);
    setMembers(membersRes.data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const updateRsvp = useCallback(
    async (eventId, status) => {
      if (!user || !supabase) return;
      const { error: upsertError } = await supabase.from('event_rsvps').upsert(
        {
          event_id: eventId,
          user_id: user.id,
          status,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'event_id,user_id' },
      );

      if (upsertError) {
        setError(upsertError.message);
        return;
      }
      await loadAll();
    },
    [user, loadAll],
  );

  const addComment = useCallback(
    async (eventId, body) => {
      if (!user || !supabase || !body.trim()) return;
      const { error: insertError } = await supabase.from('event_comments').insert({
        event_id: eventId,
        user_id: user.id,
        body: body.trim(),
      });
      if (insertError) {
        setError(insertError.message);
        return;
      }
      await loadAll();
    },
    [user, loadAll],
  );

  const selectedEventData = useMemo(
    () => events.find((event) => event.id === selectedEvent) ?? null,
    [events, selectedEvent],
  );

  return {
    events,
    members,
    loading,
    error,
    selectedEvent: selectedEventData,
    setSelectedEvent,
    updateRsvp,
    addComment,
    refresh: loadAll,
  };
}
