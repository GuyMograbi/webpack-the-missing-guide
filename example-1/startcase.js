var _ = require('lodash')
/**
 * Will turn all names to start case
 * @param source
 * @returns {string} all names in start case
 */
module.exports = function(source){
  return source.split('\n').map(_.startCase).join('\n')
}