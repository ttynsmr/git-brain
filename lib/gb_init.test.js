const fs = require('fs');
const path = require('path');
const tempy = require('tempy');
const aw = require('awaitify-stream');
const ms = require('memory-streams');

const { initializeGitRepository, runShell } = require('./gb_init');

beforeAll(async () => {
  await runShell(null, 'docker-compose up -d');
  await initializeTestDirectory();
}, 30000);

afterAll(async () => {
  await clearTestDirectory();
  await runShell(null, 'docker-compose down');
});

beforeEach(() => {
  process.chdir(testDirectory);
});

afterEach(() => {
  process.chdir(testDirectory);
});

let startupDirectory = undefined;
let testDirectory = undefined;

async function initializeTestDirectory() {
  startupDirectory = process.cwd();
  testDirectory = tempy.directory({ prefix: 'git-brain' });
  process.chdir(testDirectory);
}

async function clearTestDirectory() {
  if (startupDirectory) process.chdir(startupDirectory);
  if (testDirectory) fs.rmdirSync(testDirectory, { recursive: true });
}

test('git-brain run shell(no writer)', () => {
  return runShell(null, 'echo 1');
});

test('git-brain run shell(memory stream writer)', async () => {
  let writer = aw.createWriter(new ms.WritableStream());
  await runShell(writer, 'echo "qwerty"');
  expect(writer.stream.toString()).toBe('qwerty\n');
});

test('git-brain init', async () => {
  await runShell(
    null,
    `svn checkout http://${process.env.SVN_HOST}:${process.env.SVN_PORT}/gb-sandbox/trunk --username ${process.env.SVN_USER} --password ${process.env.SVN_PASS} gb-sandbox`,
  );

  process.chdir(path.join(testDirectory, 'gb-sandbox'));

  expect(fs.existsSync('.svn')).toBe(true);

  await runShell(null, 'echo "this text as bin ya" > svn.qwe.bin');
  await runShell(null, 'svn add svn.qwe.bin');
  await runShell(
    null,
    `svn commit -m "first commit" --username ${process.env.SVN_USER} --password ${process.env.SVN_PASS}`,
  );
  await runShell(
    null,
    `svn update --username ${process.env.SVN_USER} --password ${process.env.SVN_PASS}`,
  );

  let writer = aw.createWriter(new ms.WritableStream());

  await initializeGitRepository(writer);

  await runShell(writer, 'git config --local user.email "you@example.com"');
  await runShell(writer, 'git config --local user.name "Your Name"');
  await runShell(writer, 'echo "*.bin filter=brain diff=brain merge=brain -text" > .gitattributes');
  await runShell(writer, 'echo "this text as bin" > zxc.bin');
  await runShell(writer, 'git status');
  await runShell(writer, 'git add .');
  await runShell(null, 'git status');
  await runShell(null, 'git commit -m "Initial commit"');
  await runShell(null, 'git show');
  await runShell(writer, 'find .brain');
  await runShell(writer, 'cat zxc.bin');

  expect(writer.stream.toString()).toMatchSnapshot();

  process.chdir(testDirectory);
});
