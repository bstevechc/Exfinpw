const { format } = require("timeago.js");
var today = new Date();

const helpers = {};
const helpers2 = {};



helpers.timeago = (timestamp) => {
    return format(timestamp);
}
module.exports = helpers;

