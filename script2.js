var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );

var worldOrigin = new THREE.Vector3(0,0,0);
var camera_target = worldOrigin;
var camera_azimuth = 95;
var camera_elevation = 2;
var camera_radius = 10;
var camera_world_azimuth = 95;
var camera_world_elevation = 2;
var camera_world_radius = 10;
var camera_tank_azimuth = 180;
var camera_tank_elevation = 3.14/2;
var camera_tank_radius = 8;
var cameraMode = 0; //camera mode 0 = look at origin, camera mode 1 = look at tank.

var xAxis = new THREE.Vector3(1,0,0);
var yAxis = new THREE.Vector3(0,1,0);
var zAxis = new THREE.Vector3(0,0,1);

var tankSpeed = 0.6;
var tankRotationSpeed = 0.1;
var tank;



function setCameraPosition(target, azimuth, elevation, radius){
  
  camera.position.x = target.x + radius * Math.sin(elevation) * Math.cos(azimuth);
  camera.position.y = target.y + radius * Math.cos(elevation);
  camera.position.z = target.z + radius * Math.sin(elevation) * Math.sin(azimuth);
  
  camera.lookAt(target);
}

setCameraPosition(camera_target, camera_azimuth, camera_elevation, camera_radius);

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

renderer.domElement.addEventListener("wheel", function(wheelEvent){
  camera_radius = (camera_radius + camera_radius * (wheelEvent.deltaY/1000));

  if(camera_radius < 1){
    camera_radius = 1;
  }

  if(cameraMode == 0){
      camera_world_radius = camera_radius;
  }else if(cameraMode == 1){
      camera_tank_radius = camera_radius;
  }

  setCameraPosition(camera_target, camera_azimuth, camera_elevation, camera_radius);
  return false;
});


let mouse_is_down = false;
let camera_start;
let mouse_start;
let downListener = (e) => {
  mouse_is_down = true;
  mouse_start = {x: e.clientX, y: e.clientY};
  camera_start = {a: camera_azimuth, e: camera_elevation};
}
renderer.domElement.addEventListener('mousedown', downListener)
let moveListener = (e) => {
    if(mouse_is_down){
      camera_azimuth = (camera_start.a - (mouse_start.x - e.clientX)/100)%360;
      camera_elevation = camera_start.e + (mouse_start.y - e.clientY)/100;
      if(camera_elevation > 3.14159){
        camera_elevation = 3.14159;
      }else if(camera_elevation < 0.001){
        camera_elevation = 0.001;
      }
      if(cameraMode == 0){
        camera_world_azimuth = camera_azimuth;
        camera_world_elevation = camera_elevation;
    }else if(cameraMode = 1){
        camera_tank_azimuth = camera_azimuth;
        camera_tank_elevation = camera_elevation;
    }

      setCameraPosition(camera_target, camera_azimuth, camera_elevation, camera_radius);
    }
}
renderer.domElement.addEventListener('mousemove', moveListener)
let upListener = (e) => {
  if(mouse_start.x == e.clientX && mouse_start.y == e.clientY){
    // this is a click
    
  }
  mouse_is_down = false;
}
renderer.domElement.addEventListener('mouseup', upListener)

//tank movement

function onBoard(tank){
    return tank.position.x > 0.1 && tank.position.x < map.length - 0.1 && tank.position.z > 0.1 && tank.position.z < map[0].length -0.1;
}
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 87) { //w - forward
        tank.translateZ(tankSpeed);
        if(!onBoard(tank)){
            tank.translateZ(-tankSpeed);
        }
    } else if (keyCode == 83) {//s - backward
        tank.translateZ(-tankSpeed);
        if(!onBoard(tank)){
            tank.translateZ(tankSpeed);
        }
    } else if (keyCode == 65) {//a - turn left
        tank.rotateY(tankRotationSpeed);
        console.log(tank.rotation);
    } else if (keyCode == 68) {//d - turn right
        tank.rotateY(-tankRotationSpeed);
    } else if (keyCode == 67){//c - change camera mode
        cameraMode = (cameraMode == 0) ? (1) : (0);
    }

    if(cameraMode == 0){
        camera_target = worldOrigin;
        camera_azimuth = camera_world_azimuth;
        camera_elevation = camera_world_elevation;
        camera_radius = camera_world_radius;
    }else if(cameraMode = 1){
        camera_target = tank.position;
        camera_azimuth = camera_tank_azimuth;
        camera_elevation = camera_tank_elevation;
        camera_radius = camera_tank_radius;
    }
    setCameraPosition(camera_target, camera_azimuth, camera_elevation, camera_radius);


    //Fix this to be smooth and roate the tank on the x and z
     var x = Math.floor(tank.position.x);
     var z = Math.floor(tank.position.z);
     var w = map[x].length;

     tank.position.y = map[x][z]/30 + tank.geometry.parameters.height / 2;



    
    //tank.rotateX()

   var firstTile = onFirstTile(tank);

   var vertex1 = terrain.vertices[x*w+z];
   var vertex2 = (firstTile) ? (terrain.vertices[x*w+z+1]) : (terrain.vertices[(x+1)*w+z]);
   var vertex3 = terrain.vertices[(x+1)*w+z+1];

   var line1 = {x: vertex1.x - vertex2.x, y: vertex1.y - vertex2.y, z: vertex1.z - vertex2.z};
   var line2 = {x: vertex1.x - vertex3.x, y: vertex1.y - vertex3.y, z: vertex1.z - vertex3.z};

   var normal = crossProduct(line2, line1);
   console.log("normal: ");
   console.log(normal);
   
  // var heights = [terrain.vertices[x*w+z].y, terrain.vertices[x*w+z+1].y, terrain.vertices[(x+1)*w+z+1].y]

};

function onFirstTile(tank){
    var x = tank.position.x % 1;
    var z = tank.position.z % 1;

    return x + z > 1;
}


var light = new THREE.DirectionalLight( 0xffffff, 0.5 );
light.position = new THREE.Vector3(10,1,5);
scene.add( light );

var ambient = new THREE.AmbientLight( 0xffffff, 0.5 );
scene.add( ambient );




// ------- PUT SOME STUFF IN ThE WORLD

var spheres= [{p:new THREE.Vector3(0,13,0), r:1},
              {p:new THREE.Vector3(6,9,0), r:2},
              {p:new THREE.Vector3(-30,6,12), r:5},
              {p:new THREE.Vector3(2,-7,21), r:6},
              {p:new THREE.Vector3(-50,3,32), r:5},
              {p:new THREE.Vector3(40,-11,-4), r:3.3},];

var volume_sphere_radius = 0.7;

var colors = [0xf00ff0, 0xffff00, 0x0f00ff, 0xff0f4f];
var currentColor = 0;

for(var i in spheres){
  let geometry = new THREE.SphereGeometry(spheres[i].r, 12, 8);
  let material = new THREE.MeshLambertMaterial( { color: colors[currentColor] } );
  currentColor = (currentColor + 1)%4;
  let sph = new THREE.Mesh( geometry, material );
  sph.position.x = spheres[i].p.x;
  sph.position.y = spheres[i].p.y;
  sph.position.z = spheres[i].p.z;
  scene.add( sph );
}

//Add a block to move around
let geometry = new THREE.BoxGeometry(0.1,1,0.2);
let material = new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: false});
tank = new THREE.Mesh(geometry, material);
scene.add(tank);
tank.position.set(5, 1, 15);


// -------


// BUILD A TERRAIN
// var map is defined in map.js (generated by server)
// it is a 2d array of heights

var terrain = new THREE.Geometry();

for(var i = 0; i < map.length; i++){
  for(var j = 0; j < map[i].length; j++){
    terrain.vertices.push(new THREE.Vector3(i,map[i][j]/30,j));
  }
}

for(var x = 0; x < map.length-1; x++){
  let w = map[x].length;
  for(var y = 0; y < w-1; y++){
    let f = new THREE.Face3(x*w+y, x*w+y+1, (x+1)*w+y+1);
    let h = [terrain.vertices[x*w+y].y, terrain.vertices[x*w+y+1].y, terrain.vertices[(x+1)*w+y+1].y];
    let d = 20
    f.vertexColors[0] = new THREE.Color(h[0]/d,0.5,0.5);
    f.vertexColors[1] = new THREE.Color(h[1]/d,0.5,0.5);
    f.vertexColors[2] = new THREE.Color(h[2]/d,0.5,0.5);
    terrain.faces.push(f);
    f = new THREE.Face3(x*w+y, (x+1)*w+y+1, (x+1)*w+y);
    h[1] = h[2];
    h[2] = terrain.vertices[(x+1)*w+y].y;
    f.vertexColors[0] = new THREE.Color(h[0]/d,0.5,0.5);
    f.vertexColors[1] = new THREE.Color(h[1]/d,0.5,0.5);
    f.vertexColors[2] = new THREE.Color(h[2]/d,0.5,0.5);
    terrain.faces.push(f);
  }
}

terrain.computeFaceNormals();
terrain.computeVertexNormals();

let mat = new THREE.MeshPhongMaterial({ vertexColors: THREE.VertexColors, wireframe:true });
var m = new THREE.Mesh(terrain, mat);
//var m = new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: true});

m.material.side = THREE.DoubleSide;
scene.add(m);


function animate() {
  requestAnimationFrame( animate );
  renderer.render( scene, camera );


  
}
animate();














function dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

function crossProduct(a, b){
    var c = {x: 0, y: 0, z: 0};
    c.x = a.y * b.z - a.z * b.y;
    c.y = a.z * b.x - a.x * b.z;
    c.z = a.x * b.y - a.y * b.x;
    return c;
}

function squaredLength(v) {
    return dotProduct(v, v);
}

// Returns whether the ray intersects the sphere
// @param[in] center center point of the sphere (C)
// @param[in] radius radius of the sphere (R)
// @param[in] origin origin point of the ray (O)
// @param[in] direction direction vector of the ray (D)
// returns intersection: closest intersection point of the ray with the sphere, if any
//                       otherwise returns false
function intersectRayWithSphere(center, radius,
                                origin, direction) {
    // Solve |O + t D - C|^2 = R^2
    //       t^2 |D|^2 + 2 t < D, O - C > + |O - C|^2 - R^2 = 0
    var OC = {};

    OC.x = origin.x - center.x;
    OC.y = origin.y - center.y;
    OC.z = origin.z - center.z;

    // Solve the quadratic equation a t^2 + 2 t b + c = 0
    var a = squaredLength(direction);
    var b = dotProduct(direction, OC);
    var c = squaredLength(OC) - radius * radius;
    var delta = b * b - a * c;

    if (delta < 0) // No solution
        return false;

    // One or two solutions, take the closest (positive) intersection
    var sqrtDelta = Math.sqrt(delta);

    // a >= 0
    var tMin = (-b - sqrtDelta) / a;
    var tMax = (-b + sqrtDelta) / a;

    if (tMax < 0) // All intersection points are behind the origin of the ray
        return false;

    // tMax >= 0
    var t = tMin >= 0 ? tMin : tMax;

    var intersection = new THREE.Vector3();
    intersection.x = origin.x + t * direction.x;
    intersection.y = origin.y + t * direction.y;
    intersection.z = origin.z + t * direction.z;

    return intersection;
}