import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Github, Video, FileText, ExternalLink, Clock, User, BookOpen, Loader2, AlertCircle, ClipboardList, Plus, X } from 'lucide-react';
import { assessmentService } from '../../services/assessmentService';
import { courseService } from '../../services/courseService';
import type { Submission, Assessment, Course } from '../../types/course-manager';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const inputStyle: React.CSSProperties = {
  width: '100%', height: '52px', borderRadius: '12px',
  border: '1.5px solid #e2e8f0', padding: '0 16px',
  fontSize: '14px', fontFamily: 'inherit', color: '#1e293b',
  background: '#f8fafc', outline: 'none', boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  fontSize: '10px', fontWeight: 800, color: '#94a3b8',
  textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', display: 'block',
};

const CM_Assessments: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Submissions' | 'Management'>('Submissions');
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Reviewed'>('Pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [subs, asms, crs] = await Promise.all([
        assessmentService.getAllSubmissions(),
        assessmentService.getAllAssessments(),
        courseService.getAllCourses(),
      ]);
      setSubmissions(subs); setAssessments(asms); setCourses(crs);
    } catch { setError('Failed to load assessment data.'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleAction = async (id: string, action: 'Approved' | 'Rejected') => {
    const t = toast.loading(`${action === 'Approved' ? 'Approving' : 'Rejecting'}...`);
    try {
      setProcessingId(id);
      await assessmentService.updateSubmissionStatus(id, action);
      setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status: action } : s));
      toast.success(`Submission ${action.toLowerCase()}!`, { id: t });
    } catch { toast.error('Failed to update.', { id: t }); }
    finally { setProcessingId(null); }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const courseId = fd.get('courseId') as string;
    const course = courses.find(c => String(c.id) === courseId);
    const t = toast.loading('Deploying assessment...');
    try {
      await assessmentService.createAssessment({
        title: fd.get('title') as string, courseId,
        courseName: course?.title || '', type: fd.get('type') as Assessment['type'],
        dueDate: fd.get('dueDate') as string, status: 'Active',
      });
      setIsModalOpen(false); loadData();
      toast.success('Assessment deployed!', { id: t });
    } catch { toast.error('Failed to deploy.', { id: t }); }
  };

  const filtered = submissions.filter(s =>
    filter === 'All' ? true : filter === 'Pending' ? s.status === 'Pending' : s.status !== 'Pending'
  );
  const pendingCount = submissions.filter(s => s.status === 'Pending').length;

  const getIcon = (type: string) => {
    if (type === 'github') return <Github size={18} style={{ color: '#334155' }} />;
    if (type === 'video') return <Video size={18} style={{ color: '#7c3aed' }} />;
    if (type === 'link') return <ExternalLink size={18} style={{ color: '#1d4ed8' }} />;
    return <FileText size={18} style={{ color: '#16a34a' }} />;
  };

  const initials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#1e293b', margin: 0, letterSpacing: '-0.03em' }}>Academic Assessments</h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px', fontWeight: 500 }}>
            Manage evaluations and review student performance across all tracks.
          </p>
        </div>
        {/* Right-side pills / button */}
        {activeTab === 'Submissions' ? (
          <div style={{ display: 'flex', gap: '6px', background: '#f8fafc', borderRadius: '12px', padding: '5px', border: '1px solid #f1f5f9', flexShrink: 0 }}>
            {(['Pending', 'Reviewed', 'All'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '8px 16px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 800,
                fontFamily: 'inherit', transition: 'all 0.2s',
                background: filter === f ? '#1e293b' : 'transparent',
                color: filter === f ? '#fff' : '#64748b',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                {f}
                {f === 'Pending' && pendingCount > 0 && (
                  <span style={{ background: filter === f ? '#fff' : '#c8102e', color: filter === f ? '#1e293b' : '#fff', borderRadius: '999px', padding: '1px 7px', fontSize: '10px', fontWeight: 900 }}>
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <button onClick={() => setIsModalOpen(true)} style={{
            height: '44px', padding: '0 20px', borderRadius: '12px', border: 'none',
            background: '#1e293b', color: '#fff', fontWeight: 800, fontSize: '13px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'inherit',
          }}>
            <Plus size={16} /> Deploy Assessment
          </button>
        )}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '28px', borderBottom: '1.5px solid #f1f5f9' }}>
        {(['Submissions', 'Management'] as const).map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            paddingBottom: '14px', fontSize: '14px', fontWeight: 700, border: 'none',
            background: 'none', cursor: 'pointer', fontFamily: 'inherit',
            color: activeTab === tab ? '#1e293b' : '#94a3b8',
            borderBottom: `2px solid ${activeTab === tab ? '#c8102e' : 'transparent'}`,
            transition: 'all 0.2s', marginBottom: '-1.5px',
          }}>
            {i === 0 ? 'Submission Reviews' : 'Manage Assessments'}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ padding: '14px 20px', background: '#fef2f2', color: '#dc2626', borderRadius: '12px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ── Submissions Tab ── */}
      {activeTab === 'Submissions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', minHeight: '300px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '12px' }}>
              <Loader2 size={28} style={{ color: '#c8102e', animation: 'spin 1s linear infinite' }} />
              <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Loading submissions...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', background: '#fff', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
              <CheckCircle size={36} style={{ color: '#22c55e', marginBottom: '12px' }} />
              <div style={{ fontWeight: 900, fontSize: '18px', color: '#1e293b' }}>All Clear</div>
              <div style={{ color: '#94a3b8', marginTop: '6px', fontSize: '14px' }}>No submissions in this category.</div>
            </div>
          ) : (
            filtered.map(sub => (
              <div key={sub.id} style={{
                display: 'flex', background: '#fff', borderRadius: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
                overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}
              >
                {/* LEFT: Student Info ~35% */}
                <div style={{ width: '35%', flexShrink: 0, padding: '28px 24px', background: '#f8fafc', borderRight: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Avatar + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1e2d5e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '14px', color: '#fff', flexShrink: 0 }}>
                      {initials(sub.studentName)}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>{sub.studentName}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        <Clock size={10} /> {sub.submittedAt}
                      </div>
                    </div>
                  </div>
                  {/* Course track */}
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>Course Track</div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <BookOpen size={13} style={{ color: '#6366f1', marginTop: '2px', flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155', lineHeight: 1.4 }}>{sub.course}</span>
                    </div>
                  </div>
                  {/* Eval type */}
                  <div>
                    <div style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Evaluation Type</div>
                    <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '999px', padding: '5px 14px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {sub.assessmentType}
                    </span>
                  </div>
                </div>

                {/* RIGHT: Content + Actions ~65% */}
                <div style={{ flex: 1, padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Top row: label + status */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                      Submission Artifact
                    </div>
                    {sub.status !== 'Pending' && (
                      <span style={{
                        padding: '5px 14px', borderRadius: '999px', fontSize: '10px', fontWeight: 800,
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        ...(sub.status === 'Approved'
                          ? { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }
                          : { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }),
                      }}>
                        {sub.status}
                      </span>
                    )}
                    {/* Content box */}
                  <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '20px', flex: 1 }}>
                    {!sub.content ? (
                      <p style={{ fontSize: '14px', color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                        No artifact content provided.
                      </p>
                    ) : sub.content.type === 'text' ? (
                      <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, fontStyle: 'italic', margin: 0 }}>
                        "{sub.content.text || 'No text content available.'}"
                      </p>
                    ) : (
                      <a href={sub.content.url} target="_blank" rel="noreferrer" style={{
                        display: 'flex', alignItems: 'center', gap: '14px', padding: '16px',
                        background: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9',
                        textDecoration: 'none', transition: 'border 0.2s',
                      }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#c8102e')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = '#f1f5f9')}
                      >
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {getIcon(sub.content.type)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>
                            {sub.content.type === 'github' ? 'Development Repository' : 
                             sub.content.type === 'video' ? 'Project Demonstration' : 'Resource Link'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {sub.content.url}
                          </div>
                        </div>
                        <ExternalLink size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
                      </a>
                    )}
                  </div>                  </div>

                  {/* Actions */}
                  {sub.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                      <button onClick={() => handleAction(sub.id, 'Approved')} disabled={processingId === sub.id} style={{
                        flex: 1, height: '44px', borderRadius: '12px', border: 'none',
                        background: '#1e293b', color: '#fff', fontSize: '13px', fontWeight: 800,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit',
                        transition: 'background 0.2s', opacity: processingId === sub.id ? 0.6 : 1,
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#0f172a')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#1e293b')}
                      >
                        {processingId === sub.id ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={16} />}
                        Approve Submission
                      </button>
                      <button onClick={() => handleAction(sub.id, 'Rejected')} disabled={processingId === sub.id} style={{
                        flex: 1, height: '44px', borderRadius: '12px', border: '1.5px solid #fecaca',
                        background: '#fff', color: '#dc2626', fontSize: '13px', fontWeight: 800,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'inherit',
                        transition: 'background 0.2s', opacity: processingId === sub.id ? 0.6 : 1,
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                        onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                      >
                        {processingId === sub.id ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <XCircle size={16} />}
                        Request Revision
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Management Tab ── */}
      {activeTab === 'Management' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {assessments.map(asm => (
            <div key={asm.id} style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: asm.type === 'Quiz' ? '#fff7ed' : asm.type === 'Project' ? '#eff6ff' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ClipboardList size={20} style={{ color: asm.type === 'Quiz' ? '#c2410c' : asm.type === 'Project' ? '#1d4ed8' : '#15803d' }} />
                </div>
                <span style={{ padding: '5px 14px', borderRadius: '999px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', ...(asm.status === 'Active' ? { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' } : { background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }) }}>
                  {asm.status}
                </span>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#1e293b', marginBottom: '8px' }}>{asm.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', marginBottom: '20px' }}>
                <BookOpen size={13} /><span style={{ fontSize: '12px', fontWeight: 600 }}>{asm.courseName}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid #f8fafc', paddingTop: '20px' }}>
                <div>
                  <div style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Due Date</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>
                    <Clock size={13} style={{ color: '#c8102e' }} />{asm.dueDate}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Submissions</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>
                    <User size={13} style={{ color: '#6366f1' }} />{asm.submissionsCount} Active
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Deploy Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(6px)' }} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ position: 'relative', background: '#fff', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '520px', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
              <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: '#f8fafc', border: 'none', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <X size={16} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={22} style={{ color: '#1d4ed8' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#1e293b', margin: 0 }}>Deploy Assessment</h2>
                  <p style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '4px 0 0' }}>Strategic Academic Evaluation</p>
                </div>
              </div>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Assessment Title</label>
                  <input required name="title" placeholder="e.g. Final Portfolio Review" style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>Assign to Course</label>
                    <select required name="courseId" style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Evaluation Type</label>
                    <select required name="type" style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                      <option value="Quiz">Strategic Quiz</option>
                      <option value="Project">Final Project</option>
                      <option value="Assignment">Practical Lab</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Deadline Date</label>
                  <input required name="dueDate" type="date" style={inputStyle} />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="submit" style={{ flex: 1, height: '48px', borderRadius: '12px', border: 'none', background: '#1e293b', color: '#fff', fontSize: '14px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Launch Program
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, height: '48px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: '14px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default CM_Assessments;
