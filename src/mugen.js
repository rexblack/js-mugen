+function() {
  
  /* JSON Markup Processor */
 
  if (window.mugen) return;
 
  function parseHTML(html) {
    var el = document.createElement( 'div' ), fragment = document.createDocumentFragment();
    el.innerHTML = html;
    for (var i = 0, item; item = el.childNodes[i]; i++) fragment.appendChild(item);
    return fragment;
  }

  function hyphenate(str) {
    return str.replace(/\W+/g, '-').replace(/([a-z\d])([A-Z])/g, '$1-$2');
  }
  
  function setProperties(object, properties) {
    for (var name in properties) {
      var value = properties[name];
      if (name == 'attributes' || name == 'children' || name == 'data') continue;
      if (typeof object[name] == 'object') {
        setProperties(object[name], value); 
      } else { 
        try {
          object[name] = value;
        } catch (e) {}
      }
    }
  }
  
  function replaceVariables(string, model) {
    if (typeof string == 'object' || typeof string == 'array') {
      for (var x in string)
        string[x] = replaceVariables(string[x], model);
      return string;
    } else if (typeof string == 'string') {
      var pattern = /#{([^{}]*)}/g, matches = pattern.exec(string);
      if (matches && string.replace(/^\s+|\s+$/g, '') == matches[0] && model[matches[1]]) 
        return model[matches[1]];
      return string.replace(pattern,
        function (a, b) {
            var r = model[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        }
      );
    }
  }

  function wrap(element, wrapper) {
    if (!wrapper) return element;
    var parent = element.parentNode, nextSibling = element.nextSibling;
    wrapper = wrapper.nodeType === 11 ? wrapper.firstChild : wrapper;
    wrapper.appendChild(element);
    if (parent) parent.insertBefore(wrapper, nextSibling);
    return wrapper;
  }
  
  
  function createElement(object, element) {
    
    if (!object) return null;
    
    if (typeof object == 'string')
      return parseHTML(object);
    
    if (typeof object == 'object') {
      var nodeName = object.nodeName || object.tagName || 'div';
      element = element || object.element || document.createElement(nodeName);
        
      // attributes
      for (var x in object.attributes) 
        element.setAttribute(hyphenate(x), object.attributes[x]);
        
      // data
      for (var x in object.data) 
        element.setAttribute("data-" + hyphenate(x), object.data[x]);
          
      // children
      createNodeList(object.children, element);
      
      // props
      setProperties(element, object);
      
      // wrapper
      element = wrap(element, createElement(object.wrapper));

      return element;
    }
    
  }
  
  function createNodeList(items, element) {
    if (!items) return [];
    element = element || document.createDocumentFragment();
    for (var i = 0, item; item = items[i]; i++)
      element.appendChild(createElement(item));
    return element;
  }
  
  function render(object, element) {
    if (object instanceof Array)
      element = createNodeList(object, element);
    else
      element = createElement(object, element);
    return element;
  }
  
  function Mugen() {
    this.render = function(object, model, element) {
      replaceVariables(object, model);
      return render(object, element);
    };
  }
  
  window.mugen = new Mugen();
  
}();