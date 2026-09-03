const crypto = require("crypto");

function generateId(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

module.exports = {
  generateId
};