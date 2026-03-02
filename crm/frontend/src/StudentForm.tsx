import React, { useState } from 'react';
import { Student } from './types';
import { getApiUrl } from './api-config';

interface StudentFormProps {
  onStudentAdded: (student: Student) => void;
  tenantId: string;
}

const StudentForm: React.FC<StudentFormProps> = ({ onStudentAdded, tenantId }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [cohort, setCohort] = useState('Feb 2026');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newStudent = {
      first_name: firstName,
      last_name: lastName,
      email,
      cohort,
      status: 'Active' as const,
    };

    try {
      const token = sessionStorage.getItem('daa_id_token');
      const response = await fetch(getApiUrl(`/api/students?tenant_id=${tenantId}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newStudent),
      });
      if (!response.ok) throw new Error('Failed to add student');
      const saved = await response.json();
      onStudentAdded(saved);
      setFirstName('');
      setLastName('');
      setEmail('');
    } catch (err) {
      console.error(err);
      alert('Error adding student');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="daa-add-grid">
        <div className="daa-field">
          <label className="daa-label">First Name</label>
          <input
            required
            type="text"
            className="daa-input"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="Justin"
          />
        </div>
        <div className="daa-field">
          <label className="daa-label">Last Name</label>
          <input
            required
            type="text"
            className="daa-input"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            placeholder="Smith"
          />
        </div>
      </div>
      <div className="daa-field">
        <label className="daa-label">Email Address</label>
        <input
          required
          type="email"
          className="daa-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="jsmith@email.com"
        />
      </div>
      <div className="daa-field">
        <label className="daa-label">Cohort</label>
        <select
          className="daa-select"
          value={cohort}
          onChange={e => setCohort(e.target.value)}
        >
          <option>Feb 2026</option>
          <option>Mar 2026</option>
          <option>Apr 2026</option>
          <option>May 2026</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="daa-submit"
        style={{ marginTop: 4, fontSize: 13, padding: '12px 16px' }}
      >
        {isSubmitting ? 'Enrolling...' : '+ Enroll Student'}
      </button>
    </form>
  );
};

export default StudentForm;
