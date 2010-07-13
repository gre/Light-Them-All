(function(){
  
  var isChrome = /chrome/i.test(navigator.userAgent);
  var isAndroidOS = /android/i.test(navigator.userAgent);
  var hasTouch = ('ontouchstart' in window);
  
  var caseSize = {};
  var gridSize = { w: 12, h: 10 };
  
  
  var Event = lta.Event = function() {
    
    var useTouch = hasTouch && !isChrome;
    var target = document;
    
    var touchstart, touchmove, touchend;
    
    if(useTouch) {
      touchstart = function(fn) {
        $(target).bind('touchstart', fn);
      };
      touchmove = function(fn) {
        $(target).bind('touchmove', fn);
      };
      touchend = function(fn) {
        $(target).bind('touchend', fn);
      };
    }
    else {
      touchstart = function(fn) {
        $(document).bind('mousedown', fn);
      };
      touchmove = function(fn) {
        $(document).bind('mousemove', fn);
      };
      touchend = function(fn) {
        $(document).bind('mouseup', fn);
      };
    }
        
    return {
      touchstart: touchstart,
      touchmove: touchmove,
      touchend: touchend
    }
  }();
  
  
  var GameGrid = lta.GameGrid = function() {
    
    
    var casesNode = [];
    var cases = [];
    
    var getCase = function(x, y) {
      return cases[y*gridSize.w+x];
    };
    var getCaseNode = function(x, y) {
      return casesNode[y*gridSize.w+x];
    };
    
    var start = function(level) {
      for(var y=0; y<gridSize.h; ++y) {
        for(var x=0; x<gridSize.w; ++x) {
          var ctx = getCase(x, y);
          ctx.fillStyle = 'rgb('+Math.floor((255 * x) / gridSize.w)+', '+Math.floor((255 * y) / gridSize.h)+', 128)';
          ctx.fillRect(0, 0, caseSize.w, caseSize.h);
        }
      }
    }
    
    
    var bindCase = function(node) {
      var ctx = node[0].getContext('2d');
      var fillStyle;
      node.bind('draghoverin', function(){
        fillStyle = ctx.fillStyle;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(0,0,caseSize.w,caseSize.h);
      });
      node.bind('draghoverout', function(){
        ctx.fillStyle = fillStyle;
        ctx.fillRect(0,0,caseSize.w,caseSize.h);
      });
      node.bind('dropped', function(e, dragging) {
        dragging = $(dragging);
        if(dragging.is('.toolObject')) {
          ctx.fillStyle = 'rgba(50,100,0,0.8)';
          ctx.fillRect(0,0,caseSize.w,caseSize.h);
        }
      })
    };
    
    return {
      getCaseNode: getCaseNode,
      start: start,
      
      init: function(width) {        
        var gameGrid = $('#game .gameGrid');
        var appendTo = $('.cases', gameGrid).empty();
        for(var y=0; y<gridSize.h; ++y) {
          for(var x=0; x<gridSize.w; ++x) {
            var i = y*gridSize.w+x;
            var node = casesNode[i] = $('<canvas class="case" width="'+caseSize.w+'" height="'+caseSize.h+'"></canvas>').appendTo(appendTo);
            cases[i] = node[0].getContext('2d');
            bindCase(node);
          }
        }
      }
    }
  }();
  
  
  var Game = lta.Game = function() {
    
    var toolObjectSize = {};
    
    var getCaseNodeByPosition = function(pageX, pageY) {
      var gameGrid = $('#game .gameGrid');
      var offset = gameGrid.offset();
      if(pageX < offset.left || pageX > offset.left+gameGrid.width() 
      || pageY < offset.top  || pageY > offset.top+gameGrid.height()) {
        return null;
      }
      var x = Math.floor((pageX - offset.left) / caseSize.w);
      var y = Math.floor((pageY - offset.top) / caseSize.h);
      return GameGrid.getCaseNode(x, y);
    };
    
    
    var bindEvents = function() {
      
      /*
      $(document).bind('mousestart mousemove mouseend drag dragstart dragend pinch pinchstart tap doubletap swipe swipeleft swiperight touchstart touchmove touchend taphold tapstart tapcancel',
      function(e){
        console.log(e.type);
      });
      */
      
      Event.touchstart(function(e) {
        var node = $(e.target);
        
        if(node.is('.toolObject')) {
          e.preventDefault();
          node.addClass('dragging');
          var dragHelper = $('<div id="dragHelper"></div>').hide().append(node.clone()).css({
            position: 'absolute',
            width: toolObjectSize.w+'px',
            height: toolObjectSize.h+'px',
            zIndex: 20,
            background: 'rgba(255,255,255,0.5)'
          });
          $('#game').append(dragHelper);
        }
        
      });
      
      Event.touchend(function(e){
      
        var dragging = $('#game .toolObject.dragging');
        var dragHelper = $('#dragHelper');
        if(dragging.size()>0) {
          dragging.removeClass('dragging');
          dragging.trigger('dragend');
          dragHelper.remove();
          
          $('#game .case.draghover').removeClass('draghover').trigger('draghoverout').trigger('dropped', dragging);
        }
      });
      
      Event.touchmove(function(e) {
        var dragging = $('#game .toolObject.dragging');
        var dragHelper = $('#dragHelper');
        
        if(dragging.size()>0) {
        
          //e.preventDefault();
          
          var x, y;
          
          if(e.type=='touchmove') {
            x = e.originalEvent.touches[0].pageX;
            y = e.originalEvent.touches[0].pageY;
          }
          else {
            x = e.pageX;
            y = e.pageY;
          }
          
          var left = Math.floor(x-toolObjectSize.w/2);
          var top = Math.floor(y-toolObjectSize.h/2);
          
          dragHelper.show().css({
            top: top+'px',
            left: left+'px'
          });
          
          var caseNode = getCaseNodeByPosition(x, y);
          if(caseNode) {
            if(!caseNode.is('.draghover')) {
              $(caseNode).addClass('draghover');
              caseNode.trigger('draghoverin');
            }
            caseNode.removeClass('draghover');
          }
          $('#game .case.draghover').each(function(){
            $(this).removeClass('draghover').trigger('draghoverout');
          });
          if(caseNode)
            caseNode.addClass('draghover');
          
          return false;
        }
      });
    };
    
    return {
      init: function(width) {
        var size = Math.floor(width/gridSize.w);
        width = gridSize.w*size;
        var height = gridSize.h*size;
        caseSize.w = caseSize.h = size;
        
        var gameGrid = $('#game .gameGrid').width(width).height(height)
        $('canvas.lasers, .cases', gameGrid).width(width).height(height);
        
        GameGrid.init(width);
        
        toolObjectSize.w = toolObjectSize.h = Math.floor(width / 4 - 15);
        
        for(var i=0; i<7; ++i) {
          var tool = $('<canvas class="toolObject" width="'+toolObjectSize.w+'" height="'+toolObjectSize.h+'"></canvas>');
          $('#game .gamePanel').append(tool);
        }
        
        bindEvents();
      },
      
      start: function(level) {
        if(!level) level=0;
        
        GameGrid.start(level);
        
        
        
      }
    }
  }();
  
  var Main = lta.Main = function(){
    
    var g_width;
    
    return {
      init: function(){
        g_width = $(window).width();
        if(g_width<480) g_width = 320;
        else g_width = 480;
        Game.init(g_width);
        
        $(document).ready(function(e){
        $('#game').bind('pageAnimationEnd', function(event, info){
          Game.start();
        })
    });
      }
    }
  }();
  
  $(document).ready(Main.init);
  
}());