import PropTypes from 'prop-types'
import { widgetHoc } from '../hoc'

const Locate = widgetHoc('esri/widgets/Locate')

Locate.propTypes = {
  properties: PropTypes.object,
  position: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
}

export default Locate