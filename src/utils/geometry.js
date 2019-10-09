
/**
 * graphic.geometry has type
 * but graphic.toJSON().geometry has no type
 */
export const type = geometry => {
  if (geometry.type) {
    return geometry.type
  } else if (geometry.paths) {
    return 'polyline'
  } else if (geometry.rings) {
    return 'polygon'
  } else if (geometry.points) {
    return 'multipoint'
  } else if ('x' in geometry) {
    return 'point'
  }
}
