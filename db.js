// db.js - initialize SQLite database (better-sqlite3)
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Allow configurable DB path (useful for Render persistent disk)
const dataDir = process.env.DB_DIR ? path.resolve(process.env.DB_DIR) : path.join(__dirname,'data');
if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir,{recursive:true});
const dbPath = process.env.DB_PATH ? path.resolve(process.env.DB_PATH) : path.join(dataDir,'ff.db');
console.log('SQLite DB path:', dbPath);
const db = new Database(dbPath);

// create tables if not exists
db.prepare(`CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY,
  name TEXT,
  date TEXT,
  slots INTEGER,
  prize TEXT,
  bracket TEXT
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY,
  tournamentId TEXT,
  teamName TEXT,
  captain TEXT,
  players INTEGER,
  contact TEXT,
  ts TEXT
)`).run();

// seed sample tournaments if empty
const count = db.prepare('SELECT COUNT(*) as c FROM tournaments').get().c;
if(count === 0){
  const insert = db.prepare('INSERT INTO tournaments(id,name,date,slots,prize,bracket) VALUES(?,?,?,?,?,?)');
  insert.run('t1','FF Weekend Cup','2025-12-21',16,'300€', JSON.stringify([{a:'Alpha',b:'Bravo'},{a:'Charlie',b:'Delta'}]));
  insert.run('t2','Clash Royale Free Fire','2026-01-10',32,'500€', JSON.stringify([{a:'Echo',b:'Foxtrot'},{a:'Golf',b:'Hotel'}]));
}

module.exports = db;
