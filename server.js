// server.js - Express API + SQLite (better-sqlite3)
const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_API_KEY || 'change_me_to_a_strong_key';

app.use(cors());
app.use(express.json());
// Serve frontend static files from /public
app.use(express.static(path.join(__dirname, 'public')));

function requireAdmin(req, res, next){
  const key = req.headers['x-api-key'] || req.query.api_key;
  if(!key || key !== ADMIN_KEY) return res.status(401).json({error:'Unauthorized'});
  next();
}

// API: list tournaments
app.get('/api/tournaments', (req, res)=>{
  const rows = db.prepare('SELECT id,name,date,slots,prize,bracket FROM tournaments ORDER BY date').all();
  const out = rows.map(r=>({ ...r, bracket: r.bracket ? JSON.parse(r.bracket) : [] }));
  res.json(out);
});

// API: create tournament (admin)
app.post('/api/tournaments', requireAdmin, (req, res)=>{
  const { id, name, date, slots, prize, bracket } = req.body;
  if(!id || !name) return res.status(400).json({error:'Missing id or name'});
  db.prepare('INSERT INTO tournaments(id,name,date,slots,prize,bracket) VALUES(?,?,?,?,?,?)')
    .run(id,name,date||'',slots||16,prize||'', JSON.stringify(bracket||[]));
  res.json({ok:true});
});

// API: register
app.post('/api/registrations', (req, res)=>{
  const { tournamentId, teamName, captain, players, contact } = req.body;
  if(!tournamentId || !teamName) return res.status(400).json({error:'Missing fields'});
  const id = 'r_'+Date.now();
  const ts = new Date().toISOString();
  db.prepare('INSERT INTO registrations(id,tournamentId,teamName,captain,players,contact,ts) VALUES(?,?,?,?,?,?,?)')
    .run(id,tournamentId,teamName,captain||'',players||1,contact||'',ts);
  res.json({ok:true, id});
});

// API: list registrations (admin)
app.get('/api/registrations', requireAdmin, (req, res)=>{
  const rows = db.prepare('SELECT * FROM registrations ORDER BY ts DESC').all();
  res.json(rows);
});

// API: clear registrations (admin)
app.delete('/api/registrations', requireAdmin, (req, res)=>{
  db.prepare('DELETE FROM registrations').run();
  res.json({ok:true});
});

// API: export CSV (admin)
app.get('/api/export', requireAdmin, (req, res)=>{
  const rows = db.prepare('SELECT * FROM registrations ORDER BY ts DESC').all();
  const header = ['id','tournamentId','teamName','captain','players','contact','ts'];
  const lines = [header.join(',')];
  for(const r of rows){
    const row = [r.id,r.tournamentId,`"${r.teamName.replace(/"/g,'""')}"`,`"${(r.captain||'').replace(/"/g,'""')}"`,r.players,`"${(r.contact||'').replace(/"/g,'""')}"`,r.ts];
    lines.push(row.join(','));
  }
  const csv = lines.join('\n');
  res.setHeader('Content-Type','text/csv');
  res.setHeader('Content-Disposition','attachment; filename="inscriptions.csv"');
  res.send(csv);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ok:true, uptime: process.uptime(), time: new Date().toISOString()});
});

// fallback to index for SPA routes
app.get('*', (req, res)=>{
  res.sendFile(path.join(__dirname,'public','index.html'));
});

app.listen(PORT, ()=>{
  console.log(`Server listening on port ${PORT}`);
});
