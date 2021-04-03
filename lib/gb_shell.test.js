/* eslint-disable no-undef */
const aw = require('awaitify-stream');
const ms = require('memory-streams');
const { runShell } = require('./gb_shell');

test('git-brain run shell(no writer)', () => runShell(null, 'echo 1'));

test('git-brain run shell(memory stream writer)', async () => {
  const writer = aw.createWriter(new ms.WritableStream());
  await runShell(writer, 'echo "qwerty"');
  expect(writer.stream.toString()).toBe('qwerty\n');
});

test('git-brain sequential shell execute & outputs', async () => {
  const writerExpect = new ms.WritableStream();
  const writer = aw.createWriter(new ms.WritableStream());
  const verificationCount = 100;
  // eslint-disable-next-line no-plusplus
  for (let step = 0; step < verificationCount; step++) {
    // eslint-disable-next-line no-await-in-loop
    await runShell(writer, `echo ${step}`);
    // eslint-disable-next-line no-await-in-loop
    await writer.writeAsync('nop\n');
  }
  // eslint-disable-next-line no-plusplus
  for (let step = 0; step < verificationCount; step++) {
    writerExpect.write(`${step}\n`);
    writerExpect.write('nop\n');
  }
  expect(writerExpect.toString()).toBe(writer.stream.toString());
});
