import PropTypes from 'prop-types'
import { widgetHoc } from '../hoc'

const Search = widgetHoc('esri/widgets/Search')

Search.propTypes = {
  properties: PropTypes.object,
  position: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
}

export default Search