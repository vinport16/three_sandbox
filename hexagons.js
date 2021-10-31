var height =
       [[1,2,3,1,2,1],
        [3,3,4,2,2,3],
        [5,2,3,1,4,5],
        [7,4,6,8,5,4],
        [9,5,3,5,8,4],
        [6,9,12,9,7,3]];

var ny = height.length;
var nx = height[0].length;

var colors = [0xf00ff0, 0xffff00, 0x0f00ff, 0xff0fff];
var currentColor = 0;


for(y in height){
  for(x in height[y]){
    let p = new THREE.Vector3(x-nx/2, height[y][x]/2, y-ny/2);
    //p.z = p.z;
    if(y%2 == 0){
      p.x = p.x + 2/Math.sqrt(3);
    }
    let geometry = HexGeometry(1, height[y][x]);
    let material = new THREE.MeshLambertMaterial( { color: colors[currentColor] } );
    currentColor = (currentColor + 1)%4;
    let hex = new THREE.Mesh( geometry, material );
    hex.position.x = p.x;
    hex.position.y = p.y;
    hex.position.z = p.z;
    scene.add( hex );
  }
}


// ===== geometry ===== //

function HexGeometry(scale = 1, height = scale){
  var geometry = new THREE.Geometry();
  
  // bottom face
  geometry.vertices.push(new THREE.Vector3(0,-1.5,-2)); // vert 0
  geometry.vertices.push(new THREE.Vector3(2,-1.5,-1));
  geometry.vertices.push(new THREE.Vector3(2,-1.5,1));
  geometry.vertices.push(new THREE.Vector3(0,-1.5,2));
  geometry.vertices.push(new THREE.Vector3(-2,-1.5,1));
  geometry.vertices.push(new THREE.Vector3(-2,-1.5,-1)); // vert 5
  
  geometry.faces.push(new THREE.Face3(0, 1, 2));
  geometry.faces.push(new THREE.Face3(0, 2, 3));
  geometry.faces.push(new THREE.Face3(0, 3, 4));
  geometry.faces.push(new THREE.Face3(0, 4, 5));


  //top face
  geometry.vertices.push(new THREE.Vector3(0,1.5,-2)); // vert 6
  geometry.vertices.push(new THREE.Vector3(2,1.5,-1));
  geometry.vertices.push(new THREE.Vector3(2,1.5,1));
  geometry.vertices.push(new THREE.Vector3(0,1.5,2));
  geometry.vertices.push(new THREE.Vector3(-2,1.5,1));
  geometry.vertices.push(new THREE.Vector3(-2,1.5,-1)); // vert 11
  
  geometry.faces.push(new THREE.Face3(6, 8, 7));
  geometry.faces.push(new THREE.Face3(6, 9, 8));
  geometry.faces.push(new THREE.Face3(6, 10, 9));
  geometry.faces.push(new THREE.Face3(6, 11, 10));

  //sides
  geometry.faces.push(new THREE.Face3(6,1,0));
  geometry.faces.push(new THREE.Face3(7,1,6));
  
  geometry.faces.push(new THREE.Face3(7,2,1));
  geometry.faces.push(new THREE.Face3(8,2,7));

  geometry.faces.push(new THREE.Face3(8,3,2));
  geometry.faces.push(new THREE.Face3(9,3,8));

  geometry.faces.push(new THREE.Face3(9,4,3));
  geometry.faces.push(new THREE.Face3(10,4,9));

  geometry.faces.push(new THREE.Face3(10,5,4));
  geometry.faces.push(new THREE.Face3(11,5,10));

  geometry.faces.push(new THREE.Face3(11,0,5));
  geometry.faces.push(new THREE.Face3(6,0,11));

  geometry.scale(scale/4, height/4, scale/4);

  geometry.computeFaceNormals();

  return geometry;
}
