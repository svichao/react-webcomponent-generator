import React from 'react';
import PropTypes from 'prop-types';

import { renderElement } from './utils';

/**
 * Row component for BaseTable
 */
class TableRow extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      measured: false,
    };

    this._setRef = this._setRef.bind(this);
    this._handleExpand = this._handleExpand.bind(this);
  }

  componentDidMount() {
    this.props.estimatedRowHeight &&
      this.props.rowIndex >= 0 &&
      this._measureHeight(true);
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.estimatedRowHeight &&
      this.props.rowIndex >= 0 &&
      // should not re-measure if it's updated after measured and reset
      !this.props.getIsResetting() &&
      this.state.measured &&
      prevState.measured
    ) {
      this.setState({ measured: false }, () => this._measureHeight());
    }
  }

  render() {
    /* eslint-disable no-unused-vars */
    const {
      isScrolling,
      className,
      style,
      columns,
      rowIndex,
      rowData,
      expandColumnKey,
      depth,
      rowEventHandlers,
      estimatedRowHeight,
      rowRenderer,
      cellRenderer,
      expandIconRenderer,
      tagName: Tag,
      // omit the following from rest
      rowKey,
      getIsResetting,
      onRowHover,
      onRowExpand,
      onRowHeightChange,
      minEstimatedRowHeight,
      ...rest
    } = this.props;
    /* eslint-enable no-unused-vars */

    const expandIcon = expandIconRenderer({
      rowData,
      rowIndex,
      depth,
      onExpand: this._handleExpand,
    });
    let cells = columns.map((column, columnIndex) =>
      cellRenderer({
        isScrolling,
        columns,
        column,
        columnIndex,
        rowData,
        rowIndex,
        expandIcon: column.key === expandColumnKey && expandIcon,
      }),
    );

    if (rowRenderer) {
      cells = renderElement(rowRenderer, {
        isScrolling,
        cells,
        columns,
        rowData,
        rowIndex,
        depth,
      });
    }

    const eventHandlers = this._getEventHandlers(rowEventHandlers);

    if (estimatedRowHeight && rowIndex >= 0) {
      const { height, ...otherStyles } = style;
      return (
        <Tag
          {...rest}
          ref={this._setRef}
          className={className}
          style={this.state.measured ? style : otherStyles}
          {...(this.state.measured && eventHandlers)}
        >
          {cells}
        </Tag>
      );
    }

    return (
      <Tag {...rest} className={className} style={style} {...eventHandlers}>
        {cells}
      </Tag>
    );
  }

  _setRef(ref) {
    this.ref = ref;
  }

  _handleExpand(expanded) {
    const { onRowExpand, rowData, rowIndex, rowKey } = this.props;
    onRowExpand && onRowExpand({ expanded, rowData, rowIndex, rowKey });
  }

  _measureHeight(initialMeasure) {
    if (!this.ref) return;

    const { style, rowKey, onRowHeightChange, rowIndex, columns } = this.props;
    const height = this.ref.getBoundingClientRect().height;
    this.setState({ measured: true }, () => {
      if (initialMeasure || height !== style.height)
        onRowHeightChange(
          rowKey,
          height,
          rowIndex,
          columns[0] && !columns[0].__placeholder__ && columns[0].frozen,
        );
    });
  }

  _getEventHandlers(handlers = {}) {
    const { rowData, rowIndex, rowKey, onRowHover } = this.props;
    const eventHandlers = {};
    Object.keys(handlers).forEach((eventKey) => {
      const callback = handlers[eventKey];
      if (typeof callback === 'function') {
        eventHandlers[eventKey] = (event) => {
          callback({ rowData, rowIndex, rowKey, event });
        };
      }
    });

    if (onRowHover) {
      const mouseEnterHandler = eventHandlers['onMouseEnter'];
      eventHandlers['onMouseEnter'] = (event) => {
        onRowHover({
          hovered: true,
          rowData,
          rowIndex,
          rowKey,
          event,
        });
        mouseEnterHandler && mouseEnterHandler(event);
      };

      const mouseLeaveHandler = eventHandlers['onMouseLeave'];
      eventHandlers['onMouseLeave'] = (event) => {
        onRowHover({
          hovered: false,
          rowData,
          rowIndex,
          rowKey,
          event,
        });
        mouseLeaveHandler && mouseLeaveHandler(event);
      };
    }

    return eventHandlers;
  }
}

TableRow.defaultProps = {
  tagName: 'div',
};

TableRow.propTypes = {
  isScrolling: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  rowData: PropTypes.object.isRequired,
  rowIndex: PropTypes.number.isRequired,
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  expandColumnKey: PropTypes.string,
  depth: PropTypes.number,
  rowEventHandlers: PropTypes.object,
  rowRenderer: PropTypes.oneOfType([PropTypes.func, PropTypes.element]),
  cellRenderer: PropTypes.func,
  expandIconRenderer: PropTypes.func,
  estimatedRowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
  getIsResetting: PropTypes.func,
  onRowHover: PropTypes.func,
  onRowExpand: PropTypes.func,
  onRowHeightChange: PropTypes.func,
  tagName: PropTypes.elementType,
};

export default TableRow;
