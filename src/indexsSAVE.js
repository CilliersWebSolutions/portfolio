import { greetUser } from '$utils/greet';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';


window.Webflow ||= [];
window.Webflow.push(() => {
  init3D();
});

function init3D() {
  /**
* Base
*/
  // Debug
  const gui = new GUI()

  // Canvas
  const canvas = document.createElement('canvas');
  canvas.classList.add('webgl');
  const container = document.querySelector('[data-3d="c"]');
  container.appendChild(canvas);
  // Scene
  const scene = new THREE.Scene()


  /**
   * Galaxy
   */
  const parameters = {}
  parameters.count = 200000
  parameters.size = 0.005
  parameters.radius = 13
  parameters.branches = 6
  parameters.spin = 1
  parameters.randomness = 0.5
  parameters.randomnessPower = 3
  parameters.insideColor = '#ff6030'
  parameters.outsideColor = '#1b3984'

  let geometry = null
  let material = null
  let points = null

  const generateGalaxy = () => {
    if (points !== null) {
      geometry.dispose()
      material.dispose()
      scene.remove(points)
    }

    /**
     * Geometry
     */
    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)
    const scales = new Float32Array(parameters.count * 1)
    const randomness = new Float32Array(parameters.count * 3)

    const insideColor = new THREE.Color(parameters.insideColor)
    const outsideColor = new THREE.Color(parameters.outsideColor)

    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3

      // Position
      const radius = Math.random() * parameters.radius

      const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2


      positions[i3] = Math.cos(branchAngle) * radius
      positions[i3 + 1] = 0
      positions[i3 + 2] = Math.sin(branchAngle) * radius

      // Randomness
      const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
      const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius
      const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : - 1) * parameters.randomness * radius



      // Color
      const mixedColor = insideColor.clone()
      mixedColor.lerp(outsideColor, radius / parameters.radius)

      colors[i3] = mixedColor.r
      colors[i3 + 1] = mixedColor.g
      colors[i3 + 2] = mixedColor.b

      // Scale
      scales[i] = Math.random()
    }
    console.log(scales)
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 3))
    /**
     * Material
     */
    material = new THREE.ShaderMaterial({

      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      vertexShader: galaxyVertexShader,
      fragmentShader: galaxyFragmentShader,
      uniforms:
      {
        uSize: { value: 8.0 * renderer.getPixelRatio() },
        uTime: { value: 0 }
      }


    })

    /**
     * Points
     */
    points = new THREE.Points(geometry, material)
    scene.add(points)
  }



  gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
  gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
  gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
  gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
  gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
  gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
  gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)

  /**
   * Sizes
   */
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  }

  container.addEventListener('resize', () => {
    // Update sizes
    sizes.width = container.innerWidth
    sizes.height = container.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  })

  /**
   * Camera
   */
  // Base camera
  const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
  camera.position.x = 3
  camera.position.y = 3
  camera.position.z = 3
  scene.add(camera)

  // Controls
  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true

  // Fragment Shader Inline code
  const galaxyFragmentShader = `
  varying vec3 vColor;

  void main()
  {
      // Light point
      float strength = distance(gl_PointCoord, vec2(0.5));
      strength = 1.0 - strength;
      strength = pow(strength, 9.0);

      // Final Color
      vec3 color = mix(vec3(0.0), vColor, strength);

      gl_FragColor = vec4(color, 1.0);
      #include <colorspace_fragment>;
  }
`;

  // Vertex Shader Inline code
  const galaxyVertexShader = `
    uniform float uSize;
    uniform float uTime;

    attribute float aScale;

    varying vec3 vColor;

    void main()
     {
         /**
          * Position
          */
         vec4 modelPosition = modelMatrix * vec4(position, 1.0);
         
         /**
         * Spin
         */
         float angle = atan(modelPosition.x, modelPosition.z);
         float distanceToCenter = length(modelPosition.xz);
         float angleOffset = (1.0 / distanceToCenter) * uTime * 0.2;
         angle += angleOffset;
         modelPosition.x = cos(angle) * distanceToCenter;
         modelPosition.z = sin(angle) * distanceToCenter;

         
         vec4 viewPosition = viewMatrix * modelPosition;
         vec4 projectedPosition = projectionMatrix * viewPosition;
         gl_Position = projectedPosition;

         /**
          * Size
          */
         gl_PointSize = uSize * aScale;
         gl_PointSize *= (1.0 / - viewPosition.z);

          /**
          * Color
          */
          vColor = color;

     }
`;
  /**
   * Renderer
   */
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas
  })
  renderer.setSize(sizes.width, sizes.height);
  //renderer.appendChild(renderer.domElement);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  generateGalaxy()
  /**
   * Animate
   */
  const clock = new THREE.Clock()

  const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update material
    material.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
  }

  tick()

}


