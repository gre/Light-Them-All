/// WIP : refactoring with backbone js

$(function(){
  
  var lta = window.lta = {}

  var Color = lta.Color = Backbone.Model.extend({ 
    // Colors constants
    R: 1, G: 2, RG: 3, B: 4, RB: 5, GB: 6, RGB: 7,
    
    initialize: function() {
      var color = this.get('color');
      if(color) {
        var value = 0;
        var self = this;
        _.each(color.toUpperCase().split(''), function(a){
          if(self[a]) value |= self[a];
        });
        this.set({ value: value });
      }
    },
    
    mix: function(c2) { 
      return new Color({ value: this.get('value') | c2.get('value') });
    },
    
    filter: function(c2) { 
      return new Color({ value: this.get('value') & c2.get('value') });
    },
    
    toRgba: function(alpha, lum) {
      var c = this.get('value');
      
      if(typeof(alpha)=='undefined') alpha=1;
      if(typeof(lum)=='undefined') lum=255;
      if(alpha<0) alpha=0;
      if(alpha>1) alpha=1;
      
      var colorOn = Math.min(255,lum);
      var colorOff = Math.min(255,lum-colorOn);
      var r=0, g=0, b=0;
      if(c==this.R) {
        r=colorOn; g=colorOff; b=colorOff;
      }
      else if(c==this.G) {
        r=colorOff; g=colorOn; b=colorOff;
      }
      else if(c==this.B) {
        r=colorOff; g=colorOff; b=colorOn;
      }
      else if(c==this.RG) {
        r=colorOn; g=colorOn; b=colorOff;
      }
      else if(c==this.RB) {
        r=colorOn; g=colorOff; b=colorOn;
      }
      else if(c==this.GB) {
        r=colorOff; g=colorOn; b=colorOn;
      }
      else if(c==this.RGB) {
        r=colorOn; g=colorOn; b=colorOn;
      }
      return 'rgba('+r+','+g+','+b+','+alpha+')';
    }

  });
  
  var Orientation = lta.Orientation = Backbone.Model.extend({
    TOPLEFT: 0, TOP: 1, TOPRIGHT: 2, RIGHT: 3, BOTTOMRIGHT: 4, BOTTOM: 5, BOTTOMLEFT: 6, LEFT: 7,
    
    initialize: function(){
      var orientation = this.get('orientation');
      if(orientation) {
        orientation = orientation.replace(' ', '').toUpperCase()
        var value = -1;
        if(typeof(this[orientation])==='number')
          value = this[orientation];
        this.set({ value: value });
      }
    },
    
    next: function(){
      var val = this.get('value');
      return new Orientation({ value: val==7 ? 0 : val+1 });
    },
    prev: function(){
      var val = this.get('value');
      return new Orientation({ value: val==0 ? 7 : val-1 });
    },
    toRadian: function() {
      return (this.get('value')-3) * Math.PI / 4;
    },
    movePosition: function(x, y) {
      var val = this.get('value');
      if(val==types.Orientation.TOPLEFT)
        return {x: x-1, y: y-1};
      if(val==types.Orientation.TOP)
        return {x: x, y: y-1};
      if(val==types.Orientation.TOPRIGHT)
        return {x: x+1, y: y-1};
      if(val==types.Orientation.RIGHT)
        return {x: x+1, y: y};
      if(val==types.Orientation.BOTTOMRIGHT)
        return {x: x+1, y: y+1};
      if(val==types.Orientation.BOTTOM)
        return {x: x, y: y+1};
      if(val==types.Orientation.BOTTOMLEFT)
        return {x: x-1, y: y+1};
      if(val==types.Orientation.LEFT)
        return {x: x-1, y: y};
    }
  });
  
  /*
   * A game object displayable on the Map
   * - kind : receptor, laser, wall, bomb, tool
   */
  var MapObject = lta.MapObject = Backbone.Model.extend({
    
    ray: function() {
      
    }
    
    // Some methods used by map view
  });
  
  var Tool = lta.Tool = Backbone.MapObject.extend({
    
     initialize: function() {
       this.set({ kind: 'tool' });
       var type = this.get('type');
       var icon = new Image();
       icon.src = 'images/tool/'+(type.toLowerCase())+'.png';
       this.set({icon: icon});
     },
     
     ray: function(orientation, color) {
       
     }
    
  });
  
  var ToolCollection = lta.ToolCollection = Backbone.Collection.extend({
    model: Tool
  });
  
  
  var Sound = lta.Sound = Backbone.Model.extend({
    
  });
  
  var Level = lta.Level = Backbone.Model.extend({
    
  });
  
  var Case = lta.Case = Backbone.Model.extend({
    
  });
  
  var Grid = lta.Grid = Backbone.Model.extend({
    
  });
  
  // Manage the laser canvas
  var RayTracer = lta.RayTracer = Backbone.View.extend({
    
  });
  
  // Manage the bottom panel with tools
  var Panel = lta.Panel = Backbone.View.extend({
    
  });
  
  // Manage the grid canvas (objects canvas)
  var GridView = lta.GridView = Backbone.View.extend({
    
  });
  
  // Manage the game
  var Game = lta.Game = Backbone.Controller.extend({
    
  });
  
  
});

