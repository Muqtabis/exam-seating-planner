import { useState } from 'react';

const STEPS = [
  { id: 'Classes', title: 'Step 1: Add Classes' },
  { id: 'Rooms', title: 'Step 2: Add Rooms' },
  { id: 'Plan', title: 'Step 3: Generate & Print' }
];

const PALETTE = ['#e0f2fe', '#dcfce7', '#fef9c3', '#fee2e2', '#f3e8ff', '#ffedd5', '#f1f5f9'];

export default function App() {
  const [activeStep, setActiveStep] = useState('Classes');
  
  const [classes, setClasses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [plan, setPlan] = useState([]);
  const [error, setError] = useState('');

  const [classForm, setClassForm] = useState({ name: '', prefix: '', count: 30 });
  const [roomForm, setRoomForm] = useState({ name: '', rows: 5, cols: 6, studentsPerBench: 2 });

  const addClass = () => {
    if (!classForm.name || classForm.count <= 0) return setError('Please enter a class name and valid student count.');
    setClasses([...classes, { ...classForm, id: Date.now() }]);
    setClassForm({ name: '', prefix: '', count: 30 });
    setError('');
  };

  const deleteClass = (id) => setClasses(classes.filter(c => c.id !== id));

  const addRoom = () => {
    if (!roomForm.name || roomForm.rows <= 0 || roomForm.cols <= 0 || roomForm.studentsPerBench <= 0) {
      return setError('Please enter valid room details.');
    }
    setRooms([...rooms, { ...roomForm, id: Date.now() }]);
    setRoomForm({ name: '', rows: 5, cols: 6, studentsPerBench: 2 });
    setError('');
  };

  const deleteRoom = (id) => setRooms(rooms.filter(r => r.id !== id));

  const generateSeating = () => {
    setError('');
    if (classes.length === 0) return setError('You must add at least one class in Step 1.');
    if (rooms.length === 0) return setError('You must add at least one room in Step 2.');

    const studentPools = classes.map(cls => {
      const students = [];
      for (let i = 1; i <= cls.count; i++) {
        students.push({ rollNo: cls.prefix ? `${cls.prefix}${i}` : `${i}`, className: cls.name });
      }
      return students;
    });

    let interleavedStudents = [];
    let studentsLeft = true;
    while (studentsLeft) {
      studentsLeft = false;
      for (let i = 0; i < studentPools.length; i++) {
        if (studentPools[i].length > 0) {
          interleavedStudents.push(studentPools[i].shift());
          studentsLeft = true;
        }
      }
    }

    let studentIdx = 0;
    const newPlan = rooms.map(room => {
      const layout = [];
      for (let r = 0; r < room.rows; r++) {
        const rowBenches = [];
        for (let c = 0; c < room.cols; c++) {
          const benchSeats = [];
          for (let s = 0; s < room.studentsPerBench; s++) {
            benchSeats.push(interleavedStudents[studentIdx++] || null);
          }
          rowBenches.push(benchSeats);
        }
        layout.push(rowBenches);
      }
      return { ...room, layout };
    });

    if (studentIdx < interleavedStudents.length) {
      setError(`Warning: Not enough room capacity! ${interleavedStudents.length - studentIdx} students are left without seats.`);
    }

    setPlan(newPlan);
    setActiveStep('Plan');
  };

  const getClassColor = (className) => {
    const idx = classes.findIndex(c => c.name === className);
    return PALETTE[idx % PALETTE.length];
  };

  return (
    <div className="app-wrapper">
      <style>{`
        :root {
          --primary: #2563eb;
          --primary-hover: #1d4ed8;
          --bg: #f8fafc;
          --surface: #ffffff;
          --border: #e2e8f0;
          --text-main: #0f172a;
          --text-muted: #64748b;
          --danger: #ef4444;
          --danger-bg: #fef2f2;
          --success: #10b981;
          --radius-md: 8px;
          --radius-lg: 12px;
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        body { 
          background-color: var(--bg); 
          color: var(--text-main);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          margin: 0;
          -webkit-font-smoothing: antialiased;
        }

        * { box-sizing: border-box; }

        .app-wrapper { max-width: 1040px; margin: 0 auto; padding: 24px 16px; }

        h1 { font-size: 2rem; font-weight: 700; margin: 0 0 8px; letter-spacing: -0.02em; text-align: center; }
        h2 { font-size: 1.25rem; font-weight: 600; margin: 0 0 20px; color: var(--text-main); }
        .subtitle { color: var(--text-muted); font-size: 1rem; margin: 0; text-align: center; }

        /* Steps Nav */
        .step-nav { display: flex; gap: 8px; margin: 32px 0; flex-wrap: wrap; }
        .step-btn {
          flex: 1; min-width: 120px; padding: 12px; font-size: 0.95rem; font-weight: 600; 
          border-radius: var(--radius-md); border: 1px solid transparent;
          cursor: pointer; transition: all 0.2s ease; text-align: center;
        }
        .step-btn.active { background: var(--surface); color: var(--primary); border-color: var(--primary); box-shadow: var(--shadow-sm); }
        .step-btn.inactive { background: var(--border); color: var(--text-muted); }

        /* Panels */
        .panel { 
          background: var(--surface); padding: 24px; border-radius: var(--radius-lg); 
          box-shadow: var(--shadow-md); border: 1px solid var(--border); margin-bottom: 32px; 
        }
        
        .item-card {
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
          padding: 16px; background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-md); margin-bottom: 12px; box-shadow: var(--shadow-sm);
        }

        /* Forms */
        .form-grid { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
        .input-group { display: flex; flex-direction: column; gap: 6px; }
        .input-label { font-size: 0.85rem; font-weight: 600; color: var(--text-main); }
        .input-field {
          padding: 10px 14px; font-size: 1rem; border: 1px solid #cbd5e1; 
          border-radius: var(--radius-md); outline: none; transition: border 0.2s;
        }
        .input-field:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15); }

        /* Buttons */
        .btn {
          padding: 10px 20px; font-size: 0.95rem; font-weight: 600; border-radius: var(--radius-md);
          cursor: pointer; border: none; transition: background 0.2s;
        }
        .btn-primary { background: var(--primary); color: white; }
        .btn-success { background: var(--success); color: white; display: inline-flex; align-items: center; gap: 8px; }
        .btn-danger-outline { background: var(--danger-bg); color: var(--danger); border: 1px solid #fca5a5; padding: 8px 16px; }

        .error-banner {
          background: var(--danger-bg); border-left: 4px solid var(--danger); color: #991b1b;
          padding: 16px; border-radius: 4px; margin-bottom: 24px; font-weight: 500; font-size: 0.95rem;
        }

        /* --- RESPONSIVE GRID STYLES --- */
        .print-header { border-bottom: 2px solid var(--border); padding-bottom: 16px; margin-bottom: 24px; }
        .print-title { font-size: 1.5rem; font-weight: 700; margin: 0; }
        .print-meta { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        
        .front-board {
          background: #f1f5f9; color: var(--text-muted); text-align: center; padding: 10px;
          border-radius: var(--radius-md); font-weight: 600; letter-spacing: 0.1em; font-size: 0.85rem;
          margin-bottom: 24px; border: 1px dashed #cbd5e1;
        }

        /* This wrapper allows swiping on mobile instead of squishing */
        .desk-grid-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 16px;
        }

        .desk-grid { 
          display: grid; 
          gap: 20px; 
          /* Forces grid to spread out based on content, not squish into screen */
          min-width: max-content; 
        }
        
        .desk { 
          border: 1px solid var(--border); border-radius: var(--radius-md); 
          background: #f8fafc; overflow: hidden; box-shadow: var(--shadow-sm); 
          min-width: 140px; /* Prevents desk from becoming a skinny vertical rectangle */
        }
        .desk-label { 
          background: #e2e8f0; color: #475569; text-align: center; padding: 8px; 
          font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; 
        }
        .seats-container { display: flex; padding: 10px; gap: 8px; background: white; }
        
        .seat {
          flex: 1; padding: 12px 6px; text-align: center; border-radius: 6px;
          border: 1px solid var(--border); display: flex; flex-direction: column; justify-content: center;
          min-width: 50px;
        }
        .seat-empty { border: 1px dashed #cbd5e1; background: #f8fafc; color: #94a3b8; font-size: 0.85rem; }
        
        .seat-class { 
          font-size: 0.7rem; font-weight: 700; color: var(--text-muted); margin-bottom: 4px; 
          text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .seat-roll { font-size: 1.15rem; font-weight: 800; color: var(--text-main); line-height: 1; }

        /* --- PRINT CSS: FORCES LANDSCAPE --- */
        @media print {
          @page { size: landscape; margin: 0.5in; } /* Landscape is crucial for many columns */
          body { background: white; }
          .no-print { display: none !important; }
          .page-break { page-break-after: always; margin-bottom: 0; }
          .app-wrapper { padding: 0; max-width: 100%; }
          
          /* Remove scrollbars and borders for clean paper printing */
          .desk-grid-wrapper { overflow-x: visible; padding-bottom: 0; }
          .desk-grid { min-width: 100%; gap: 12px; }
          .desk { min-width: 0; box-shadow: none; border-color: #94a3b8; break-inside: avoid; }
          .desk-label { background: #f1f5f9; border-bottom: 1px solid #94a3b8; color: #1e293b; padding: 4px; font-size: 0.65rem; }
          .seats-container { padding: 6px; gap: 6px; }
          .seat { border-color: #94a3b8; padding: 8px 4px; min-width: 0; }
          .seat-roll { font-size: 1.1rem; }
          .seat-class { font-size: 0.65rem; }
        }
      `}</style>

      <header className="no-print">
        <h1>Exam Seating Planner</h1>
        <p className="subtitle">Configure your classes and rooms to auto-generate a mixed seating chart.</p>
      </header>

      <nav className="step-nav no-print">
        {STEPS.map(step => (
          <button 
            key={step.id} 
            onClick={() => setActiveStep(step.id)}
            className={`step-btn ${activeStep === step.id ? 'active' : 'inactive'}`}
          >
            {step.title}
          </button>
        ))}
      </nav>

      {error && <div className="error-banner no-print">{error}</div>}

      <main>
        {activeStep === 'Classes' && (
          <section className="no-print">
            <div className="panel">
              <h2>Add a Class</h2>
              <div className="form-grid">
                <div className="input-group" style={{ flex: '1 1 200px' }}>
                  <label className="input-label">Class Name</label>
                  <input className="input-field" placeholder="e.g. 10th Grade Sec A" value={classForm.name} onChange={e => setClassForm({...classForm, name: e.target.value})} />
                </div>
                <div className="input-group" style={{ flex: '1 1 150px' }}>
                  <label className="input-label">Roll Prefix (Optional)</label>
                  <input className="input-field" placeholder="e.g. CS-" value={classForm.prefix} onChange={e => setClassForm({...classForm, prefix: e.target.value})} />
                </div>
                <div className="input-group" style={{ flex: '0 1 120px' }}>
                  <label className="input-label">Total Students</label>
                  <input className="input-field" type="number" min="1" value={classForm.count} onChange={e => setClassForm({...classForm, count: Number(e.target.value)})} />
                </div>
              </div>
              <button className="btn btn-primary" onClick={addClass}>+ Add Class</button>
            </div>

            <div>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Configured Classes</h3>
              {classes.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No classes added yet.</p> : (
                <div>
                  {classes.map(c => (
                    <div key={c.id} className="item-card">
                      <div>
                        <strong style={{ fontSize: '1.1rem' }}>{c.name}</strong> 
                        <span style={{ color: 'var(--text-muted)', marginLeft: '12px', fontSize: '0.9rem' }}>
                          {c.count} Students &bull; Series: {c.prefix}1 - {c.prefix}{c.count}
                        </span>
                      </div>
                      <button className="btn btn-danger-outline" onClick={() => deleteClass(c.id)}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {activeStep === 'Rooms' && (
          <section className="no-print">
            <div className="panel">
              <h2>Add an Exam Room</h2>
              <div className="form-grid">
                <div className="input-group" style={{ flex: '1 1 200px' }}>
                  <label className="input-label">Room Name</label>
                  <input className="input-field" placeholder="e.g. Hall A" value={roomForm.name} onChange={e => setRoomForm({...roomForm, name: e.target.value})} />
                </div>
                <div className="input-group" style={{ flex: '0 1 100px' }}>
                  <label className="input-label">Rows</label>
                  <input className="input-field" type="number" min="1" value={roomForm.rows} onChange={e => setRoomForm({...roomForm, rows: Number(e.target.value)})} />
                </div>
                <div className="input-group" style={{ flex: '0 1 100px' }}>
                  <label className="input-label">Columns</label>
                  <input className="input-field" type="number" min="1" value={roomForm.cols} onChange={e => setRoomForm({...roomForm, cols: Number(e.target.value)})} />
                </div>
                <div className="input-group" style={{ flex: '0 1 120px' }}>
                  <label className="input-label">Seats / Desk</label>
                  <input className="input-field" type="number" min="1" value={roomForm.studentsPerBench} onChange={e => setRoomForm({...roomForm, studentsPerBench: Number(e.target.value)})} />
                </div>
              </div>
              <button className="btn btn-primary" onClick={addRoom}>+ Add Room</button>
            </div>

            <div>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Configured Rooms</h3>
              {rooms.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No rooms added yet.</p> : (
                <div>
                  {rooms.map(r => (
                    <div key={r.id} className="item-card">
                      <div>
                        <strong style={{ fontSize: '1.1rem' }}>{r.name}</strong> 
                        <span style={{ color: 'var(--text-muted)', marginLeft: '12px', fontSize: '0.9rem' }}>
                          {r.rows} × {r.cols} layout &bull; <strong>Capacity: {r.rows * r.cols * r.studentsPerBench}</strong>
                        </span>
                      </div>
                      <button className="btn btn-danger-outline" onClick={() => deleteRoom(r.id)}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {activeStep === 'Plan' && (
          <section>
            <div className="panel no-print" style={{ textAlign: 'center' }}>
              <h2>Final Step: Generate Chart</h2>
              <p style={{ color: 'var(--text-muted)', margin: '0 0 24px 0' }}>Ensure your classes and rooms are correct, then click below to generate.</p>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={generateSeating}>Generate Layout</button>
                {plan.length > 0 && (
                  <button className="btn btn-success" onClick={() => window.print()}>
                    Print / Save PDF (Landscape)
                  </button>
                )}
              </div>
            </div>

            {plan.length > 0 && (
              <div>
                {plan.map((room, index) => (
                  <div key={room.id} className="page-break" style={{ marginBottom: '80px' }}>
                    
                    <div className="print-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <div className="print-meta">Official Seating Chart</div>
                        <h2 className="print-title">{room.name}</h2>
                      </div>
                      <div className="print-meta">Page {index + 1} of {plan.length}</div>
                    </div>
                    
                    <div className="front-board">FRONT OF CLASSROOM / BOARD</div>

                    {/* Wrapper handles mobile horizontal scrolling gracefully */}
                    <div className="desk-grid-wrapper">
                      <div className="desk-grid" style={{ gridTemplateColumns: `repeat(${room.cols}, 1fr)` }}>
                        {room.layout.flatMap((row, rIdx) => 
                          row.map((desk, cIdx) => (
                            <div key={`${rIdx}-${cIdx}`} className="desk">
                              <div className="desk-label">Row {rIdx + 1} &bull; Col {cIdx + 1}</div>
                              
                              <div className="seats-container">
                                {desk.map((student, sIdx) => (
                                  <div 
                                    key={sIdx} 
                                    className={`seat ${!student ? 'seat-empty' : ''}`}
                                    style={{ backgroundColor: student ? getClassColor(student.className) : undefined }}
                                  >
                                    {student ? (
                                      <>
                                        <div className="seat-class" title={student.className}>{student.className}</div>
                                        <div className="seat-roll">{student.rollNo}</div>
                                      </>
                                    ) : (
                                      <span>Empty</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
