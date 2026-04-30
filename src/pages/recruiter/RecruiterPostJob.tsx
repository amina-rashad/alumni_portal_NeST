import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, AlignLeft, List, Target, CheckCircle, ArrowLeft, Send, Sparkles, AlertCircle } from 'lucide-react';
import { recruiterApi } from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';
import StatusModal from '../../components/StatusModal';

const smoothSpring = { type: 'spring' as const, stiffness: 100, damping: 20, mass: 1 };

const RecruiterPostJob: React.FC = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        min_salary: '',
        max_salary: '',
        type: 'Full-time',
        experience_level: 'Entry Level',
        description: '',
        requirements: '',
        skills_required: ''
    });

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        type: 'error' as 'success' | 'error' | 'info' | 'warning',
        title: '',
        message: ''
    });

    const nestNavy = '#1a2652';
    const nestRed = '#c8102e';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                salary: formData.min_salary && formData.max_salary
                    ? `₹${formData.min_salary} - ₹${formData.max_salary}`
                    : formData.min_salary || formData.max_salary || 'Competitive',
                requirements: formData.requirements.split('\n').filter(r => r.trim() !== ''),
                skills_required: formData.skills_required.split(',').map(s => s.trim()).filter(s => s !== '')
            };
            const response = await recruiterApi.addJob(payload);
            if (response.success) {
                navigate('/recruiter/jobs');
            } else {
                setModalConfig({
                    isOpen: true,
                    type: 'error',
                    title: 'Publishing Failed',
                    message: response.message || 'We could not publish the job at this time.'
                });
            }
        } catch (error) {
            console.error('Error posting job:', error);
            setModalConfig({
                isOpen: true,
                type: 'error',
                title: 'Network Error',
                message: 'A connection error occurred while publishing.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

            <style>{`
                .luxury-form-card {
                    background: #ffffff;
                    border-radius: 24px;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
                    padding: 40px;
                    margin-bottom: 32px;
                }
                .form-group {
                    margin-bottom: 24px;
                }
                .label-premium {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 13px;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 10px;
                }
                .input-premium {
                    width: 100%;
                    padding: 14px 18px;
                    border-radius: 14px;
                    border: 1.5px solid #f1f5f9;
                    background: #f8fafc;
                    font-size: 15px;
                    color: #1e293b;
                    outline: none;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .input-premium:focus {
                    background: #fff;
                    border-color: ${nestNavy};
                    box-shadow: 0 0 0 4px rgba(26, 38, 82, 0.05);
                }
                .btn-submit {
                    background: ${nestNavy};
                    color: white;
                    padding: 16px 40px;
                    border-radius: 14px;
                    font-weight: 800;
                    font-size: 16px;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: 0 10px 25px rgba(26, 38, 82, 0.2);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .btn-submit:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 35px rgba(26, 38, 82, 0.3);
                    background: #111827;
                }
                .btn-submit:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
            `}</style>

            <Link to="/recruiter/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', marginBottom: '32px', fontWeight: 600, fontSize: '14px' }}>
                <ArrowLeft size={18} /> Back to Management
            </Link>

            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '40px' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <Sparkles size={20} color={nestRed} />
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>New Listing</span>
                </div>
                <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#111827', margin: 0, letterSpacing: '-0.03em' }}>Create a New Listing</h1>
                <p style={{ color: '#64748b', marginTop: '8px', fontSize: '16px', fontWeight: 500 }}>Craft a compelling job description to attract the brightest NeST alumni.</p>
            </motion.header>

            <form onSubmit={handleSubmit}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="luxury-form-card"
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label className="label-premium"><Briefcase size={16} /> Professional Role Title</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Lead Full Stack Architect"
                                required
                                className="input-premium"
                            />
                        </div>

                        <div>
                            <label className="label-premium"><MapPin size={16} /> Targeted Location</label>
                            <input
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g. Remote, Worldwide"
                                required
                                className="input-premium"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label className="label-premium"><DollarSign size={16} /> Min Salary</label>
                                <input
                                    name="min_salary"
                                    value={formData.min_salary}
                                    onChange={handleChange}
                                    placeholder="e.g. 10,00,000"
                                    className="input-premium"
                                />
                            </div>
                            <div>
                                <label className="label-premium"><DollarSign size={16} /> Max Salary</label>
                                <input
                                    name="max_salary"
                                    value={formData.max_salary}
                                    onChange={handleChange}
                                    placeholder="e.g. 15,00,000"
                                    className="input-premium"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="label-premium"><List size={16} /> Employment Type</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="input-premium">
                                <option>Full-time</option>
                                <option>Part-time</option>
                                <option>Internship</option>
                                <option>Contract</option>
                                <option>Consultancy</option>
                            </select>
                        </div>

                        <div>
                            <label className="label-premium"><Target size={16} /> Experience Level</label>
                            <select name="experience_level" value={formData.experience_level} onChange={handleChange} className="input-premium">
                                <option>Entry Level</option>
                                <option>Mid Level</option>
                                <option>Senior Level</option>
                                <option>Executive / Director</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="luxury-form-card"
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div className="form-group">
                            <label className="label-premium"><AlignLeft size={16} /> Role Description & Vision</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={8}
                                required
                                placeholder="Detail the impact this role will have and the culture they will join..."
                                className="input-premium"
                                style={{ resize: 'vertical', minHeight: '160px' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="label-premium"><CheckCircle size={16} /> Core Requirements (List per line)</label>
                            <textarea
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleChange}
                                rows={5}
                                placeholder="One requirement per line..."
                                className="input-premium"
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="label-premium"><Target size={16} /> Critical Skillsets (Comma separated)</label>
                            <input
                                name="skills_required"
                                value={formData.skills_required}
                                onChange={handleChange}
                                placeholder="e.g. React, Python, Leadership, System Design"
                                className="input-premium"
                            />
                        </div>
                    </div>
                </motion.div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '60px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#64748b' }}>
                        <AlertCircle size={18} />
                        <span style={{ fontSize: '13px', fontWeight: 500 }}>Listing will be visible to all verified alumni.</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <button type="button" onClick={() => navigate('/recruiter/jobs')} style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: '14px' }}>Discard Draft</button>
                        <button
                            disabled={submitting}
                            type="submit"
                            className="btn-submit"
                        >
                            {submitting ? 'Publishing...' : <><Send size={18} /> Publish Opportunity</>}
                        </button>
                    </div>
                </div>
            </form>

            <StatusModal 
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                type={modalConfig.type}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText="Okay"
            />
        </div>
    );
};

export default RecruiterPostJob;
