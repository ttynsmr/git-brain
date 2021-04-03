const crypto = require('crypto');
const fs = require('fs');
const fsPromises = require('fs').promises;

// see https://github.com/git-lfs/git-lfs/blob/9b2c3f50b3a124a5d24a4942eeb00fc4ddc45fdf/lfs/pointer.go#L17
class Pointer {
  static get defaults() {
    return {
      version: 'https://git-lfs.github.com/spec/v1',
      oidType: undefined,
      oid: undefined,
      size: undefined,
    };
  }

  constructor(options) {
    this.#version = Pointer.defaults.version;
    this.#oidType = options === undefined ? Pointer.defaults.oidType : options.oidType;
    this.#oid = options === undefined ? Pointer.defaults.oid : options.oid;
    this.#size = options === undefined ? Pointer.defaults.size : options.size;
  }

  static get blobSizeCutoff() {
    return 1024;
  }

  get oidType() {
    return this.#oidType;
  }

  get oid() {
    return this.#oid;
  }

  get size() {
    return this.#size;
  }

  get version() {
    return this.#version;
  }

  toPointerString() {
    return `version ${this.#version}\noid ${this.#oidType}:${this.#oid}\nsize ${this.#size}\n`;
  }

  static async calcSha256Hash(filename) {
    return Pointer.calcSha256HashFromStream(fs.createReadStream(filename));
  }

  static async calcSha256HashFromStream(stream) {
    function calcSha256HashFromStreamPromise(_stream) {
      const hashHex = crypto.createHash('sha256');
      return new Promise((resolve, reject) => {
        let streamSize = 0;
        let streamHash = '';
        _stream
          .on('error', (err) => {
            reject(
              new Error({
                success: false,
                hash: null,
                fileSize: null,
                error: err,
              }),
            );
          })
          .on('data', (chunk) => {
            streamSize += chunk.length;
            hashHex.update(chunk);
          })
          .on('end', () => {
            streamHash = hashHex.digest('hex');
          })
          .on('end', () => {
            resolve({ success: true, hash: streamHash, fileSize: streamSize });
          });
      });
    }

    return calcSha256HashFromStreamPromise(stream);
  }

  async savePointerFile(filename) {
    return fsPromises.writeFile(filename, this.toPointerString(), 'utf-8');
  }

  static async isPointerFile(filename) {
    return (await Pointer.loadPointerFile(filename)) != null;
  }

  static async loadActualFile(filename) {
    try {
      const result = await Pointer.calcSha256Hash(filename);
      return new Pointer({
        oidType: 'sha256',
        oid: result.hash,
        size: result.fileSize,
      });
    } catch (err) {
      // console.log(err);
      return null;
    }
  }

  static async loadPointerFile(filename) {
    try {
      const stat = await fsPromises.stat(filename);
      if (stat.size > Pointer.blobSizeCutoff) {
        return null;
      }

      const pointerString = await fsPromises.readFile(filename, 'utf-8');
      const pointer = new Pointer();
      if (pointer.parse(pointerString)) {
        return pointer;
      }
      return null;
    } catch (err) {
      // console.log(err);
      return null;
    }
  }

  parse(pointerString) {
    try {
      if (pointerString.length > Pointer.blobSizeCutoff) {
        throw new Error('too large pointer string.');
      }

      const lines = pointerString.split('\n');
      const infos = lines.filter((line) => line).map((line) => line.split(' '));

      const dict = {};
      infos.forEach(([key, value]) => {
        dict[key] = value;
      });

      if (dict.version === undefined) {
        throw new Error('version not contained.');
      }

      if (dict.oid === undefined) {
        throw new Error('oid not contained.');
      }

      if (dict.size === undefined) {
        throw new Error('size not contained.');
      }

      this.#version = dict.version;

      if (dict.oid.includes(':')) {
        const [oidType, oid] = dict.oid.split(':');
        this.#oidType = oidType;
        this.#oid = oid;
      } else {
        throw new Error('invalid oid.');
      }

      this.#size = parseInt(dict.size, 10);

      return true;
    } catch (err) {
      // console.log(err);
      this.#version = undefined;
      this.#oidType = undefined;
      this.#oid = undefined;
      this.#size = undefined;
      return false;
    }
  }

  #version;

  #oidType;

  #oid;

  #size;
}

module.exports = {
  Pointer,
};
