import { formatDateTimeRange } from '../utils/date';
import { RSVP_OPTIONS } from '../utils/constants';

export default function EventCard({ event, onOpen, onRsvp }) {
  const counts = event.rsvps.reduce(
    (acc, rsvp) => {
      acc[rsvp.status] = (acc[rsvp.status] || 0) + 1;
      return acc;
    },
    { going: 0, maybe: 0, not_going: 0 },
  );

  return (
    <article className="event-card" onClick={() => onOpen(event.id)}>
      <div className="event-card-top">
        <div>
          <p className="eyebrow">{event.sport_type}</p>
          <h3>{event.title}</h3>
          <p className="muted">{formatDateTimeRange(event.start_at, event.end_at)}</p>
          <p className="muted">{event.location}</p>
        </div>
        <div className="pill-stack">
          <span className="pill pill-green">{counts.going} Going</span>
          <span className="pill">{counts.maybe} Maybe</span>
          <span className="pill">{counts.not_going} Can’t</span>
        </div>
      </div>

      <div className="attendance-strip">
        {event.rsvps.slice(0, 6).map((rsvp) => (
          <div key={rsvp.id} className="mini-avatar">
            <span>{rsvp.profile?.avatar_icon || '🙂'}</span>
            <small>{rsvp.profile?.nickname || 'Player'}</small>
          </div>
        ))}
      </div>

      <div className="rsvp-row" onClick={(e) => e.stopPropagation()}>
        {RSVP_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={`rsvp-button ${event.myRsvp === option.value ? 'selected' : ''}`}
            onClick={() => onRsvp(event.id, option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </article>
  );
}
