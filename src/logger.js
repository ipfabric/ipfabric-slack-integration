const offset = (
  new Date()
    .getTimezoneOffset() * 60 * 1000
);
const now = () => (
  (new Date(Date.now() - offset))
    .toISOString()
    .substr(0, 23)
);

module.exports.log = (...args) => {
  if (args.length) {
    console.log(now(), ...args); // eslint-disable-line no-console
  } else {
    console.log(); // eslint-disable-line no-console
  }
};

module.exports.logNoTime = (...args) => {
  console.log(...args); // eslint-disable-line no-console
};
