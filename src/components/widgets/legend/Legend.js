import PropTypes from 'prop-types'
import { widgetHoc } from '../hoc'

const Legend = widgetHoc('esri/widgets/Legend')

Legend.propTypes = {
  properties: PropTypes.object,
  position: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
}

export default Legend