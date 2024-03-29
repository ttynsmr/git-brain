const fs = require('fs');
const path = require('path');
const { Level } = require('level');

async function open(file) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  global.db = new Level(file);
  await global.db.open();
  return fs.existsSync(file);
}

async function close() {
  await global.db.close();
}

async function store(key, value) {
  await global.db.put(key, JSON.stringify(value));
}

async function load(key) {
  try {
    return JSON.parse(await global.db.get(key));
  } catch (err) {
    return null;
  }
}

async function* list() {
  // eslint-disable-next-line no-restricted-syntax
  for await (const data of global.db.createReadStream()) {
    yield data;
  }
}

module.exports = {
  open,
  close,
  store,
  load,
  list,
};
