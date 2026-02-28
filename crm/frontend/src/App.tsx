import React, { useEffect, useState } from 'react';
import { Student } from './types';
import StudentForm from './StudentForm';
import EnrollmentForm from './EnrollmentForm';

const ADMIN_PIN = process.env.REACT_APP_ADMIN_PIN || 'DAA2026';

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string>('DAA-CORE');
  const [view, setView] = useState<'enroll' | 'admin'>('enroll');
  const [adminUnlocked, setAdminUnlocked] = useState<boolean>(
    sessionStorage.getItem('daa_admin_auth') === 'true'
  );
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  const handleAdminTabClick = () => {
    if (adminUnlocked) {
      setView('admin');
    } else {
      setShowPinModal(true);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      sessionStorage.setItem('daa_admin_auth', 'true');
      setAdminUnlocked(true);
      setShowPinModal(false);
      setPinInput('');
      setPinError(false);
      setView('admin');
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  useEffect(() => {
    if (view === 'admin') {
      setLoading(true);
      fetch(`/api/students?tenant_id=${tenantId}`)
        .then(res => { if (!res.ok) throw new Error('Failed to fetch'); return res.json(); })
        .then(data => { setStudents(data); setLoading(false); })
        .catch(err => { setError(err.message); setLoading(false); });
    }
  }, [tenantId, view]);

  const handleStudentAdded = (s: Student) => setStudents(prev => [...prev, s]);

  const activeCount = students.filter(s => s.status === 'Active').length;
  const inquiryCount = students.filter(s => s.status === 'Inquiry').length;

  return (
    <div id="root">

      {/* ── PIN Gate Modal ── */}
      {showPinModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '40px 36px',
            width: '100%',
            maxWidth: 380,
            textAlign: 'center',
            boxShadow: 'var(--shadow-blue)',
            animation: 'fadeUp 0.3s ease',
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔐</div>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
              Admin Access
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
              Enter the DAA staff passcode to access the dashboard.
            </p>
            <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                id="admin-pin-input"
                type="password"
                className="daa-input"
                placeholder="Enter passcode..."
                value={pinInput}
                onChange={e => { setPinInput(e.target.value); setPinError(false); }}
                autoFocus
                style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: 18 }}
              />
              {pinError && (
                <p style={{ color: '#f85149', fontSize: 12, margin: 0 }}>Incorrect passcode. Try again.</p>
              )}
              <button type="submit" className="daa-submit" style={{ padding: '12px 16px', fontSize: 14 }}>
                Unlock Dashboard
              </button>
              <button
                type="button"
                className="daa-link-btn"
                onClick={() => { setShowPinModal(false); setPinInput(''); setPinError(false); }}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Navigation ── */}
      <header className="daa-nav">
        <div className="daa-nav-inner">
          {/* Logo */}
          <a href="https://detroitautomationacademy.com" className="daa-logo" target="_blank" rel="noreferrer">
            <div className="daa-logo-mark">⚙️</div>
            <div className="daa-logo-text">
              <span>DETROIT</span>
              <span>AUTOMATION ACADEMY</span>
            </div>
          </a>

          {/* Tab Switcher */}
          <nav className="daa-nav-tabs">
            <button
              id="tab-enroll"
              className={`daa-tab${view === 'enroll' ? ' active-green' : ''}`}
              onClick={() => setView('enroll')}
            >
              🎓 Registration Portal
            </button>
            <button
              id="tab-admin"
              className={`daa-tab${view === 'admin' ? ' active' : ''}`}
              onClick={handleAdminTabClick}
            >
              {adminUnlocked ? '📊' : '🔒'} Admin Dashboard
            </button>
          </nav>
        </div>
      </header>

      {/* ── Registration Portal ── */}
      {view === 'enroll' && <EnrollmentForm />}

      {/* ── Admin Dashboard ── */}
      {view === 'admin' && (
        <div style={{ flex: 1, padding: '40px 24px' }}>
          <div className="daa-admin-page" style={{ padding: 0 }}>

            {/* Header */}
            <div className="daa-admin-header">
              <div>
                <h1 className="daa-admin-title">DAA Multi-Tenant CRM</h1>
                <p className="daa-admin-subtitle">Managing <strong style={{ color: 'var(--primary)' }}>{tenantId}</strong> environment</p>
              </div>
              <div className="daa-tenant-select">
                <span className="daa-tenant-label">Academy:</span>
                <select
                  id="tenant-select"
                  className="daa-select"
                  style={{ minWidth: 220, padding: '8px 40px 8px 12px' }}
                  value={tenantId}
                  onChange={e => { setTenantId(e.target.value); setLoading(true); }}
                >
                  <option value="DAA-CORE">Detroit Automation Academy (Core)</option>
                  <option value="BGC-METRO">Boys &amp; Girls Club (Metro Branch)</option>
                </select>
              </div>
            </div>

            {/* Stats Row */}
            {!loading && !error && (
              <div className="daa-stats-row">
                <div className="daa-stat-card">
                  <div className="daa-stat-card-label">Total Students</div>
                  <div className="daa-stat-card-value">{students.length}</div>
                </div>
                <div className="daa-stat-card">
                  <div className="daa-stat-card-label">Active</div>
                  <div className="daa-stat-card-value green">{activeCount}</div>
                </div>
                <div className="daa-stat-card">
                  <div className="daa-stat-card-label">Inquiries</div>
                  <div className="daa-stat-card-value blue">{inquiryCount}</div>
                </div>
              </div>
            )}

            {/* Main Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

              {/* Table */}
              <div className="daa-table-card">
                {loading && (
                  <div className="daa-empty-state">
                    <div className="daa-empty-state-icon">⏳</div>
                    <p>Loading students for {tenantId}...</p>
                  </div>
                )}
                {error && (
                  <div className="daa-empty-state">
                    <div className="daa-empty-state-icon">⚠️</div>
                    <p style={{ color: '#f85149' }}>{error}</p>
                  </div>
                )}
                {!loading && !error && students.length === 0 && (
                  <div className="daa-empty-state">
                    <div className="daa-empty-state-icon">🎓</div>
                    <p>No students in {tenantId} yet. Add one using the panel →</p>
                  </div>
                )}
                {!loading && !error && students.length > 0 && (
                  <table className="daa-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Program Interest</th>
                        <th>Cohort</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(student => (
                        <tr key={student.id}>
                          <td>
                            <div className="student-name">{student.first_name} {student.last_name}</div>
                            <div className="student-email">{student.email}</div>
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                            {student.program_interest ? student.program_interest.join(', ') : '—'}
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{student.cohort}</td>
                          <td>
                            <span className={`daa-badge ${student.status === 'Active' ? 'active' :
                              student.status === 'Inquiry' ? 'inquiry' : 'other'
                              }`}>
                              {student.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Add Student Panel */}
              <div className="daa-add-card">
                <h3>➕ Add Student</h3>
                <StudentForm onStudentAdded={handleStudentAdded} tenantId={tenantId} />
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
