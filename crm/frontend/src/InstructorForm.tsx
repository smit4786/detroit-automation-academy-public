import React, { useState } from 'react';
import { Instructor } from './types';
import { getApiUrl } from './api-config';

interface InstructorFormProps {
  onInstructorAdded: (instructor: Instructor) => void;
  tenantId: string;
}

const InstructorForm: React.FC<InstructorFormProps> = ({ onInstructorAdded, tenantId }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newInstructor = {
      first_name: firstName,
      last_name: lastName,
      email,
      status: 'Active' as const,
    };

    try {
      const token = sessionStorage.getItem('daa_id_token');
      const response = await fetch(getApiUrl(`/api/instructors?tenant_id=${tenantId}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newInstructor),
      });
      if (!response.ok) throw new Error('Failed to add instructor');
      const saved = await response.json();
      onInstructorAdded(saved);
      setFirstName('');
      setLastName('');
      setEmail('');
    } catch (err) {
      console.error(err);
      alert('Error adding instructor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: 32, padding: 24, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
      <h4 style={{ margin: '0 0 16px' }}>Add New Instructor</h4>
      <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }} onSubmit={handleSubmit}>
        <div className="daa-input-group">
          <label className="daa-label">First Name</label>
          <input
            className="daa-input"
            required
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="Jane"
          />
        </div>
        <div className="daa-input-group">
          <label className="daa-label">Last Name</label>
          <input
            className="daa-input"
            required
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            placeholder="Doe"
          />
        </div>
        <div className="daa-input-group">
          <label className="daa-label">Google Email</label>
          <input
            className="daa-input"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="jane.doe@gmail.com"
          />
        </div>
        <button
          className="daa-submit"
          disabled={isSubmitting}
          style={{ padding: '10px 24px' }}
        >
          {isSubmitting ? 'Adding...' : 'Add Instructor'}
        </button>
      </form>
    </div>
  );
};

export default InstructorForm;
