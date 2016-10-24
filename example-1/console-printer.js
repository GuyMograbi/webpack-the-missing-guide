module.exports = function(source){
  var prints = source.split('\n').map(function(line){
    return `console.log('${line}');`
  }).join('\n');
  return `exports.print = function(){\n${prints}\n}`
}