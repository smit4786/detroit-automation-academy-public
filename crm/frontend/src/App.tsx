import React, { useEffect, useState } from 'react';
import { Student } from './types';
import StudentForm from './StudentForm';
import EnrollmentForm from './EnrollmentForm';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '87748455115-compute@developer.gserviceaccount.com'; // User needs to provide actual Client ID
const ALLOWED_EMAILS = ['dbkrsmith@gmail.com', 'nicole.yungers@gmail.com'];

const AppContent: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string>('DAA-CORE');
  const [view, setView] = useState<'enroll' | 'admin'>('enroll');
  const [userEmail, setUserEmail] = useState<string | null>(
    sessionStorage.getItem('daa_user_email')
  );
  const [adminUnlocked, setAdminUnlocked] = useState<boolean>(
    sessionStorage.getItem('daa_admin_auth') === 'true'
  );
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  const handleAdminTabClick = () => {
    if (adminUnlocked) {
      setView('admin');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = (response: CredentialResponse) => {
    if (response.credential) {
      const decoded: any = jwtDecode(response.credential);
      const email = decoded.email;
      
      if (ALLOWED_EMAILS.includes(email)) {
        sessionStorage.setItem('daa_admin_auth', 'true');
        sessionStorage.setItem('daa_user_email', email);
        sessionStorage.setItem('daa_id_token', response.credential);
        setAdminUnlocked(true);
        setUserEmail(email);
        setShowLoginModal(false);
        setView('admin');
      } else {
        alert(`Access Denied: ${email} is not authorized.`);
      }
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('daa_admin_auth');
    sessionStorage.removeItem('daa_user_email');
    sessionStorage.removeItem('daa_id_token');
    setAdminUnlocked(false);
    setUserEmail(null);
    setView('enroll');
  };

  useEffect(() => {
    if (view === 'admin') {
      setLoading(true);
      const token = sessionStorage.getItem('daa_id_token');
      fetch(`/api/students?tenant_id=${tenantId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => { 
          if (res.status === 401 || res.status === 403) {
            handleLogout();
            throw new Error('Session expired or unauthorized');
          }
          if (!res.ok) throw new Error('Failed to fetch'); 
          return res.json(); 
        })
        .then(data => { setStudents(data); setLoading(false); })
        .catch(err => { setError(err.message); setLoading(false); });
    }
  }, [tenantId, view]);

  const handleStudentAdded = (s: Student) => setStudents(prev => [...prev, s]);

  const activeCount = students.filter(s => s.status === 'Active').length;
  const inquiryCount = students.filter(s => s.status === 'Inquiry').length;

  return (
    <div id="root">

      {/* ── SSO Login Modal ── */}
      {showLoginModal && (
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
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔐</div>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
              Admin Access
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
              Sign in with your DAA Google account to access the dashboard.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={() => console.log('Login Failed')}
                useOneTap
              />
            </div>
            <button
              type="button"
              className="daa-link-btn"
              onClick={() => setShowLoginModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Navigation ── */}
      <header className="daa-nav">
        <div className="daa-nav-inner">
          <a href="https://detroitautomationacademy.com" className="daa-logo" target="_blank" rel="noreferrer">
            <div className="daa-logo-mark">⚙️</div>
            <div className="daa-logo-text">
              <span>DETROIT</span>
              <span>AUTOMATION ACADEMY</span>
            </div>
          </a>

          <nav className="daa-nav-tabs">
            <button
              className={`daa-tab${view === 'enroll' ? ' active-green' : ''}`}
              onClick={() => setView('enroll')}
            >
              🎓 Registration Portal
            </button>
            <button
              className={`daa-tab${view === 'admin' ? ' active' : ''}`}
              onClick={handleAdminTabClick}
            >
              {adminUnlocked ? '📊' : '🔒'} Admin Dashboard
            </button>
            {adminUnlocked && (
              <button className="daa-tab" onClick={handleLogout} style={{ color: '#f85149' }}>
                Logout
              </button>
            )}
          </nav>
        </div>
      </header>

      {view === 'enroll' && <EnrollmentForm />}

      {view === 'admin' && (
        <div style={{ flex: 1, padding: '40px 24px' }}>
          <div className="daa-admin-page" style={{ padding: 0 }}>
            <div className="daa-admin-header">
              <div>
                <h1 className="daa-admin-title">DAA Multi-Tenant CRM</h1>
                <p className="daa-admin-subtitle">User: <strong style={{ color: 'var(--primary)' }}>{userEmail}</strong> | Tenant: <strong>{tenantId}</strong></p>
              </div>
              <div className="daa-tenant-select">
                <span className="daa-tenant-label">Academy:</span>
                <select
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
              <div className="daa-table-card">
                {loading && <div className="daa-empty-state"><p>Loading...</p></div>}
                {error && <div className="daa-empty-state"><p style={{ color: '#f85149' }}>{error}</p></div>}
                {!loading && !error && students.length === 0 && <div className="daa-empty-state"><p>No students found.</p></div>}
                {!loading && !error && students.length > 0 && (
                  <table className="daa-table">
                    <thead>
                      <tr><th>Student</th><th>Interest</th><th>Cohort</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {students.map(student => (
                        <tr key={student.id}>
                          <td>
                            <div className="student-name">{student.first_name} {student.last_name}</div>
                            <div className="student-email">{student.email}</div>
                          </td>
                          <td style={{ fontSize: 12 }}>{student.program_interest?.join(', ') || '—'}</td>
                          <td style={{ fontSize: 12 }}>{student.cohort}</td>
                          <td><span className={`daa-badge ${student.status.toLowerCase()}`}>{student.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
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

const App: React.FC = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <AppContent />
  </GoogleOAuthProvider>
);

export default App;
