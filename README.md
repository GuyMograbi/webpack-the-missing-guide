# Webpack - the missing guide

In this post I quickly teach you how to use webpack and then I dive into loaders.    
I will also show how to write a loader with source map. 

## Why webpack

Webpack is an awesome module bundler that you should use if: 

 - You are publishing a reusable library (e.g. twitter's bootstrap)
 - You want an easy and hassle free setup for web development
 - You want to join a big and rich community

## Webpack is NOT just a module bundler 

Actually, Webpack is much more than just a module bundler.    
Webpack is: 
  
  - A loaders runner. Loaders modify resources' content.  (more below)
  - A plugins runner. Plugins affect the build process. 
  - A preprocessor
  - A development environment
  - A build tool 
  
Module bundlers usually combine JavaScript files together and expose them in one of the existing modules standards that exist today (e.g. commonjs, amd and es2015)        

Webpack goes beyond the JavaScript limit and allows you to bundle anything.    
For webpack everything is a module. 

#### Example: bundling a `sass` file

In webpack you bundle a `sass` file by writing `require('style!css!sass../style/main.scss');` which does the following: 

 - requires a resource
 - tells the sass loader to processes the resources - which converts `sass` to `css`
 - pipes the sass loader's output to css loader - which further processes the `css`, for example `url` and `@import` statements 
 - pipes the css loader's output to style loader - which adds `css` to the `dom` by injecting a `<style>` tag


[Complete Flow](images/complete-flow.png)
 
## Webpack in 60 seconds

As I said before Webpack is a `loader` runner.   
You start with a JavaScript file - like `main.js` - and an environment to run JavaScript. 
Lets assume our environment is a browser and so we will have an `html` file - like `index.html`.
 
Your main JavaScript file requires all the resources you want to bundle while declaring which loader to use on each resource.       
Here is such a `main.js` for example    

```
var name = require('console-printer!startcase!./name.txt');
name.print()
```

In the example we can see

 - `name.txt` is a resource required by main.js and processed by 2 (imaginery) loaders
 - `startcase` is the first loader
 - `console-printer` is the second loader, it gets the output from the previous loader
 - The `console-printer` output is kept on a variable named `name`
 - Then function `print` is invoked on `name`
 
The loaders can do whatever they want as long as at the end I get an invocable `print()` method.   
Here is a [list of available loaders](https://webpack.github.io/docs/list-of-loaders.html). Chances are what you need already exists. 
  
You run webpack on `main.js` by running `webpack --output-filename dist/bundle.js main.js`. 
Webpack will write the output to `dist/bundle.js` which you reference in `index.html` like so
 
```
<html>
    <body>
        <script src="dist/bundle.js></script>
    </body>
</html>
```

And then you simply load `index.html` to the browser and everything should work.  

Now you know what webpack is and how to use it.    
Before we continue you should also know that

 - Webpack can watch your project for changes. 
 - Webpack has a configuration file that makes using it much easier. 
 - [Webpack development server](https://webpack.github.io/docs/webpack-dev-server.html) is a server written by the webpack team and tailored to webpack abilities.  
 
 
Next, lets review the loaders up close and learn how to write them. 

   
# Praise the Load 
   
Loaders are what makes webpack truly powerful, unique and worth your while thanks to their genious simplicity.     
This is why I chose to focus on them in this post. 
     
     
A loader is applied on a single resource and must export a function. for example:  

```
module.exports = function(source) {
  return modifySource(source); 
}
```

You can easily reference your custom loaders with a relative path 

```
require('../my-loaders/my-custom-loader!./some-resource.js')
```

And you can easily configure your loader. 

```
require('../my-loadersmy-custom-loader?foo=bar!./some-resource.js')
```

Did you notice it is just like a url query? Do you know any query parsing libraries? :)    
It just happens that [webpack has a special library for that too](https://github.com/webpack/loader-utils#parsequery)


# Lets write our own loader 

This is the example I've shown before

```
var name = require('console-printer!startcase!./name.txt');
name.print()
```

Lets write the `startcase` and `console-printer` loaders.

Lets assume `name.txt` contain top 4 worldwide grossing movies in 2016. At the date of writing this, this is the list: 
 
```
captain america: civil war
zootopia
finding dory
the jungle book
```

### Writing `startcase` loader

This loader will turn all the names to be with startcase.
So `finding dory` will become `Finding Dory`. 


```javascript
var _ = require('lodash')
/**
 * Will turn all names to start case
 * @param source
 * @returns {string} all names in start case
 */
module.exports = function(source){
  return source.split('\n').map(_.startCase).join('\n')
}
```

This loader is quite simple for now.   
I am using lodash to convert all the names to start case. 

### Writing the `console-printer` loader

The `console-printer` loader should output code that exports `print` method
 
```javascript
module.exports = function(source){
  var prints = source.split('\n').map(function(line){
    return `console.log('${line}');`
  }).join('\n');
  return `exports.print = function(){\n${prints}\n}`
}
```

### Lets look at the result 

After running `webpack --output-filename dist/bundle.js --entry main.js` take a look at `bundle.js` and you should see something like

```javascript
exports.print = function(){
console.log('Captain America Civil War');
console.log('Zootopia');
console.log('Finding Dory');
console.log('The Jungle Book');
}
```

Which is the code we generated. 

### Lets run it

Technically, this code does not require a browser so we could simply `node dist/bundle.js` to see the prints.   
But for the purpose of this post you should run `index.html` that looks like this: 

```html
<html>
    <body>
        <script src="dist/bundle.js"></script>
    </body>
</html>
```

And open the developers' area to see the prints. 

## What does it all mean? 

We actually just transpiled the source in `names.txt` into JavaScript.    
This example was pretty simple, but make it complex enough and you get Typescript :) 

Lets not stop here.   
Like all good transpilers lets add a source map and see how it is done with webpack.

# Lets add a source map

To generate a source map we will need to modify the `console-printer` loader just a bit. 

```
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
```

Lets walk through the code:

 - First require `path` and `source-map` which will help us construct the source map.
 - Afterwards we split the lines by newline and construct the JavaScript code like before.
 - Then we generate the source map with a simple logic - each line in `names.txt` is now lower by 1.
 - Eventually we return the result but instead of using `return` which only allows returning a single argument, we use `this.callback` which allows sending errors, the result and source map.

There are many ways to generate source maps, but webpack has a unique way of its own.
When you generate your own source map in webpack it is crucial to pay attention to :

 - The paths. Some are relative and some are absolute. Get them wrong and you will not content properly.
 - You **have** to attach `source` as this data is lost after the loader is finished.
 - You must return an object rather than have a `//# sourceMappingURL=app.js.map` comment (like you usually do) since webpack uglifies the code and the comment will be lost.

and now lets run webpack again. This time we need to run webpack with `-d` flag to generate source map. `webpack -d --progress --colors --output-filename dist/bundle.js --entry ./example-1/main.js`
Now you should be able to open the sources tab in developers' area and fine `names.txt` there.
You should also be able to put a breakpoint and step over.

[sourcemap results](./images/sourcemap-results.png)


HOW COOL IS THAT?

# What else can loaders do?

 - Loaders can be async.
 - Loaders can get configurations and have access to webpack's configuration
 - Loaders can run in different hooks in webpack's build process. read about preLoaders.

There's [a guide for writing loaders](https://webpack.github.io/docs/loaders.html#loader-context) but I also strongly recommend reading source for existing loaders and reading `NormalModuleMixin.js` in webpack's sources.
It helped me clarify some stuff.

  
# The meaning of it all  

In this post we talked about what webpack is and what it is not.
We saw how to use it and how to extend it with loaders.
We drilled down to a loader implementation and saw how powerful it can be without much effort thanks to webpack's awesome api.

I'd love to hear about your experience with webpack in the comments below.