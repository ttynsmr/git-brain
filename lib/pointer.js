const fs = require('fs').promises;

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
    return (
      `version ${this.#version}\n` + `oid ${this.#oidType}:${this.#oid}\n` + `size ${this.#size}\n`
    );
  }

  static async calcSha256Hash(filename) {
    const fs = require('fs');
    return Pointer.calcSha256HashFromStream(fs.createReadStream(filename));
  }

  static async calcSha256HashFromStream(stream) {
    function calcSha256HashFromStreamPromise(_stream) {
      const crypto = require('crypto');
      const hashHex = crypto.createHash('sha256');
      let fileSize = 0;
      let hash = '';
      return new Promise((resolve, reject) => {
        _stream
          .on('error', (err) => {
            reject({ success: false, hash: null, fileSize: null });
          })
          .on('data', (chunk) => {
            fileSize += chunk.length;
            hashHex.update(chunk);
          })
          .on('end', () => {
            hash = hashHex.digest('hex');
          })
          .on('end', () => {
            resolve({ success: true, hash: hash, fileSize: fileSize });
          });
      });
    }

    return calcSha256HashFromStreamPromise(stream);
  }

  async savePointerFile(filename) {
    return fs.writeFile(filename, this.toPointerString(), 'utf-8');
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
      const stat = await fs.stat(filename);
      if (stat.size > Pointer.blobSizeCutoff) {
        return null;
      }

      const pointerString = await fs.readFile(filename, 'utf-8');
      const pointer = new Pointer();
      if (pointer.parse(pointerString)) {
        return pointer;
      } else {
        return null;
      }
    } catch (err) {
      //console.log(err);
      return null;
    }
  }

  parse(pointerString) {
    try {
      if (pointerString.length > Pointer.blobSizeCutoff) {
        throw 'too large pointer string.';
      }

      const lines = pointerString.split('\n');
      const infos = lines
        .filter((line) => line)
        .map((line) => {
          return line.split(' ');
        });

      const dict = {};
      infos.forEach((info) => (dict[info[0]] = info[1]));

      if (dict['version'] === undefined) {
        throw 'version not contained.';
      }

      if (dict['oid'] === undefined) {
        throw 'oid not contained.';
      }

      if (dict['size'] === undefined) {
        throw 'size not contained.';
      }

      this.#version = dict['version'];

      if (dict['oid'].includes(':')) {
        const sp = dict['oid'].split(':');
        this.#oidType = sp[0];
        this.#oid = sp[1];
      } else {
        throw 'invalid oid.';
      }

      this.#size = parseInt(dict['size']);

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
