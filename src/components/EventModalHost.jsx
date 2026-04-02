import { useState } from 'react';
import { useEventData } from '../contexts/EventDataContext';
import { formatDateTimeRange } from '../utils/date';
import { RSVP_OPTIONS } from '../utils/constants';

function GroupSection({ label, items }) {
  return (
    <section className="attendance-group">
      <div className="attendance-heading">
        <h4>{label}</h4>
        <span>{items.length}</span>
      </div>
      <div className="attendance-grid">
        {items.map((entry) => (
          <div key={entry.id} className="attendance-avatar-card">
            <div className="attendance-avatar">{entry.profile?.avatar_icon || '🙂'}</div>
            <div className="attendance-name">{entry.profile?.nickname || 'Player'}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function EventModalHost() {
  const { selectedEvent, setSelectedEvent, updateRsvp, addComment } = useEventData();
  const [comment, setComment] = useState('');

  if (!selectedEvent) return null;

  const grouped = {
    going: selectedEvent.rsvps.filter((item) => item.status === 'going'),
    maybe: selectedEvent.rsvps.filter((item) => item.status === 'maybe'),
    not_going: selectedEvent.rsvps.filter((item) => item.status === 'not_going'),
  };

  return (
    <div className="modal-backdrop" onClick={() => setSelectedEvent(null)}>
      <div className="event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">{selectedEvent.is_recurring ? 'Recurring series' : 'One-time run'}</p>
            <h2>{selectedEvent.title}</h2>
            <p className="muted">{selectedEvent.sport_type} • {selectedEvent.location}</p>
          </div>
          <button className="ghost-button" onClick={() => setSelectedEvent(null)}>Close</button>
        </div>

        <div className="signature-attendance-board">
          <GroupSection label="Going" items={grouped.going} />
          <GroupSection label="Maybe" items={grouped.maybe} />
          <GroupSection label="Can’t make it" items={grouped.not_going} />
        </div>

        <div className="detail-grid">
          <div className="detail-card"><strong>When</strong><span>{formatDateTimeRange(selectedEvent.start_at, selectedEvent.end_at)}</span></div>
          <div className="detail-card"><strong>Organizer</strong><span>{selectedEvent.organizer_name}</span></div>
          <div className="detail-card"><strong>Equipment</strong><span>{selectedEvent.equipment_needed || 'No special gear listed'}</span></div>
          <div className="detail-card"><strong>Weather Note</strong><span>{selectedEvent.weather_note || 'No weather note'}</span></div>
        </div>

        <section className="panel">
          <h3>Quick RSVP</h3>
          <div className="rsvp-row wrap">
            {RSVP_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={`rsvp-button ${selectedEvent.myRsvp === option.value ? 'selected' : ''}`}
                onClick={() => updateRsvp(selectedEvent.id, option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="muted">Default state is “Can’t” until someone actively opts in.</p>
        </section>

        <section className="panel">
          <h3>Notes</h3>
          <p>{selectedEvent.notes || 'No extra notes yet.'}</p>
        </section>

        <section className="panel">
          <h3>Thread</h3>
          <div className="comment-list">
            {selectedEvent.comments.length === 0 && <p className="muted">No messages yet.</p>}
            {selectedEvent.comments.map((item) => (
              <div key={item.id} className="comment-card">
                <div className="comment-author">{item.profile?.avatar_icon || '🙂'} {item.profile?.nickname || 'Player'}</div>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
          <div className="comment-entry">
            <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Running late? court changed? drop a note…" />
            <button
              className="primary-button"
              onClick={async () => {
                await addComment(selectedEvent.id, comment);
                setComment('');
              }}
            >
              Post
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
