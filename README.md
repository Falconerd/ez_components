# \<grug/\> Grug Components
> Simple reusable components for the grug brained developer.

A preprocessor that uses HTML all the way down. No JSX, no objects, no extra languages; just HTML.

## The simplest example
```html
// components/greeting.html
<div>Hello, {name}</div>
```
```html
// src/index.html
<!DOCTYPE html>
<html>

  <head></head>

  <body>
    <greeting name="Alice" />
  </body>

</html>
```
```html
// build/index.html
<!DOCTYPE html>
<html>

  <head></head>

  <body>
    <div>Hello, Alice</div>
  </body>

</html>
```
# Usage
```
npm i -D grug-components
npx grug_components
```