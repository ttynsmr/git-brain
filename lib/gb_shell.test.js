const aw = require('awaitify-stream');
const ms = require('memory-streams');
const { runShell } = require('./gb_shell');

test('git-brain run shell(no writer)', () => {
  return runShell(null, 'echo 1');
});

test('git-brain run shell(memory stream writer)', async () => {
  let writer = aw.createWriter(new ms.WritableStream());
  await runShell(writer, 'echo "qwerty"');
  expect(writer.stream.toString()).toBe('qwerty\n');
});
