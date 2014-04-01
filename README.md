mugine.js
=========

Another javascript markup engine. 

The main purpose of mugine.js is to serve as a markup engine that can be integrated in javascript components, such as jquery-plugins.

Most javascript plugins provide no markup options, but styling via css is not always sufficient. 

Different css frameworks often require a different markup. This is why we often need different plugins for different frameworks, such as jquery-ui or bootstrap, although the business logic of those components is almost the same. 

Mugine.js addresses these issues by providing a simple templating api which could be setup through the options of a plugin. 

If you're building components, you will normally one maon element on which the component will be initialized as well as other key-elements that you need to keep references to.
Mugine.js handles this by working directly on the dom as well as injecting dom elements into strings via template variables. 

With mugine.js you can create templates by mixing the following three templating approaches:  

* Using json templates
* Using string templates
* Using data-attributes


Syntax
------

```
mugine.render([element:element|selector], [template:json|string], [data:object]);
```


Basic usage
-----------

Convert a button into a bootstrap button using a json template
```
<button id="button1">Click me</button>
```
```
// Create a bootstrap button using a json template
mugine.render('#button1', {
  className: 'btn btn-default'
});
```

#### Using mugine.js as a jquery-plugin

```
$(function() {
  // using mugine.js as a jquery-plugin
  $('#button4').render({
    className: 'btn btn-default'
  });
});
```

### Json templates

Json templates are pretty self-explanatory: Think of the dom as an object. 
An object could have any regular html-property, such as 'className' or 'innerHTML'.
* Create an element by using 'nodeName' or 'tagName'-Property. 
* Set attributes as object via the 'attributes'-property.
* Insert children as array via the 'childNodes'-property. 

#### Using variable interpolation to inject data into the views
```
<button id="button2">Click me</button>
```
```
// inject data using variable interpolation
mugine.render('#button2', {
  className: 'btn btn-default', 
  innerHTML: "#{label}"
}, {
  label: 'LabelText'
});

```

#### Injecting element references using the 'element'-property
```
// inject elements via the 'element'-property
var checkbox = document.createElement('input');
checkbox.setAttribute('type', 'checkbox');
mugine.render('button', {
  className: 'btn btn-default', 
  childNodes: [
    { element: "#{checkbox}" }
  ]}
}, {
  checkbox: checkbox
});

```


### String templates

String-templating is implemented through a modified version of John Resig's [javascript micro-templating](http://ejohn.org/blog/javascript-micro-templating/) algorithm. 
* Mugine.js allows for keeping object references and working with dom fragments. 
* Element references can be injected by template-variables
* Make use of the 'build'-helper to integrate json templating


### Data-attributes

You can also inject variables into a html-string via data-attributes. 

```
// inject element reference via data-attributes
mugen.render('button', '<button data-variable="element"></button>');
```

String-, Number- and Boolean-Values are applied to the text-content of the element:
```
// inject values as text-content 
mugen.render('button', '<button data-variable="element"><span data-variable="label"></span></button>');

```





Example
-------
Creating bootstrap input-group from a button and a textfield. 

#### Using a json template
```
<input id="input1" data-label="Label"/>
```
```
mugine.render('#input1', {
  className: 'input-group', 
  childNodes: [
    {
      nodeName: 'button', 
      innerHTML: '<%= element.getAttribute("data-label") %>', 
      className: 'btn btn-default', 
      wrap: '<span class="input-group-btn"></span>'
    },
    {
      element: '#{element}', 
      className: 'form-control'
    }
  ]
});
```

#### Using a string template
```
<input id="input2" data-label="Label"/>
```

```
mugine.render(
  '#input2', 
  '<div class="input-group">' + 
    '<span class="input-group-btn">' + 
      '<button class="btn btn-default"><%= element.getAttribute("data-label") %></button>' + 
    '</span>' + 
    '<%= _build(element, {className: "form-control " + element.getAttribute("data-label")}) %>' +  
  '</div>'
);
```



#### Using data attributes
```
<input id="input3" data-label="Label"/>
```
```       
var element = document.getElementById('input3');
mugine.render(
  element, 
  '<div class="input-group">' + 
    '<span class="input-group-btn">' + 
      '<button class="btn btn-default"><span data-variable="label"></span></button>' + 
    '</span>' + 
    '<input data-variable="element" class="form-control"/>' + 
  '</div>', {
    label: element.getAttribute('data-label')
  }
);
```
    


