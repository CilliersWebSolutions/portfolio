
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'


window.Webflow ||= [];
window.Webflow.push(() => {
  init3D();
});


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

    /**
     * 
  * Loaders
    */
    // Texture loader
    const textureLoader = new THREE.TextureLoader()

    // Draco loader
    // const dracoLoader = new THREE.DRACOLoader()
    // dracoLoader.setDecoderPath('draco/')

    // GLTF loader
    const gltfLoader = new GLTFLoader()
    // gltfLoader.setDRACOLoader(dracoLoader)

    const bakedTexture = textureLoader.load('baked.jpg')
    bakedTexture.flipY = false

    bakedTexture.colorSpace = THREE.SRGBColorSpace
    console.log(bakedTexture)
    /**
     * Materials
     */
    //Baked material
    const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture })
    //const bakedMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })

    // Pole Light material
    // const poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
    console.log(bakedMaterial)
    /**
     *  Model
     */
    gltfLoader.load(
      'oneShelfVend.glb',
      (gltf) => {

        const bakedMesh = gltf.scene.children.find(child => child.name === 'vendingMachine_wholeShelf.004')
        //const poleLightAMesh = gltf.scene.children.find(child => child.name === 'poleLightA')
        //const poleLightBMesh = gltf.scene.children.find(child => child.name === 'poleLightB')
        //const portalLightMesh = gltf.scene.children.find(child => child.name === 'portalLight')
        console.log(bakedMesh)

        bakedMesh.material = bakedMaterial
        //poleLightAMesh.material = poleLightMaterial
        //poleLightBMesh.material = poleLightMaterial
        //portalLightMesh.material = portalLightMaterial




        scene.add(gltf.scene)
        console.log(gltf.scene)
      }
    )


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
      //camera.updateProjectionMatrix()

      // Update renderer
      renderer.setSize(sizes.width, sizes.height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

      // // Update fireflies Pixel Ration
      // firefliesMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2)
    })

    /**
     * Camera
     */
    // Base camera
    //const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
    const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
    camera.position.x = 5

    camera.position.y = 5

    camera.position.z = 3

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


    //renderer.setClearColor('#00FFFFFF')


    /**
    * Animate
    */
    const clock = new THREE.Clock()

    const tick = () => {
      const elapsedTime = clock.getElapsedTime()


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


