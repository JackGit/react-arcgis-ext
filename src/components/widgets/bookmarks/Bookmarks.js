import PropTypes from 'prop-types'
import { widgetHoc } from '../hoc'

const Bookmarks = widgetHoc('esri/widgets/Bookmarks')

Bookmarks.propTypes = {
  properties: PropTypes.object,
  position: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
}

export default Bookmarks