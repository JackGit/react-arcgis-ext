import React, { Component } from 'react'
import Map from '@/components/map/Map'
import GraphicsLayer from '@/components/layers/graphics-layer/GraphicsLayer'
import Graphic from './Graphic'
import ModuleLoader from '@/components/ModuleLoader'
import { ModulesConsumer } from '@/components/providers/ModulesProvider'

import { simplePointGraphic, simplePolylineGraphic, simplePolygonGraphic } from 'mock/graphics'
import { WebMap, WebScene, Scene  } from '@esri/react-arcgis'

export default { title: 'Graphic' }

export const introGraphic = () => {
  const graphics = [simplePointGraphic, simplePolylineGraphic, simplePolygonGraphic]
  return (
    <div style={{width:'100vw',height:'100vh'}}>
      <Map
        mapProperties={{
          basemap: 'hybrid'
        }}
        viewProperties={{
          center: [-80, 35],
          zoom: 3
        }}
      >
        <GraphicsLayer>
          {graphics.map(g => <Graphic properties={g} />)}
        </GraphicsLayer>
      </Map>
    </div>
  )
}

export const addGraphicsToASceneView = () => {
  const point = {
    geometry: {
      type: "point",
      x: -0.178,
      y: 51.48791,
      z: 1010
    },
    symbol: {
      type: "simple-marker",
      color: [226, 119, 40],
      outline: {
        color: [255, 255, 255],
        width: 2
      }
    }
  }
  const polyline = {
    geometry: {
      type: "polyline",
      paths: [[-0.178, 51.48791, 0], [-0.178, 51.48791, 1000]]
    },
    symbol: {
      type: "simple-line",
      color: [226, 119, 40],
      width: 4
    }
  }
  const polygon = {
    geometry: {
      type: "polygon",
      rings: [
        [-0.184, 51.48391, 400],
        [-0.184, 51.49091, 500],
        [-0.172, 51.49091, 500],
        [-0.172, 51.48391, 400],
        [-0.184, 51.48391, 400]
      ]
    },
    symbol: {
      type: "simple-fill",
      color: [227, 139, 79, 0.8],
      outline: {
        color: [255, 255, 255],
        width: 1
      }
    }
  }
  const graphics = [point, polyline, polygon]
  return (
    <div style={{width:'100vw',height:'100vh'}}>
      <Scene
        mapProperties={{ basemap: 'hybrid' }}
        viewProperties={{
          camera: {
            position: {
              x: -0.17746710975334712,
              y: 51.44543992422466,
              z: 1266.7049653716385
            },
            heading: 0.34445102566290225,
            tilt: 82.95536300536367
          }
        }}
      >
        <GraphicsLayer>
          {[graphics.map((g, i) =>
            <Graphic key={i} properties={g} />
          )]}
        </GraphicsLayer>
      </Scene>
    </div>
  )
}

class WorkingWith3dMeshPrimitivesStory extends Component {
  state = {
    graphics: []
  }

  componentDidMount () {
    const { Point, SpatialReference } = this.props.modules
    const snowManLocation = new Point({
      x: 870934.67356809,
      y: 5835285.101616,
      z: 2013.6,
      spatialReference: SpatialReference.WebMercator
    })
    const symbol = {
      type: "mesh-3d",
      symbolLayers: [{ type: "fill" }]
    }
    const treeLocations = [
      new Point({
        x: 870948.1109645499,
        y: 5835340.97953185,
        z: 2022.1,
        spatialReference: SpatialReference.WebMercator
      }),
      new Point({
        x: 870917.1665520248,
        y: 5835321.648520845,
        z: 2027.02,
        spatialReference: SpatialReference.WebMercator
      }),
      new Point({
        x: 871003.3214365735,
        y: 5835349.059825734,
        z: 2011.96,
        spatialReference: SpatialReference.WebMercator
      }),
      new Point({
        x: 870965.2794487729,
        y: 5835289.441932107,
        z: 2005.77,
        spatialReference: SpatialReference.WebMercator
      })
    ];
    
    const graphics = []
    graphics.push({
      geometry: this.createSnowManGeometry(snowManLocation),
      symbol
    })

    for (let i = 0; i < treeLocations.length; i++) {
      graphics.push({
        geometry: this.createTreeGeometry(treeLocations[i]),
        symbol
      })
    }

    this.setState({ graphics })
  }

  createPyramid = (pt, params) => {
    const { Mesh } = this.props.modules
    const height = params.size.height
    const halfWidth = params.size.width / 2
    const halfDepth = params.size.depth / 2
    const position = [
      pt.x,             pt.y,             pt.z + height,
      pt.x - halfWidth, pt.y - halfDepth, pt.z,
      pt.x + halfWidth, pt.y - halfDepth, pt.z,
      pt.x + halfWidth, pt.y + halfDepth, pt.z,
      pt.x - halfWidth, pt.y + halfDepth, pt.z
    ]
    const uv = [0.5, 0, 0, 1, 1, 1, 0, 1, 1, 1]
    return new Mesh({
      vertexAttributes: {
        position: position,
        uv: uv
      },
      components: [
        { faces: [0, 1, 2], material: params.material },
        { faces: [0, 2, 3], material: params.material },
        { faces: [0, 3, 4], material: params.material },
        { faces: [0, 4, 1], material: params.material }
      ],
      spatialReference: pt.spatialReference
    })
  }

  createLeafCanvas = () => {
    const canvas = document.createElement("canvas")
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext("2d")

    const gradient = ctx.createLinearGradient(0, 0, 0, 32)
    gradient.addColorStop(0, "#00ff00")
    gradient.addColorStop(1, "#009900")

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 32, 32)
    return canvas
  }

  createTreeGeometry = (pt) => {
    const { Mesh, meshUtils } = this.props.modules
    const treeMaterial = { colorTexture: this.createLeafCanvas() }
    const trunkMaterial = { color: "orange" }
    const bottom = this.createPyramid(pt, {
      size: { width: 10, depth: 10, height: 5 },
      material: treeMaterial
    })
    const middle = this.createPyramid(pt, {
      size: { width: 8, depth: 8, height: 3 },
      material: treeMaterial
    })
    const top = this.createPyramid(pt, {
      size: { width: 6, depth: 6, height: 3 },
      material: treeMaterial
    })
    const trunk = Mesh.createBox(pt, {
      size: { width: 1, depth: 1, height: 5 },
      material: trunkMaterial
    })
    bottom.offset(0, 0, 4)
    middle.offset(0, 0, 7)
    top.offset(0, 0, 9)
    return meshUtils.merge([trunk, bottom, middle, top])
  }

  createSnowManGeometry = (pt) => {
    const { Mesh, meshUtils } = this.props.modules
    const whiteMaterial = { color: "white" }
    const blackMaterial = { color: "black" }
    const orangeMaterial = { color: "orange" }
    const lowerBody = Mesh.createSphere(pt, { size: 5, material: whiteMaterial })
    const upperBody = Mesh.createSphere(pt, { size: 4, material: whiteMaterial })
    const head = Mesh.createSphere(pt, { size: 3, material: whiteMaterial })
    const rightEye = Mesh.createSphere(pt, { size: 0.6, material: blackMaterial })
    const leftEye = Mesh.createSphere(pt, { size: 0.6, material: blackMaterial })
    const nose = Mesh.createCylinder(pt, { size: { width: 0.8, depth: 0.8, height: 3 }, material: orangeMaterial })
    const nosePosition = nose.vertexAttributes.position

    for (let i = 0; i < nosePosition.length / 2; i += 3) {
      nosePosition[i + 0] = pt.x
      nosePosition[i + 1] = pt.y
    }

    nose.vertexAttributes.normal = null
    nose.vertexAttributesChanged()
    upperBody.offset(0, 0, 4.5)
    head.offset(0, 0, 8)
    rightEye.offset(0, 1.3, 9.6).rotate(0, 0, -240, { origin: pt })
    leftEye.offset(0, 1.3, 9.6).rotate(0, 0, -190, { origin: pt })
    nose.rotate(-90, 0, -90).offset(2, 0, 8).rotate(0, 0, -125, { origin: pt })

    return meshUtils.merge([lowerBody, upperBody, head, rightEye, leftEye, nose])
  }

  render () {
    const { graphics } = this.state
    return (
      <div style={{width:'100vw',height:'100vh'}}>
        <Scene
          mapProperties={{
            basemap: "satellite",
            ground: "world-elevation"
          }}
          viewProperties={{
            environment: {
              atmosphere: {
                quality: "high"
              },
              lighting: {
                directShadowsEnabled: true,
                ambientOcclusionEnabled: true
              }
            },
            camera: {
              position: [7.8233347, 46.3409284, 2032.93599],
              heading: 19.72,
              tilt: 86.007
            }
          }}
        >
          <GraphicsLayer>
            {[graphics.map((g, i) =>
              <Graphic key={i} properties={g} />
            )]}
          </GraphicsLayer>
        </Scene>
      </div>
    )
  }
}

export const workingWith3dMeshPrimitives = () => (
  <ModuleLoader
    modules={[
      'esri/geometry/Point','esri/geometry/SpatialReference',
      'esri/geometry/Mesh','esri/geometry/support/meshUtils'
    ]}
  >
    <ModulesConsumer>
      {({ status, modules }) => status === 'success' ? <WorkingWith3dMeshPrimitivesStory modules={modules} /> : null}
    </ModulesConsumer>
  </ModuleLoader>
)


class LowPolyTerrainUsingMeshGeometryStory extends Component {
  state = { 
    graphics: []
  }
  map = null
  view = null

  createTerrain = () => {
    const { map, view } = this
    const exaggeration = 2
    const extent = view.clippingArea

    const getColor = (height) => {
      if (height < 500 * exaggeration) {
        return [149, 195, 50]
      } else {
        if (height < 700 * exaggeration) {
          return [209, 148, 81]
        }
      }
      return [255, 255, 255]
    }

    const createTerrainTexture = (mesh) => {
      const vPositions = mesh.vertexAttributes.position
      const vertexCount = vPositions.length / 3
      const w = Math.round(
        Math.sqrt((vertexCount * extent.width) / extent.height)
      )
      const h = Math.round(vertexCount / w)
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      canvas.width = w
      canvas.height = h
      const imgData = ctx.createImageData(w, h)
      let j = 0
      for (let i = 0; i < vPositions.length; i += 3) {
        const color = getColor(vPositions[i + 2])
        imgData.data[j + 0] = color[0]
        imgData.data[j + 1] = color[1]
        imgData.data[j + 2] = color[2]
        imgData.data[j + 3] = 255
        j += 4
      }
      ctx.putImageData(imgData, 0, 0)
      return canvas
    }

    return this.props.modules.meshUtils
      .createFromElevation(map.ground.layers.getItemAt(0), extent, { demResolution: 125 })
      .then(mesh => {
        const vPositions = mesh.vertexAttributes.position
        for (let index = 0; index < vPositions.length; index += 3) {
          vPositions[index + 2] = vPositions[index + 2] * exaggeration
        }
        mesh.components[0].shading = "flat"
        mesh.components[0].material = {
          colorTexture: createTerrainTexture(mesh)
        }

        this.setState({
          graphics: [...this.state.graphics, {
            geometry: mesh,
            symbol: {
              type: "mesh-3d",
              symbolLayers: [{ type: "fill" }]
            }
          }]
        })
        return mesh
    })
  }

  createTrees = (mesh) => {
    const { Point, meshUtils } = this.props.modules
    const extent = this.view.clippingArea
    const treeXYCoordinates = [
      [949511.0269866717, 5996737.260347401],
      [948349.0915666509, 5995392.784148848],
      [948134.9365087302, 5995257.3964663735],
      [947677.0638892008, 5995549.099657962],
      [948533.132906933, 5996579.031805388],
      [948164.69040468, 5998378.064842778],
      [947679.8323087967, 5996458.904069111],
      [949905.6697365673, 5995740.200877652],
      [949291.5109791199, 5997380.737017862],
      [948419.5816452013, 5994747.508043459],
      [949421.7202507699, 5998165.359250989]
    ]
    return meshUtils
      .createElevationSampler(mesh)
      .then(elevationSampler => {
        for (let i = 0; i < treeXYCoordinates.length; i++) {
          const tree = new Point({
            x: treeXYCoordinates[i][0],
            y: treeXYCoordinates[i][1],
            spatialReference: extent.spatialReference
          })

          const tree3D = elevationSampler.queryElevation(tree)
          const symbol = {
            type: "point-3d",
            symbolLayers: [{
              type: "object",
              resource: { href: "https://jsapi.maps.arcgis.com/sharing/rest/content/items/4418035fa87d44f490d5bf27a579e118/resources/styles/web/resource/tree.json" },
              height: 200,
              heading: Math.random() * 360,
              anchor: "bottom"
            }]
          }

          this.setState({
            graphics: [...this.state.graphics, {
              geometry: tree3D,
              symbol: symbol
            }]
          })
        }
      })
  }

  onSceneLoad = (map, view) => {
    this.map = map
    this.view = view
    view.when().then(this.createTerrain).then(this.createTrees).catch(console.error)
  }

  render () {
    window.x = this
    const { Extent, SpatialReference } = this.props.modules
    const { graphics } = this.state
    return (
      <div style={{width:'100vw',height:'100vh'}}>
        <Scene
          mapProperties={{ ground: 'world-elevation' }}
          viewProperties={{
            viewingMode: "local",
            environment: {
              lighting: { directShadowsEnabled: true }
            },
            clippingArea: new Extent({
              xmax: 950005,
              xmin: 943783,
              ymax: 5998448,
              ymin: 5994465,
              spatialReference: SpatialReference.WebMercator
            }),
            camera: {
              position: {
                spatialReference: SpatialReference.WebMercator,
                x: 949489,
                y: 5994263,
                z: 1339
              },
              heading: 322,
              tilt: 82
            }
          }}
          onLoad={this.onSceneLoad}
        >
          <GraphicsLayer>
            {[graphics.map((g, i) =>
              <Graphic key={i} properties={g} />
            )]}
          </GraphicsLayer>
        </Scene>
      </div>
    )
  }
}


export const lowPolyTerrainUsingMeshGeometry = () => (
  <ModuleLoader
    modules={[
      'esri/geometry/Point','esri/geometry/Extent','esri/geometry/SpatialReference',
      'esri/geometry/Mesh','esri/geometry/support/meshUtils'
    ]}
  >
    <ModulesConsumer>
      {({ status, modules }) => status === 'success' ? <LowPolyTerrainUsingMeshGeometryStory modules={modules} /> : null}
    </ModulesConsumer>
  </ModuleLoader>
)