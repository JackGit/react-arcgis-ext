import PropTypes from 'prop-types'
import { widgetHoc } from '../hoc'

const BasemapGallery = widgetHoc('esri/widgets/BasemapGallery')

BasemapGallery.propTypes = {
  properties: PropTypes.object,
  position: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
}

export default BasemapGallery