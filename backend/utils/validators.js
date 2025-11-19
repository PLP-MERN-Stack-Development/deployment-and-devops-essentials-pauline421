// validators.js - small validation helpers

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

module.exports = { isNonEmptyString };
