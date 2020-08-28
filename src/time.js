const offset = (new Date())
  .getTimezoneOffset();

module.exports.utcToLocal = ms => (ms - offset * 60 * 1000);

module.exports.msToStr = ms => (new Date(ms))
  .toISOString()
  .substr(0, 23)
  .replace('T', ' ');

module.exports.diffToStr = ms => {
  if (ms < 1000) {
    return `${ms} millisecond(s)`;
  }
  if (ms < 60 * 1000) {
    return `${Math.floor(ms / 1000)}.${(ms % 1000)
      .toString()
      .padStart(3, '0')} second(s)`;
  }
  const secs = Math.round(ms / 1000);
  if (secs < 60 * 60) {
    return `${Math.floor(secs / 60)} minute(s) and ${secs % 60} second(s)`;
  }
  const mins = Math.round(secs / 60);
  return `${Math.floor(mins / 60)} hour(s) and ${mins % 60} minute(s)`;
};
