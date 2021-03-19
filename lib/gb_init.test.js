const fs = require('fs');
const path = require('path');
const tempy = require('tempy');
const aw = require('awaitify-stream');
const ms = require('memory-streams');

const { initializeGitRepository, runShell } = require('./gb_init');

beforeAll(async () => {
  return await initializeTestDirectory();
});

afterAll(async () => {
  return await clearTestDirectory();
});

let testDirectory = tempy.directory({ prefix: 'git-brain' });

async function initializeTestDirectory() {
  process.chdir(testDirectory);
}

async function clearTestDirectory() {
  process.chdir(path.dirname(process.cwd()));
  fs.rmdirSync(testDirectory, { recursive: true });
}

test('git-brain run shell(no writer)', () => {
  return runShell(null, 'echo 1');
});

test('git-brain run shell(memory stream writer)', async () => {
  let stream = new ms.WritableStream();
  let writer = aw.createWriter(stream);
  await runShell(writer, 'echo "qwerty"');
  expect(stream.toString()).toBe('qwerty\n');
});

test('git-brain init', async () => {
  let stream = new ms.WritableStream();
  let writer = aw.createWriter(stream);

  await initializeGitRepository(writer);

  await runShell(writer, 'echo "*.bin filter=brain diff=brain merge=brain -text" > .gitattributes');
  await runShell(writer, 'echo "this text as bin" > zxc.bin');
  await runShell(writer, 'git status');
  await runShell(writer, 'git add .');
  await runShell(null, 'git status');
  await runShell(null, 'git commit -m "Initial commit"');
  await runShell(null, 'git show');
  await runShell(writer, 'find .brain');
  await runShell(writer, 'cat zxc.bin');

  expect(stream.toString()).toMatchSnapshot();
});
