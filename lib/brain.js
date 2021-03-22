const fs = require('fs');
const path = require('path');
const level = require('level');

let db;

async function open(file) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  db = level(file);
  return fs.existsSync(file);
}

async function store(key, value) {
  db.set(key, JSON.stringify(value));
}

async function load(key) {
  return JSON.parse(db.get(key));
}

module.exports = {
  open,
  store,
  load,
};
