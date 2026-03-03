import React, { useEffect, useState } from 'react';
import { Student } from './types';
import StudentForm from './StudentForm';
import EnrollmentForm from './EnrollmentForm';
import { getApiUrl } from './api-config';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "87748455115-483j472l7c7scjkcm8qpguen8jaa4ie6.apps.googleusercontent.com";
const ADMIN_EMAILS = ["dbkrsmith@gmail.com", "smit4786@gmail.com"];

const AppContent: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState('ALL');
  const [view, setView] = useState<'enroll' | 'admin' | 'instructor'>('enroll');
  const [adminSubView, setAdminSubView] = useState<'list' | 'details' | 'revenue' | 'instructors'>('list');
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('daa_crm_theme') as 'light' | 'dark') || 'dark'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('daa_crm_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const [isUnlocked, setIsUnlocked] = useState<boolean>(
    sessionStorage.getItem('daa_admin_auth') === 'true'
  );
  const [userRole, setUserRole] = useState<'admin' | 'instructor' | null>(
    (sessionStorage.getItem('daa_user_role') as any) || null
  );
  const [userEmail, setUserEmail] = useState<string | null>(
    sessionStorage.getItem('daa_user_email')
  );
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  const handleAdminTabClick = () => {
    if (isUnlocked) {
      if (userRole === 'admin') setView('admin');
      else setView('instructor');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLoginSuccess = (response: CredentialResponse) => {
    if (response.credential) {
      const decoded: any = jwtDecode(response.credential);
      const email = decoded.email;

      let role: 'admin' | 'instructor' | null = null;
      if (ADMIN_EMAILS.includes(email)) {
        role = 'admin';
      } else {
        role = 'instructor';
      }

      sessionStorage.setItem('daa_admin_auth', 'true');
      sessionStorage.setItem('daa_user_email', email);
      sessionStorage.setItem('daa_user_role', role);
      sessionStorage.setItem('daa_id_token', response.credential);
      setIsUnlocked(true);
      setUserEmail(email);
      setUserRole(role);
      setShowLoginModal(false);
      if (role === 'admin') setView('admin');
      else setView('instructor');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('daa_admin_auth');
    sessionStorage.removeItem('daa_user_email');
    sessionStorage.removeItem('daa_user_role');
    sessionStorage.removeItem('daa_id_token');
    setIsUnlocked(false);
    setUserEmail(null);
    setUserRole(null);
    setView('enroll');
  };

  useEffect(() => {
    if (view === 'admin' || view === 'instructor') {
      setLoading(true);
      const token = sessionStorage.getItem('daa_id_token');
      const studentUrl = tenantId === 'ALL' ? getApiUrl('/api/students') : getApiUrl(`/api/students?tenant_id=${tenantId}`);
      
      const fetchStudents = fetch(studentUrl, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json());
      
      let promises = [fetchStudents];
      if (view === 'admin' && adminSubView === 'instructors') {
        const instUrl = tenantId === 'ALL' ? getApiUrl('/api/instructors') : getApiUrl(`/api/instructors?tenant_id=${tenantId}`);
        promises.push(fetch(instUrl, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()));
      }

      Promise.all(promises)
        .then(([studentData, instData]) => {
          setStudents(studentData);
          if (instData) setInstructors(instData);
          setLoading(false);
        })
        .catch(err => { 
          setError(err.message); 
          setLoading(false); 
          if (err.message.includes('401') || err.message.includes('403')) handleLogout();
        });
    }
  }, [tenantId, view, adminSubView]);

  const handleStudentAdded = (s: Student) => setStudents(prev => [...prev, s]);

  const activeCount = students.filter(s => s.status === 'Active').length;
  const inquiryCount = students.filter(s => s.status === 'Inquiry').length;

  const markAttendance = async (studentId: string, present: boolean) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const newAttendance = [...(student.attendance || [])];
    const today = new Date().toISOString().split('T')[0];
    
    const existingIdx = newAttendance.findIndex(a => a.date.startsWith(today));
    if (existingIdx >= 0) {
      newAttendance[existingIdx] = { date: today, present };
    } else {
      newAttendance.push({ date: today, present });
    }

    try {
      const token = sessionStorage.getItem('daa_id_token');
      const response = await fetch(getApiUrl(`/api/students?tenant_id=${student.tenant_id}`), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ...student, attendance: newAttendance })
      });
      if (!response.ok) throw new Error('Failed to update attendance');
      
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, attendance: newAttendance } : s));
    } catch (err) {
      console.error(err);
      alert('Error updating attendance');
    }
  };

  const deleteStudent = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this enrollment?')) return;
    try {
      const token = sessionStorage.getItem('daa_id_token');
      const response = await fetch(getApiUrl(`/api/students?id=${id}&tenant_id=${tenantId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete');
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
      alert('Error deleting student');
    }
  };

  const sortedStudents = [...students].sort((a, b) => (a.cohort || '').localeCompare(b.cohort || ''));

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
              Portal Access
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
              className="daa-tab"
              onClick={toggleTheme}
              style={{ fontSize: '16px' }}
              title="Toggle Theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              className={`daa-tab${view === 'enroll' ? ' active-green' : ''}`}
              onClick={() => setView('enroll')}
            >
              🎓 Registration Portal
            </button>
            <button
              className={`daa-tab${(view === 'admin' || view === 'instructor') ? ' active' : ''}`}
              onClick={handleAdminTabClick}
            >
              {isUnlocked ? (userRole === 'admin' ? '📊 Admin Dashboard' : '👨‍🏫 Instructor Portal') : '🔒 Dashboard'}
            </button>
            {isUnlocked && (
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <h1 className="daa-admin-title">DAA Multi-Tenant CRM</h1>
                <p className="daa-admin-subtitle">User: <strong style={{ color: 'var(--primary)' }}>{userEmail}</strong> | Tenant: <strong>{tenantId}</strong></p>
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                  <button 
                    onClick={() => setAdminSubView('list')}
                    className={`daa-tab-small ${adminSubView === 'list' ? 'active' : ''}`}
                    style={{ fontSize: 11, padding: '4px 12px', borderRadius: 4, background: adminSubView === 'list' ? 'var(--primary)' : 'var(--bg-card)', border: '1px solid var(--border)', color: adminSubView === 'list' ? 'white' : 'var(--text)' }}
                  >
                    📊 Overview
                  </button>
                  <button 
                    onClick={() => setAdminSubView('details')}
                    className={`daa-tab-small ${adminSubView === 'details' ? 'active' : ''}`}
                    style={{ fontSize: 11, padding: '4px 12px', borderRadius: 4, background: adminSubView === 'details' ? 'var(--primary)' : 'var(--bg-card)', border: '1px solid var(--border)', color: adminSubView === 'details' ? 'white' : 'var(--text)' }}
                  >
                    📑 Full Records
                  </button>
                  <button 
                    onClick={() => setAdminSubView('revenue')}
                    className={`daa-tab-small ${adminSubView === 'revenue' ? 'active' : ''}`}
                    style={{ fontSize: 11, padding: '4px 12px', borderRadius: 4, background: adminSubView === 'revenue' ? 'var(--primary)' : 'var(--bg-card)', border: '1px solid var(--border)', color: adminSubView === 'revenue' ? 'white' : 'var(--text)' }}
                  >
                    💰 Revenue Insights
                  </button>
                  <button 
                    onClick={() => setAdminSubView('instructors')}
                    className={`daa-tab-small ${adminSubView === 'instructors' ? 'active' : ''}`}
                    style={{ fontSize: 11, padding: '4px 12px', borderRadius: 4, background: adminSubView === 'instructors' ? 'var(--primary)' : 'var(--bg-card)', border: '1px solid var(--border)', color: adminSubView === 'instructors' ? 'white' : 'var(--text)' }}
                  >
                    👨‍🏫 Manage Instructors
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button
                  className="daa-submit"
                  style={{
                    fontSize: 12, padding: '8px 16px', background: 'var(--secondary)',
                    opacity: students.length === 0 ? 0.5 : 1, cursor: students.length === 0 ? 'not-allowed' : 'pointer'
                  }}
                  disabled={students.length === 0}
                  onClick={() => {
                    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Age/Grade', 'Education', 'Interests', 'Experience', 'Language', 'Hear About Us', 'Goals', 'Comments', 'Cohort', 'Status', 'Academy'];
                    const rows = students.map(s => [
                      s.first_name, s.last_name, s.email, s.phone || '', s.age_grade || '', s.education_level || '', 
                      (s.program_interest || []).join('; '), s.experience_level || '', s.language || '', 
                      s.hear_about_us || '', s.goals || '', s.comments || '', s.cohort, s.status, s.tenant_id
                    ]);
                    const csvContent = [headers, ...rows].map(e => e.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(",")).join("\n");
                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement("a");
                    const url = URL.createObjectURL(blob);
                    link.setAttribute("href", url);
                    link.setAttribute("download", `enrollments_full_${tenantId}_${new Date().toISOString().split('T')[0]}.csv`);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  📥 Export FULL CSV
                </button>
                <div className="daa-tenant-select">
                  <span className="daa-tenant-label">Academy:</span>
                  <select
                    className="daa-select"
                    style={{ minWidth: 220, padding: '8px 40px 8px 12px' }}
                    value={tenantId}
                    onChange={e => { setTenantId(e.target.value); setLoading(true); }}
                  >
                    <option value="ALL">All Academies (Aggregate View)</option>
                    <option value="DAA-CORE">Detroit Automation Academy (Core)</option>
                    <option value="BGC-METRO">Boys &amp; Girls Club (Metro Branch)</option>
                  </select>
                </div>
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

            <div style={{ display: 'grid', gridTemplateColumns: adminSubView === 'list' ? '1fr 320px' : '1fr', gap: 20, alignItems: 'start' }}>
              <div className="daa-table-card">
                {loading && <div className="daa-empty-state"><p>Loading...</p></div>}
                {error && <div className="daa-empty-state"><p style={{ color: '#f85149' }}>{error}</p></div>}
                {!loading && !error && students.length === 0 && <div className="daa-empty-state"><p>No students found.</p></div>}
                {!loading && !error && students.length > 0 && adminSubView === 'list' && (
                  <table className="daa-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Interest</th>
                        <th>Cohort</th>
                        <th>Status</th>
                        {tenantId === 'ALL' && <th>Academy</th>}
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedStudents.map(student => (
                        <tr key={student.id}>
                          <td>
                            <div className="student-name">{student.first_name} {student.last_name}</div>
                            <div className="student-email">{student.email}</div>
                          </td>
                          <td style={{ fontSize: 12 }}>{student.program_interest?.join(', ') || '—'}</td>
                          <td style={{ fontSize: 12 }}>{student.cohort}</td>
                          <td><span className={`daa-badge ${student.status.toLowerCase()}`}>{student.status}</span></td>
                          {tenantId === 'ALL' && (
                            <td style={{ fontSize: 10, opacity: 0.7 }}>{student.tenant_id}</td>
                          )}
                          <td>
                            <button
                              onClick={() => deleteStudent(student.id)}
                              className="daa-link-btn"
                              style={{ color: '#f85149', fontSize: 11, padding: '4px 8px' }}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {!loading && !error && students.length > 0 && adminSubView === 'details' && (
                  <div style={{ padding: 24 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                      {sortedStudents.map(student => (
                        <div key={student.id} style={{ 
                          border: '1px solid var(--border)', 
                          borderRadius: 12, 
                          padding: 24, 
                          background: 'var(--bg-body)',
                          boxShadow: '0 4px 12px var(--shadow)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
                            <div>
                              <h3 style={{ margin: 0, fontSize: 18, color: 'var(--primary)' }}>{student.first_name} {student.last_name}</h3>
                              <p style={{ margin: '4px 0 0', opacity: 0.7, fontSize: 13 }}>{student.email} | {student.phone || 'No phone'}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span className={`daa-badge ${student.status.toLowerCase()}`}>{student.status}</span>
                              <p style={{ margin: '4px 0 0', fontSize: 11, opacity: 0.5 }}>ID: {student.id}</p>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
                            <div className="daa-detail-item">
                              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', opacity: 0.5, display: 'block', marginBottom: 4 }}>Academy & Cohort</label>
                              <div style={{ fontSize: 14 }}>{student.tenant_id} | {student.cohort}</div>
                            </div>
                            <div className="daa-detail-item">
                              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', opacity: 0.5, display: 'block', marginBottom: 4 }}>Education & Age</label>
                              <div style={{ fontSize: 14 }}>{student.education_level || '—'} ({student.age_grade || '—'})</div>
                            </div>
                            <div className="daa-detail-item">
                              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', opacity: 0.5, display: 'block', marginBottom: 4 }}>Experience</label>
                              <div style={{ fontSize: 14 }}>{student.experience_level || '—'}</div>
                            </div>
                            <div className="daa-detail-item">
                              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', opacity: 0.5, display: 'block', marginBottom: 4 }}>Interests</label>
                              <div style={{ fontSize: 14 }}>{student.program_interest?.join(', ') || '—'}</div>
                            </div>
                          </div>

                          <div style={{ marginTop: 20, padding: 16, background: 'rgba(102, 204, 0, 0.05)', borderRadius: 12, border: '1px solid rgba(102, 204, 0, 0.2)' }}>
                            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#66CC00', display: 'block', marginBottom: 8 }}>Phase 2: Attendance Tracking</label>
                            {student.attendance && student.attendance.length > 0 ? (
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {student.attendance.map((session, idx) => (
                                  <div key={idx} style={{ fontSize: 12, padding: '4px 8px', background: 'var(--bg-card)', borderRadius: 4, border: '1px solid var(--border)' }}>
                                    {new Date(session.date).toLocaleDateString()}: {session.present ? '✅' : '❌'}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{ fontSize: 13, opacity: 0.6, fontStyle: 'italic' }}>No sessions recorded yet for this student.</div>
                            )}
                          </div>

                          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px dashed var(--border)' }}>
                            <div style={{ marginBottom: 16 }}>
                              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', opacity: 0.5, display: 'block', marginBottom: 6 }}>Goals & Objectives</label>
                              <div style={{ fontSize: 14, lineHeight: 1.6, background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8 }}>
                                {student.goals || 'No goals provided.'}
                              </div>
                            </div>
                            {student.comments && (
                              <div>
                                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', opacity: 0.5, display: 'block', marginBottom: 6 }}>Staff Comments</label>
                                <div style={{ fontSize: 14, lineHeight: 1.6, fontStyle: 'italic', opacity: 0.8 }}>
                                  {student.comments}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => deleteStudent(student.id)}
                              className="daa-link-btn"
                              style={{ color: '#f85149', fontSize: 12 }}
                            >
                              🗑️ Delete Record
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!loading && !error && adminSubView === 'revenue' && (
                  <div style={{ padding: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                      <div style={{ background: 'var(--bg-body)', padding: 24, borderRadius: 16, border: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>AaaS Pilot Performance</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                          <div>
                            <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)' }}>${(students.filter(s => s.tenant_id !== 'DAA-CORE').length * 149).toLocaleString()}</p>
                            <p style={{ fontSize: 12, opacity: 0.6 }}>Current Monthly Recurring Revenue</p>
                          </div>
                          <div style={{ textAlign: 'right', color: '#66CC00', fontSize: 14, fontWeight: 700 }}>
                            ↑ 12% vs last month
                          </div>
                        </div>
                      </div>
                      <div style={{ background: 'var(--bg-body)', padding: 24, borderRadius: 16, border: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>Active Licenses</h3>
                        <p style={{ fontSize: 32, fontWeight: 800 }}>{Array.from(new Set(students.map(s => s.tenant_id))).length}</p>
                        <p style={{ fontSize: 12, opacity: 0.6 }}>Total Academy Tenants</p>
                      </div>
                      <div style={{ background: 'var(--bg-body)', padding: 24, borderRadius: 16, border: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>2026 Projection</h3>
                        <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--secondary)' }}>$1.05M</p>
                        <p style={{ fontSize: 12, opacity: 0.6 }}>Target Ecosystem Revenue</p>
                      </div>
                    </div>
                    
                    <div style={{ marginTop: 32, background: 'rgba(0, 102, 204, 0.05)', padding: 24, borderRadius: 16, border: '1px dashed var(--primary)' }}>
                      <h4 style={{ marginBottom: 16 }}>💰 Chief Revenue Officer Directive</h4>
                      <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.8 }}>
                        Scaling educational partner licenses through the "Academy-in-a-Box" model. 
                        Targeting 4 local school districts for Tier 2 enrollment by May 2026. 
                        <strong> Current focus:</strong> Operationalizing the B2B licensing for the MCP compute engine.
                      </p>
                    </div>
                  </div>
                )}

                {!loading && !error && adminSubView === 'instructors' && (
                  <div style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <h3 style={{ margin: 0 }}>Active Instructors</h3>
                      <p style={{ fontSize: 12, opacity: 0.7 }}>Instructors can mark attendance for their assigned Academy.</p>
                    </div>
                    
                    <table className="daa-table">
                      <thead>
                        <tr>
                          <th>Instructor</th>
                          <th>Email</th>
                          <th>Academy</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {instructors.map(inst => (
                          <tr key={inst.id}>
                            <td>{inst.first_name} {inst.last_name}</td>
                            <td>{inst.email}</td>
                            <td>{inst.tenant_id}</td>
                            <td><span className={`daa-badge ${inst.status.toLowerCase()}`}>{inst.status}</span></td>
                            <td>
                              <button className="daa-link-btn" style={{ color: '#f85149' }}>Remove</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div style={{ marginTop: 32, padding: 24, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
                      <h4 style={{ margin: '0 0 16px' }}>Add New Instructor</h4>
                      <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12, alignItems: 'end' }} onSubmit={(e) => {
                        e.preventDefault();
                        alert('Instructor added (Simulation)');
                      }}>
                        <div className="daa-input-group">
                          <label className="daa-label">First Name</label>
                          <input className="daa-input" required />
                        </div>
                        <div className="daa-input-group">
                          <label className="daa-label">Last Name</label>
                          <input className="daa-input" required />
                        </div>
                        <div className="daa-input-group">
                          <label className="daa-label">Google Email</label>
                          <input className="daa-input" type="email" required />
                        </div>
                        <button className="daa-submit" style={{ padding: '10px 24px' }}>Add Instructor</button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
              {adminSubView === 'list' && (
                <div className="daa-add-card">
                  {tenantId === 'ALL' ? (
                    <div className="daa-empty-state" style={{ padding: '24px 0' }}>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        Select a specific Academy to manually add students.
                      </p>
                    </div>
                  ) : (
                    <StudentForm tenantId={tenantId} onStudentAdded={handleStudentAdded} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {view === 'instructor' && (
        <div style={{ flex: 1, padding: '40px 24px' }}>
          <div className="daa-admin-page" style={{ padding: 0 }}>
            <div className="daa-admin-header">
              <div>
                <h1 className="daa-admin-title">Instructor Portal</h1>
                <p className="daa-admin-subtitle">Welcome, <strong>{userEmail}</strong></p>
              </div>
              <div className="daa-tenant-select">
                <span className="daa-tenant-label">Mark Attendance for:</span>
                <select
                  className="daa-select"
                  value={tenantId}
                  onChange={e => { setTenantId(e.target.value); setLoading(true); }}
                >
                  <option value="ALL">All Academies</option>
                  <option value="DAA-CORE">DAA Core</option>
                  <option value="BGC-METRO">BGC Metro</option>
                </select>
              </div>
            </div>

            <div className="daa-table-card">
              {loading ? (
                <div className="daa-empty-state"><p>Loading students...</p></div>
              ) : (
                <table className="daa-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Cohort</th>
                      <th>Today's Attendance ({new Date().toLocaleDateString()})</th>
                      <th>History</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStudents.filter(s => s.status === 'Active').map(student => {
                      const today = new Date().toISOString().split('T')[0];
                      const attendanceToday = student.attendance?.find(a => a.date.startsWith(today));
                      
                      return (
                        <tr key={student.id}>
                          <td>
                            <div className="student-name">{student.first_name} {student.last_name}</div>
                            <div className="student-email">{student.email}</div>
                          </td>
                          <td style={{ fontSize: 12 }}>{student.cohort}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 12 }}>
                              <button 
                                onClick={() => markAttendance(student.id, true)}
                                className={`daa-badge active ${attendanceToday?.present === true ? '' : 'inactive'}`}
                                style={{ cursor: 'pointer', border: 'none', opacity: attendanceToday?.present === true ? 1 : 0.4 }}
                              >
                                Present ✅
                              </button>
                              <button 
                                onClick={() => markAttendance(student.id, false)}
                                className={`daa-badge withdrawn ${attendanceToday?.present === false ? '' : 'inactive'}`}
                                style={{ cursor: 'pointer', border: 'none', opacity: attendanceToday?.present === false ? 1 : 0.4 }}
                              >
                                Absent ❌
                              </button>
                            </div>
                          </td>
                          <td style={{ fontSize: 11 }}>
                            {student.attendance ? (
                              <span>{student.attendance.filter(a => a.present).length} / {student.attendance.length} sessions</span>
                            ) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
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
