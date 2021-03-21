const { Pointer } = require('./pointer');
const ms = require('memory-streams');
const { smudgeFilter, smudgeInputToPointer, smudgePointerToOutput } = require('./gb_smudge');

jest.mock('./gb_cache', () => ({
  hasFile: (pointer) => {
    return new Promise((resolve) => {
      resolve(true);
    });
  },
  getFileReadStream: (pointer) => {
    const ms = require('memory-streams');
    let reader = new ms.ReadableStream();
    reader.push('for example 222');

    return reader;
  },
  copyFromCache: (pointer, file) => {
    return true;
  },
}));

describe('smudge filter actual file', () => {
  test.skip('file stream', async () => {
    let reader = new ms.ReadableStream();

    let pointer = new Pointer({
      oidType: 'sha256',
      oid: '40a9ef7b88be7becfc0f503a712ccc82db446943d9cce6dc684a67cbc4cd18d6',
      size: 15,
    });
    reader.push(pointer.toPointerString());

    let writer = new ms.WritableStream();
    await smudgeFilter(reader, writer);
    expect(writer.toString()).toBe('for example 222');
  });

  test('file stream input', async () => {
    let reader = new ms.ReadableStream();

    let writePointer = new Pointer({
      oidType: 'sha256',
      oid: '40a9ef7b88be7becfc0f503a712ccc82db446943d9cce6dc684a67cbc4cd18d6',
      size: 15,
    });
    reader.push(writePointer.toPointerString());

    let writer = new ms.WritableStream();
    let readPointer = await smudgeInputToPointer(reader);

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

    let writer = new ms.WritableStream();
    await smudgePointerToOutput('the-file', pointer, writer);
    expect(writer.toString()).toBe('for example 222');
  });
});
