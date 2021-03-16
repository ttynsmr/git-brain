class BrainStatus {
  constructor() {
    const Spinner = require('clui').Spinner;
    this.runningStatus = new Spinner('🧠 Zzz', ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷']);
    this.runningStatus.start();
  }
  runningStatus;
  startBrainStatus() {}

  updateMessage() {
    this.runningStatus.message(`🧠${this.status}  ${this._log}`);
  }

  status = 'Zzz';
  setStatus(status) {
    this.status = status;
    this.updateMessage();
  }

  _log = '';
  log(_log) {
    this._log = _log;
    this.updateMessage();
  }
}

module.exports = {
  BrainStatus,
};
