/* eslint-disable no-undef */
const ms = require('memory-streams');
const { cleanFilter } = require('./gb_clean');

describe('clean filter actual file', () => {
  function createTestActualFile() {}

  function removeTestActualFile() {}

  beforeEach(() => {
    createTestActualFile();
  });

  afterEach(() => {
    removeTestActualFile();
  });

  test('file stream', async () => {
    const reader = new ms.ReadableStream();
    reader.push('for example 222');
    const writer = new ms.WritableStream();
    const pointer = await cleanFilter(reader, writer);
    expect(pointer).toBeTruthy();
    expect(pointer.size).toBe(15);
    expect(pointer.oid).toBe('40a9ef7b88be7becfc0f503a712ccc82db446943d9cce6dc684a67cbc4cd18d6');
    const pointerString = pointer.toPointerString();
    const out = writer.toString();
    expect(out).toBe(pointerString);
    expect(pointerString).toMatchSnapshot();
    expect(out).toMatchSnapshot();
  });
});
