const fs = require('fs');
const path = require('path');
const tempy = require('tempy');
const aw = require('awaitify-stream');
const ms = require('memory-streams');

const { runShell } = require('./gb_shell');
const { initializeGitRepository } = require('./gb_init');

beforeAll(async () => {
  await initializeTestDirectory();
});

afterAll(async () => {
  await clearTestDirectory();
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

test('git-brain init', async () => {
  await runShell(null, 'svnadmin create svnrepo');
  await runShell(null, 'mkdir -p srcrepo/trunk');
  await runShell(
    null,
    `svn import srcrepo/trunk file://${testDirectory}/svnrepo/trunk -m "initial commit"`,
  );

  await runShell(null, `svn checkout file://${testDirectory}/svnrepo/trunk gb-sandbox`);

  process.chdir(path.join(testDirectory, 'gb-sandbox'));

  expect(fs.existsSync('.svn')).toBe(true);

  await runShell(null, 'echo "this text as bin ya" > svn.qwe.bin');
  await runShell(null, 'svn add svn.qwe.bin');
  await runShell(null, `svn commit -m "add bin file"`);
  await runShell(null, `svn update`);

  let writer = aw.createWriter(new ms.WritableStream());

  await initializeGitRepository(writer);

  await runShell(writer, 'git config --local user.email "you@example.com"');
  await runShell(writer, 'git config --local user.name "Your Name"');
  await runShell(writer, 'echo ".svn" > .gitignore');
  await runShell(writer, 'echo "*.bin filter=brain diff=brain merge=brain -text" > .gitattributes');
  await runShell(writer, 'echo "this text as bin" > zxc.bin');
  await runShell(writer, 'git status');
  await runShell(writer, 'git add .');
  expect(fs.existsSync('.brain')).toBe(true);
  await runShell(null, 'git status');
  await runShell(null, 'git commit -m "Initial commit"');
  await runShell(null, 'git show');
  await runShell(writer, 'find .brain');
  await runShell(writer, 'cat zxc.bin');

  expect(writer.stream.toString()).toMatchSnapshot();

  process.chdir(testDirectory);
});
