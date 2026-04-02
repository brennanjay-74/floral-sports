import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AVATAR_OPTIONS } from '../utils/avatars';

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    nickname: '',
    avatarIcon: '⚽️',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);

    if (mode === 'signup') {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: form.firstName,
            last_name: form.lastName,
            nickname: form.nickname,
            avatar_icon: form.avatarIcon,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setBusy(false);
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          email: form.email,
          first_name: form.firstName,
          last_name: form.lastName,
          nickname: form.nickname,
          avatar_icon: form.avatarIcon,
        });

        if (profileError) {
          setError(profileError.message);
          setBusy(false);
          return;
        }
      }

      setMessage('Account created. Check your email if confirmation is enabled, then log in.');
      setMode('login');
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (signInError) {
        setError(signInError.message);
        setBusy(false);
        return;
      }
      navigate('/');
    }

    setBusy(false);
  };

  return (
    <div className="auth-layout">
      <section className="auth-panel brand-panel">
        <p className="eyebrow">Floral Gang private app</p>
        <h1>Floral Sports</h1>
        <p>
          Fast sports coordination with recurring runs, fun avatar-based attendance, and mobile-first RSVPs.
        </p>
        <div className="feature-list">
          <div>⚡️ Quick RSVP from cards</div>
          <div>🧠 Recurring series support</div>
          <div>🎭 Avatar-first attendance board</div>
          <div>📱 Installable like an app</div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="mode-toggle">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Log In</button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Sign Up</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <>
              <div className="grid-two">
                <label>
                  First name
                  <input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required />
                </label>
                <label>
                  Last name
                  <input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required />
                </label>
              </div>

              <label>
                Nickname
                <input value={form.nickname} onChange={(e) => update('nickname', e.target.value)} required />
              </label>

              <label>
                Character icon
                <div className="avatar-picker">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      type="button"
                      key={avatar}
                      className={`avatar-choice ${form.avatarIcon === avatar ? 'selected' : ''}`}
                      onClick={() => update('avatarIcon', avatar)}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </label>
            </>
          )}

          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
          </label>

          <label>
            Password
            <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required />
          </label>

          {message && <p className="success-text">{message}</p>}
          {error && <p className="error-text">{error}</p>}

          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? 'Working…' : mode === 'login' ? 'Enter Floral Sports' : 'Create Account'}
          </button>
        </form>
      </section>
    </div>
  );
}
