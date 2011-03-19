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
  

});

