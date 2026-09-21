import { useState } from 'react';

const STEPS = [
  { id: 'Classes', title: 'Step 1: Add Classes' },
  { id: 'Rooms', title: 'Step 2: Add Rooms' },
  { id: 'Plan', title: 'Step 3: Generate & Print' }
];

// High contrast pastel colors for easy reading and ink-saving printing
const PALETTE = ['#dbeafe', '#d1fae5', '#fef3c7', '#fee2e2', '#f3e8ff', '#ccfbf1'];

export default function App() {
  const [activeStep, setActiveStep] = useState('Classes');
  
  const [classes, setClasses] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [plan, setPlan] = useState([]);
  const [error, setError] = useState('');

  const [classForm, setClassForm] = useState({ name: '', prefix: '', count: 30 });
  const [roomForm, setRoomForm] = useState({ name: '', rows: 5, cols: 4, studentsPerBench: 2 });

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
    setRoomForm({ name: '', rows: 5, cols: 4, studentsPerBench: 2 });
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
  };

  const getClassColor = (className) => {
    const idx = classes.findIndex(c => c.name === className);
    return PALETTE[idx % PALETTE.length];
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Arial, sans-serif', color: '#000' }}>
      
      <style>{`
        body { background-color: #fdfdfc; }
        * { box-sizing: border-box; }
        
        .input-field {
          width: 100%; padding: 12px; font-size: 16px;
          border: 1px solid #888; border-radius: 4px; margin-top: 6px;
        }
        .input-field:focus { border-color: #000; outline: none; box-shadow: 0 0 0 2px rgba(0,0,0,0.1); }
        
        .form-label { font-weight: bold; font-size: 15px; display: block; margin-top: 15px; }
        .help-text { font-size: 13px; color: #555; display: block; margin-top: 4px; }
        
        .primary-btn {
          background: #000; color: #fff; border: none; padding: 14px 28px;
          font-size: 16px; font-weight: bold; border-radius: 4px; cursor: pointer; margin-top: 20px;
        }
        .primary-btn:hover { background: #333; }

        @media print {
          body { background: #fff; }
          .no-print { display: none !important; }
          .page-break { page-break-after: always; }
          @page { margin: 0.5in; }
        }
      `}</style>

      <header className="no-print" style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #000', paddingBottom: '20px' }}>
        <h1 style={{ fontSize: '32px', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>Exam Seating Planner</h1>
        <p style={{ fontSize: '18px', color: '#444', margin: 0 }}>Follow the 3 steps below to generate the seating chart.</p>
      </header>

      <nav className="no-print" style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        {STEPS.map(step => (
          <button 
            key={step.id} 
            onClick={() => setActiveStep(step.id)}
            style={{ 
              flex: 1, padding: '16px', border: '2px solid #000', cursor: 'pointer',
              backgroundColor: activeStep === step.id ? '#000' : '#fff',
              color: activeStep === step.id ? '#fff' : '#000',
              fontSize: '18px', fontWeight: 'bold'
            }}
          >
            {step.title}
          </button>
        ))}
      </nav>

      {error && (
        <div className="no-print" style={{ background: '#ffeeee', border: '2px solid #cc0000', color: '#cc0000', padding: '16px', marginBottom: '30px', fontWeight: 'bold', fontSize: '18px' }}>
          Error: {error}
        </div>
      )}

      <main>
        {activeStep === 'Classes' && (
          <section className="no-print">
            <div style={{ background: '#f9f9f9', border: '1px solid #ccc', padding: '30px', marginBottom: '40px', borderRadius: '8px' }}>
              <h2 style={{ marginTop: 0, borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>Add a Class</h2>
              
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 250px' }}>
                  <label className="form-label">Class Name</label>
                  <input className="input-field" value={classForm.name} onChange={e => setClassForm({...classForm, name: e.target.value})} />
                  <span className="help-text">Example: 10th Grade Sec A</span>
                </div>

                <div style={{ flex: '1 1 200px' }}>
                  <label className="form-label">Roll Number Prefix (Optional)</label>
                  <input className="input-field" value={classForm.prefix} onChange={e => setClassForm({...classForm, prefix: e.target.value})} />
                  <span className="help-text">Example: CS-</span>
                </div>

                <div style={{ flex: '0 1 150px' }}>
                  <label className="form-label">Total Students</label>
                  <input className="input-field" type="number" min="1" value={classForm.count} onChange={e => setClassForm({...classForm, count: Number(e.target.value)})} />
                  <span className="help-text">Total taking the exam</span>
                </div>
              </div>

              <button className="primary-btn" onClick={addClass}>+ Add Class</button>
            </div>

            <h2>Added Classes</h2>
            {classes.length === 0 ? <p style={{ color: '#666' }}>No classes added yet.</p> : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {classes.map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#fff', border: '2px solid #000', borderRadius: '8px' }}>
                    <div style={{ fontSize: '18px' }}>
                      <strong>{c.name}</strong> 
                      <span style={{ color: '#555', marginLeft: '15px' }}>Total Students: {c.count} (Rolls: {c.prefix}1 to {c.prefix}{c.count})</span>
                    </div>
                    <button onClick={() => deleteClass(c.id)} style={{ background: '#fff', border: '2px solid #cc0000', color: '#cc0000', padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>Remove</button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeStep === 'Rooms' && (
          <section className="no-print">
            <div style={{ background: '#f9f9f9', border: '1px solid #ccc', padding: '30px', marginBottom: '40px', borderRadius: '8px' }}>
              <h2 style={{ marginTop: 0, borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>Add an Exam Room</h2>
              
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 250px' }}>
                  <label className="form-label">Room Name</label>
                  <input className="input-field" value={roomForm.name} onChange={e => setRoomForm({...roomForm, name: e.target.value})} />
                  <span className="help-text">Example: Room 104</span>
                </div>

                <div style={{ flex: '0 1 120px' }}>
                  <label className="form-label">Rows</label>
                  <input className="input-field" type="number" min="1" value={roomForm.rows} onChange={e => setRoomForm({...roomForm, rows: Number(e.target.value)})} />
                  <span className="help-text">Horizontal rows</span>
                </div>

                <div style={{ flex: '0 1 120px' }}>
                  <label className="form-label">Columns</label>
                  <input className="input-field" type="number" min="1" value={roomForm.cols} onChange={e => setRoomForm({...roomForm, cols: Number(e.target.value)})} />
                  <span className="help-text">Desks per row</span>
                </div>

                <div style={{ flex: '0 1 150px' }}>
                  <label className="form-label">Seats / Desk</label>
                  <input className="input-field" type="number" min="1" value={roomForm.studentsPerBench} onChange={e => setRoomForm({...roomForm, studentsPerBench: Number(e.target.value)})} />
                  <span className="help-text">Students per desk</span>
                </div>
              </div>

              <button className="primary-btn" onClick={addRoom}>+ Add Room</button>
            </div>

            <h2>Added Rooms</h2>
            {rooms.length === 0 ? <p style={{ color: '#666' }}>No rooms added yet.</p> : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {rooms.map(r => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#fff', border: '2px solid #000', borderRadius: '8px' }}>
                    <div style={{ fontSize: '18px' }}>
                      <strong>{r.name}</strong> 
                      <span style={{ color: '#555', marginLeft: '15px' }}>{r.rows} rows × {r.cols} columns. <strong>Total Capacity: {r.rows * r.cols * r.studentsPerBench}</strong></span>
                    </div>
                    <button onClick={() => deleteRoom(r.id)} style={{ background: '#fff', border: '2px solid #cc0000', color: '#cc0000', padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>Remove</button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeStep === 'Plan' && (
          <section>
            <div className="no-print" style={{ textAlign: 'center', padding: '40px', background: '#f9f9f9', border: '1px solid #ccc', marginBottom: '40px', borderRadius: '8px' }}>
              <h2 style={{ marginTop: 0 }}>Final Step: Generate Chart</h2>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
                <button className="primary-btn" style={{ margin: 0 }} onClick={generateSeating}>Create Seating Plan</button>
                {plan.length > 0 && (
                  <button className="primary-btn" style={{ background: '#15803d', margin: 0 }} onClick={() => window.print()}>Print / Save as PDF</button>
                )}
              </div>
            </div>

            {/* --- PRINTABLE CHART --- */}
            {plan.length > 0 && (
              <div>
                {plan.map((room, index) => (
                  <div key={room.id} className="page-break" style={{ marginBottom: '60px' }}>
                    
                    {/* Header */}
                    <div style={{ borderBottom: '4px solid #000', paddingBottom: '15px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>Official Seating Chart</div>
                        <h2 style={{ margin: '5px 0 0 0', fontSize: '36px', color: '#000' }}>{room.name}</h2>
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                        Page {index + 1} of {plan.length}
                      </div>
                    </div>
                    
                    {/* Front of Room Indicator */}
                    <div style={{ 
                      textAlign: 'center', background: '#e5e7eb', padding: '10px', 
                      fontWeight: 'bold', letterSpacing: '3px', marginBottom: '30px',
                      border: '2px solid #000', borderRadius: '4px'
                    }}>
                      FRONT OF CLASSROOM (BOARD)
                    </div>

                    {/* True Physical Grid Layout */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: `repeat(${room.cols}, 1fr)`, 
                      gap: '20px' 
                    }}>
                      {room.layout.flatMap((row, rIdx) => 
                        row.map((desk, cIdx) => (
                          
                          /* A Single Desk */
                          <div key={`${rIdx}-${cIdx}`} style={{ border: '3px solid #000', borderRadius: '8px', overflow: 'hidden', pageBreakInside: 'avoid' }}>
                            
                            {/* Desk Coordinate Label */}
                            <div style={{ background: '#000', color: '#fff', textAlign: 'center', padding: '8px', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                              Row {rIdx + 1} &bull; Col {cIdx + 1}
                            </div>
                            
                            {/* Seats on the Desk */}
                            <div style={{ display: 'flex', padding: '10px', gap: '10px', background: '#fff' }}>
                              {desk.map((student, sIdx) => (
                                <div 
                                  key={sIdx} 
                                  style={{
                                    flex: 1, padding: '15px 10px', textAlign: 'center', borderRadius: '4px',
                                    border: student ? '2px solid #000' : '2px dashed #aaa',
                                    backgroundColor: student ? getClassColor(student.className) : '#fafafa'
                                  }}
                                >
                                  {student ? (
                                    <>
                                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>{student.className}</div>
                                      <div style={{ fontSize: '20px', fontWeight: '900', color: '#000' }}>{student.rollNo}</div>
                                    </>
                                  ) : (
                                    <span style={{ fontSize: '14px', color: '#888' }}>Empty</span>
                                  )}
                                </div>
                              ))}
                            </div>

                          </div>
                        ))
                      )}
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