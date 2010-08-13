(function(){
  var types = lta.types;
  for(var v in types.Orientation) this[v]=types.Orientation[v];
  for(var v in types.Color) this[v]=types.Color[v];
  for(var v in types.ToolType) this[v]=types.ToolType[v];
  var Tool = function(x, y, tool){ this.x = x; this.y = y; for(var k in tool) this[k] = tool[k]; };
  var empty=0;
  var bomb=function(){ return { mapObject: types.MapObject.BOMB } };
  var receptor=function(c){ return { mapObject: types.MapObject.RECEPTOR, color: c } };
  var laser=function(c,o){ return { mapObject: types.MapObject.LASER, color: c, orientation: o } };
  var wall=function(){ return { mapObject: types.MapObject.WALL } };

data_levels = [
  {
    name: "Level 1 - Getting started",
    description: "Mirror is the key.",
    
    grid: [
      new Tool(0, 4, laser(R, RIGHT)),
      new Tool(6, 9, receptor(R))
    ],
    
    tools: [
      {
        type: SIMPLE,
        number: 1
      }
    ]
  },
  
  {
    name: "Level 2 - Spliting rays",
    description: "One source. Three receptors.",
    
    grid: [
      new Tool(4, 0, laser(G, BOTTOM)),
      new Tool(9, 6, receptor(G)),
      new Tool(6, 9, receptor(G)),
      new Tool(0, 6, receptor(G))
    ],
    
    tools: [
      {
        type: CONE,
        number: 1
      },
      {
        type: QUAD,
        number: 1
      }
    ]
  }
];

}());