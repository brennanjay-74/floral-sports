import { useMemo, useState } from 'react';
import { parseISO } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { SPORTS } from '../utils/constants';
import { buildOccurrences } from '../utils/date';
import { useEventData } from '../contexts/EventDataContext';

function combineLocalDateTime(date, time) {
  return new Date(`${date}T${time}:00`).toISOString();
}

export default function CreateEventPage() {
  const { user, profile } = useAuth();
  const { refresh } = useEventData();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    sport_type: 'Basketball',
    title: '',
    location: '',
    date: '',
    startTime: '19:00',
    endTime: '20:30',
    recurrenceType: 'none',
    recurrenceInterval: 1,
    recurrenceWeekdays: [],
    recurrenceUntil: '',
    notes: '',
    equipment_needed: '',
    weather_note: '',
  });

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const previewText = useMemo(() => {
    if (!form.date) return 'Pick a start date to preview recurrence.';
    if (form.recurrenceType === 'none') return 'This will create one single event.';
    return form.recurrenceType === 'weekly'
      ? `This will expand upcoming weekly events into individual event rows through ${form.recurrenceUntil || 'your chosen end date'}.`
      : `This will expand upcoming monthly events into individual event rows through ${form.recurrenceUntil || 'your chosen end date'}.`;
  }, [form]);

  const handleWeekdayToggle = (dayNumber) => {
    const existing = new Set(form.recurrenceWeekdays);
    existing.has(dayNumber) ? existing.delete(dayNumber) : existing.add(dayNumber);
    update('recurrenceWeekdays', [...existing].sort());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const start_at = combineLocalDateTime(form.date, form.startTime);
      const end_at = combineLocalDateTime(form.date, form.endTime);
      const durationMinutes = Math.max(30, Math.round((parseISO(end_at) - parseISO(start_at)) / 60000));

      const basePayload = {
        sport_type: form.sport_type,
        title: form.title,
        location: form.location,
        start_at,
        end_at,
        organizer_id: user.id,
        organizer_name: profile?.nickname || profile?.first_name || 'Organizer',
        notes: form.notes,
        equipment_needed: form.equipment_needed,
        weather_note: form.weather_note,
        is_recurring: form.recurrenceType !== 'none',
      };

      if (form.recurrenceType === 'none') {
        const { data, error: insertError } = await supabase.from('events').insert(basePayload).select().single();
        if (insertError) throw insertError;
        await supabase.from('event_rsvps').upsert({ event_id: data.id, user_id: user.id, status: 'going' }, { onConflict: 'event_id,user_id' });
      } else {
        const recurrence_rule = {
          type: form.recurrenceType,
          interval: Number(form.recurrenceInterval),
          byWeekday: form.recurrenceType === 'weekly' ? form.recurrenceWeekdays : undefined,
          byMonthDay: form.recurrenceType === 'monthly' ? Number(form.date.split('-')[2]) : undefined,
          until: form.recurrenceUntil ? new Date(`${form.recurrenceUntil}T23:59:59`).toISOString() : undefined,
          durationMinutes,
        };

        const { data: seriesRow, error: seriesError } = await supabase
          .from('event_series')
          .insert({
            ...basePayload,
            recurrence_rule,
          })
          .select()
          .single();
        if (seriesError) throw seriesError;

        const occurrences = buildOccurrences(seriesRow, 120);
        const eventRows = occurrences.map((occurrence) => ({
          ...basePayload,
          start_at: occurrence.startAt,
          end_at: occurrence.endAt,
          is_recurring: true,
          series_id: seriesRow.id,
        }));

        const { data: createdEvents, error: eventError } = await supabase.from('events').insert(eventRows).select();
        if (eventError) throw eventError;

        if (createdEvents?.length) {
          await supabase.from('event_rsvps').insert(
            createdEvents.map((createdEvent) => ({
              event_id: createdEvent.id,
              user_id: user.id,
              status: 'going',
            })),
          );
        }
      }

      setMessage('Event saved. Floral Gang is ready.');
      await refresh();
    } catch (submitError) {
      setError(submitError.message);
    }

    setSaving(false);
  };

  return (
    <div className="stack-lg">
      <section className="panel">
        <h2>Create Event</h2>
        <p className="muted">One-time or recurring. Keep it fast and thumb-friendly.</p>
        <form className="stack-md" onSubmit={handleSubmit}>
          <div className="grid-two">
            <label><span>Sport</span><select value={form.sport_type} onChange={(e) => update('sport_type', e.target.value)}>{SPORTS.map((sport) => <option key={sport}>{sport}</option>)}</select></label>
            <label><span>Custom title</span><input value={form.title} onChange={(e) => update('title', e.target.value)} required /></label>
          </div>
          <label><span>Location</span><input value={form.location} onChange={(e) => update('location', e.target.value)} required /></label>

          <div className="grid-three">
            <label><span>Date</span><input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} required /></label>
            <label><span>Start</span><input type="time" value={form.startTime} onChange={(e) => update('startTime', e.target.value)} required /></label>
            <label><span>End</span><input type="time" value={form.endTime} onChange={(e) => update('endTime', e.target.value)} required /></label>
          </div>

          <div className="grid-three">
            <label><span>Recurring rule</span><select value={form.recurrenceType} onChange={(e) => update('recurrenceType', e.target.value)}><option value="none">One-time only</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></label>
            <label><span>Interval</span><input type="number" min="1" value={form.recurrenceInterval} onChange={(e) => update('recurrenceInterval', e.target.value)} /></label>
            <label><span>Repeat until</span><input type="date" value={form.recurrenceUntil} onChange={(e) => update('recurrenceUntil', e.target.value)} /></label>
          </div>

          {form.recurrenceType === 'weekly' && (
            <div>
              <span className="field-label">Days of week</span>
              <div className="weekday-picker">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label, index) => (
                  <button
                    type="button"
                    key={label}
                    className={form.recurrenceWeekdays.includes(index) ? 'selected' : ''}
                    onClick={() => handleWeekdayToggle(index)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label><span>Notes</span><textarea rows="4" value={form.notes} onChange={(e) => update('notes', e.target.value)} /></label>
          <label><span>Equipment needed</span><input value={form.equipment_needed} onChange={(e) => update('equipment_needed', e.target.value)} /></label>
          <label><span>Outdoor / weather note</span><input value={form.weather_note} onChange={(e) => update('weather_note', e.target.value)} placeholder="Indoor backup court if rain" /></label>

          <div className="panel subtle-panel"><strong>Recurrence approach</strong><p>{previewText}</p></div>

          {message && <p className="success-text">{message}</p>}
          {error && <p className="error-text">{error}</p>}
          <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Create Event'}</button>
        </form>
      </section>
    </div>
  );
}
