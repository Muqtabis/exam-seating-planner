const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

let rooms = [];
let students = [];
let seatingPlan = [];
let nextRoomId = 1;
let nextStudentId = 1;

// ---------- ROOMS ----------
app.get('/api/rooms', (req, res) => res.json(rooms));

app.post('/api/rooms', (req, res) => {
  const { name, rows, cols } = req.body;
  const r = Number(rows), c = Number(cols);
  if (!name || !r || !c || r < 1 || c < 1) {
    return res.status(400).json({ error: 'name, rows and cols (>=1) are required' });
  }
  const room = { id: nextRoomId++, name: name.trim(), rows: r, cols: c };
  rooms.push(room);
  res.json(room);
});

app.delete('/api/rooms/:id', (req, res) => {
  rooms = rooms.filter((r) => r.id !== Number(req.params.id));
  res.json({ ok: true });
});

app.delete('/api/rooms', (req, res) => {
  rooms = [];
  res.json({ ok: true });
});

// ---------- STUDENTS ----------
app.get('/api/students', (req, res) => res.json(students));

// Accepts newline-separated "rollNo, name, className" rows
app.post('/api/students/csv', (req, res) => {
  const { csv } = req.body;
  if (!csv || !csv.trim()) return res.status(400).json({ error: 'csv text is required' });
  const lines = csv.split('\n').map((l) => l.trim()).filter(Boolean);
  let added = 0;
  for (const line of lines) {
    const parts = line.split(',').map((s) => (s || '').trim());
    const [rollNo, name, className] = parts;
    if (!rollNo || !name || !className) continue;
    students.push({ id: nextStudentId++, rollNo, name, className });
    added++;
  }
  res.json({ added, total: students.length, students });
});

app.delete('/api/students', (req, res) => {
  students = [];
  res.json({ ok: true });
});

// ---------- SEATING ALGORITHM ----------
// Interleaves students across classes so that, wherever the class mix allows it,
// no two consecutively-seated students share a class (reduces easy copying).
function interleaveByClass(list) {
  const groups = {};
  for (const s of list) (groups[s.className] ||= []).push(s);
  const buckets = Object.values(groups).map((arr) => ({ arr, i: 0 }));
  const result = [];
  let lastClass = null;

  while (result.length < list.length) {
    buckets.sort((a, b) => (b.arr.length - b.i) - (a.arr.length - a.i));
    let chosen = buckets.find(
      (b) => b.i < b.arr.length &&
        (b.arr[b.i].className !== lastClass ||
          !buckets.some((o) => o !== b && o.i < o.arr.length))
    );
    if (!chosen) chosen = buckets.find((b) => b.i < b.arr.length);
    const student = chosen.arr[chosen.i++];
    result.push(student);
    lastClass = student.className;
  }
  return result;
}

app.post('/api/generate', (req, res) => {
  if (rooms.length === 0) return res.status(400).json({ error: 'Add at least one room first' });
  if (students.length === 0) return res.status(400).json({ error: 'Add at least one student first' });

  const capacity = rooms.reduce((sum, r) => sum + r.rows * r.cols, 0);
  if (students.length > capacity) {
    return res.status(400).json({
      error: `Not enough seats: ${students.length} students but only ${capacity} seats across all rooms`,
    });
  }

  const ordered = interleaveByClass(students);
  let idx = 0;
  const plan = rooms.map((room) => {
    const grid = Array.from({ length: room.rows }, () => Array(room.cols).fill(null));
    for (let r = 0; r < room.rows; r++) {
      for (let c = 0; c < room.cols; c++) {
        if (idx < ordered.length) grid[r][c] = ordered[idx++];
      }
    }
    return { roomId: room.id, roomName: room.name, rows: room.rows, cols: room.cols, grid };
  });

  seatingPlan = plan;
  res.json(plan);
});

app.get('/api/seating', (req, res) => res.json(seatingPlan));

app.get('/api/export/csv', (req, res) => {
  let csv = 'Room,Row,Column,RollNo,Name,Class\n';
  for (const room of seatingPlan) {
    for (let r = 0; r < room.rows; r++) {
      for (let c = 0; c < room.cols; c++) {
        const s = room.grid[r][c];
        if (s) csv += `${room.roomName},${r + 1},${c + 1},${s.rollNo},${s.name},${s.className}\n`;
      }
    }
  }
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="seating-plan.csv"');
  res.send(csv);
});

app.post('/api/reset', (req, res) => {
  rooms = [];
  students = [];
  seatingPlan = [];
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Seating planner API running on http://localhost:${PORT}`));
