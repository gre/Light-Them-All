(function(){
  
  var types = lta.types = {};
  
  types.Color = { R: 1, G: 2, RG: 3, B: 4, RB: 5, GB: 6, RGB: 7,
    mix: function(c1, c2) { 
      return c1 | c2;
    },
    filter: function(c1, c2) { 
      return c1 & c2; 
    }
  };
  
  types.MapObject = { RECEPTOR: 1, LASER: 2, WALL: 3, BOMB: 4 };
  
  types.LevelMap = {};
  
  types.Orientation = { TOPLEFT: 0, TOP: 1, TOPRIGHT: 2, RIGHT: 3, BOTTOMRIGHT: 4, BOTTOM: 5, BOTTOMLEFT: 6, LEFT: 7,
    next: function(o){
      return (o+1)%8;
    },
    prev: function(o){
      return (o-1)%8;
    }
  };
  
  types.ToolType = { SIMPLE: 0, DOUBLE: 1, CONE: 2, QUAD: 3, REFRACTOR: 4, TRIANGLE: 5, SPLITER: 6 };
  
  types.Tool = [];
    
  var toolMaker = function(type) {
    
    this.icon = 'images/tool_'+type+'.png';
    
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
          var c = types.Color.mix(color, types.Color.R);
          if(c) output[types.Orientation.TOPRIGHT] = c;
          c = types.Color.mix(color, types.Color.G);
          if(c) output[types.Orientation.RIGHT] = c;
          c = types.Color.mix(color, types.Color.B);
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
    types.Tool[types.ToolType[t]] = new toolMaker(t);
  
}());