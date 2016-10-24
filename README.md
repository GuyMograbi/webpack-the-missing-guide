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

## What does it all mean? 

We actually just transpiled the source in `names.txt` into JavaScript.    
This example was pretty simple, but make it complex enough and you get Typescript :) 

Lets not stop here.   
Like all good transpilers lets add a source map and see how it is done with webpack.     

# Lets add a source map

To generate a source map we will need to modify the console-printer just a bit. 

```
```

# What else can loaders do?
  
# The meaning of it all  




 