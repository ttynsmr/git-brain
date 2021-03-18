const { cleanFilter } = require('./gb_clean');
const fs = require('fs');

describe('clean filter actual file', () => {
  function createTestActualFile() {
    fs.writeFileSync('.test.in', 'for example 222');
  }

  function removeTestActualFile() {
    try {
      fs.unlinkSync('.test.in');
    } catch (err) {}
    try {
      fs.unlinkSync('.test.out');
    } catch (err) {}
  }

  beforeEach(() => {
    createTestActualFile();
  });

  afterEach(() => {
    removeTestActualFile();
  });

  test('file stream', async () => {
    const reader = fs.createReadStream('.test.in', 'utf8');
    const writer = fs.createWriteStream('.test.out', 'utf8');
    await cleanFilter(reader, writer);
    let out = fs.readFileSync('.test.out', { encoding: 'utf8' });
    expect(out).toMatchSnapshot();
  });
});
