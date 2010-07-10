(function(){
  
  var isMobileWebKit = RegExp(" Mobile/").test(navigator.userAgent);
  
  var Game = lta.Game = function() {
  
    var gridSize = { w: 12, h: 12 };
    var caseSize = {};
    
    var casesNode = [];
    var cases = [];
    
    var getCase = function(x, y) {
      return cases[y*gridSize.w+x];
    };
    
    var bindPanelToolObject = function(node) {
      node.bind(isMobileWebKit ? 'touchstart' : 'mousedown', function() {
        node.addClass('dragging');
        var dragHelper = $('<div id="dragHelper"></div>').hide()
        .css({
          position: 'absolute',
          width: caseSize.w+'px',
          height: caseSize.h+'px',
          zIndex: 20,
          background: 'rgba(255,255,255,0.5)'
        });
        $('#game').append(dragHelper);
      });
    };
    
    var bindEvents = function() {
      $(window).bind(isMobileWebKit ? 'touchend' : 'mouseup', function(){
        var dragging = $('#game .gamePanel .toolObject.dragging');
        var dragHelper = $('#dragHelper');
        if(dragging.size()>0) {
          dragging.removeClass('dragging');
          dragHelper.remove();
        }
      });
      $(window).bind(isMobileWebKit ? 'touchmove' : 'mousemove', function(e) {
        var dragging = $('#game .gamePanel .toolObject.dragging');
        var dragHelper = $('#dragHelper');
        if(dragging.size()>0) {
        
          var x, y;
          
          if(isMobileWebKit) {
            x = e.originalEvent.touches[0].clientX;
            y = e.originalEvent.touches[0].clientY;
          }
          else {
            x = e.clientX;
            y = e.clientY;
          }
          
          var left = Math.floor(x-caseSize.w/2);
          var top = Math.floor(y-caseSize.h/2);
          
          dragHelper.show().css({
            top: top+'px',
            left: left+'px'
          });
          
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
        
        var gameGrid = $('#game .gameGrid').width(width).height(height);
        $('canvas.lasers, .cases', gameGrid).width(width).height(height);
        var appendTo = $('.cases', gameGrid).empty();
        for(var y=0; y<gridSize.h; ++y) {
          for(var x=0; x<gridSize.w; ++x) {
            var i = y*gridSize.w+x;
            var node = casesNode[i] = $('<canvas class="case" width="'+caseSize.w+'" height="'+caseSize.h+'"></canvas>').appendTo(appendTo);
            cases[i] = node[0].getContext('2d');
          }
        }
        
        for(var i=0; i<7; ++i) {
          var tool = $('<canvas class="toolObject" width="'+caseSize.w+'" height="'+caseSize.h+'"></canvas>');
          $('#game .gamePanel').append(tool);
          bindPanelToolObject(tool);
        }
        
        bindEvents();
      },
      
      start: function(level) {
        if(!level) level=0;
        
        for(var y=0; y<gridSize.h; ++y) {
          for(var x=0; x<gridSize.w; ++x) {
            var ctx = getCase(x, y);
            ctx.fillStyle = 'rgb('+Math.floor((255 * x) / gridSize.w)+', '+Math.floor((255 * y) / gridSize.h)+', 128)';
            ctx.fillRect(0, 0, caseSize.w, caseSize.h);
          }
        }
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