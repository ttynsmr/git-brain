const { Pointer } = require('./pointer');
const fs = require('fs');

test('pointer defaults.version', () => {
  expect(Pointer.defaults.version).toBe('https://git-lfs.github.com/spec/v1');
  expect(Pointer.defaults.oidType).toBe(undefined);
  expect(Pointer.defaults.oid).toBe(undefined);
  expect(Pointer.defaults.size).toBe(undefined);
});

test('pointer blobSizeCutoff', () => {
  expect(Pointer.blobSizeCutoff).toBe(1024);
});

test('pointer constructor', () => {
  let pointer = new Pointer({ oidType: 'md5', oid: '2fc57d6f63a9ee7e2f21a26fa522e3b6', size: 2 });
  expect(pointer.version).toBe(Pointer.defaults.version);
  expect(pointer.oidType).toBe('md5');
  expect(pointer.oid).toBe('2fc57d6f63a9ee7e2f21a26fa522e3b6');
  expect(pointer.size).toBe(2);
});

test('pointer constructor(default)', () => {
  let pointer = new Pointer();
  expect(pointer.version).toBe(Pointer.defaults.version);
  expect(pointer.oidType).toBe(undefined);
  expect(pointer.oid).toBe(undefined);
  expect(pointer.size).toBe(undefined);
});

test('pointer parser', () => {
  let pointer = new Pointer();
  let result = pointer.parse(`
version ${Pointer.defaults.version}
oid sha256:785f3ec7eb32f30b90cd0fcf3657d388b5ff4297f2f9716ff66e9b69c05ddd09
size 2`);
  expect(pointer.version).toBe(Pointer.defaults.version);
  expect(pointer.oidType).toBe('sha256');
  expect(pointer.oid).toBe('785f3ec7eb32f30b90cd0fcf3657d388b5ff4297f2f9716ff66e9b69c05ddd09');
  expect(pointer.size).toBe(2);
  expect(result).toBe(true);
});

function testInvalidPointer(pointerString) {
  let pointer = new Pointer();
  let result = pointer.parse(pointerString);
  expect(pointer.version).toBe(undefined);
  expect(pointer.oidType).toBe(undefined);
  expect(pointer.oid).toBe(undefined);
  expect(pointer.size).toBe(undefined);
  expect(result).toBe(false);
}

test('pointer parser(invalid pointer)', () => {
  testInvalidPointer(`
version ${Pointer.defaults.version}
oid sha256785f3ec7eb32f30b90cd0fcf3657d388b5ff4297f2f9716ff66e9b69c05ddd09
size 2`);
});

test('pointer parser(invalid pointer)', () => {
  testInvalidPointer(`
version ${Pointer.defaults.version}
oid sha:256785f3ec7eb32f30b90cd0fcf3657d388b5ff4297f2f9716ff66e9b69c05ddd09`);
});

test('pointer parser(invalid pointer)', () => {
  testInvalidPointer(`
version ${Pointer.defaults.version}
size 2`);
});

test('pointer parser(empty string)', () => {
  testInvalidPointer(``);
});

test('pointer parser(is not pointer)', () => {
  testInvalidPointer(''.padEnd(1025, '*'));
});

test('pointer toPointerString', () => {
  let pointer = new Pointer({
    oidType: 'sha256',
    oid: '785f3ec7eb32f30b90cd0fcf3657d388b5ff4297f2f9716ff66e9b69c05ddd09',
    size: 2,
  });
  let text = pointer.toPointerString();
  expect(text).toBe(
    `version ${Pointer.defaults.version}\n` +
      `oid sha256:785f3ec7eb32f30b90cd0fcf3657d388b5ff4297f2f9716ff66e9b69c05ddd09\n` +
      `size 2\n`,
  );
});

describe('test for actual file', () => {
  function createTestActualFile() {
    fs.writeFileSync('.test', '22');
  }

  function removeTestActualFile() {
    try {
      fs.unlinkSync('.test');
    } catch (err) {
      console.error(err);
    }
  }

  beforeEach(() => {
    createTestActualFile();
  });

  afterEach(() => {
    removeTestActualFile();
  });

  test('pointer calculate file hash', async () => {
    let hash = await Pointer.calcSha256Hash('.test');
    expect(hash).toBe('785f3ec7eb32f30b90cd0fcf3657d388b5ff4297f2f9716ff66e9b69c05ddd09');
  });

  test('pointer load actual file', async () => {
    let pointer = await Pointer.loadActualFile('.test');
    expect(pointer).toBeTruthy();
    expect(pointer.version).toBe(Pointer.defaults.version);
    expect(pointer.oidType).toBe('sha256');
    expect(pointer.oid).toBe('785f3ec7eb32f30b90cd0fcf3657d388b5ff4297f2f9716ff66e9b69c05ddd09');
    expect(pointer.size).toBe(2);
    expect(pointer.toPointerString()).toMatchSnapshot();
  });

  test('pointer load not exist file', async () => {
    let pointer = await Pointer.loadActualFile('.test.not.exist');
    expect(pointer).toBeNull();
  });

  test('pointer save actual file', async () => {
    let pointer = await Pointer.loadActualFile('.test');
    await pointer.savePointerFile('.test_pointer');
    try {
      fs.unlinkSync('.test_pointer');
    } catch (err) {
      console.error(err);
    }
  });
});

describe('test for pointer file', () => {
  function createTestPointerFile() {
    fs.writeFileSync('.test', '22');
    fs.writeFileSync('.test.large', ''.padEnd(1025, '*'));
    fs.writeFileSync(
      '.test.pointer',
      `
version ${Pointer.defaults.version}
oid sha256:785f3ec7eb32f30b90cd0fcf3657d388b5ff4297f2f9716ff66e9b69c05ddd09
size 2
`,
    );
  }

  function removeTestPointerFile() {
    try {
      fs.unlinkSync('.test');
    } catch (err) {
      console.error(err);
    }
    try {
      fs.unlinkSync('.test.large');
    } catch (err) {
      console.error(err);
    }
    try {
      fs.unlinkSync('.test.pointer');
    } catch (err) {
      console.error(err);
    }
  }

  beforeEach(() => {
    createTestPointerFile();
  });

  afterEach(() => {
    removeTestPointerFile();
  });

  test('pointer is pointer file(pointer file)', async () => {
    let result = await Pointer.isPointerFile('.test.pointer');
    expect(result).toBe(true);
  });

  test('pointer is pointer file(actual file)', async () => {
    let result = await Pointer.isPointerFile('.test');
    expect(result).toBe(false);
  });

  test('pointer is pointer file(not exist)', async () => {
    let result = await Pointer.isPointerFile('.test.not.exist');
    expect(result).toBe(false);
  });

  test('pointer load pointer file', async () => {
    let pointer = await Pointer.loadPointerFile('.test.pointer');
    expect(pointer.version).toBe(Pointer.defaults.version);
    expect(pointer.oidType).toBe('sha256');
    expect(pointer.oid).toBe('785f3ec7eb32f30b90cd0fcf3657d388b5ff4297f2f9716ff66e9b69c05ddd09');
    expect(pointer.size).toBe(2);
    expect(pointer.toPointerString()).toMatchSnapshot();
  });

  test('pointer load not exist file', async () => {
    let pointer = await Pointer.loadPointerFile('.test.not.exist');
    expect(pointer).toBeNull();
  });

  test('pointer load large actual file as pointer', async () => {
    let pointer = await Pointer.loadPointerFile('.test.large');
    expect(pointer).toBeNull();
  });
});
