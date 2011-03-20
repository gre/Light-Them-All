/// WIP : refactoring with backbone js

(function(){
  
  if(!console) console = { log: function(){}, error: function(){} };
  
  var isChrome = /chrome/i.test(navigator.userAgent);
  var isAndroidOS = /android/i.test(navigator.userAgent);
  var hasTouch = ('ontouchstart' in window);
  
  var g_width = $(window).width();
  if(g_width<480) g_width = 320;
  else g_width = 480;
  
(function(lta){
  
  var Event = lta.Event = {};
  (function(Event){
    _.extend(Event, Backbone.Events);
    var useTouch = hasTouch && !isChrome;
    $(document).bind(useTouch ? 'touchstart' : 'mousedown', function(e){
      Event.trigger('touchstart', e);
    });
    $(document).bind(useTouch ? 'touchmove' : 'mousemove', function(e){
      Event.trigger('touchmove', e);
    });
    $(document).bind(useTouch ? 'touchend' : 'mouseup', function(e){
      Event.trigger('touchend', e);
    });
  }(Event));
  
  
  var Color = lta.Color = Backbone.Model.extend({ 
    // Colors constants
    R: 1, G: 2, RG: 3, B: 4, RB: 5, GB: 6, RGB: 7,
    
    defaults: {
      value: this.R
    },
    
    initialize: function() {
      var color = this.get('color');
      if(color) {
        var value = 0;
        var self = this;
        _.each(color.toUpperCase(), function(a){
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
    
    defaults: {
      value: this.RIGHT
    },
    
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
    
    val: function(){
      return this.get('value'); 
    },
    
    next: function(){
      var val = this.get('value');
      return new Orientation({ value: val===7 ? 0 : val+1 });
    },
    prev: function(){
      var val = this.get('value');
      return new Orientation({ value: val===0 ? 7 : val-1 });
    },
    toRadian: function() {
      return (this.get('value')-3) * Math.PI / 4;
    }
  });
  
  var Position = lta.Position = Backbone.Model.extend({
    initialize: function(){
      
    },
    x: function(v) {
      if(typeof(v)==="undefined")
        return this.get('x');
      this.set({ x: v });
      return this;
    },
    y: function(v) {
      if(typeof(v)==="undefined")
        return this.get('y');
      this.set({ y: v });
      return this;
    },
    move: function(orientation) {
      var val = orientation.get('value');
      if(val==orientation.TOPLEFT)
        return this.x(x-1).y(y-1);
      if(val==orientation.TOP)
        return this.y(y-1);
      if(val==orientation.TOPRIGHT)
        return this.x(x+1).y(y-1);
      if(val==orientation.RIGHT)
        return this.x(x+1);
      if(val==orientation.BOTTOMRIGHT)
        return this.x(x+1).y(y+1);
      if(val==orientation.BOTTOM)
        return this.y(y+1);
      if(val==orientation.BOTTOMLEFT)
        return this.x(x-1).y(y+1);
      if(val==orientation.LEFT)
        return this.x(x-1);
    }
  })
  
  
  
  
  var ToolType = lta.ToolType = Backbone.Model.extend({
    initialize: function() {
      var type = this.get('type');
      var icon = new Image();
      var self = this;
      icon.onload = function(){ self.trigger('icon-load') }
      icon.src = 'images/tool/'+(type.toLowerCase())+'.png';
      this.set({ icon: icon });
      var rayTransforms = this.get('rayTransforms');
      this.input = [];
      for(var o in rayTransforms)
        this.input[new Orientation({ orientation: o }).val()] = rayTransforms[o];
    },
    ray: function(orientation, color) {
      var f = this.input[orientation.val()];
      if(typeof(f)==='undefined') return {};
      return f(color);
    }
  })
  
  var ToolCollection = lta.ToolCollection = Backbone.Collection.extend({
    model: ToolType,
    findByType: function(type) {
      return this.find(function(el){ return el.get('type') === type.toUpperCase() });
    }
  });
  
  // A game object displayable on the Map
  var MapObject = lta.MapObject = Backbone.Model.extend({
    
    defaults: {
      kind: 'none', // receptor, laser, wall, bomb, tool
      orientation: new Orientation,
      position: new Position
    },
    
    position: function(val) {
      if(typeof(val)==='undefined')
        return this.get('position');
      this.set({ position: val });
      return this;
    },
    
    orientation: function(val) {
      if(typeof(val)==='undefined')
        return this.get('orientation');
      this.set({ orientation: val });
      return this;
    },
    
    turnLeft: function() {
      orientation( orientation().next() );
    },
    
    turnRight: function() {
      orientation( orientation().prev() );
    },
    
    ray: function() {
      
    }
  });
  
  var Bomb = lta.Bomb = MapObject.extend({
    defaults: {
      kind: 'bomb'
    }
  })
  
  var Laser = lta.Laser = MapObject.extend({
    defaults: {
      color: new Color,
      kind: 'laser'
    },
    color: function(val) {
      if(typeof(val)==='undefined')
        return this.get('color');
      this.set({ color: val });
      return this;
    }
  })
  
  var Receptor = lta.Receptor = MapObject.extend({
    defaults: {
      color: new Color,
      kind: 'receptor'
    },
    color: function(val) {
      if(typeof(val)==='undefined')
        return this.get('color');
      this.set({ color: val });
      return this;
    }
  })
  
  var Tool = lta.Tool = MapObject.extend({
    
    defaults: {
      kind: 'tool',
      type: null
    },
    
    initialize: function() {
      this.type = this.get('type');
    },
    
    ray: function() {
      return this.type.apply(this.type, arguments);
    }
    
  });
  
  
  var Sound = lta.Sound = Backbone.Model.extend({
    initialize: function(){
      this.player =  $(this.get('node')).clone()[0];
    },
    play: function() {
      this.player.play();
      return this;
    }
  });
  
  // The grid object
  var Map = lta.Map = Backbone.Collection.extend({
    model: MapObject,
    initialize: function(){
      
    },
    getByPosition: function(x, y) {
      return this.find(function(obj){
        var pos = obj.position();
        return (pos.x()==x && pos.y()==y);
      });
    }
  });
  
  var PanelTool = lta.PanelTool = Backbone.Model.extend({
    defaults: {
      number: 0,
      tooltype: null
    },
    initialize: function(){
      
    },
    number: function(val) {
      if(typeof(val)==='undefined') return this.get('number');
      this.set({ number: val });
      return this;
    }
  });
  
  var Panel = lta.Panel = Backbone.Collection.extend({
    model: PanelTool
  })
  
  var Level = lta.Level = Backbone.Model.extend({
    initialize: function(){
      var cases = []
      var tools = []
      _.each(this.get('grid'), function(obj){
        var clazz = obj[2];
        var instance = new clazz();
        instance.position(new Position({ x: obj[0], y: obj[1] }));
        if(obj[3]) instance.color(new Color({ color: obj[3] }));
        if(obj[4]) instance.orientation(new Orientation({ orientation: obj[4] }));
        cases.push(instance);
      })
      _.each(this.get('tools'), function(t){
        tools.push(new PanelTool({ number: t.number, tooltype: lta.tools.findByType(t.type) }));
      })
      this.grid = new Map(cases);
      this.panel = new Panel(tools);
      this.width = this.get('width');
      this.height = this.get('height');
    },
    
    start: function(){
      
    }
  });
  
  var LevelCollection = lta.LevelCollection = Backbone.Collection.extend({
    model: Level,
    findByNum: function(num) {
      return this.models[num];
    }
  })
  
  
  // Manage the laser canvas
  var RayTracer = lta.RayTracer = Backbone.View.extend({
    initialize: function() {
      
    },
    render: function(){
      
    }
  });
  
  var Case = lta.Case = Backbone.View.extend({
    initialize: function() {
      var appendTo = this.options.container;
      this.w = this.options.width;
      this.h = this.options.height;
      
      var node = $('<canvas class="case"></canvas>')
                  .attr('width', this.w)
                  .attr('height', this.h)
                  .attr('index', this.options.index)
                  .attr('x', this.options.x)
                  .attr('y', this.options.y)
                  .appendTo(appendTo);
      
      this.el = node;
      this.ctx = this.el[0].getContext('2d');
      
      // TODO bind events : hoverin, hoverout
      
    },
    
    empty: function() {
      var ctx = this.ctx;
      this.el[0].width = this.el[0].width;
      ctx.strokeStyle = 'rgba(0,0,0,0.05)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.w, this.h);
      ctx.lineTo(0, this.h);
      ctx.lineTo(0, 0);
      ctx.lineTo(this.w, 0);
      ctx.lineTo(this.w, this.h);
      ctx.closePath();
      ctx.stroke();
    },
    
    render: function(o) {
      var ctx = this.ctx;
      this.empty();
      if(!o) return;
      ctx.save();
          
      switch(o.get('kind')) {
        case 'tool':
          ctx.translate(this.w/2, this.h/2);
          ctx.rotate(o.orientation().toRadian());
          ctx.drawImage(tooltype.get('icon'), -this.w/2, -this.h/2, this.w, this.h);
        break;
        
        case 'wall':
          ctx.fillStyle = 'rgb(100,100,100)';
          ctx.fillRect(4, 4, this.w-8, this.h-8);
          ctx.fillStyle = 'rgb(150,150,150)';
          ctx.fillRect(this.w/6, this.h/6, 2*this.w/3, 2*this.h/3);
        break;
      
        case 'bomb':
          drawImage($('#image_bomb')[0], 0, 0, this.w, this.h)
        break;
      
        case 'receptor':
          var c = o.color();
          var rayOver = o.get('rayOver');
          if(rayOver) {
            ctx.shadowColor = c.toRgba(400);
            ctx.shadowBlur = 5;
            ctx.fillStyle = c.toRgba(1,300);
          }
          else {
            ctx.fillStyle = c.toRgba(1,250);
          }
          ctx.beginPath();
          ctx.arc(this.w/2, this.h/2, this.h/2-4, 0, Math.PI*2, true);
          ctx.fill();
          if(rayOver) {
            ctx.shadowBlur = this.w/4;
            ctx.shadowColor = c.toRgba(400);
            ctx.fillStyle = c.toRgba(0.8,350);
          }
          else {
            ctx.fillStyle = c.toRgba(0.8,200);
          }
          ctx.beginPath();
          ctx.arc(this.w/2, this.h/2, this.h/4, 0, Math.PI*2, true);
          ctx.fill();
          ctx.shadowBlur = 0;
        break;
      
        case 'laser':
          var c = o.color();
          ctx.translate(this.w/2, this.h/2);
          ctx.rotate(o.orientation().toRadian());
          ctx.shadowBlur = 2;
          ctx.strokeStyle = c.toRgba(0.2,100);
          ctx.strokeRect(-this.w/2+4, -this.h/4, this.w-8, this.h/2);
          ctx.fillStyle = c.toRgba(1,150);
          ctx.fillRect(-this.w/2+4, -this.h/4, this.w-8, this.h/2);
          ctx.fillStyle = c.toRgba(1,350);
          ctx.fillRect(4, -this.h/6, this.w/2-8, this.h/3);
          ctx.fillStyle = c.toRgba(1,400);
          ctx.fillRect(6, -this.h/6+2, this.w/2-10, this.h/3-4);
      }
      
      ctx.restore();
    }
  })
  
  // Manage the grid canvas (objects canvas)
  var GridView = lta.GridView = Backbone.View.extend({
    initialize: function() {
      var gridWidth = this.gridWidth = this.options.gridWidth;
      var gridHeight = this.gridHeight = this.options.gridHeight;
      
      var caseSize = Math.floor(this.options.width/gridWidth);
      var width = gridWidth*caseSize;
      var height = gridHeight*caseSize;
      
      this.el.width(width).height(height)
      this.$('.cases').width(width).height(height)
      this.$('canvas.lasers').attr('width', width).attr('height', height);
      
      var casesNode = [];
      var appendTo = this.$('.cases').empty();
      for(var y=0; y<gridHeight; ++y) {
        for(var x=0; x<gridWidth; ++x) {
          var i = y*gridWidth+x;
          casesNode[i] = new Case({ container: appendTo, width: caseSize, height: caseSize, index: i, x: x, y: y });
        }
      }
      this.cases = casesNode;
      this.raytracer = new RayTracer({ el: this.$('canvas.lasers'), model: this.model, width: width, height: height });
    },
    
    render: function() {
      var self = this;
      _.each(this.cases, function(c, i){
        var x = i % self.gridWidth;
        var y = Math.floor(i/self.gridWidth);
        var o = self.model.getByPosition(x, y);
        c.render(o);
      })
      this.raytracer.render();
    }
  });
  
  var PanelToolView = lta.PanelToolView = Backbone.View.extend({
    initialize: function() {
      this.width = this.options.width;
      this.height = this.options.height;
      var number = $('<div class="number"></div>');
      var canvas = $('<canvas class="toolObject"></canvas>')
                    .attr('width', this.options.width)
                    .attr('height', this.options.height);
      this.el.show().empty().append(number).append(canvas);
      this.ctx = canvas[0].getContext('2d');
      this.render();
    },
    
    render: function() {
      this.$('.number').text(this.model.get('number'));
      var ctx = this.ctx;
      ctx.save();
      ctx.translate(this.width/2, this.height/2);
      ctx.rotate(new Orientation('right').toRadian());
      ctx.drawImage(this.model.get('tooltype').get('icon'), -this.width/2, -this.height/2, this.width, this.height);
      ctx.restore();
    }
  })
  
  // Manage the bottom panel with tools
  var PanelView = lta.PanelView = Backbone.View.extend({
    initialize: function() {
      var panelWidth = this.options.width;
      var size = Math.floor(panelWidth / this.model.length);
      if(size>128) size = 128;
      this.$('.gamePanel').width(panelWidth).empty();
      this.model.each(function(o){
        var tool = $('<div class="toolObjectContainer"></div>');
        this.$('.gamePanel').append(tool);
        new PanelToolView({ el: tool, model: o, width: size, height: size });
      })
    },
    render: function() {
      
    }
  });
  
  var LevelView = lta.LevelView = Backbone.View.extend({
    initialize: function(){
      var gridHeight = this.model.height;
      var gridWidth = this.model.width;
      var width = g_width;
      
      this.panel = new PanelView({ el: this.$('.gamePanel'), model: this.model.panel, width: width })
      this.grid = new GridView({ el: this.$('.gameGrid'), model: this.model.grid, width: width, gridWidth: gridWidth, gridHeight: gridHeight })
      this.render();
    },
    render: function() {
      this.panel.render();
      this.grid.render();
    }
  })
  
  // Manage the game
  var GameController = lta.GameController = Backbone.Controller.extend({
    routes: {
      '!/': 'home',
      '!/resume': 'resume',
      '!/newgame': 'newgame',
      '!/levels': 'levels',
      '!/help': 'help',
      '!/play/:level': 'play'
    },
    initialize: function(){
      
    },
    
    home: function(){
      
    },
    resume: function(){
      console.log('todo')
    },
    newgame: function(){
      location.hash = '#!/play/0';
    },
    levels: function(){
      console.log('todo');
    },
    help: function(){
      console.log('todo');
    },
    play: function(level) {
      $('#home').hide();
      var levelObj = lta.levels.findByNum(level);
      this.view = new LevelView({ el: $('#game'), model: levelObj })
    }
  });
  
}(window.lta));
  
  /// Main
  
  lta.tools = new lta.ToolCollection([
    new lta.ToolType({
      type: 'SIMPLE',
      rayTransforms: {
        topleft: function(color) { return { bottomleft: color } },
            top: function(color) { return { bottom: color } },
         bottom: function(color) { return { top: color } },
     bottomleft: function(color) { return { topleft: color } },
           left: function(color) { return { left: color } }
      }
    }),
    new lta.ToolType({
      type: 'DOUBLE',
      rayTransforms: {
        topleft: function(color) { return { bottomleft: color } },
            top: function(color) { return { bottom: color } },
       topright: function(color) { return { bottomright: color } },
          right: function(color) { return { right: color } },
    bottomright: function(color) { return { topright: color } },
         bottom: function(color) { return { top: color } },
     bottomleft: function(color) { return { topleft: color } },
           left: function(color) { return { left: color } }
      }
    }),
    new lta.ToolType({
      type: 'CONE',
      rayTransforms: {
            top: function(color) { return { left: color } },
         bottom: function(color) { return { left: color } },
           left: function(color) { return { top: color, bottom: color } }
      }
    }),
    new lta.ToolType({
      type: 'QUAD',
      rayTransforms: {
          right: function(color) { return { top: color, left: color } },
           left: function(color) { return { top: color, right: color } }
      }
    }),
    new lta.ToolType({
      type: 'REFRACTOR',
      rayTransforms: {
        topleft: function(color) { return { bottomright: color } },
          right: function(color) { return { topleft: color } },
    bottomright: function(color) { return { topleft: color } },
           left: function(color) { return { bottomright: color } }
      }
    }),
    new lta.ToolType({
      type: 'TRIANGLE',
      rayTransforms: {
        topleft: function(color) { return { right: color } },
        right: function(color) { return { topleft: color, bottomleft: color } },
        bottomleft: function(color) { return { right: color } }
      }
    }),
    new lta.ToolType({
      type: 'SPLITER',
      rayTransforms: {
        left: function(color) { return {
          topright: color.filter(new Color('R')),
          right: color.filter(new Color('G')),
          bottomright: color.filter(new Color('B')) } }
      }
    })
  ]);
  
  lta.levels = new lta.LevelCollection([
    {
      name: "Level 1 - Getting started",
      description: "Mirror is the key.",
      
      width: 10,
      height: 10,
      
      grid: [
        [0, 4, lta.Laser, 'r', 'right'],
        [6, 9, lta.Receptor, 'r']
      ],
      
      tools: [
        { type: 'SIMPLE', number: 1 }
      ]
    },
    
    {
      name: "Level 2 - Spliting rays",
      description: "One source. Three receptors.",
      
      width: 10,
      height: 10,
      
      grid: [
        [4, 0, lta.Laser, 'G', 'BOTTOM'],
        [9, 6, lta.Receptor, 'G'],
        [6, 9, lta.Receptor, 'G'],
        [0, 6, lta.Receptor, 'G']
      ],
      
      tools: [
        { type: 'CONE', number: 1 },
        { type: 'QUAD', number: 1 }
      ]
    }
  ])
  
  var game = new lta.GameController();
  
  Backbone.history.start()
}());

