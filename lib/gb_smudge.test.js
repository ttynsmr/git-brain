const { Pointer } = require('./pointer');
const ms = require('memory-streams');
const { smudgeFilter, smudgeInputToPointer, smudgePointerToOutput } = require('./gb_smudge');

jest.mock('./gb_cache', () => ({
  hasFile: (pointer) => {
    return true;
  },
  getFileReadStream: (pointer) => {
    const ms = require('memory-streams');
    const reader = new ms.ReadableStream();
    reader.push('for example 222');

    return reader;
  },
  copyFromCache: (pointer, file) => {
    return true;
  },
}));

describe('smudge filter actual file', () => {
  test('file stream', async () => {
    const reader = new ms.ReadableStream();

    const pointer = new Pointer({
      oidType: 'sha256',
      oid: '40a9ef7b88be7becfc0f503a712ccc82db446943d9cce6dc684a67cbc4cd18d6',
      size: 15,
    });
    reader.push(pointer.toPointerString());

    const writer = new ms.WritableStream();
    await smudgeFilter('the-file', reader, writer);
    expect(writer.toString()).toBe('for example 222');
  });

  test('file stream input', async () => {
    const reader = new ms.ReadableStream();

    const writePointer = new Pointer({
      oidType: 'sha256',
      oid: '40a9ef7b88be7becfc0f503a712ccc82db446943d9cce6dc684a67cbc4cd18d6',
      size: 15,
    });
    reader.push(writePointer.toPointerString());

    const readPointer = await smudgeInputToPointer(reader);

    expect(readPointer.toPointerString()).toBe(writePointer.toPointerString());
  });

  test('file stream output', async () => {
    const cache = require('./gb_cache');

    const pointer = new Pointer({
      oidType: 'sha256',
      oid: '40a9ef7b88be7becfc0f503a712ccc82db446943d9cce6dc684a67cbc4cd18d6',
      size: 15,
    });

    expect(await cache.hasFile(pointer)).toBe(true);

    const writer = new ms.WritableStream();
    await smudgePointerToOutput('the-file', pointer, writer);
    expect(writer.toString()).toBe('for example 222');
  });
});
