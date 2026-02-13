"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(MotionPathPlugin);

type Vector3Array = Array<{ x: number; y: number; z: number }>;

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    const groupsCount = 6;
    const cardsCount = 6;
    const radius = 4;
    const textureLoader = new THREE.TextureLoader();
    const ctx = gsap.context(() => {}, mount);
    const textures: THREE.Texture[] = [];

    // Preload textures
    for (let i = 1; i <= 8; i++) {
      textures.push(textureLoader.load(`/cards/${i}.png`));
    }

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    const activeCards: THREE.Mesh[] = [];

    function generatePath(index: number): Vector3Array {
      const nextAngle = (Math.PI / (groupsCount / 2)) * (index + 0.5);
      return [
        {
          x: radius * Math.cos(nextAngle),
          y: radius * Math.sin(nextAngle),
          z: 0,
        },
        { x: 0, y: 0, z: 0 },
      ];
    }

    function createCard(groupI: number, cardI: number) {
      const geometry = new THREE.PlaneGeometry(1.2, 2);
      const randomTexture = textures[Math.floor(Math.random() * textures.length)];
      const material = new THREE.MeshBasicMaterial({
        map: randomTexture,
        transparent: true,
        opacity: 0,
      });
      const card = new THREE.Mesh(geometry, material);
      const phaseOffset = (Math.PI / (groupsCount / 2)) * groupI;

      card.position.set(
        radius * Math.cos(phaseOffset),
        radius * Math.sin(phaseOffset),
        0
      );

      scene.add(card);
      activeCards.push(card);
      doWeirdAnimation(card, groupI, cardI, 6);
    }

    function doWeirdAnimation(
      object: THREE.Mesh,
      groupI: number,
      cardI: number,
      duration: number
    ) {
      const newPath = generatePath(groupI);
      ctx.add(() => {
        gsap.to(object.position, {
          motionPath: { path: newPath, curviness: 1, autoRotate: true },
          duration,
          ease: "power1.inOut",
        });
        gsap.to(object.material, { opacity: 1.2, duration });
        gsap.to(object.rotation, { z: 6, duration: duration * 5 });

        gsap.delayedCall(duration / 2 - 1, () => {
          gsap.to(object.scale, {
            x: 0,
            y: 0,
            z: 0,
            duration: duration / 2,
            ease: "expo.out",
          });
        });

        gsap.delayedCall(duration / 1.75, () => {
          scene.remove(object);
          object.geometry.dispose();
          object.material.dispose();
          const index = activeCards.indexOf(object);
          if (index > -1) activeCards.splice(index, 1);
          createCard(groupI, cardI);
        });
      });
    }

    // 👉 Stagger group creation using GSAP delayedCall loop
    function staggerGroups(index = 0) {
      if (index >= groupsCount) return;
      for (let j = 0; j < cardsCount; j++) {
        createCard(j, index);
      }
      gsap.delayedCall(1, () => staggerGroups(index + 1));
    }
    staggerGroups();

    // Optimized animation loop
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });

    return () => {
      ctx.revert();
      window.removeEventListener("resize", handleResize);
      renderer.setAnimationLoop(null);

      activeCards.forEach((card) => {
        scene.remove(card);
        card.geometry.dispose();
        card.material.dispose();
      });

      scene.clear();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "100vh", backgroundColor: "transparent" }}
    />
  );
}
