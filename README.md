mugen.js
========

A simple json markup engine

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