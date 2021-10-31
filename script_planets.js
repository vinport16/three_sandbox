var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );

var camera_target = new THREE.Vector3(0,0,0);
var camera_azimuth = 95;
var camera_elevation = 2;
var camera_radius = 10;

// lets have some spheres
var spheres= [{p:new THREE.Vector3(0,13,0), r:1},
              {p:new THREE.Vector3(6,9,0), r:1},
              {p:new THREE.Vector3(-30,6,12), r:1},
              {p:new THREE.Vector3(2,-7,21), r:1},
              {p:new THREE.Vector3(-50,3,32), r:1},
              {p:new THREE.Vector3(40,-11,-4), r:1},];

// lets have some tubes
var tubes= [{p1:new THREE.Vector3(0,13,0), p2:new THREE.Vector3(6,9,0), r:0.5},
            {p1:new THREE.Vector3(-30,6,12), p2:new THREE.Vector3(2,-7,21), r:0.5},
            {p1:new THREE.Vector3(-50,3,32), p2:new THREE.Vector3(2,-7,21), r:0.5}];

var volume_sphere_radius = 0.7;

// lets draw the spheres
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

//lets draw the tubes
for(var i in tubes){
  let geometry = new THREE.CylinderGeometry(tubes[i].r, tubes[i].r, tubes[i].p1.distanceTo(tubes[i].p2), 12);
  let material = new THREE.MeshLambertMaterial( { color: colors[currentColor] } );
  currentColor = (currentColor + 1)%4;
  let tube = new THREE.Mesh( geometry, material );
  
  // orient in world
  // find center position
  middle = (new THREE.Vector3(0,0,0).add(tubes[i].p1).add(tubes[i].p2)).divideScalar(2)
  tube.position.x = middle.x;
  tube.position.y = middle.y;
  tube.position.z = middle.z;
  // rotate about center
  tube.setRotationFromQuaternion(quart_between(tubes[i].p1, tubes[i].p2));

  scene.add( tube );
}

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
      setCameraPosition(camera_target, camera_azimuth, camera_elevation, camera_radius);
    }
}
renderer.domElement.addEventListener('mousemove', moveListener)
let upListener = (e) => {
  if(mouse_start.x == e.clientX && mouse_start.y == e.clientY){
    // this is a click
    // shoot a vector to see if there's a new camera target

    var raycaster = new THREE.Raycaster();
    var rect = renderer.domElement.getBoundingClientRect();
    let mouse = new THREE.Vector2();
    mouse.x = ( ( e.clientX - rect.left ) / ( rect.width - rect.left ) ) * 2 - 1;
    mouse.y = - ( ( e.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
    raycaster.setFromCamera( mouse.clone(), camera );
    let ray = raycaster.ray;

    // see if line hits sphere
    let hitSphere = false;
    let hitPos = {};
    for(var i in spheres){
      let intersection = intersectRayWithSphere(spheres[i].p, spheres[i].r, ray.origin, ray.direction);
      if(intersection && (!hitSphere || camera.position.distanceTo(intersection) < camera.position.distanceTo(hitPos))){
        hitSphere = spheres[i];
        hitPos = intersection;
      }
    }

    if(hitSphere){
      camera_target = hitSphere.p;
      setCameraPosition(camera_target, camera_azimuth, camera_elevation, camera_radius);
    }
    
  }
  mouse_is_down = false;
}
renderer.domElement.addEventListener('mouseup', upListener)


var light = new THREE.DirectionalLight( 0xffffff, 0.5 );
light.position = new THREE.Vector3(10,1,5);
scene.add( light );

var ambient = new THREE.AmbientLight( 0xffffff, 0.5 );
scene.add( ambient );


function animate() {
  requestAnimationFrame( animate );
  renderer.render( scene, camera );
}
animate();














function dotProduct(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
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

function quart_between(p1, p2){
  // Set starting and ending vectors
  var myVector = new THREE.Vector3(0,1,0); // up
  var targetVector = p2.clone();
  targetVector.sub(p1);

  // Normalize vectors to make sure they have a length of 1
  myVector.normalize();
  targetVector.normalize();

  // Create a quaternion, and apply starting, then ending vectors
  var quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(myVector, targetVector);

  return quaternion;
}