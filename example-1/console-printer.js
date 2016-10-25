
module.exports = function(source){
  var lines = source.split('\n')
  var prints = lines.map(function(line){
    return `console.log('${line}');`
  }).join('\n');

  /**
   * { version: 3,
   *      file: '/home/home/dev_env/projects_GIT/coder-on-deck/easy-webpack-setup/app/style/main.scss',
   *      sources: [ 'app/style/main.scss' ],
   *      sourcesContent: [ 'body{\n  background:yellow;\n}' ],
   *      mappings: 'AAAA,AAAA,IAAI,CAAA;EACF,UAAU,EAAC,MAAO,GACnB',
   *      names: [],
   *      sourceRoot: '' }
   *
   **/
  var path = require('path');
  var sourceMap = require('source-map');
  var SourceMapGenerator = sourceMap.SourceMapGenerator
  
  var relativePath = path.relative(process.cwd(), this.resource)
  
  var map = new SourceMapGenerator({
    file: this.resource,
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
  })
  
  this.addDependency(this.resource)
  
  this.callback(null, `exports.print = function(){\n\n${prints}\n}`, map.toJSON())
}