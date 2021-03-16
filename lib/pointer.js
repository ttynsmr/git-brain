class Pointer {
  constructor() {
    this.#version = Pointer.defaultVersion;
    this.#oidType = 'sha22';
    this.#oid = 'fakeoid';
    this.#size = 22;
  }

  static get defaultVersion() {
    return 'https://git-lfs.github.com/spec/v1';
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

  async savePointerFile(filename) {
    await fs.writeFile(filename, this.toPointerString(), 'utf-8');
  }

  static async isPointerFile(filename) {
    return (await PointerInfo.loadPointerFile(filename)) != null;
  }

  static async loadPointerFile(filename) {
    let stat = await fs.stat(filename);
    if (stat.size > PointerInfo.blobSizeCutoff) {
      return null;
    }
    try {
      const pointerString = await fs.readFile(filename, 'utf-8');
      let pointer = new PointerInfo();
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
      let lines = pointerString.split('\n');
      const infos = lines
        .filter((line) => line)
        .map((line) => {
          return line.split(' ');
        });

      let dict = {};
      infos.forEach((info) => (dict[info[0]] = info[1]));

      if (dict['version'] === undefined) {
        return false;
      }

      if (dict['oid'] === undefined) {
        return false;
      }

      if (dict['size'] === undefined) {
        return false;
      }

      this.#version = dict['version'];

      if (dict['oid'].includes(':')) {
        let sp = dict['oid'].split(':');
        this.#oidType = sp[0];
        this.#oid = sp[1];
      } else {
        return false;
      }

      this.#size = parseInt(dict['size']);

      return true;
    } catch (err) {
      console.log(err);
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
