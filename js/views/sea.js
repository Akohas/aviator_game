import THREE from 'three';
import colors from './colors'

const sea =  () => {
    var geometry = new THREE.CylinderGeometry(600,600,800,40,10);
    var material = new THREE.MeshPhongMaterial({
      color: colors.blue,
      transparent:true,
      opacity:.6,
      shading:THREE.FlatShading,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.receiveShadow = true; 
    mesh.rotation.x = -Math.PI/2

    return mesh
}

export default sea()