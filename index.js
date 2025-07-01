const { Pdf4me } = require('./dist/nodes/Pdf4me/Pdf4me.node.js');
const { Pdf4meApi } = require('./dist/credentials/Pdf4meApi.credentials.js');

module.exports = {
  nodes: {
    Pdf4me,
  },
  credentials: {
    Pdf4meApi,
  },
};
