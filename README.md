mugen.js
========

A simple json markup engine. 

The purpose of mugen is to serve as a markup engine that can be embedded in javascript components. 

Most javascript plugins provide no markup options, but styling via css is not sufficient in many cases. 
Different css frameworks often require a different markup.  
This is why we often need different plugins for different frameworks, such as jquery-ui or bootstrap, although the business logic of those components is almost the same. 

Mugen addresses these issues by providing a simple json / templating interface which can be setup through the options of a plugin. 

Example
-------
Creating bootstrap input-group from a button and a textfield. 

```
mugen.render({
  className: 'input-group', 
  children: [
    {
      element: '#{button}',  
      className: 'btn btn-default', 
      wrapper: '<div class="input-group-btn"></div>'
    }, 
    {
      element: '#{input}',  
      className: 'form-control'
    }
  ]
  }, {
    button: document.getElementById('button'), 
    input: document.getElementById('input')
  }, document.getElementById('test'));
});
```

```
<div id="test">
  <button id="button">Test</button>
  <input id="input" value="This is the input value"/>
</div>
```