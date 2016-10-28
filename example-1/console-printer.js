var path = require('path');
var sourceMap = require('source-map');

module.exports = function(source){
  var lines = source.split('\n');
  var prints = lines.map(function(line){
    return `console.log('${line}');`
  }).join('\n');

  // build source map
  var SourceMapGenerator = sourceMap.SourceMapGenerator;

  var relativePath = path.relative(process.cwd(), this.resourcePath);

  var map = new SourceMapGenerator({
    file: this.resourcePath,
    sourceContent: lines
  });
  map.setSourceContent(relativePath,source);
  lines.forEach(function(line, index){
    map.addMapping({
      generated: {
        line: index+2,
        column: 1
      },
      source:relativePath ,
      original: {
        line: index+1,
        column: 1
      }
    });
  });

  this.callback(null, `exports.print = function(){\n\n${prints}\n}`, map.toJSON())
};