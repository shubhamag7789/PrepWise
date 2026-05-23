/**
 * Profile Page — View and edit user profile
 */
import { useState } from 'react';
import DashboardLayout from '@components/layout/DashboardLayout';
import Card from '@components/common/Card';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import Badge from '@components/common/Badge';
import { useAuth } from '@hooks/useAuth';
import { getInitials, getAvatarGradient, formatDate } from '@utils/formatters';
import { userApi } from '@api/userApi';
import { useToast } from '@hooks/useToast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    college: user?.college || '',
  });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { data } = await userApi.updateProfile(form);
      updateUser(data.data.user);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    }
    setIsLoading(false);
  };

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your account details">
      <div className="max-w-3xl space-y-6">

        {/* Profile header card */}
        <Card>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black bg-gradient-to-br ${getAvatarGradient(user?.name)} shadow-brand shrink-0`}>
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h2 className="font-display font-bold text-2xl text-[var(--color-text)]">{user?.name}</h2>
                <Badge variant="primary">{user?.role}</Badge>
              </div>
              <p className="text-[var(--color-text-muted)] text-sm mb-3">{user?.email}</p>
              <p className="text-xs text-[var(--color-text-faint)]">
                Member since {formatDate(user?.createdAt)}
              </p>
            </div>
            <Button
              variant={editing ? 'ghost' : 'outline'}
              size="sm"
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </Card>

        {/* Edit / Info card */}
        <Card>
          <Card.Header>
            <h3 className="font-display font-bold text-[var(--color-text)]">Personal Information</h3>
          </Card.Header>
          <Card.Body>
            {editing ? (
              <div className="space-y-4">
                <Input label="Full name" name="name" value={form.name} onChange={handleChange} placeholder="Your name" />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--color-text)]">Bio</label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    maxLength={300}
                    className="input-base resize-none"
                  />
                  <p className="text-xs text-[var(--color-text-faint)] text-right">{form.bio.length}/300</p>
                </div>
                <Input label="College / University" name="college" value={form.college} onChange={handleChange} placeholder="Your institution" />
                <Button variant="primary" size="md" isLoading={isLoading} onClick={handleSave}>
                  Save changes
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: 'Bio', value: user?.bio || 'No bio added yet' },
                  { label: 'College', value: user?.college || 'Not specified' },
                  { label: 'Skills', value: user?.skills?.join(', ') || 'No skills added' },
                  { label: 'Target Companies', value: user?.targetCompanies?.join(', ') || 'Not specified' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1">{label}</p>
                    <p className="text-sm text-[var(--color-text)]">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Stats card */}
        <Card>
          <Card.Header>
            <h3 className="font-display font-bold text-[var(--color-text)]">Your Stats</h3>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Sessions', value: user?.stats?.practiceSessionsCompleted || 0, icon: '💻' },
                { label: 'Interviews', value: user?.stats?.mockInterviewsCompleted || 0, icon: '🎙️' },
                { label: 'Score', value: user?.stats?.totalScore || 0, icon: '⭐' },
                { label: 'Streak', value: `${user?.stats?.streak || 0}d`, icon: '🔥' },
              ].map(({ label, value, icon }) => (
                <div key={label} className="text-center p-4 rounded-xl bg-surface-50 dark:bg-surface-800">
                  <div className="text-2xl mb-2">{icon}</div>
                  <p className="font-display font-black text-2xl text-[var(--color-text)]">{value}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>

      </div>
    </DashboardLayout>
  );
};

export default Profile;
