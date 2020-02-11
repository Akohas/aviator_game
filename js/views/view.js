import EventEmitter from '../helpers/EventEmitter';
import airPlane from './airPlane'
import createCloud from './createCloud'
import sea from './sea'
import lights from './lights'
import colors from './colors'
import THREE from 'three';
const OrbitControls = require('three-orbit-controls')(THREE);
//this.emit('toggle', {id, done})
class View extends EventEmitter {
  constructor() {
    super();
    this.colors = colors
    this.height = window.innerHeight
    this.width = window.innerWidth

    this.scoreContainer = document.getElementById('score')
    this.healthContainer = document.getElementById('health')
    this.mousePos = {
      x: 0,
      y: 0
    };

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 10000);
    this.camera.position.set(1, 154, 465);

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('scene').appendChild(this.renderer.domElement);

    var axisHelper = new THREE.AxisHelper(500);
    this.scene.add(axisHelper);

    const controls = new OrbitControls(this.camera);
    this.coinPlace = new THREE.Object3D()
    this.coinPlace.position.y = -600
    this.scene.add(this.coinPlace)

    window.addEventListener('resize', this.onResize, false);
    document.addEventListener('mousemove', this.handleMouseMove, false);

    this.createLights()
    this.addSea()
    this.createSky()
    this.createAirPlane()
    this.createCoin(75)
    this.createBomb(25)
    this.render()

  }

 
  handleMouseMove = (evt) => {
    const {
      clientX,
      clientY
    } = evt
    var tx = -1 + (clientX / this.width) * 2;
    var ty = 1 - (clientY / this.height) * 2;

    this.mousePos = {
      x: tx,
      y: ty
    };
  }

  onResize = () => {
    this.height = window.innerHeight
    this.width = window.innerWidth
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  createSky = () => {
    const sky = new THREE.Object3D()
    const numClouds = 20
    const stepAngle = Math.PI * 2 / numClouds;

    for (let i = 0; i < numClouds; i++) {
      var c = createCloud()

      var a = stepAngle * i;
      var h = 700 + Math.random() * 100;

      c.position.y = Math.sin(a) * h;
      c.position.x = Math.cos(a) * h;


      c.rotation.z = a + Math.PI / 2;

      c.position.z = -200 - Math.random() * 100;


      var s = 1 + Math.random() * 2;
      c.scale.set(s, s, s);


      sky.add(c);
    }

    sky.position.y = -600;
    this.sky = sky
    this.scene.add(sky);
  }

  createAirPlane = () => {
    const {
      mesh,
      propeller
    } = airPlane

    this.propeller = propeller
    this.airplane = mesh

    mesh.scale.set(.25, .25, .25);
    mesh.position.y = 100;
    this.scene.add(mesh)
  }

  addSea = () => {
    const mesh = sea
    mesh.position.y = -600

    this.sea = mesh
    this.scene.add(mesh)
  }

  createLights = () => {

    const {
      hemisphereLight,
      shadowLight
    } = lights


    this.scene.add(hemisphereLight);
    this.scene.add(shadowLight);
  }

  setMeshesAroud = (createMesh, times) => {
    const mesh = () => {
      const mesh = createMesh();

      mesh.angle = (Math.PI * 2 / 100) * Math.random() * 100;
      mesh.distance = 650 + Math.random() * 100;

      mesh.position.y = -600 + Math.sin(mesh.angle) * mesh.distance;
      mesh.position.x = Math.cos(mesh.angle) * mesh.distance

      mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2)
      return mesh
    }

    for (let i = 0; i < times; i++) {
      this.scene.add(mesh())
    }

  }

  createCoin = (times = 1) => {
    const createCoinMesh = () => {
      const geometry = new THREE.CylinderGeometry(5, 5, 2);
      const material = new THREE.MeshPhongMaterial({
        color: colors.yellow,
      });
      const mesh = new THREE.Mesh(geometry, material)
      mesh.userData.id = new Date()
      mesh.userData.name = 'coin'
      return mesh
    }
    this.setMeshesAroud(createCoinMesh, times);
  }

  createBomb = (times = 1) => {
    const createCoinMesh = () => {
      const geometry = new THREE.OctahedronGeometry(5);
      const material = new THREE.MeshPhongMaterial({
        color: colors.brownDark,
      });
      const mesh = new THREE.Mesh(geometry, material)
      mesh.userData.id = new Date()
      mesh.userData.name = 'bomb'
      return mesh
    }
    this.setMeshesAroud(createCoinMesh, times);

  }


  isCollision = (element) => {
    const airplanePos = this.airplane.position
    const elemPos = element.position;

    const distance = airplanePos.distanceTo(elemPos);

    if(distance < 16) return true;
    return false;
  }

  updateCoins = () => {
    this.scene.children.forEach(item => {
      if (item.userData.name == 'coin') {
        this.updatePosition(item, 0.005);
        if (this.isCollision(item)) {
          this.removeMeshFromScene( item.userData.id, 'coin')
          this.emit('incrementScore');
          this.createCoin(1)
        }
      }
    })
  }
  updateBombs = () => {
    this.scene.children.forEach(item => {
      if (item.userData.name == 'bomb') {
        this.updatePosition(item, 0.005);
        if (this.isCollision(item)) {
          this.removeMeshFromScene( item.userData.id, 'bomb')
          this.emit('decrementHealth')
        }
      }
    })
  }

  updatePosition = (item, angle) => {
    item.angle += angle;
    item.position.y = -600 + Math.sin(item.angle) * item.distance;
    item.position.x = Math.cos(item.angle) * item.distance;
  }

  removeMeshFromScene = (id, name) => {
    this.scene.children = this.scene.children.filter(mesh =>
      !(mesh.userData.id == id && mesh.userData.name == name)
    )
  }

  updateScore = (score) => {
    this.scoreContainer.innerText = score;
  }
  updateHealth = ({ current, total }) => {
    const elementWidth = this.healthContainer.offsetWidth / total - 2;
    const createItem = () => {
      const elem = document.createElement('div');
      elem.classList.add('health-item');
      elem.style.width = `${elementWidth}px`;
      this.healthContainer.appendChild(elem)
    }

    const items = document.querySelectorAll('.health-item');
    if(items.length > current){
      for(let i = 0; i < items.length - current; i++){
        items[i].remove();
      }
    } else if(items.length < current) {
      for(let i = 0; i < current - items.length; i++){
        createItem();
      }
    }

  }


  updatePlane = () => {
    var targetX = this.normalize(this.mousePos.x, -1, 1, -100, 100);
    var targetY = this.normalize(this.mousePos.y, -1, 1, 25, 175);

    this.airplane.position.y = targetY;
    this.airplane.position.x = targetX;
    this.propeller.rotation.x += 0.3;
  }

  normalize = (v, vmin, vmax, tmin, tmax) => {

    var nv = Math.max(Math.min(v, vmax), vmin);
    var dv = vmax - vmin;
    var pc = (nv - vmin) / dv;
    var dt = tmax - tmin;
    var tv = tmin + (pc * dt);
    return tv;

  }

  showGameOverPopup(){
    
  }

  render = () => {
    requestAnimationFrame(this.render);
    this.renderer.render(this.scene, this.camera);
    this.sea.rotation.y -= 0.01
    this.sky.rotation.z += 0.01

    this.updatePlane()
    this.updateCoins()
    this.updateBombs()

  }
}


export default View;