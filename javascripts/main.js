(function(){
  
  if(!console) console = { log: function(){} };
  
  var isChrome = /chrome/i.test(navigator.userAgent);
  var isAndroidOS = /android/i.test(navigator.userAgent);
  var hasTouch = ('ontouchstart' in window);
  
  var types = lta.types;
  
  var caseSize = {};
  var gridSize = { w: 8, h: 8 };
  
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
  
  var Case = lta.Case = function(ctx) {
    
    var node = $(ctx.canvas);
    
    var style = function(style) {
      ctx.fillStyle = style;
    };
    
    var rectAll = function() {
      ctx.fillRect(0, 0, caseSize.w, caseSize.h);
    };
    
    var empty = function(){
      style('rgb(200,200,200)');
      rectAll();
    };
    
    return {
      hoverin: function() {
        node.addClass('hover');
      },
      hoverout: function() {
        node.removeClass('hover');
      },
      empty: empty,
      wall: function(){
        style('rgb(100,100,100)');
        rectAll();
      },
      bomb: function(){
        style('rgb(100,0,0)');
        rectAll();
      },
      receptor: function(color){
        empty();
        style('rgb(0,150,0)');
        ctx.beginPath();
        ctx.arc(caseSize.w/2, caseSize.h/2, caseSize.h/3, 0, Math.PI*2, true);
        ctx.fill();
      },
      laser: function(color, orientation){
        style('rgb(100,100,200)');
        rectAll();
      },
      drop: function(dragging) {
        style('black');
        ctx.fillRect(caseSize.w/4, caseSize.h/4, caseSize.w/2, caseSize.h/2);
      }
    }
  };
  
  var Level = lta.Level = function() {
    
    var level2file = function(level) {
      return 'levels/'+(level<10?'0':'')+level+'.lvl';
    }
    
    var parseLevel = function(data) {
      var grid = [];
      var caseSplit = data.split(/[;\n]/);
      console.log('case length = '+caseSplit.length);
      for(var c in caseSplit) {
       var caseObj = {};
        var caseStr = $.trim(caseSplit[c]).toUpperCase();
        if(caseStr.match("^BOMB")) {
          caseObj = { mapObject: types.MapObject.BOMB };
        }
        else if(caseStr.match("^RECEPTOR")) {
          caseObj = { mapObject: types.MapObject.RECEPTOR };
          caseStr = caseStr.substring("RECEPTOR".length);
          var args = caseStr.split(',');
          for(var a in args) {
            var arg = $.trim(args[a]).toUpperCase();
            for(var color in types.Color) {
              if(arg==color) {
                caseObj.color = types.Color[color];
                break;
              }
            }
          }
        }
        else if(caseStr.match("^LASER")) {
          caseObj = { mapObject: types.MapObject.LASER };
          caseStr = caseStr.substring("LASER".length);
          var args = caseStr.split(',');
          for(var a in args) {
            var arg = $.trim(args[a]).toUpperCase();
            var found = false;
            for(var color in types.Color) {
              if(arg==color) {
                caseObj.color = types.Color[color];
                found = true;
                break;
              }
            }
            if(!found) {
              for(var o in types.Orientation) {
                if(arg==o) {
                  caseObj.orientation = types.Orientation[o];
                  break;
                }
              }
            }
          }
        }
        else if(caseStr.match("^WALL")) {
          caseObj = { mapObject: types.MapObject.WALL };
        }
        grid.push(caseObj);
      }
      return grid;
    };
    
    getGrid = function(level, callback) {
      $.get(level2file(level), function(data) {
        callback(parseLevel(data));
      });
    };
    
    return {
      hasNext: function(level) {
        return level<10; // todo
      },
      getGrid: getGrid
    }
  }();
  
  var GameGrid = lta.GameGrid = function() {
    
    var grid = [];
    var casesNode = [];
    var cases = [];
    
    var getCase = function(x, y) {
      return cases[y*gridSize.w+x];
    };
    var getCaseNode = function(x, y) {
      return casesNode[y*gridSize.w+x];
    };
    
    var bindCase = function(node) {
      var ctx = node[0].getContext('2d');
      var fillStyle;
      node.bind('draghoverin', function(){
        new Case(ctx).hoverin();
      });
      node.bind('draghoverout', function(){
        new Case(ctx).hoverout();
      });
      node.bind('dropped', function(e, dragging) {
        dragging = $(dragging);
        if(dragging.is('.toolObject')) {
          new Case(ctx).drop(dragging);
        }
      })
    };
    
    return {
      getCaseNode: getCaseNode,
      start: function(level) {       
        var game = $('#game');
        game.hide();
        Level.getGrid(level, function(g){
          grid = g;
          var i = 0;
          for(var y=0; y<gridSize.h; ++y) {
            for(var x=0; x<gridSize.w; ++x) {
              var ctx = getCase(x, y);
              var caseObj = grid[i];
              switch(caseObj.mapObject) {
                case types.MapObject.RECEPTOR:
                  new Case(ctx).receptor(caseObj.color);
                break;
                case types.MapObject.LASER:
                  new Case(ctx).laser(caseObj.color, caseObj.orientation);
                break;
                case types.MapObject.WALL:
                  new Case(ctx).wall();
                break;
                case types.MapObject.BOMB:
                  new Case(ctx).bomb();
                break;
                default:
                  new Case(ctx).empty();
              }
              
              ++i;
            }
          }
          game.show();
        });
      },
      
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
        
        toolObjectSize.w = toolObjectSize.h = Math.floor((width-10) / 7 - 10);
        
        for(var i=0; i<7; ++i) {
          var tool = $('<canvas class="toolObject" width="'+toolObjectSize.w+'" height="'+toolObjectSize.h+'"></canvas>');
          $('#game .gamePanel').append(tool);
        }
        
        bindEvents();
      },
      
      start: function(level) {
        if(!level) level=1;
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
        $('#play').bind('pageAnimationEnd', function(event, info){
          Game.start();
        })
    });
      }
    }
  }();
  
  $(document).ready(Main.init);
  
}());