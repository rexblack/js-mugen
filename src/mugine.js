(function() {
  
  /* JSON Markup Processor */
 
  var 
    doc = document, 
    win = window,  
    DIV = "div", 
    WRAP = "wrap", 
    PUSH = "push", 
    JOIN = "join", 
    DATA = "data", 
    SPLIT = "split", 
    OBJECT = "object", 
    STRING = "string", 
    REPLACE = "replace", 
    ELEMENT = "element", 
    NODE_TYPE = "nodeType", 
    INNER_HTML = "innerHTML", 
    ATTRIBUTES = "attributes", 
    CHILD_NODES = "childNodes", 
    PARENT_NODE = "parentNode", 
    FIRST_CHILD = "firstChild", 
    APPEND_CHILD = "appendChild", 
    INSERT_BEFORE = "insertBefore", 
    REPLACE_CHILD = "replaceChild", 
    SET_ATTRIBUTE = "setAttribute",
    CREATE_ELEMENT = "createElement", 
    DATA_VARIABLE = "data-variable", 
    QUERY_SELECTOR_ALL = "querySelectorAll", 
    CREATE_DOCUMENT_FRAGMENT = "createDocumentFragment", 
    
    
    INTERPOLATION_TOKENS = {
      start: '#{', end: '}', buffer: ''
    }, 
    
    TEMPLATE_TOKENS = {
      start: '<%', end: '%>', buffer: '='
    }, 
    
    // Simple JavaScript Templating
    // John Resig - http://ejohn.org/ - MIT Licensed
    
    // EDITED: modified as noted
    
    tmpl = (function() {
    
      var cache = {};
      
      return function(str, data, options) {
        
        options = options || {};
        
        // ADDED: template helpers
        //var helpers = options.helpers || {};
        for (var name in helpers) {
          data['_' + name] = (function(helper, data) {
            return function() {
              helper._data = data;
              var result = helper.apply(this, arguments);
              delete helper._data;
              return result;
            };
          })(helpers[name], data); 
        }
        
        
        var tokens = options.tokens || TEMPLATE_TOKENS;
      
        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        // REMOVED: load template by id
        var fn = cache[str] = cache[str] ||
         
          // Generate a reusable function that will serve as a template
          // generator (and which will be cached).
          
          new Function("obj",
            "var p=[],print=function(){p.push.apply(p,arguments);};" +
           
            // Introduce the data as local variables using with(){}
            "with(obj){p.push('" +
           
            // Convert the template into pure JavaScript
            // Added: minification optimization
            str
              [REPLACE](/[\r\t\n]/g, " ")
              [SPLIT](tokens.start)[JOIN]("\t")
              
              // Modified: dynamic patterns
              [REPLACE](new RegExp("\\(\\(\\^\\|" + tokens.end + "\\)\\[\\^\t\\]\\*\\)", 'g') , "$1\r")
              [REPLACE](new RegExp("\t" + tokens.buffer + "\(\.\*\?\)" + tokens.end, "g"), "',$1,'")
              
              //[REPLACE](new RegExp("#{\(\.\*\?\)}", "g"), "',$1,'")
              
              [SPLIT]("\t")[JOIN]("');")
              [SPLIT](tokens.end)[JOIN]("p.push('")
              [SPLIT]("\r")[JOIN]("\\'")

            
          + "');} "
          
          // ADDED: strip empty elements 
          + "p = p.filter(function(v) {return typeof v == 'string' ? v.replace(/^\s+|\s+$/g, '').length : true});" 
          
          // ADDED: output dom elements as html
          + "for (var i = 0; i < p.length; i++) { var o = p[i]; if (o && o.outerHTML) p[i] = o.outerHTML; }" 
          
          // ADDED: return single item as object
          + "return p.length > 1 ? p.join('') : typeof p[0] == 'undefined' ? '' : p[0];");

        // Provide some basic currying to the user
        var result = data ? fn( data ) : fn;
        
        // Added: remove template helpers
        for (var name in helpers)
          delete data['_' + name];
        
        return result;
      };
      
    })();
    
    
  // outputs a dom fragment from a string template, keeping references by generating data-template-id attribute
  function tmplFrag(template, data, options) {
    
    options = options || {};
    
    // generate template-ids
    var tmplElems = getModelMap(data);
    for (var qualifiedName in tmplElems) {
      var tmplElem = tmplElems[qualifiedName];
      tmplElem[NODE_TYPE] ? tmplElem[SET_ATTRIBUTE](DATA_VARIABLE, qualifiedName) : null;
    }
    
    // build string
    var string = tmpl(template, data, options);
    var result = parseHTML(string);
    var placeholders = result[QUERY_SELECTOR_ALL]('*[' + DATA_VARIABLE + ']');
    
    // replace placeholders with model elements
    var placeholders = result.querySelectorAll('*[' + DATA_VARIABLE + ']');
    
    // restore template-ids
    for (var i = 0, placeholder; placeholder = placeholders[i]; i++) {
    
      var id = placeholder.getAttribute(DATA_VARIABLE), tmplElem = tmplElems[id];
      
      if (tmplElem) {
      
        if (tmplElem[NODE_TYPE]) {
        
          // copy markup to component
          for (var a = 0, attr; attr = placeholder[ATTRIBUTES][a]; a++) {
            tmplElem[SET_ATTRIBUTE](attr.nodeName, attr.nodeValue);
          }
          
          if (!tmplElem[CHILD_NODES].length) {
            for (var c = 0, children = placeholder[CHILD_NODES]; c < children.length; c++) {
              tmplElem[APPEND_CHILD](children[c--]);
            }
          }
          // replace node
          placeholder[PARENT_NODE][REPLACE_CHILD](tmplElem, placeholder);
          
        } else if (typeof elem != 'object') {
          var value = tmplElem;
          tmplElem = placeholder;
          tmplElem[INNER_HTML] = value;
        }
      }
    }
    
    for (var qualifiedName in tmplElems) {
      var tmplElem = tmplElems[qualifiedName];
      tmplElem[NODE_TYPE] ? tmplElem.removeAttribute(DATA_VARIABLE) : null;
    }
    
    return result;
  }
  
  // helpers
  var helpers = {
    build: function() {
      return build.call(this, arguments[0], arguments[1], arguments.callee._data);
    }
  };
    
  function build(element, template, data) {
  
    var result = null, data = data || {};
    
    if (typeof template == "string") {
      
      // string
      result = tmplFrag(template, data, {helpers: helpers});
      
    } else if (template instanceof Array) {
      
      result = element = element || doc[CREATE_DOCUMENT_FRAGMENT]();
      for (var i = 0, item; item = template[i]; i++)
        element[APPEND_CHILD](build.call(this, null, item, data));
        
    
    } else if (typeof template == "object") {
    
      // object
      var tmplElement = element || template[ELEMENT];
      
      // element
      result = (function() {
        if (typeof tmplElement == "string") {
          var children = tmplFrag(tmplElement, data, {helpers: helpers, tokens: INTERPOLATION_TOKENS})[CHILD_NODES];
          if (children.length == 1 && children[0][NODE_TYPE] == 1) {
            return children[0];
          } else {
            throw("property 'element' must evaluate to a single dom element");
          } 
        } else if (typeof tmplElement == "object" && tmplElement[NODE_TYPE])  {
          return tmplElement;
        }
        return null;
      })() || doc[CREATE_ELEMENT](template.nodeName || template.tagName || DIV);
      
      element = result;
      
      // store props for after extend
      var _wrap = template[WRAP];
    
      // attributes
      for (var x in template[ATTRIBUTES]) 
        element[SET_ATTRIBUTE](hyphenate(x), tmpl(template[ATTRIBUTES][x], data));
      
      // children
      if (template[CHILD_NODES])
        build.call(this, element, template[CHILD_NODES], data);

      // props
      extend(element, template, data);
      
      // wrap
      if (_wrap) {
        result = element = wrap(element, build.call(this, null, _wrap, data));
      }
    }
    
    return result;
  }
  
  
  // keep references to generated markup elements to clean-up on render
  var generated = [];
  
  function clean(element) {
    for (var i = 0, gen; gen = generated[i]; i++) {
      if (gen[ELEMENT] == element) {
        generated.splice(i--, 1);
        for (var m = 0, elem; elem = gen.markup[m]; m++) {
          elem[PARENT_NODE][REPLACE_CHILD](element, elem);
        }
        break;
      }
    }
  }
  
  function render(element, template, data) {
   
    data = data || {}; 
    
    // reset markup
    clean.call(this, element);
    
    // get insertion point
    var clone = element.cloneNode(), parent = element[PARENT_NODE], insertAt = clone;
    parent ? parent[INSERT_BEFORE](clone, element) : null;
    
    // for single objects add element to template
    var tmplChildren = template[CHILD_NODES];
    if (typeof template == "object" && !(template instanceof Array) && (!tmplChildren || tmplChildren.length == 1)) {
      template[ELEMENT] = element;
    }
      
    // add element to data
    data[ELEMENT] = data[ELEMENT] || element;
    
    // build
    var result = build.call(this, null, template, data);

    // collect generated markup for cleanup
    var children = [], childNodes = result[CHILD_NODES];
    for (var i = 0, child; child = childNodes[i]; i++)
      children[PUSH](child);
    generated[PUSH]({element: element, markup: children});
    
    // render
    if (insertAt) {
      insertAt[PARENT_NODE][REPLACE_CHILD](result, insertAt);
    }
    
    return result;
  }
  
  function Mugine() {
  }

  Mugine.prototype = {
    // create markup from string or json templates
    render: function (element, template, data) {
      var elements = typeof element == STRING ? doc[QUERY_SELECTOR_ALL](element) : element instanceof Array ? element : [element];
      for (var i = 0, elem; elem = elements[i]; i++) {
        render.call(this, elem, template, data);
      }
      return elements;
    }, 
    clean: function (element) {
      clean.call(this, element);
    }, 
    helpers: helpers
  };

  // Utility functions
  function hyphenate(str) {
    return str[REPLACE](/\W+/g, '-')[REPLACE](/([a-z\d])([A-Z])/g, '$1-$2');
  }
  
  function parseHTML(html) {
    if (typeof html != 'string') return html;
    var elem, el = doc[CREATE_ELEMENT](DIV), fragment = doc[CREATE_DOCUMENT_FRAGMENT]();
    el[INNER_HTML] = html;
    while (elem = el[FIRST_CHILD]) fragment[APPEND_CHILD](elem);
    return fragment;
  }
  
  function extend(object, properties, data) {
    for (var name in properties) {
      if (!!([ELEMENT, ATTRIBUTES, DATA, CHILD_NODES, WRAP].indexOf(name) + 1)) continue;
      var value = properties[name]; 
      typeof value == OBJECT && !value[NODE_TYPE] ? 
        arguments.callee(object[name] || {}, value, data) 
      : object[name] = typeof value == STRING ? 
        tmpl(value, data, {helpers: helpers, tokens: value.indexOf(TEMPLATE_TOKENS.start) >= 0 ? 
          TEMPLATE_TOKENS : INTERPOLATION_TOKENS}) : value;
    }
    return object;
  }
  
  function wrap(element, wrapper) {
    if (!wrapper) return element;
    var parent = element[PARENT_NODE], nextSibling = element.nextSibling;
    wrapper = wrapper[NODE_TYPE] === 11 ? wrapper[FIRST_CHILD] : wrapper;
    wrapper[APPEND_CHILD](element);
    if (parent) parent[INSERT_BEFORE](wrapper, nextSibling);
    return wrapper;
  }
  
  function getModelMap(data, namespace, result) {
    namespace = namespace || "", result = result || {};
    for ( var name in data ) {
      var object = data[name], qualifiedName = namespace ? namespace + "[" + name + "]" : name;
      if (typeof object == 'undefined' || object == null) continue;
      result[qualifiedName] = object;
      if (typeof object == OBJECT && !object.outerHTML)
        getModelMap(object, qualifiedName, result);
    }
    return result;
  }
  
  if ($ = jQuery) {
    // register plugin
    $.fn['render'] = $.fn['render'] || function(template, data) {
      return this.each(function() {
        win.mugine.render(this, template, data);
        return $(this);
      });
    };
  }
  
  win.Mugine = win.Mugine || Mugine;
  win.mugine = win.mugine || new Mugine();
  
  return Mugine;
  
})();