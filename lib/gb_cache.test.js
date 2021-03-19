const path = require('path');
const cache = require('./gb_cache');

test('cache path', () => {
  global.gitRootDirectory = 'here';
  let dir = cache.getBlobCacheDirectory(
    '82e0ebc90140066bed1db993d5ceeaf7a34fc42aed9e2cda82ce6211819ea59d',
  );
  expect(dir).toBe(path.join(global.gitRootDirectory, '.brain', 'objects', '82', 'e0'));
});

test.todo('cached file validation');
