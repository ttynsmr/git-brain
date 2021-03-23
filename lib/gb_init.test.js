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
  let writer = aw.createWriter(new ms.WritableStream());

  await runShell(writer, 'svnadmin create svnrepo');
  await runShell(writer, 'mkdir -p srcrepo/trunk');
  await runShell(
    writer,
    `svn import srcrepo/trunk file://${testDirectory}/svnrepo/trunk -m "initial commit"`,
  );

  await runShell(writer, `svn checkout file://${testDirectory}/svnrepo/trunk gb-sandbox`);
  await runShell(writer, `svn checkout file://${testDirectory}/svnrepo/trunk gb-sandbox-remote`);

  process.chdir(path.join(testDirectory, 'gb-sandbox'));

  expect(fs.existsSync('.svn')).toBe(true);

  await runShell(writer, 'echo "this text as bin ya" > svn.qwe.bin');
  await runShell(writer, 'svn add svn.qwe.bin');
  await runShell(writer, `svn commit -m "add bin file"`);
  await runShell(writer, `svn update`);

  await initializeGitRepository(writer);

  expect(fs.existsSync('.git')).toBe(true);

  expect(fs.existsSync('.brain')).toBe(true);

  await runShell(writer, 'git config --local user.email "you@example.com"');
  await runShell(writer, 'git config --local user.name "Your Name"');
  await runShell(writer, 'echo ".svn" > .gitignore');
  await runShell(writer, 'echo "*.bin filter=brain diff=brain merge=brain -text" > .gitattributes');
  await runShell(writer, 'echo "this text as bin" > zxc.bin');
  await runShell(null, 'git status');
  await runShell(writer, 'git add .');
  expect(fs.existsSync('.brain')).toBe(true);
  await runShell(null, 'git status');
  await runShell(null, 'git commit -m "Initial commit"');
  await runShell(null, 'git show');
  // await runShell(writer, 'find .brain');
  await runShell(writer, 'cat zxc.bin').then(() => {
    process.chdir(path.join(testDirectory, 'gb-sandbox-remote'));
  });

  // await runShell(writer, 'pwd');
  await runShell(writer, `svn update`);
  await runShell(writer, 'echo "this is text" > README.txt');
  await runShell(writer, 'echo "this is bin" > rev2.bin');
  await runShell(writer, 'svn add README.txt rev2.bin');
  await runShell(writer, `svn commit -m "this revision is 3"`).then(() => {
    process.chdir(path.join(testDirectory, 'gb-sandbox'));
  });

  // await runShell(writer, 'pwd');
  await runShell(writer, `svn update`);
  await runShell(writer, `find .brain | sort`);

  expect(writer.stream.toString()).toMatchSnapshot();

  process.chdir(testDirectory);
}, 30000);
