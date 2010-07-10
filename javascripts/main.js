(function(){
  
  var Game = lta.Game = function() {
  
    var gridSize = { w: 12, h: 12 };
    var caseSize = {};
    
    
    var casesNode = [];
    var cases = [];
    
    var getCase = function(x, y) {
      return cases[y*gridSize.w+x];
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
        
        for(var i=0; i<7; ++i)
          $('#game .gamePanel').append($('<div class="toolObject"></div>').width(size).height(size));
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
          console.log(event, info);
          Game.start();
        })
    });
      }
    }
  }();
  
  $(document).ready(Main.init);
  
}());