const hasha = require('hasha');
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
    return await hasha.fromFile(filename, { algorithm: 'sha256' });
  }

  async savePointerFile(filename) {
    await fs.writeFile(filename, this.toPointerString(), 'utf-8');
  }

  static async isPointerFile(filename) {
    return (await Pointer.loadPointerFile(filename)) != null;
  }

  static async loadActualFile(filename) {
    try {
      let stat = await fs.stat(filename);
      return new Pointer({
        oidType: 'sha256',
        oid: await Pointer.calcSha256Hash(filename),
        size: stat.size,
      });
    } catch (err) {
      //console.log(err);
      return null;
    }
  }

  static async loadPointerFile(filename) {
    try {
      let stat = await fs.stat(filename);
      if (stat.size > Pointer.blobSizeCutoff) {
        return null;
      }

      const pointerString = await fs.readFile(filename, 'utf-8');
      let pointer = new Pointer();
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

      let lines = pointerString.split('\n');
      const infos = lines
        .filter((line) => line)
        .map((line) => {
          return line.split(' ');
        });

      let dict = {};
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
        let sp = dict['oid'].split(':');
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
