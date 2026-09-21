# Exam Seating Planner

Full-stack app: React (Vite) frontend + Node/Express backend. Auto-generates a
seating chart across rooms so that, wherever possible, adjacent seats hold
students from different classes.

## Run it

**Backend** (port 4000):
```
cd backend
npm install
npm start
```

**Frontend** (port 5173, proxies /api to the backend):
```
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## How it works

1. **Rooms** tab — add each hall with its row/column count (capacity = rows × cols).
2. **Students** tab — paste one student per line as `rollNo, name, className`.
3. **Seating Plan** tab — click Generate. The backend interleaves students
   across classes (a round-robin scheduler) before filling seats row by row,
   so consecutive seats rarely share a class. Export as CSV or print directly.

All data is stored in memory on the backend — restarting the server clears it.
To persist data, swap the in-memory arrays in `backend/server.js` for a real
database.
