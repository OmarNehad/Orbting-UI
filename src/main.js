//# Setup a Three.js Scene
import * as THREE from 'three';
import gsap from 'gsap';
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
gsap.registerPlugin(MotionPathPlugin);


// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Orbit parameters
const radius = 3; // Radius of the circular orbit
//let angle = 0;
const groupsCount = 6;
const cardsCount = 6;
const textureLoader = new THREE.TextureLoader();

function createCard(groupI, cardI){
  const geometry = new THREE.PlaneGeometry(0.5, 1);
  const random = Math.floor(Math.random() * 5);
  const material = new THREE.MeshBasicMaterial({
    map: textureLoader.load(`/cards/${random}.png`), // Replace with actual image paths
    transparent: true,
    opacity:0
  });

  
  const card = new THREE.Mesh(geometry, material);


  const phaseOffset = (Math.PI / (groupsCount/2)) * groupI; // Divide the circle into cardsCount quarters

  const currentAngle = phaseOffset; // Add phase offset to each card


  // Randomize positions and rotations
  card.position.set(
    (radius) * Math.cos(currentAngle), 
    (radius) * Math.sin(currentAngle),
    0 //cards offset
  );
  

  scene.add(card);
  doWeirdAnimatoin(card, groupI, cardI, 12);

}

for (let i = 0; i < groupsCount; i++) {
  setTimeout(() => {
    for (let j = 0; j < cardsCount; j++) {
      createCard(j, i); // Create all cards in the group
    }
  }, i * 1000); // Delay for each group
}

//moveCard(cards[0],0,0,0,3);
// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update angle for orbiting motion


  // cards.forEach((card)=>{
  //   console.log(card.scale);
  //   card.scale.set(Math.min(1,Math.abs(card.position.x)), Math.min(1,Math.abs(card.position.x)), Math.min(1,Math.abs(card.position.x))); // Scale independently along x, y, z axes

  // });

  // cards.forEach((card,index) => {
  //   const phaseOffset = (Math.PI / (cardCount/2)) * index; // Divide the circle into four quarters

  //   // Update angle for orbiting motion
  //   //angle += 0.005 /cardCount; // Adjust the speed by changing this value

  //   //const currentAngle = angle + phaseOffset; // Add phase offset to each card


  //   // Update position of the orbiting object
  //   //card.position.x = (radius) * Math.cos(currentAngle); //(2-Math.exp(card.position.y));//radius * Math.cos(angle);
  //   //card.position.y = (radius) * Math.sin(currentAngle);


    
  // });
  // Render the scene
  renderer.render(scene, camera);
}



function generatePath(index) {
  const nextAngle = (Math.PI / (groupsCount/2)) * (index+(1/2)); 

  return [
      { x: radius * Math.cos(nextAngle), y: radius * Math.sin(nextAngle), z: 0 },
      { x: 0, y: 0, z: 0 },

  ];
}



animate();

function doWeirdAnimatoin(object, groupI, cardI, duration)
{
  //const timeline = gsap.timeline();
  const newPath = generatePath(groupI);
  
  gsap.to(object.position, {
    motionPath: {
      path: newPath,
      curviness: 1,
      autoRotate: true,
    },
    duration: duration,
    ease: "power1.inOut",
    });

    gsap.to(object.material,
      {
        opacity: 1,
        duration:duration
      }
    )
    gsap.to(object.rotation,
      {
        x:0,
        y:0,
        z:6,
        duration:duration*20
      }
    )
    // gsap.to(object.scale, {
    //   x: 0,
    //   y: 0,
    //   z: 0,
    //   duration: duration,
    // });    

    gsap.delayedCall(duration/2-1, () => { // Delay the animation by 3 seconds
      gsap.to(object.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: duration/2,
        ease: "expo.out"
      });
    });
    gsap.delayedCall(duration/1.75, ()=>{
      scene.remove(object);
      object.geometry.dispose();
      createCard(groupI,cardI);
    })
  // gsap.to(object.rotation, {
  //   x:0,
  //   y:0,
  //   z:1,
  //   duration: duration,
  //   ease: "power1.inOut",
  // });
  
  // timeline.to(object.position, {
  //   x: radius * Math.cos(nextAngle),
  //   y: radius * Math.sin(nextAngle),
  //   z: object.position.z,
  //   duration: circleDuration,
  //   ease: "power1.inOut", // Optional: Adds a smooth easing
  // });
  // timeline.to(object.position, {
  //   x: 0,
  //   y: 0,
  //   z: object.position.z,
  //   duration: circleDuration,
  //   ease: "power1.inOut", // Optional: Adds a smooth easing
  // });
  //moveCard(object, 0,0,0,centerDuration);


}

