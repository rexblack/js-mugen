+function ( $, window) {

  var mugine = window.mugine;

  var pluginName = 'wysiwygExample';
  
  var defaults = {
    style: 'auto'
  };

  // This example uses data-attributes to inject elements
  // Alternatively you could use template helpers as noted in the comments
  var templates = {
    'bootstrap': 
      '<div class="panel panel-default">' + 
      '<div class="panel-heading">' + 
      '<div class="btn-toolbar" role="toolbar"><div class="btn-group">' + 
      '<% for (var i = 0, button; button = buttons[i]; i++) { %>' +
      '<button data-variable="buttons[<%= i %>]" class="btn btn-default"><i class="glyphicon glyphicon-<%= button.getAttribute("data-action") %>"></i></button> ' +
      // ALTERNATE: '<%= _build(button, {className: "btn btn-default", innerHTML: "<i class=\\"glyphicon glyphicon-" + button.getAttribute("data-action") + "\\"></i>"}) %> ' +
      '<% } %>' +  
      '</div>' + 
      '</div>' + 
      '</div>' + 
      '<div class="panel-body">' + 
      '<div data-variable="views">' + 
      '<div data-variable="preview" class="form-control"><%= element.value %></div>' +   
      // ALTERNATE: '<%= _build(preview, {className: "form-control", innerHTML: element.value}) %>' + 
      '<textarea data-variable="element" class="form-control"></textarea>' +   
      // ALTERNATE: '<%= _build(element, {className: "form-control"}) %>' + 
      '</div>' + 
      '</div>' + 
      '</div>' + 
      '</div>'
  };
  
  function WysiwygExample(element, options) {
    
    /* private instance methods: */
    
    // executes a text command
    function exec(action) {
      switch (action) {
        case 'bold': 
        case 'italic': 
          document.execCommand(action, false, null);
          break;
        case 'align-left':
        case 'align-center':
        case 'align-right':    
          // convert action to command
          var cmd = "justify" + action.substring(action.indexOf('-') + 1).replace(/^./, function (char) { return char.toUpperCase(); });
          document.execCommand(cmd);
          break;
      }
      change();
    }
    
    // change callback
    function change() {
      // update textarea value
      element.innerHTML = preview.innerHTML; 
    }
    
    
    // renders markup for the component
    function render() {
      
      mugine.render(element, templates[options.style], {
        preview: preview, 
        views: views, 
        buttons: buttons
      });
      
    }
    
    // applies layout to the component's children
    function layout() {
      
      $(element).css({
        position: 'relative', 
        visibility: 'hidden'
      }); 
      
      $(views).css({
        position: 'relative'
      }); 
      
      $(preview).css({
        position: 'absolute', 
        height: '100%', 
        overflow: 'auto', 
        WebkitOverflowScrolling: 'touch'
      });
    
    }
    
    
    /* initialize component */
    
    // define actions
    var actions = ['bold', 'italic', 'align-left', 'align-right', 'align-center'];
    
    // create views
    var views = document.createElement('div'), preview = document.createElement('div');
    preview.contentEditable = true;
    
    // create buttons
    var buttons = $(actions).map(function(index, obj) {
      var button = document.createElement('button');
      return $('<button></button>')
        .attr('data-action', obj)
        .on('click', function() {
          exec($(this).data('action'));
        }).get();
    }).get();
    
    // configure listeners
    $(preview).on('keyup', function() {
      change();
    });

    render.call(this);
    layout.call(this);
    
  }
  

  // register component as plugin
  var pluginClass = WysiwygExample;
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