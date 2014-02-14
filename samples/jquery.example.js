+function ( $, window) {

  var mugine = window.mugine;

  var pluginName = 'example';
  
  var defaults = {
    property: 'example', 
    className: 'example'
  };
  
  function isCodeTag(elem) {
    return !!(["SCRIPT", "STYLE"].indexOf(elem.nodeName) + 1);
  }
  
  function Example(element, options) {
    
    if ($(element).parents().map(function() {
      return $(this).data('example');
    }).length > 0) return;
    
    var contentElem = $(element).find("*[data-example]")[0] || element;
    
    var pre = document.createElement('pre');
    pre.className = options.className;
    var clone = $(contentElem.cloneNode(true))
      .removeAttr('data-example')
      .get(0);
    
    var code = isCodeTag(element);
    
    var text = code ? clone.innerHTML : clone.outerHTML;
    pre.appendChild(document.createTextNode(text));
    
    var insertAt = element;
    
    var prev = $(element).prev();
    if (prev.data(pluginName)) {
      insertAt = prev;
    }
    
    $(pre).insertBefore(insertAt);

    if (code && $(clone).attr('type') != 'text/javascript') {
      $(clone).attr('type', 'text/javascript');
      $(clone).insertAfter(element);
      console.warn("CODE: ", element, clone);
    }
  }

  // register component as plugin
  var pluginClass = Example;
  $.fn[pluginName] = function(options) {
    options = $.extend({}, defaults, options);
    return this.each(function() {
      if (!$(this).data(pluginName)) {
          $(this).data(pluginName, new pluginClass(this, options));
      }
      return $(this);
    });
  };

}( jQuery, window );