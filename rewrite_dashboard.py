import codecs

with codecs.open('c:\\Users\\noble.sibi\\Downloads\\alumni_portal_NeST\\src\\pages\\Dashboard.tsx', 'r', 'utf-8') as f:
    text = f.read()

prefix = text[:7376]

new_return = """  return (
    <div className="font-sans dark-dashboard" style={{ 
      backgroundColor: '#0F1523', 
      backgroundImage: `
        radial-gradient(at 0% 0%, rgba(211, 47, 47, 0.08) 0px, transparent 40%),
        radial-gradient(at 100% 0%, rgba(59, 130, 246, 0.08) 0px, transparent 40%)
      `,
      minHeight: '100vh', 
      padding: '2rem 1.5rem', 
      fontFamily: '"Montserrat", sans-serif',
      color: '#fff'
    }}>
      
      {/* GLOBAL CSS OVERRIDES */}
      <style>{`
        .font-sans, .font-sans h1, .font-sans h2, .font-sans h3, .font-sans h4, .font-sans h5, .font-sans h6, .font-sans p, .font-sans span, .font-sans button, .font-sans input {
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif !important;
          letter-spacing: -0.015em;
        }

        .luxury-card {
          background: rgba(30, 41, 59, 0.6);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 40px 0 rgba(0, 0, 0, 0.3);
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          overflow: hidden;
          position: relative;
        }

        .btn-premium {
          transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }
        .btn-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        
        .pulse-blob {
          animation: pulse-slow 8s infinite alternate ease-in-out;
        }
        @keyframes pulse-slow {
          0% { transform: scale(1) translate(0, 0); opacity: 0.3; }
          100% { transform: scale(1.1) translate(20px, -20px); opacity: 0.5; }
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0F1523; 
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1); 
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2); 
        }
      `}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* NEW TOP LAYOUT (Matches Uploaded Image) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'stretch' }}>
          
          {/* LEFT COLUMN: Welcome Banner */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: 'linear-gradient(145deg, #121828 0%, #0A0F1A 100%)',
              borderRadius: '24px',
              padding: '3.5rem',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: '480px'
            }}
          >
            {/* Background elements to match the "swirl" and dynamic image */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
               <img src={bannerImg} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.25, mixBlendMode: 'luminosity' }} alt="" />
               <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #0A0F1A 40%, transparent 100%)' }} />
               <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, #0A0F1A 10%, transparent 50%)' }} />
               
               {/* Colorful glows reproducing the swirl */}
               <div className="pulse-blob" style={{ position: 'absolute', top: '10%', right: '15%', width: '300px', height: '300px', background: '#e11d48', filter: 'blur(90px)', borderRadius: '50%' }} />
               <div className="pulse-blob" style={{ position: 'absolute', bottom: '10%', right: '5%', width: '250px', height: '250px', background: '#4f46e5', filter: 'blur(90px)', borderRadius: '50%', animationDelay: '2s' }} />
               <div className="pulse-blob" style={{ position: 'absolute', top: '40%', right: '25%', width: '150px', height: '150px', background: '#d946ef', filter: 'blur(70px)', borderRadius: '50%', animationDelay: '1s' }} />
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                 <div style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.12em', color: '#f8fafc' }}>
                    DASHBOARD OVERVIEW
                 </div>
                 <div style={{ background: '#CA8A04', color: '#0F1523', padding: '4px 14px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                    ALUMNI
                 </div>
              </div>
              
              <h1 style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1.1, margin: '0 0 1.5rem', color: '#fff', letterSpacing: '-0.02em' }}>
                 Welcome back,<br/>
                 <span style={{ 
                   background: 'linear-gradient(to right, #ef4444, #dc2626)', 
                   WebkitBackgroundClip: 'text', 
                   WebkitTextFillColor: 'transparent',
                   textTransform: 'capitalize'
                 }}>
                   {user ? user.full_name.split(' ')[0] : 'Amina'}
                 </span>
              </h1>
              
              <p style={{ color: '#cbd5e1', fontSize: '1.25rem', maxWidth: '440px', lineHeight: 1.6, marginBottom: '3rem', fontWeight: 500 }}>
                 Your alumni network is growing. Check out the latest updates and opportunities from classmates.
              </p>
              
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(239, 68, 68, 0.4)', 
                  color: '#fff', 
                  padding: '14px 28px', 
                  borderRadius: '12px', 
                  fontSize: '1rem', 
                  fontWeight: 700, 
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.2), inset 0 0 10px rgba(239, 68, 68, 0.1)', 
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)'
                }}
              >
                 Check Updates
              </motion.button>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: Events & News */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* FEATURED EVENTS */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              style={{ 
                background: 'linear-gradient(180deg, #172133 0%, #101726 100%)', 
                borderRadius: '24px', 
                padding: '2rem', 
                border: '1px solid rgba(255,255,255,0.06)', 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column'
              }}
            >
               <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '12px', borderRadius: '16px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)', color: '#C084FC' }}>
                     <Calendar size={28} />
                  </div>
                  <div>
                     <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '4px' }}>CALENDAR</div>
                     <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Featured Network Events</h2>
                  </div>
               </div>
               
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', flex: 1 }}>
                  {events.slice(0, 2).map((event, i) => (
                     <div key={i} style={{ 
                       background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)', 
                       borderRadius: '20px', 
                       padding: '1.5rem', 
                       display: 'flex', 
                       flexDirection: 'column', 
                       justifyContent: 'space-between', 
                       border: '1px solid rgba(255,255,255,0.06)', 
                       position: 'relative', 
                       overflow: 'hidden' 
                     }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: event.color === '#0F172A' ? '#ef4444' : event.color, opacity: 0.15, filter: 'blur(30px)', borderRadius: '50%' }} />
                        
                        <div style={{ position: 'relative', zIndex: 1 }}>
                           <div style={{ 
                             background: 'linear-gradient(135deg, #CA8A04, #A16207)', 
                             width: 'max-content',
                             borderRadius: '12px', 
                             padding: '8px 12px', 
                             textAlign: 'center', 
                             marginBottom: '1.5rem', 
                             boxShadow: '0 8px 16px rgba(202, 138, 4, 0.2)',
                             border: '1px solid rgba(255,255,255,0.1)'
                           }}>
                              <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#FEFCE8' }}>{event.date.split(' ')[0].toUpperCase()}</div>
                              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FEFCE8', lineHeight: 1, marginTop: '2px' }}>{event.date.split(' ')[1]}</div>
                           </div>
                           
                           <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.8rem', color: '#fff', lineHeight: 1.3 }}>{event.title}</h3>
                           
                           <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600, marginBottom: '1rem' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={14} /> {event.time}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Users size={14} /> {event.attendees}+ Joined</span>
                           </div>
                           
                           <p style={{ fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              Join us for our annual signature event with exclusive insights from industry leaders and exceptional networking.
                           </p>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', position: 'relative', zIndex: 1 }}>
                           <div style={{ display: 'flex' }}>
                              {[1,2,3].map(n => <img key={n} src={`https://i.pravatar.cc/150?img=${n+15}`} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #1E293B', marginLeft: n!==1 ? '-10px' : 0 }} alt="usr" />)}
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#334155', border: '2px solid #1E293B', marginLeft: '-10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff' }}>+12</div>
                           </div>
                           <button className="btn-premium" style={{ background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.6)', color: '#fff', padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700 }}>
                             Secure Spot
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </motion.div>

            {/* GLOBAL ALUMNI NEWS */}
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               style={{ 
                 background: 'linear-gradient(180deg, #172133 0%, #101726 100%)', 
                 borderRadius: '24px', 
                 padding: '2rem', 
                 border: '1px solid rgba(255,255,255,0.06)' 
               }}
            >
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Global Alumni News</h2>
                  <span style={{ fontSize: '0.9rem', color: '#cbd5e1', cursor: 'pointer', borderBottom: '1px solid rgba(203, 213, 225, 0.4)', paddingBottom: '2px', fontWeight: 600 }}>View all stories</span>
               </div>
               
               <div style={{ background: 'rgba(30, 41, 59, 0.4)', borderRadius: '20px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', marginBottom: '1.2rem' }}>
                     <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444, #991b1b)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)' }}>
                        NA
                     </div>
                     <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>NeST Alumni Association</div>
                        <div style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 500 }}>Official Network Portal • 2h ago</div>
                     </div>
                  </div>
                  <p style={{ margin: '0 0 1.2rem', color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    We are thrilled to announce the upcoming Global Alumni Meet 2026. Join us in celebrating a decade of engineering excellence! Register now in the Events tab to secure your spot. <span style={{ color: '#ef4444', fontWeight: 600 }}>#NeSTAlumni #TechLeadership</span>
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.2rem' }}>
                     <div style={{ display: 'flex', gap: '1.2rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#CA8A04', fontWeight: 600 }}><ShieldCheck size={16} /> Verified Archive</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}><Sparkles size={16} /> Alumni Story</span>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600 }}>
                        <Heart size={16} color="transparent" style={{ stroke: '#cbd5e1', strokeWidth: 2 }} /> 342
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        </div>

        {/* REST OF SECTIONS (Jobs, Courses) - Adapted to Dark Theme */}
        
        {/* 1. RECOMMENDED JOBS */}
        <motion.section 
          variants={sectionVariants} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-10%" }}
          style={{ marginBottom: '2rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '10px', borderRadius: '14px', display: 'flex' }}>
                  <Briefcase size={22} color="#ef4444" />
                </div>
                <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>Opportunities</h2>
             </div>
             <button onClick={() => navigate('/jobs')} className="btn-premium" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontWeight: 700, padding: '10px 24px', borderRadius: '999px', fontSize: '0.95rem' }}>
                Explore All
             </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
             {jobs.slice(0, 3).map((job, i) => (
                <motion.div 
                   key={i}
                   variants={itemVariants}
                   onClick={() => setSelectedJob(job)}
                   className="luxury-card btn-premium"
                   style={{ height: '220px', padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                >
                   <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                      <img src={job.backgroundImage || architectBg} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.15, mixBlendMode: 'luminosity' }} alt="" />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 21, 35, 1) 10%, transparent 100%)' }} />
                   </div>
                   
                   <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '6px 14px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                        NeST Internal
                      </span>
                   </div>
                   
                   <div style={{ position: 'relative', zIndex: 1 }}>
                      <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{job.title}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Users size={14} color="#ef4444" /> {job.company}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <MapPin size={14} color="#ef4444" /> {job.location}
                        </span>
                      </div>
                   </div>
                </motion.div>
             ))}
          </div>
        </motion.section>

        {/* 2. ADVANCED LEARNING */}
        <motion.section 
          variants={sectionVariants} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: "-10%" }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '10px', borderRadius: '14px', display: 'flex' }}>
                  <Award size={22} color="#3b82f6" />
                </div>
                <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>Advanced Learning</h2>
              </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {courses.length === 0 ? (
                <p style={{ color: '#94A3B8', fontSize: '1rem' }}>Curating elite masterclasses...</p>
              ) : courses.slice(0, 3).map((course, i) => (
                  <motion.div key={course.id || i} variants={itemVariants} className="luxury-card btn-premium" style={{ cursor: 'pointer' }} onClick={() => navigate(`/learning/course/${course.id}`)}>
                    <div style={{ height: '140px', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 21, 35, 0.8))', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={48} color="white" style={{ opacity: 0.1 }} />
                      </div>
                      <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: '999px', color: 'white', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>
                        {course.level || 'Mastery'}
                      </div>
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>{course.title}</h4>
                        <p style={{ margin: '0 0 1.2rem', fontSize: '0.85rem', color: '#94A3B8', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.2rem' }}>
                          <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={14} color="#3b82f6" /> {course.duration || 'Flexible'}</span>
                          <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>Start <ArrowRight size={14} /></span>
                        </div>
                    </div>
                  </motion.div>
              ))}
          </div>
        </motion.section>

        <div style={{ paddingBottom: '4rem' }} />
      </div>

      {/* MODAL OVERLAY FOR JOBS */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'rgba(5, 10, 25, 0.8)', backdropFilter: 'blur(20px)' }}
            onClick={() => setSelectedJob(null)}
          >
            <motion.div 
              style={{ width: '100%', maxWidth: '1200px', height: '80vh', background: '#0F1523', borderRadius: '32px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.08)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={selectedJob.backgroundImage || architectBg} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3, mixBlendMode: 'luminosity' }} alt="" />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 21, 35, 1) 40%, transparent 100%)' }} />
              
              <div style={{ position: 'relative', zIndex: 10, padding: '4rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <motion.button 
                  whileHover={{ scale: 1.1, background: '#ef4444', borderColor: '#ef4444' }}
                  style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}
                  onClick={() => setSelectedJob(null)}
                >
                  <X size={20} />
                </motion.button>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                   <span style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 20px', borderRadius: '99px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem' }}>Elite Network</span>
                </div>
                
                <h2 style={{ fontSize: '4rem', fontWeight: 900, color: '#fff', margin: '0 0 1.5rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>{selectedJob.title}</h2>
                
                <div style={{ display: 'flex', gap: '3rem', fontSize: '1.1rem', color: '#cbd5e1', fontWeight: 600, marginBottom: '2rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Users size={20} color="#ef4444" /> {selectedJob.company}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><MapPin size={20} color="#ef4444" /> {selectedJob.location}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Briefcase size={20} color="#ef4444" /> Leadership Track</span>
                </div>
                
                <p style={{ fontSize: '1.2rem', color: '#94A3B8', lineHeight: 1.6, maxWidth: '800px', fontWeight: 500, margin: '0 0 3rem' }}>Join NeST Digital's top-tier engineering taskforce. We are looking for visionaries to lead our next generation of distributed systems and industrial automation frameworks.</p>
                
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(`/jobs/${selectedJob.id}`)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '1.2rem 3rem', borderRadius: '16px', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(239, 68, 68, 0.3)' }}>Apply for Opportunity</motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSelectedJob(null)} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '1.2rem 2rem', borderRadius: '16px', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>Close Detail</motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
"""

with codecs.open('c:\\Users\\noble.sibi\\Downloads\\alumni_portal_NeST\\src\\pages\\Dashboard.tsx', 'w', 'utf-8') as f:
    f.write(prefix + new_return)
