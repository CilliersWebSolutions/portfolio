

// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

window.Webflow ||= [];
window.Webflow.push(() => {
  init3D();
});

const DRACOLoader = new THREE.DRACOLoader()
const GLTFLoader = new THREE.GLTFLoader()
function init3D() {

  const containers = document.querySelectorAll('[data-3d="c"]');


  // Iterate over each container
  containers.forEach(container => {
    // Canvas
    const canvas = document.createElement('canvas');
    canvas.classList.add('webgl');
    container.appendChild(canvas);

    // Scene
    const scene = new THREE.Scene();
    /**
    * Base
    */
    // Debug
    const debugObject = {}
    // const gui = new GUI({
    //   width: 400
    // })

    /**
     * 
  * Loaders
    */
    // Texture loader
    const textureLoader = new THREE.TextureLoader()

    // Draco loader
    const dracoLoader = new dracoLoader()
    DRACOLoader.setDecoderPath('draco/')

    // GLTF loader
    const gltfLoader = new gltfLoader()
    GLTFLoader.setDRACOLoader(dracoLoader)


    // Fragment Shader Inline code
    const firefliesVertexShader = `
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uTime;
  
  attribute float aScale;
  
  
  void main()
  {
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      modelPosition.y += sin(uTime + modelPosition.x * 100.0 ) * aScale * 0.09;
      modelPosition.x += sin(uTime + modelPosition.z * 50.0 ) * aScale * 0.05;
      
       vec4 viewPosition = viewMatrix * modelPosition;
      vec4 projectionPosition = projectionMatrix * viewPosition;
    
      gl_Position = projectionPosition;
      gl_PointSize = uSize * aScale * uPixelRatio ;
    
  gl_PointSize *= (1.0 / - viewPosition.z);
  }
`;


    const firefliesFragmentShader = `
  void main()
  {
     float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
     float strength = 0.05 / distanceToCenter - 0.1;
     gl_FragColor = vec4(1.0, 1.0, 1.0, strength);
  
  } 
`;

    const portalVertexShader = `
varying vec2 vUv;


void main()
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
    vUv = uv;
}
`;


    const portalFragmentShader = `
varying vec2 vUv;

uniform vec3 uColorStart;
uniform vec3 uColorEnd;
uniform float uTime;


//	Classic Perlin 3D Noise 
//	by Stefan Gustavson
//
vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

float cnoise(vec3 P)
{
    vec3 Pi0 = floor(P); // Integer part for indexing
    vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
    Pi0 = mod(Pi0, 289.0);
    Pi1 = mod(Pi1, 289.0);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 / 7.0;
    vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 / 7.0;
    vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;
    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
    
    return 2.2 * n_xyz;
}

void main()
{
    // Displace the UV
    vec2 displacedUv = vUv + cnoise(vec3(vUv * 11.0 , uTime * 0.02 ));
    
    // Perlin noise
    float strength = cnoise(vec3(displacedUv * 5.0 , uTime * 0.3 ));

    // Outer glow
    float outerGlow = distance(vUv, vec2(0.5)) * 5.0 - 1.4;
    strength += outerGlow;

    // Apply cool step
    strength = strength + step(-0.2, strength) * 0.8;

    // Clamp the value from 0 to 1
    strength = clamp(strength, -0.8, 1.3);

    // Final Color
    vec3 color = mix(uColorStart, uColorEnd, strength);

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>;
}
`;


    const bakedTexture = textureLoader.load('https://uploads-ssl.webflow.com/661bd3640db9efe63984e8eb/66292a2e92bc9a8a0ab9c2fa_baked.jpg')
    bakedTexture.flipY = false
    bakedTexture.colorSpace = THREE.SRGBColorSpace

    /**
     * Materials
     */
    //Baked material
    const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })

    // Portal Light material

    debugObject.portalColorStart = '#2404c3'
    debugObject.portalColorEnd = '#c602f7'
    // gui
    //   .addColor(debugObject, 'portalColorStart')
    //   .onChange(() => {
    //     portalLightMaterial.uniforms.uColorStart.value.set(debugObject.portalColorStart)
    //   })
    // gui
    //   .addColor(debugObject, 'portalColorEnd')
    //   .onChange(() => {
    //     portalLightMaterial.uniforms.uColorEnd.value.set(debugObject.portalColorEnd)
    //   }
    //   )

    const portalLightMaterial = new THREE.ShaderMaterial({
      uniforms:
      {
        uTime: { value: 0 },
        uColorStart: { value: new THREE.Color(debugObject.portalColorStart) },
        uColorEnd: { value: new THREE.Color(debugObject.portalColorEnd) },
      },

      vertexShader: portalVertexShader,
      fragmentShader: portalFragmentShader
    })



    // Pole Light material
    const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF })

    /**
     *  Model
     */
    gltfLoader.load(
      'https://uploads-ssl.webflow.com/661bd3640db9efe63984e8eb/66292a635448b34b6929506c_portal.glb.txt',
      (gltf) => {
        const bakedMesh = gltf.scene.children.find(child => child.name === 'baked')
        const poleLightAMesh = gltf.scene.children.find(child => child.name === 'poleLightA')
        const poleLightBMesh = gltf.scene.children.find(child => child.name === 'poleLightB')
        const portalLightMesh = gltf.scene.children.find(child => child.name === 'portalLight')

        //console.log(bakedMesh)
        bakedMesh.material = bakedMaterial
        poleLightAMesh.material = poleLightMaterial
        poleLightBMesh.material = poleLightMaterial
        portalLightMesh.material = portalLightMaterial




        scene.add(gltf.scene)
      }
    )

    /**
  * Fireflies
  */

    // Geometry

    const firefliesGeometry = new THREE.BufferGeometry()
    const firefliesCount = 300 / 2


    const positionArray = new Float32Array(firefliesCount * 3)
    const scaleArray = new Float32Array(firefliesCount)

    for (let i = 0; i < firefliesCount; i++) {
      positionArray[i * 3 + 0] = (Math.random() - 0.5) * 4
      positionArray[i * 3 + 1] = Math.random() * 1.9
      positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4

      scaleArray[i] = Math.random()
    }

    firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
    firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1))
    // Material
    const firefliesMaterial = new THREE.ShaderMaterial({
      uniforms:
      {
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 100 },
        uTime: { value: 0 }
      },


      vertexShader: firefliesVertexShader,
      fragmentShader: firefliesFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })

    // gui.add(firefliesMaterial.uniforms.uSize, 'value').min(0).max(500).step(1).name('fireflies Size')

    // Points
    const fireflies = new THREE.Points(firefliesGeometry, firefliesMaterial)
    scene.add(fireflies)
    /**
     * Sizes
     */
    const sizes = {
      width: container.clientWidth,
      height: container.clientHeight
    }

    document.addEventListener('resize', () => {
      // Update sizes
      sizes.width = container.clientWidth
      sizes.height = container.clientHeight

      // Update camera
      camera.aspect = sizes.width / sizes.height
      camera.updateProjectionMatrix()

      // Update renderer
      renderer.setSize(sizes.width, sizes.height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

      // Update fireflies Pixel Ration
      firefliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
    })

    /**
     * Camera
     */
    // Base camera
    //const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
    const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
    camera.position.x = 3

    camera.position.y = 2.8

    camera.position.z = 6

    scene.add(camera)



    // Controls
    //  const controls = new FirstPersonControls(camera, canvas)
    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    controls.dampingFactor = 0.009

    /**
    * Renderer
    */
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    debugObject.clearColor = '#00FFFFFF'
    renderer.setClearColor(debugObject.clearColor)
    // gui
    //   .addColor(debugObject, 'clearColor')
    //   .onChange(() => {
    //     renderer.setClearColor(debugObject.clearColor)
    //   })

    /**
    * Animate
    */
    const clock = new THREE.Clock()

    const tick = () => {
      const elapsedTime = clock.getElapsedTime()

      // Update Materials
      firefliesMaterial.uniforms.uTime.value = elapsedTime
      portalLightMaterial.uniforms.uTime.value = elapsedTime

      // Update controls
      controls.update()

      // Render
      renderer.render(scene, camera)

      // Call tick again on the next frame
      window.requestAnimationFrame(tick)
    }

    tick()

  });


}


