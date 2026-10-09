// Whitelist fields from a request body so clients can never set owner/relations by mass assignment.
module.exports = (obj, keys) => {
  const out = {};
  for (const key of keys) {
    if (obj && obj[key] !== undefined) out[key] = obj[key];
  }
  return out;
};
