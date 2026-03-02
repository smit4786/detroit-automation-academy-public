import React, { useState } from 'react';
import { getApiUrl } from './api-config';

const programs = [
  { label: 'Automation Technology', icon: '⚙️' },
  { label: 'Advanced Manufacturing', icon: '🏭' },
  { label: 'CNC Programming', icon: '🖥️' },
  { label: 'Drone Operations & AI', icon: '🚁' },
  { label: 'Still exploring', icon: '🔍' },
];

const EnrollmentForm: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    age_grade: '',
    education_level: '',
    program_interest: [] as string[],
    experience_level: '',
    language: 'English',
    hear_about_us: '',
    goals: '',
    comments: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleCheckboxChange = (program: string) => {
    setFormData(prev => ({
      ...prev,
      program_interest: prev.program_interest.includes(program)
        ? prev.program_interest.filter(p => p !== program)
        : [...prev.program_interest, program],
    }));
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(getApiUrl('/api/students?tenant_id=DAA-CORE'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, status: 'Inquiry', cohort: 'TBD' }),
      });
      if (!response.ok) throw new Error('Failed to submit enrollment');
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Error submitting enrollment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="daa-page">
        <div className="daa-success">
          <div className="daa-success-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#66CC00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2>Application Received!</h2>
          <p>
            Thank you for applying to Detroit Automation Academy.<br />
            Our team will review your information and reach out within 24–48 hours.
          </p>
          <button className="daa-link-btn" onClick={() => setIsSubmitted(false)}>
            Submit another application
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="daa-page">
      <div className="daa-form-card">
        {/* Header */}
        <div className="daa-form-header">
          <h1>Join the <span>Academy</span></h1>
          <p>Start your journey in Automation &amp; Robotics — Built by Detroit, for Detroit.</p>
        </div>

        {/* Progress */}
        <div style={{ padding: '24px 40px 0' }}>
          <div className="daa-progress">
            <div className="daa-progress-step active">
              <div className="daa-progress-dot" />
              Personal
            </div>
            <div className="daa-progress-line" />
            <div className="daa-progress-step active">
              <div className="daa-progress-dot" />
              Programs
            </div>
            <div className="daa-progress-line" />
            <div className="daa-progress-step active">
              <div className="daa-progress-dot" />
              Goals
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="daa-form-body">

          {/* Section 1 — Personal Info */}
          <section className="daa-section">
            <h2 className="daa-section-title">
              <span className="daa-section-num">1</span>
              Personal Information
            </h2>
            <div className="daa-grid-2">
              <div className="daa-field">
                <label className="daa-label">First Name *</label>
                <input required className="daa-input" type="text" placeholder="Justin" value={formData.first_name} onChange={set('first_name')} />
              </div>
              <div className="daa-field">
                <label className="daa-label">Last Name *</label>
                <input required className="daa-input" type="text" placeholder="Smith" value={formData.last_name} onChange={set('last_name')} />
              </div>
              <div className="daa-field">
                <label className="daa-label">Email Address *</label>
                <input required className="daa-input" type="email" placeholder="jsmith@example.com" value={formData.email} onChange={set('email')} />
              </div>
              <div className="daa-field">
                <label className="daa-label">Phone Number *</label>
                <input required className="daa-input" type="tel" placeholder="(313) 555-1234" value={formData.phone} onChange={set('phone')} />
              </div>
              <div className="daa-field">
                <label className="daa-label">Age / Grade</label>
                <input className="daa-input" type="text" placeholder="e.g. 17 / 11th Grade" value={formData.age_grade} onChange={set('age_grade')} />
              </div>
              <div className="daa-field">
                <label className="daa-label">Education Level</label>
                <select className="daa-select" value={formData.education_level} onChange={set('education_level')}>
                  <option value="">Select level...</option>
                  <option>Middle School</option>
                  <option>High School</option>
                  <option>Some College</option>
                  <option>College Graduate</option>
                  <option>Adult Learner</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section 2 — Program Interest */}
          <section className="daa-section">
            <h2 className="daa-section-title">
              <span className="daa-section-num">2</span>
              Program Interests
            </h2>
            <div className="daa-program-grid">
              {programs.map(({ label, icon }) => {
                const selected = formData.program_interest.includes(label);
                return (
                  <label
                    key={label}
                    className={`daa-program-chip${selected ? ' selected' : ''}`}
                    onClick={() => handleCheckboxChange(label)}
                  >
                    <div className="daa-program-check">
                      <svg className="daa-program-check-icon" viewBox="0 0 10 8">
                        <path d="M1 4l3 3 5-6" />
                      </svg>
                    </div>
                    <span style={{ fontSize: 16, lineHeight: 1 }}>{icon}</span>
                    <span className="daa-program-label">{label}</span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Section 3 — Background */}
          <section className="daa-section">
            <h2 className="daa-section-title">
              <span className="daa-section-num">3</span>
              Background
            </h2>
            <div className="daa-grid-2" style={{ marginBottom: 16 }}>
              <div className="daa-field">
                <label className="daa-label">Experience Level</label>
                <select className="daa-select" value={formData.experience_level} onChange={set('experience_level')}>
                  <option value="">Select...</option>
                  <option>Complete Beginner</option>
                  <option>Some Experience</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div className="daa-field">
                <label className="daa-label">How did you hear about us?</label>
                <select className="daa-select" value={formData.hear_about_us} onChange={set('hear_about_us')}>
                  <option value="">Select...</option>
                  <option>Boys & Girls Club event</option>
                  <option>Social Media</option>
                  <option>Friend / Family</option>
                  <option>School / Teacher</option>
                  <option>Website / Google</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section 4 — Goals */}
          <section className="daa-section" style={{ marginBottom: 28 }}>
            <h2 className="daa-section-title">
              <span className="daa-section-num">4</span>
              Your Goals
            </h2>
            <div className="daa-field">
              <label className="daa-label">What do you hope to achieve at DAA? *</label>
              <textarea
                required
                className="daa-textarea"
                rows={4}
                value={formData.goals}
                onChange={set('goals')}
                placeholder="Tell us about your interest — career change, hobby, skill-building, or just curious about robotics..."
              />
            </div>
          </section>

          {/* Submit */}
          <div className="daa-submit-wrap">
            <button type="submit" disabled={isSubmitting} className="daa-submit">
              {isSubmitting ? '⏳ Sending Application...' : '🚀 Submit My Application'}
            </button>
            <p className="daa-submit-disclaimer">
              By submitting, you agree to be contacted by Detroit Automation Academy regarding program opportunities.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
};

export default EnrollmentForm;
