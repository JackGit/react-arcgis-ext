import PropTypes from 'prop-types'
import { widgetHoc } from '../hoc'

const LayerList = widgetHoc('esri/widgets/LayerList')

LayerList.propTypes = {
  properties: PropTypes.object,
  position: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
}

export default LayerList