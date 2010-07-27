(function(){
  
  var types = lta.types = {};
  
  types.Color = { R: 1, G: 2, RG: 3, B: 4, RB: 5, GB: 6, RGB: 7,
    mix: function(c1, c2) { 
      return c1 | c2;
    },
    filter: function(c1, c2) { 
      return c1 & c2; 
    },
    rgba: function(c, alpha, lum) {
      if(typeof(alpha)=='undefined') alpha=1;
      if(typeof(lum)=='undefined') lum=255;
      if(alpha<0) alpha=0;
      if(alpha>1) alpha=1;
      
      var min = function(a,b){ return (a<b ? a : b) };
      
      var colorOn = min(255,lum);
      var colorOff = min(255,lum-colorOn);
      var r=0, g=0, b=0;
      if(c==types.Color.R) {
        r=colorOn; g=colorOff; b=colorOff;
      }
      else if(c==types.Color.G) {
        r=colorOff; g=colorOn; b=colorOff;
      }
      else if(c==types.Color.B) {
        r=colorOff; g=colorOff; b=colorOn;
      }
      else if(c==types.Color.RG) {
        r=colorOn; g=colorOn; b=colorOff;
      }
      else if(c==types.Color.RB) {
        r=colorOn; g=colorOff; b=colorOn;
      }
      else if(c==types.Color.GB) {
        r=colorOff; g=colorOn; b=colorOn;
      }
      else if(c==types.Color.RGB) {
        r=colorOn; g=colorOn; b=colorOn;
      }
      return 'rgba('+r+','+g+','+b+','+alpha+')';
    }
  };
  
  types.MapObject = { RECEPTOR: 1, LASER: 2, WALL: 3, BOMB: 4 };
  
  types.LevelMap = {};
  
  types.Orientation = { TOPLEFT: 0, TOP: 1, TOPRIGHT: 2, RIGHT: 3, BOTTOMRIGHT: 4, BOTTOM: 5, BOTTOMLEFT: 6, LEFT: 7,
    next: function(o){
      return o==7 ? 0 : parseInt(o)+1;
    },
    prev: function(o){
      return o==0 ? 7 : parseInt(o)-1;
    },
    degre: function(o) {
      return (o-3) * Math.PI / 4;
    },
    move: function(o, x, y) {
      if(o==types.Orientation.TOPLEFT)
        return {x: x-1, y: y-1};
      if(o==types.Orientation.TOP)
        return {x: x, y: y-1};
      if(o==types.Orientation.TOPRIGHT)
        return {x: x+1, y: y-1};
      if(o==types.Orientation.RIGHT)
        return {x: x+1, y: y};
      if(o==types.Orientation.BOTTOMRIGHT)
        return {x: x+1, y: y+1};
      if(o==types.Orientation.BOTTOM)
        return {x: x, y: y+1};
      if(o==types.Orientation.BOTTOMLEFT)
        return {x: x-1, y: y+1};
      if(o==types.Orientation.LEFT)
        return {x: x-1, y: y};
    }
  };
  
  types.ToolType = { SIMPLE: 0, DOUBLE: 1, CONE: 2, QUAD: 3, REFRACTOR: 4, TRIANGLE: 5, SPLITER: 6 };
  
  types.ToolProperties = [];
    
  var toolMaker = function(type) {
    
    this.icon = new Image();
    this.icon.src = 'images/tool/'+(type.toLowerCase())+'.png';
    
    
    this.type = type;
    
    var empty = function() {
      return [];
    };
    
    var input = [];
    for(var t in types.Orientation)
      input[ types.Orientation[t] ] = empty;
    
    switch(types.ToolType[type]) {
    
      case types.ToolType.SIMPLE: 
        input[types.Orientation.TOPLEFT] = function(color) {
          var output = {};
          output[types.Orientation.BOTTOMLEFT] = color;
          return output;
        };
        input[types.Orientation.TOP] = function(color) {
          var output = {};
          output[types.Orientation.BOTTOM] = color;
          return output;
        };
        input[types.Orientation.BOTTOM] = function(color) {
          var output = {};
          output[types.Orientation.TOP] = color;
          return output;
        };
        input[types.Orientation.BOTTOMLEFT] = function(color) {
          var output = {};
          output[types.Orientation.TOPLEFT] = color;
          return output;
        };
        input[types.Orientation.LEFT] = function(color) {
          var output = {};
          output[types.Orientation.LEFT] = color;
          return output;
        };
        break;
        
      case types.ToolType.DOUBLE: 
        input[types.Orientation.TOPLEFT] = function(color) {
          var output = {};
          output[types.Orientation.BOTTOMLEFT] = color;
          return output;
        };
        input[types.Orientation.TOP] = function(color) {
          var output = {};
          output[types.Orientation.BOTTOM] = color;
          return output;
        };
        input[types.Orientation.TOPRIGHT] = function(color) {
          var output = {};
          output[types.Orientation.BOTTOMRIGHT] = color;
          return output;
        };
        input[types.Orientation.RIGHT] = function(color) {
          var output = {};
          output[types.Orientation.RIGHT] = color;
          return output;
        };
        input[types.Orientation.BOTTOMRIGHT] = function(color) {
          var output = {};
          output[types.Orientation.TOPRIGHT] = color;
          return output;
        };
        input[types.Orientation.BOTTOM] = function(color) {
          var output = {};
          output[types.Orientation.TOP] = color;
          return output;
        };
        input[types.Orientation.BOTTOMLEFT] = function(color) {
          var output = {};
          output[types.Orientation.TOPLEFT] = color;
          return output;
        };
        input[types.Orientation.LEFT] = function(color) {
          var output = {};
          output[types.Orientation.LEFT] = color;
          return output;
        };
        break;
        
      case types.ToolType.CONE:
        input[types.Orientation.TOP] = function(color) {
          var output = {};
          output[types.Orientation.LEFT] = color;
          return output;
        };
        input[types.Orientation.BOTTOM] = function(color) {
          var output = {};
          output[types.Orientation.LEFT] = color;
          return output;
        };
        input[types.Orientation.LEFT] = function(color) {
          var output = {};
          output[types.Orientation.TOP] = color;
          output[types.Orientation.BOTTOM] = color;
          return output;
        };
        break;
        
      case types.ToolType.QUAD: 
        input[types.Orientation.RIGHT] = function(color) {
          var output = {};
          output[types.Orientation.TOP] = color;
          output[types.Orientation.LEFT] = color;
          return output;
        };
        input[types.Orientation.LEFT] = function(color) {
          var output = {};
          output[types.Orientation.TOP] = color;
          output[types.Orientation.RIGHT] = color;
          return output;
        };
        break;
        
      case types.ToolType.REFRACTOR: 
        
        input[types.Orientation.TOPLEFT] = function(color) {
          var output = {};
          output[types.Orientation.BOTTOMRIGHT] = color;
          return output;
        };
        input[types.Orientation.RIGHT] = function(color) {
          var output = {};
          output[types.Orientation.TOPLEFT] = color;
          return output;
        };
        input[types.Orientation.BOTTOMRIGHT] = function(color) {
          var output = {};
          output[types.Orientation.TOPLEFT] = color;
          return output;
        };
        input[types.Orientation.LEFT] = function(color) {
          var output = {};
          output[types.Orientation.BOTTOMRIGHT] = color;
          return output;
        };
        break;
        
      case types.ToolType.TRIANGLE:
        input[types.Orientation.TOPLEFT] = function(color) {
          var output = {};
          output[types.Orientation.RIGHT] = color;
          return output;
        };
        input[types.Orientation.RIGHT] = function(color) {
          var output = {};
          output[types.Orientation.TOPLEFT] = color;
          output[types.Orientation.BOTTOMLEFT] = color;
          return output;
        };
        input[types.Orientation.BOTTOMLEFT] = function(color) {
          var output = {};
          output[types.Orientation.RIGHT] = color;
          return output;
        };
        break;
        
      case types.ToolType.SPLITER: 
        input[types.Orientation.LEFT] = function(color) {
          var output = {};
          var c = types.Color.filter(color, types.Color.R);
          if(c) output[types.Orientation.TOPRIGHT] = c;
          c = types.Color.filter(color, types.Color.G);
          if(c) output[types.Orientation.RIGHT] = c;
          c = types.Color.filter(color, types.Color.B);
          if(c) output[types.Orientation.BOTTOMRIGHT] = c;
          return output;
        };
        break;
    }
    
    
    this.ray = function(orientation, color) {
      return input[orientation](color);
    }
    
    return this;
  };
  
  for(var t in types.ToolType)
    types.ToolProperties[types.ToolType[t]] = new toolMaker(t);
  
}());