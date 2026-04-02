import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { AVATAR_OPTIONS } from '../utils/avatars';

export default function ProfilePage() {
  const { profile, setProfile } = useAuth();
  const [form, setForm] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    nickname: profile?.nickname || '',
    email: profile?.email || '',
    avatar_icon: profile?.avatar_icon || '⚽️',
    phone_number: profile?.phone_number || '',
    favorite_sport: profile?.favorite_sport || '',
    notification_pref: profile?.notification_pref || 'in_app',
  });
  const [message, setMessage] = useState('');

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const save = async (event) => {
    event.preventDefault();
    const { data, error } = await supabase.from('profiles').update(form).eq('id', profile.id).select().single();
    if (error) {
      setMessage(error.message);
      return;
    }
    setProfile(data);
    setMessage('Profile saved.');
  };

  return (
    <section className="panel">
      <h2>My Profile</h2>
      <form className="stack-md" onSubmit={save}>
        <div className="grid-two">
          <label><span>First name</span><input value={form.first_name} onChange={(e) => update('first_name', e.target.value)} /></label>
          <label><span>Last name</span><input value={form.last_name} onChange={(e) => update('last_name', e.target.value)} /></label>
        </div>
        <label><span>Nickname</span><input value={form.nickname} onChange={(e) => update('nickname', e.target.value)} /></label>
        <label><span>Email</span><input value={form.email} onChange={(e) => update('email', e.target.value)} /></label>
        <label><span>Phone</span><input value={form.phone_number} onChange={(e) => update('phone_number', e.target.value)} /></label>
        <label><span>Favorite sport</span><input value={form.favorite_sport} onChange={(e) => update('favorite_sport', e.target.value)} /></label>
        <label><span>Notification preference</span><select value={form.notification_pref} onChange={(e) => update('notification_pref', e.target.value)}><option value="in_app">In-app only</option><option value="email">Email</option><option value="sms_later">SMS later</option></select></label>
        <div>
          <span className="field-label">Avatar</span>
          <div className="avatar-picker">
            {AVATAR_OPTIONS.map((avatar) => (
              <button type="button" key={avatar} className={`avatar-choice ${form.avatar_icon === avatar ? 'selected' : ''}`} onClick={() => update('avatar_icon', avatar)}>{avatar}</button>
            ))}
          </div>
        </div>
        {message && <p className="success-text">{message}</p>}
        <button className="primary-button">Save Profile</button>
      </form>
    </section>
  );
}
