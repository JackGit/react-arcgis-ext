import PropTypes from 'prop-types'
import { widgetHoc } from '../hoc'

const Sketch = widgetHoc('esri/widgets/Sketch')

Sketch.propTypes = {
  properties: PropTypes.object,
  position: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
}

export default Sketch