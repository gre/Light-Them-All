(function(){
  
  if(!console) console = { log: function(){} };
  
  var isChrome = /chrome/i.test(navigator.userAgent);
  var isAndroidOS = /android/i.test(navigator.userAgent);
  var hasTouch = ('ontouchstart' in window);
  
  var types = lta.types;
  
  var g_width;
  
  var g_currentLevel;
  
  var g_playable = false;
  
  var toolObjectSize = {};
  var caseSize = {};
  var gridSize = { w: 10, h: 10 };
  
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
  
  var Sound = function(node) {
    var player =  $(node).clone()[0];
    return {
      play: function() {
        player.play();
        return this;
      }
    }
  };
  
  var PanelObject = function(arg) {
    var ctx, node, container;
    if(!arg.fillRect) {
      node = arg;
      if(node.is('.toolObjectContainer')) {
        var canvas = $('canvas', node);
        if(canvas.size()==0) {
          var number = $('<div class="number"></div>');
          var canvas = $('<canvas class="toolObject"></canvas>').attr('width', toolObjectSize.w).attr('height', toolObjectSize.h);
          node.show().empty().append(number).append(canvas);
        }
        container = node;
        node = $('canvas', container);
      }
      ctx = node[0].getContext('2d');
    }
    else {
      ctx = arg;
      node = $(ctx.canvas);
      container = node.parents('.toolObjectContainer:first');
    }
    var drawImage = function(img, x, y) {
      if(!x) x=0;
      if(!y) y=0;
      ctx.drawImage(img, x, y, toolObjectSize.w, toolObjectSize.h);
    };
    
    var getNumber = function() {
      return $('.number', container).text() || 0;
    };
    var setNumber = function(n) {
      if(!n) {
        n=0;
        container.addClass('empty');
      }
      else
        container.removeClass('empty');
    
      $('.number', container).attr('value', n).text(n);
    };
    
    return {
      type: function(t) {
        if(typeof(t)!='undefined') 
          this.init(t);
        return node.attr('tooltype');
      },
      node: function() {
        return node;
      },
      init: function(type, o) {
        if(typeof(o)=='undefined') o = types.Orientation.RIGHT;
        var properties = types.ToolProperties[type];
        ctx.save();
        ctx.translate(toolObjectSize.w/2, toolObjectSize.h/2);
        ctx.rotate(types.Orientation.degre(o));
        drawImage(properties.icon, -toolObjectSize.w/2, -toolObjectSize.h/2);
        ctx.restore();
        node.attr('tooltype', type);
        return this;
      },
      number: function(n) {
        if(typeof(n)=="undefined") return getNumber();
        setNumber(n);
        return n;
      },
      decr: function() {
        var val = getNumber();
        setNumber((--val<=0) ? 0 : val);
        return this;
      },
      incr: function() {
        setNumber(getNumber()+1);
        return this;
      }
    }
  };
  
  var Case = lta.Case = function(arg) {
    
    var ctx, node;
    
    if(!arg.fillRect) {
      node = arg;
      ctx = node[0].getContext('2d');
    }
    else {
      ctx = arg;
      node = $(ctx.canvas);
    }
    
    var style = function(style) {
      ctx.fillStyle = style;
    };
    
    var rectAll = function() {
      ctx.fillRect(0, 0, caseSize.w, caseSize.h);
    };
    
    var drawImage = function(img, x, y) {
      if(!x) x=0;
      if(!y) y=0;
      ctx.drawImage(img, x, y, caseSize.w, caseSize.h);
    };
    
    var empty = function(){
      node[0].width = node[0].width;
      ctx.strokeStyle = 'rgba(0,0,0,0.05)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(caseSize.w, caseSize.h);
      ctx.lineTo(0, caseSize.h);
      ctx.lineTo(0, 0);
      ctx.lineTo(caseSize.w, 0);
      ctx.lineTo(caseSize.w, caseSize.h);
      ctx.closePath();
      ctx.stroke(); // TODO : make this with background
    };
    
    var role = function(role) {
      if(typeof(tooltype)!="undefined")
        node.attr("role", role);
      return node.attr("role");
    }
    var orientation = function(o) {
      if(typeof(o)!="undefined")
        node.attr("orientation", o);
      o = node.attr("orientation");
      return o ? parseInt(o) : types.Orientation.RIGHT;
    }
    var tooltype = function(t) {
      if(typeof(t)!="undefined")
        node.attr("tooltype", t);
      return node.attr("tooltype");
    }
    var color = function(c) {
      if(typeof(c)!="undefined")
        node.attr("color", c);
      c = node.attr("color");
      return c ? parseInt(c) : types.Color.R;
    }
    
    return {
      node: function() {
        return node;
      },
      role: role,
      orientation: orientation,
      color: color,
      tooltype: tooltype,
      x: function() {
        return parseInt(node.attr('x'));
      },
      y: function() {
        return parseInt(node.attr('y'));
      },
      hoverin: function() {
        node.addClass('hover');
      },
      hoverout: function() {
        node.removeClass('hover');
      },
      /**
        * type : tool type
        * o : orientation
        */
      tool: function(type, o) {
        empty();
        if(typeof(o)=='undefined') o = orientation();
        var properties = types.ToolProperties[type];
        role('tool');
        tooltype(type);
        orientation(o);
        ctx.save();
        ctx.translate(caseSize.w/2, caseSize.h/2);
        ctx.rotate(types.Orientation.degre(o));
        drawImage(properties.icon, -caseSize.w/2, -caseSize.h/2);
        ctx.restore();
      },
      turnLeft: function() {
        this.tool(tooltype(), types.Orientation.prev(orientation()));
      },
      turnRight: function() {
        this.tool(tooltype(), types.Orientation.next(orientation()));
      },
      empty: function() {
        role('empty');
        empty();
      },
      wall: function(){
        role('wall');
        style('rgb(100,100,100)');
        ctx.fillRect(4, 4, caseSize.w-8, caseSize.h-8);
        style('rgb(150,150,150)');
        ctx.fillRect(caseSize.w/6, caseSize.h/6, 2*caseSize.w/3, 2*caseSize.h/3);
      },
      bomb: function(){
        role('bomb');
        drawImage($('#image_bomb')[0]);
        ctx.fill();
      },
      receptor: function(c, rayOver){
        if(typeof(c)=='undefined') c = color();
        var currentRayAttr = node.attr('ray');
        var newRayAttr = rayOver ? 'on' : 'off';
        if(c==color() && currentRayAttr == newRayAttr) return;
        node.attr('ray', newRayAttr);
        empty();
        role('receptor');
        color(c);
        if(rayOver) {
          ctx.shadowColor = types.Color.rgba(c, 400);
          ctx.shadowBlur = 5;
          style(types.Color.rgba(c),1,300);
        }
        else {
          style(types.Color.rgba(c),1,250);
        }
        ctx.beginPath();
        ctx.arc(caseSize.w/2, caseSize.h/2, caseSize.h/2-4, 0, Math.PI*2, true);
        ctx.fill();
        if(rayOver) {
          ctx.shadowBlur = caseSize.w/4;
          ctx.shadowColor = types.Color.rgba(c, 400);
          style(types.Color.rgba(c,0.8,350));
        }
        else
          style(types.Color.rgba(c,0.8,200));
        ctx.beginPath();
        ctx.arc(caseSize.w/2, caseSize.h/2, caseSize.h/4, 0, Math.PI*2, true);
        ctx.fill();
        ctx.shadowBlur = 0;
      },
      laser: function(c, o){
        if(typeof(o)=='undefined') o = orientation();
        if(typeof(c)=='undefined') c = color();
        empty();
        role('laser');
        color(c);
        orientation(o);
        ctx.save();
        ctx.translate(caseSize.w/2, caseSize.h/2);
        ctx.rotate(types.Orientation.degre(o));
        ctx.shadowBlur = 2;
        ctx.strokeStyle = types.Color.rgba(c,0.2,100);
        ctx.strokeRect(-caseSize.w/2+4, -caseSize.h/4, caseSize.w-8, caseSize.h/2);
        style(types.Color.rgba(c,1,150));
        ctx.fillRect(-caseSize.w/2+4, -caseSize.h/4, caseSize.w-8, caseSize.h/2);
        style(types.Color.rgba(c,1,350));
        ctx.fillRect(4, -caseSize.h/6, caseSize.w/2-8, caseSize.h/3);
        style(types.Color.rgba(c,1,400));
        ctx.fillRect(6, -caseSize.h/6+2, caseSize.w/2-10, caseSize.h/3-4);
        ctx.restore();
      }
    }
  };
  
  var Level = lta.Level = function() {
    
    var level2file = function(level) {
      return 'levels/'+(level<10?'0':'')+level+'.lvl';
    }
    
    var parseLevel = function(data) {
      var appendScript = 'for(var v in types.Orientation) this[v]=types.Orientation[v];'+
      'for(var v in types.Color) this[v]=types.Color[v];'+
      'for(var v in types.ToolType) this[v]=types.ToolType[v];'+
      'var Tool = function(x, y, tool){ this.x = x; this.y = y; for(var k in tool) this[k] = tool[k]; };'+
      'var empty=0;'+
      'var bomb=function(){ return { mapObject: types.MapObject.BOMB } };'+
      'var receptor=function(c){ return { mapObject: types.MapObject.RECEPTOR, color: c } };'+
      'var laser=function(c,o){ return { mapObject: types.MapObject.LASER, color: c, orientation: o } };'+
      'var wall=function(){ return { mapObject: types.MapObject.WALL } };';
      
      var obj;
      try {
        obj = eval(appendScript+'('+data+')');
      }
      catch(e) {
        console.log(e);
        return {};
      }
      return obj;
    };
    
    getGrid = function(level, callback) {
      $.get(level2file(level), function(data) {
        var level = parseLevel(data);
        if($.isEmptyObject(level)) {
          console.log('Unable to parse level.');
        }
        else
          callback(level);
      });
    };
    
    return {
      exists: function(level) {
        return level<3; // todo
      },
      getGrid: getGrid
    }
  }();
  
  var RayTracer = lta.RayTracer = function() {
    
    var lasersCanvas, lasersCtx;
    
    var computedLasers;
    
    var bomb_touched;
    
    var joinArray = function(a, b) {
      var newArray = [];
      for(var i in a)
        newArray.push(a[i]);
      for(var i in b)
        newArray.push(b[i]);
      return newArray;
    };

    /// utils
    var inRange = function(i, a, b) {
      return i>=a && i<b;
    };
    
    var getNextCase = function(current, moveOrientation) {
      var x = parseInt(current.attr('x'));
      var y = parseInt(current.attr('y'));
      var nextPos = types.Orientation.move(moveOrientation, x, y);
      if(!inRange(nextPos.x, 0, gridSize.w) || !inRange(nextPos.y, 0, gridSize.h)) {
        return null;
      }
      else return GameGrid.getCaseNode(nextPos.x, nextPos.y);
    };
    
    var getCasePos = function(c) {
      return { x: c.x(), y: c.y(), obj: c };
    }
    
    var casePosEquals = function(a, b) {
      return a.x==b.x && a.y==b.y;
    };
    
    /// Graphical part
    var resetLasers = function() {
      lasersCanvas.width = lasersCanvas.width;
    }
    var drawLasers = function(lasers) {
      lasersCtx.lineJoin = 'round';
      lasersCtx.shadowBlur = caseSize.w/4;
      lasersCtx.globalCompositeOperation = 'lighter';
      lasersCtx.lineWidth = caseSize.w/8;
      for(var i in lasers) {
        var laser = lasers[i];
        var points = [];
        for(var p in laser.points) {
          var point = laser.points[p];
          var role = point.obj.role();
          
          var offsetX = 0.5, offsetY = 0.5;
          if(p>0 && role=="empty" && (point.x==0 || point.x==gridSize.w-1 || point.y==0 || point.y==gridSize.h-1)) {
            var offset = types.Orientation.move(laser.orientation, 0, 0);
            offsetX = (1+offset.x)/2;
            offsetY = (1+offset.y)/2;
          }
          
          points.push({ x: (offsetX+point.x)*caseSize.w, y: (offsetY+point.y)*caseSize.h });
        }
        lasersCtx.strokeStyle = types.Color.rgba(laser.color, 1, 250);
        lasersCtx.shadowColor = types.Color.rgba(laser.color, 1, 300);
        lasersCtx.beginPath();
        var first = true;
        for(var p in points) {
          var point = points[p];
          if(first) {
            first = false;
            lasersCtx.moveTo(point.x, point.y);
          }
          else {
            lasersCtx.lineTo(point.x, point.y);
          }
        }
        lasersCtx.stroke();
      }
    };
    
    /// Algorithmic part
    
    
    var traceRay = function(laserCase) {
      
      var lasers = [];
      
      var receptors = [];
      
      /*
       * @arg rays : [ { orientation, color, points }, ... ]
       */
      var rayExists = function(points, color, rays) {
        for(var r in rays) {
          var ray = rays[r];
          if(ray.color==color && casePosEquals(ray.points[0], points[0]) && casePosEquals(ray.points[1], points[1]))
            return true;
        }
        return false;
      }
      
      var rec_traceRay = function(caseObj, laserOrientation, color) {
        var originalCasePos = getCasePos(caseObj);
        var laser = {
          orientation: laserOrientation,
          color: color,
          points: [originalCasePos]
        };
        var traces = [];
        
        var pos;
        var nextCase = caseObj;
        var currentCase = caseObj;
        var role = "empty";
        while(nextCase) {
          var nextCaseNode = getNextCase(nextCase.node(), laser.orientation); // TODO : getNextCase doit retourner les coordonnées la prochaine case meme si elle n'existe pas, en revanche on met obj à null et on quitte à la fin de la boucle
          nextCase = nextCaseNode ? new Case(nextCaseNode) : null;
          pos = getCasePos(currentCase);
          
          if(role=="tool") {
            var tool = currentCase.tooltype();
            var caseOrientation = parseInt(currentCase.orientation());
            var relativeCaseOrientation = (-caseOrientation+laser.orientation+7)%8; // todo use a function
            
            var output = types.ToolProperties[tool].ray(relativeCaseOrientation, color);
            
            var currentCasePos = getCasePos(currentCase);
            for(var o in output) {
              var orientation = (5 +caseOrientation + parseInt(o))%8;
              var color = output[o];
              if(!rayExists([originalCasePos, currentCasePos], color, lasers))
                traces.push([currentCase, orientation, color, lasers]);
            }
          }
          else if(role=="bomb") {
            bomb_touched = true;
          }
          else if(role=="receptor") {
            if(laser.color==currentCase.color()) {
              receptors.push(currentCase);
              currentCase.receptor(currentCase.color(), true);
            }
          }
          
          if(role!="empty") {
            nextCase = null;
          }
          
          if(nextCase) {
            role = nextCase.role();
            currentCase = nextCase;
          }
        }
        if(pos) {
          laser.points.push(pos);
          lasers.push(laser);
          for(var t in traces) {
            rec_traceRay.apply(this, traces[t]);
          }
        }
      };
    
      rec_traceRay(laserCase, laserCase.orientation(), laserCase.color());
      
      $('#game .case[role=receptor]').each(function(){
        var receptor = new Case($(this));
        var x = receptor.x();
        var y = receptor.y();
        for(var i in receptors)
          if(receptors[i].x()==x && receptors[i].y()==y)
            return;
        receptor.receptor(receptor.color(), false);
      });
      
      return lasers;
    };
    
    var computeRays = function() {
      var lasers = [];
      bomb_touched = false;
      $('.case[role=laser]').each(function(){
        var laserNode = $(this);
        var laserCase = new Case(laserNode);
        var lasersForThisRay = traceRay(laserCase);
        lasers = joinArray(lasers, lasersForThisRay);
      });
      return computedLasers = lasers;
    };
    
    var trace = function() {
      resetLasers();
      computeRays();
      drawLasers(computedLasers);
      if(bomb_touched)
        Popup.bomb();
      if( $('#game .case[role=receptor][ray=off]').size()==0 ) {
        Popup.levelWin();
      }
    };
    
    return {
      init: function() {
        lasersCanvas = $('#game canvas.lasers')[0];
        lasersCtx = lasersCanvas.getContext('2d');
        $('#game').bind('gridChanged', function(){
          trace();
        });
      },
      trace: trace,
      compute: computeRays
    };
  }();
  $(document).ready(RayTracer.init);
  
  var GameGrid = lta.GameGrid = function() {
    
    var grid = [];
    var tools;
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
      node.bind('draghoverin', function(e, dragging){
        var c = new Case(ctx);
        if(c.role()=='empty') {
          c.hoverin();
          $('#dragHelper').addClass('overEmptyCase');
        }
        else
          $('#dragHelper').removeClass('overEmptyCase');
        
        if(node.is('.dragging'))
          $('#dragHelper').addClass('overDraggingCase');
        else
          $('#dragHelper').removeClass('overDraggingCase');
        
        
      });
      node.bind('draghoverout', function(e, dragging){
        var c = new Case(ctx);
        if(c.role()=='empty') {
          c.hoverout();
        }
      });
      node.bind('dropped', function(e, dragging) {
        dragging = $(dragging);
        if(dragging.is('.toolObjectContainer')) {
          var c = new Case(ctx);
          if(c.role()!='empty') return;
          c.tool($('canvas', dragging).attr('tooltype'));
          new PanelObject(dragging).decr();
          $('#game').trigger('gridChanged').trigger('gridCaseDrop');
        }
        else if(dragging.is('.case')) {
          var c = new Case(ctx);
          if(c.role()!='empty') return;
          var draggingCase = new Case(dragging);
          c.orientation(draggingCase.orientation());
          c.tool(draggingCase.tooltype());
          draggingCase.empty();
          $('#game').trigger('gridChanged').trigger('gridCaseDrop');
        }
      });
      node.bind('touch', function(e) {
        var c = new Case(ctx);
        if(c.role()=='tool') {
          c.turnRight();
          $('#game').trigger('gridChanged').trigger('gridCaseTurn');
        }
      });
    };
    
    return {
      getCaseNode: getCaseNode,
      getCase: getCase,
      start: function(level, placedTools) {
        if(!placedTools) placedTools = [];
        g_playable = false;
        var game = $('#game');
        
        var getPlacedTool = function(x, y) {
          for(var p in placedTools) {
            var placedTool = placedTools[p];
            if(placedTool.x == x && placedTool.y == y) {
              return placedTool;
            }
          }
          return null;
        };
        
        Popup.open("<h1>Chargement...</h1>");
        Level.getGrid(level, function(lvl){
          $('#play .toolbar h1').text(lvl.name||'Game');
          grid = [];
          for(var i=0; i<gridSize.h*gridSize.w; ++i) {
            grid[i] = 0;
          }
          for(var i in lvl.grid) {
            var tool = lvl.grid[i];
            if(tool.x>=0 && tool.y>=0 && tool.x<gridSize.w && tool.y<gridSize.h)
              grid[tool.x + tool.y*gridSize.w] = tool;
          }
          
          tools = lvl.tools;
          
          $('#game .gamePanel .toolObjectContainer').hide().empty();
          
          var size = Math.floor(g_width / tools.length);
          if(size>128) size = 128;
          if(size<caseSize.h) size = caseSize.h;
          toolObjectSize.w = toolObjectSize.h = size;
          
          $('#game .gamePanel').empty();
          for(var i=0; i<tools.length; ++i) {
            var tool = $('<div class="toolObjectContainer"></div>');
            $('#game .gamePanel').append(tool);
          }
          
          var i = 0;
          for(var t in tools) {
            var tool = tools[t];
            new PanelObject($('#game .gamePanel .toolObjectContainer').eq(i++)).init(tool.type).number(tool.number);
          }
          
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
                  var c = new Case(ctx);
                  c.empty();
                  var placedTool = getPlacedTool(x, y);
                  if(placedTool) {
                    var toolNodeContainer = $('#game .toolObject[tooltype='+placedTool.tooltype+']:first').parents('.toolObjectContainer:first');
                    if(toolNodeContainer.size()>0) {
                      var panelObject = new PanelObject(toolNodeContainer);
                      if(panelObject.number()>0) {
                        c.tool(placedTool.tooltype, placedTool.orientation);
                        panelObject.decr();
                      }
                    }
                  }
              }
              ++i;
            }
          }
          
          RayTracer.trace();
          
          $(window).resize();
          
          Popup.levelStart(lvl, function(){
            g_currentLevel = level;
            g_playable = true;
            Main.saveCurrentGame();
          }, (placedTools.length>0));
        });
      },
      
      init: function() {
        var width = g_width;
        var gameGrid = $('#game .gameGrid');
        var appendTo = $('.cases', gameGrid).empty();
        for(var y=0; y<gridSize.h; ++y) {
          for(var x=0; x<gridSize.w; ++x) {
            var i = y*gridSize.w+x;
            var node = casesNode[i] = $('<canvas class="case"></canvas>')
                                      .attr('width', caseSize.w)
                                      .attr('height', caseSize.h)
                                      .attr('index', i)
                                      .attr('x', x)
                                      .attr('y', y)
                                      .appendTo(appendTo);
            cases[i] = node[0].getContext('2d');
            bindCase(node);
          }
        }
      }
    }
  }();
  
  var Popup = lta.Popup = function(){
    
    var g_popup = null;
    
    var oldPlayable = null;
    
    var openPopup = function(content) {
      oldPlayable = g_playable;
      g_playable = false;
      if(!content) content = "";
      g_popup.empty().append($('<div class="content" />').width(g_width-60).append(content)).show();
    };
    
    var close = function(){
      g_popup.hide().empty();
    };
    
    return {
      init: function(){
        if($("#popup").size()==0) $("#game").append('<div id="popup" />');
        g_popup = $("#popup");
        close();
      },
      open: function(content) {
        openPopup(content);
      },
      bomb: function() {
        openPopup('<h1>Failure</h1>'+
        '<p>You exploded a bomb.</p>'+
        '<p class="buttons"><a href="javascript: lta.Game.start('+g_currentLevel+');">Try again</a></p>');
      },
      levelWin: function() {
        var content = '<h1>Success</h1>';
        if(Level.exists(g_currentLevel+1)) {
          content += '<p class="buttons"><a href="javascript: lta.Game.start('+(g_currentLevel+1)+');">next level</a></p>';
        }
        else {
          content += '<p>You have finished all levels !</p>';
        }
        
        openPopup(content);
      },
      levelStart: function(lvl, callback, continueMode) {
        var h1 = $('<h1/>').text(lvl.name||'');
        var description = $('<p class="description" />').text(lvl.description||'');
        var startLevelLink = $('<a href="javascript:;">'+(continueMode ? 'Continue' : 'Start')+' level</a>');
        openPopup($().after(h1).after(description).after($('<p class="buttons" />').append(startLevelLink)));
        if(callback) {
          startLevelLink.click(function(){
            close();
            callback();
          });
        }
      },
      close: function() {
        close();
      }
    }
  }();
  $(document).ready(Popup.init);
  
  var Game = lta.Game = function() {
    
    var getCaseNodeByPosition = function(pageX, pageY) { // TODO : use x and y attr
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
      
      $('#game').bind('gridCaseDrop', function(){
        new Sound('#audio_drop').play();
      });
      $('#game').bind('gridCaseTurn', function(){
        new Sound('#audio_turn').play();
      });
      
      Event.touchstart(function(e) { 
        if(!g_playable) return;
        var node = $(e.target);
          
        if(node.parent().is('.toolObjectContainer')) node = node.parent();
        if(node.is('.toolObjectContainer')) {
          if($('canvas', node).size()==0 || $('.number', node).text()==0) return;
          var draggingPanelObj = new PanelObject($('canvas', node));
          var dragHelper = $('<div id="dragHelper"></div>').hide().append(new PanelObject($('canvas', node).clone()).init(draggingPanelObj.type()).node()).css({
            position: 'absolute',
            width: toolObjectSize.w+'px',
            height: toolObjectSize.h+'px'
          });
          
          node.addClass('dragging');
          $('#game').append(dragHelper);
          e.preventDefault();
        }
        else if(node.is('.case')) {
          var c = new Case(node);
          if(c.role()=='tool') {
            node.addClass('touching');
            e.preventDefault();
          }
        }
      });
      
      Event.touchend(function(e){  
        if(!g_playable) return;
        var target = $(e.target);
        var dragging = $('#game .dragging');
        var dragHelper = $('#dragHelper');
        if(dragging.size()>0) {
          dragging.removeClass('dragging');
          dragging.trigger('dragend');
          dragHelper.remove();
          $('#game .case.draghover').removeClass('draghover').trigger('draghoverout').trigger('dropped', dragging);
        }
        else if(target.is('.case.touching')) {
         target.trigger('touch');
        }
        $('#game .case.touching').removeClass('touching');
      });
      
      Event.touchmove(function(e) {
        e.preventDefault();
        if(!g_playable) return;
        
        var dragHelper = $('#dragHelper');
        var x, y;
        if(e.type=='touchmove') {
          x = e.originalEvent.touches[0].pageX;
          y = e.originalEvent.touches[0].pageY;
        }
        else {
          x = e.pageX;
          y = e.pageY;
        }
        var caseNode = getCaseNodeByPosition(x, y);
        
        if($('#game .touching').size()>0 && caseNode && !caseNode.is('.touching')) {
          var node = $('#game .touching').removeClass('touching').addClass('dragging');
          var c = new Case(node);
          if(c.role()=='tool') {
            var dragHelper = $('<div id="dragHelper"></div>').hide().append(new PanelObject($('<canvas />')).init(c.tooltype(), c.orientation()).node()).css({
              position: 'absolute',
              width: toolObjectSize.w+'px',
              height: toolObjectSize.h+'px'
            });
            node.addClass('dragging');
            $('#game').append(dragHelper);
          }
        }
        
        var dragging = $('#game .dragging');
        
        if(dragging.size()>0) {
          var left = Math.floor(x-toolObjectSize.w/2-$('#game').position().left);
          var top = Math.floor(y-toolObjectSize.h/2-$('#game').position().top);
          dragHelper.show().css({
            top: top+'px',
            left: left+'px'
          });
          if(caseNode) {
            $('#dragHelper').addClass('overGrid');
            if(!caseNode.is('.draghover')) {
              $(caseNode).addClass('draghover');
              caseNode.trigger('draghoverin', dragging);
            }
            caseNode.removeClass('draghover');
          }
          else {
            $('#dragHelper').removeClass('overGrid');
          }
          $('#game .case.draghover').each(function(){
            $(this).removeClass('draghover').trigger('draghoverout', dragging);
          });
          if(caseNode)
            caseNode.addClass('draghover');
        }
      });
    };
    
    return {
      init: function() {
        var width = g_width;
        var size = Math.floor(width/gridSize.w);
        width = gridSize.w*size;
        var height = gridSize.h*size;
        caseSize.w = caseSize.h = size;
        
        var gameGrid = $('#game .gameGrid').width(width).height(height)
        $('.cases', gameGrid).width(width).height(height);
        $('canvas.lasers', gameGrid).attr('width', width).attr('height', height);
        $('#game .gamePanel').width(width);
        
        GameGrid.init();
        bindEvents();
      },
      
      start: function(level, tools) {
        if(!level) level=1;
        GameGrid.start(level, tools);
        Popup.close();
      }
    }
  }();
  
  var Main = lta.Main = function(){
    
    var getCurrentContinuableGame = function() {
      var continuableGame = { 
        timestamp: new Date().getTime(),
        level: g_currentLevel, 
        tools: [] 
      };
      $('#game .cases .case[role=tool]').each(function(){
        var c = new Case($(this));
        continuableGame.tools.push({
          x: c.x(),
          y: c.y(),
          orientation: c.orientation(),
          tooltype: c.tooltype()
        });
      });
      return continuableGame;
    };
    
    var storeContinuableGame = function(continuableGame) {
      return localStorage.setItem('continuableGame', JSON.stringify(continuableGame));
    };
    var retrieveContinuableGame = function() {
      return JSON.parse(localStorage.getItem('continuableGame'));
    };
    
    var updateMenus = function() {
      var continuableGame = retrieveContinuableGame();
      if(!continuableGame) {
        $('.destroyIfNoContinuableGame').hide();
      }
      else {
        $('.destroyIfNoContinuableGame').show();
        $('li.continueGame .date').empty();
        if(continuableGame.timestamp) {
          $('li.continueGame .date').text('played '+prettyDate(new Date(continuableGame.timestamp)));
        }
      }
    };
    
    return {
      saveCurrentGame: function() {
        storeContinuableGame(getCurrentContinuableGame());
      },
      init: function(){
        g_width = $(window).width();
        if(g_width<480) g_width = 320;
        else g_width = 480;
        
        Game.init();
        
        $('#home').bind('pageAnimationEnd', function(event, info){
          updateMenus();
        });
        updateMenus();
        
        $('a.continueGame').click(function(){
          var continuableGame = retrieveContinuableGame();
          Game.start(continuableGame.level, continuableGame.tools);
        });
        
        $('a.newGame').click(function(){
          var continuableGame = retrieveContinuableGame();
          if(!continuableGame || confirm("Cancel last saved game ?")) {
            Game.start();
          }
          else {
            return false;
          }
          // TODO store foreach new level // storeContinuableGame({ level: 1, tools: [] });
        });
        
        $('#game').bind('gridChanged', function(){
          storeContinuableGame(getCurrentContinuableGame());
        });
      }
    }
  }();
  
  $(document).ready(Main.init);
  
}());