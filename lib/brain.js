const fs = require('fs');
const path = require('path');
const level = require('level');

async function open(file) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  global.db = level(file);
  await global.db.open();
  return fs.existsSync(file);
}

async function close(file) {
  await global.db.close();
}

async function store(key, value) {
  await global.db.put(key, JSON.stringify(value));
}

async function load(key) {
  return JSON.parse(await global.db.get(key));
}

module.exports = {
  open,
  store,
  load,
};
