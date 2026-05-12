import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ComplianceLensScene() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.3, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.appendChild(renderer.domElement);

    const group = new THREE.Group();
    group.scale.setScalar(0.44);
    group.position.set(2.25, 0.04, 0);
    scene.add(group);

    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 1.5);
    shieldShape.bezierCurveTo(1.15, 1.15, 1.45, 0.45, 1.2, -0.45);
    shieldShape.bezierCurveTo(0.9, -1.25, 0.35, -1.65, 0, -1.9);
    shieldShape.bezierCurveTo(-0.35, -1.65, -0.9, -1.25, -1.2, -0.45);
    shieldShape.bezierCurveTo(-1.45, 0.45, -1.15, 1.15, 0, 1.5);

    const shield = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shieldShape, {
        depth: 0.16,
        bevelEnabled: true,
        bevelSize: 0.04,
        bevelThickness: 0.06,
        bevelSegments: 8
      }),
      new THREE.MeshPhysicalMaterial({
        color: "#9fffea",
        metalness: 0.05,
        roughness: 0.12,
        transmission: 0.65,
        transparent: true,
        opacity: 0.58,
        thickness: 0.8,
        clearcoat: 1
      })
    );
    shield.position.z = -0.08;
    group.add(shield);

    const ringMaterial = new THREE.MeshBasicMaterial({ color: "#19e6c1", transparent: true, opacity: 0.72 });
    const dangerMaterial = new THREE.MeshBasicMaterial({ color: "#ff5f73", transparent: true, opacity: 0.7 });
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.012, 12, 140), ringMaterial);
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.009, 12, 160), ringMaterial.clone());
    const ringC = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.008, 12, 120), dangerMaterial);
    ringA.rotation.x = 1.08;
    ringB.rotation.x = 1.32;
    ringB.rotation.y = 0.34;
    ringC.rotation.x = 1.55;
    ringC.rotation.z = 0.5;
    group.add(ringA, ringB, ringC);

    const dotGeometry = new THREE.SphereGeometry(0.045, 18, 18);
    const dotMaterial = new THREE.MeshBasicMaterial({ color: "#e6fff8" });
    for (let i = 0; i < 18; i += 1) {
      const dot = new THREE.Mesh(dotGeometry, dotMaterial);
      const angle = (i / 18) * Math.PI * 2;
      dot.position.set(Math.cos(angle) * 2.1, Math.sin(angle) * 0.32, Math.sin(angle) * 1.05);
      group.add(dot);
    }

    const lightA = new THREE.PointLight("#7df6d6", 4, 9);
    lightA.position.set(2.4, 2.8, 3.2);
    const lightB = new THREE.PointLight("#ff6b7d", 1.2, 8);
    lightB.position.set(-2.6, -1.4, 3.1);
    scene.add(lightA, lightB, new THREE.AmbientLight("#ffffff", 1.1));

    let frame = 0;
    let animation = 0;

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const animate = () => {
      frame += 0.01;
      group.rotation.y = Math.sin(frame * 0.8) * 0.22;
      shield.rotation.z = Math.sin(frame) * 0.025;
      ringA.rotation.z += 0.006;
      ringB.rotation.z -= 0.004;
      ringC.rotation.z += 0.009;
      renderer.render(scene, camera);
      animation = requestAnimationFrame(animate);
    };

    resize();
    animate();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    return () => {
      cancelAnimationFrame(animation);
      observer.disconnect();
      renderer.dispose();
      shield.geometry.dispose();
      ringA.geometry.dispose();
      ringB.geometry.dispose();
      ringC.geometry.dispose();
      host.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="lens-scene" ref={hostRef} aria-hidden="true" />;
}
