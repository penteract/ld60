
//height of silt above bedrock
//var ground:number[][] = [];

//height from bedrock
//var water:number[][] = [];

//assumption: water>=ground

type SimState = {
  water:number[][],
  ground:number[][],
  pumps:[number,number][]
}
  

export var W=50
export var H=50
export var dt =1/40

export function init() : SimState{
  return {
        //new SimState(params.nx,params.ny,params.H,params.dt,document.getElementById("drop_range").value);
        water:new Array(W).fill(0).map(()=>new Array(H).fill(0)),
        ground:new Array(W).fill(0).map(()=>new Array(H).fill(0)),
        pumps:[]
      }
}

export function step(sim:SimState){
  let {water,ground} = sim
  //var newwater = new Array(W).fill(0).map(()=>new Array(H).fill(0))
  for(let xy=0;xy<W+H-1;xy++){
    for(let x=Math.max(0,xy-(H-1));x<Math.min(W,xy+1);x++){
      let y = xy - x;
      //console.log(x,y)
      if (x==0 || x==W-1 || y==0 || y==H-1){
        water[x][y]=W+H -xy*0.1
      }
      if(x>0 && y>0){
        for (let [dx,dy] of [[-1,0],[0,-1]]){
          let w = water[x+dx][y+dy]
          let g = ground[x+dx][y+dy]
          let hd = water[x][y] - w
          let flow = hd*dt
          // can't have more flowing out than the amount of water above ground on the tile
          flow = Math.max(flow,g-w)
          flow = Math.min(flow,water[x][y]-ground[x][y])
          water[x][y]-=flow
          water[x+dx][y+dy]+=flow
        }
      }
    }
  }
}
