'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _decorator = require('react-onclickoutside/decorator');

var _decorator2 = _interopRequireDefault(_decorator);

var _selector = require('./selector');

var _selector2 = _interopRequireDefault(_selector);

var _keyevent = require('../keyevent');

var _keyevent2 = _interopRequireDefault(_keyevent);

var _fuzzy = require('fuzzy');

var _fuzzy2 = _interopRequireDefault(_fuzzy);

var _reactDatepicker = require('react-datepicker');

var _reactDatepicker2 = _interopRequireDefault(_reactDatepicker);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * A "typeahead", an auto-completing text input
 *
 * Renders an text input that shows options nearby that you can use the
 * keyboard or mouse to select.  Requires CSS for MASSIVE DAMAGE.
 */

var Typeahead = function (_Component) {
  _inherits(Typeahead, _Component);

  function Typeahead() {
    _classCallCheck(this, Typeahead);

    return _possibleConstructorReturn(this, (Typeahead.__proto__ || Object.getPrototypeOf(Typeahead)).apply(this, arguments));
  }

  _createClass(Typeahead, [{
    key: 'getDefaultProps',
    value: function getDefaultProps() {
      return {
        options: [],
        header: 'Category',
        datatype: 'text',
        customClasses: {},
        defaultValue: '',
        placeholder: '',
        onKeyDown: function onKeyDown(event) {
          return;
        },
        onOptionSelected: function onOptionSelected(option) {}
      };
    }
  }, {
    key: 'getInitialState',
    value: function getInitialState() {
      return {
        // The set of all options... Does this need to be state?  I guess for lazy load...
        options: this.props.options,
        header: this.props.header,
        datatype: this.props.datatype,

        focused: false,

        // The currently visible set of options
        visible: this.getOptionsForValue(this.props.defaultValue, this.props.options),

        // This should be called something else, "entryValue"
        entryValue: this.props.defaultValue,

        // A valid typeahead value
        selection: null
      };
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      this.setState({ options: nextProps.options,
        header: nextProps.header,
        datatype: nextProps.datatype,
        visible: nextProps.options });
    }
  }, {
    key: 'getOptionsForValue',
    value: function getOptionsForValue(value, options) {
      var result = _fuzzy2.default.filter(value, options).map(function (res) {
        return res.string;
      });

      if (this.props.maxVisible) {
        result = result.slice(0, this.props.maxVisible);
      }
      return result;
    }
  }, {
    key: 'setEntryText',
    value: function setEntryText(value) {
      if (this.refs.entry != null) {
        this.refs.entry.getDOMNode().value = value;
      }
      this._onTextEntryUpdated();
    }
  }, {
    key: '_renderIncrementalSearchResults',
    value: function _renderIncrementalSearchResults() {
      if (!this.state.focused) {
        return "";
      }

      // Something was just selected
      if (this.state.selection) {
        return "";
      }

      // There are no typeahead / autocomplete suggestions
      if (!this.state.visible.length) {
        return "";
      }

      return _react2.default.createElement(_selector2.default, {
        ref: 'sel', options: this.state.visible,
        header: this.state.header,
        onOptionSelected: this._onOptionSelected,
        customClasses: this.props.customClasses });
    }
  }, {
    key: '_onOptionSelected',
    value: function _onOptionSelected(option) {
      var nEntry = this.refs.entry.getDOMNode();
      nEntry.focus();
      nEntry.value = option;
      this.setState({ visible: this.getOptionsForValue(option, this.state.options),
        selection: option,
        entryValue: option });

      this.props.onOptionSelected(option);
    }
  }, {
    key: '_onTextEntryUpdated',
    value: function _onTextEntryUpdated() {
      var value = "";
      if (this.refs.entry != null) {
        value = this.refs.entry.getDOMNode().value;
      }
      this.setState({ visible: this.getOptionsForValue(value, this.state.options),
        selection: null,
        entryValue: value });
    }
  }, {
    key: '_onEnter',
    value: function _onEnter(event) {
      if (!this.refs.sel.state.selection) {
        return this.props.onKeyDown(event);
      }

      this._onOptionSelected(this.refs.sel.state.selection);
    }
  }, {
    key: '_onEscape',
    value: function _onEscape() {
      this.refs.sel.setSelectionIndex(null);
    }
  }, {
    key: '_onTab',
    value: function _onTab(event) {
      var option = this.refs.sel.state.selection ? this.refs.sel.state.selection : this.state.visible[0];
      this._onOptionSelected(option);
    }
  }, {
    key: 'eventMap',
    value: function eventMap(event) {
      var events = {};

      events[_keyevent2.default.DOM_VK_UP] = this.refs.sel.navUp;
      events[_keyevent2.default.DOM_VK_DOWN] = this.refs.sel.navDown;
      events[_keyevent2.default.DOM_VK_RETURN] = events[_keyevent2.default.DOM_VK_ENTER] = this._onEnter;
      events[_keyevent2.default.DOM_VK_ESCAPE] = this._onEscape;
      events[_keyevent2.default.DOM_VK_TAB] = this._onTab;

      return events;
    }
  }, {
    key: '_onKeyDown',
    value: function _onKeyDown(event) {
      // If Enter pressed
      if (event.keyCode === _keyevent2.default.DOM_VK_RETURN || event.keyCode === _keyevent2.default.DOM_VK_ENTER) {
        // If no options were provided so we can match on anything
        if (this.props.options.length === 0) {
          this._onOptionSelected(this.state.entryValue);
        }

        // If what has been typed in is an exact match of one of the options
        if (this.props.options.indexOf(this.state.entryValue) > -1) {
          this._onOptionSelected(this.state.entryValue);
        }
      }

      // If there are no visible elements, don't perform selector navigation.
      // Just pass this up to the upstream onKeydown handler
      if (!this.refs.sel) {
        return this.props.onKeyDown(event);
      }

      var handler = this.eventMap()[event.keyCode];

      if (handler) {
        handler(event);
      } else {
        return this.props.onKeyDown(event);
      }
      // Don't propagate the keystroke back to the DOM/browser
      event.preventDefault();
    }
  }, {
    key: '_onFocus',
    value: function _onFocus(event) {
      this.setState({ focused: true });
    }
  }, {
    key: 'handleClickOutside',
    value: function handleClickOutside(event) {
      this.setState({ focused: false });
    }
  }, {
    key: 'isDescendant',
    value: function isDescendant(parent, child) {
      var node = child.parentNode;
      while (node != null) {
        if (node == parent) {
          return true;
        }
        node = node.parentNode;
      }
      return false;
    }
  }, {
    key: '_handleDateChange',
    value: function _handleDateChange(date) {
      this.props.onOptionSelected(date.format("YYYY-MM-DD"));
    }
  }, {
    key: '_showDatePicker',
    value: function _showDatePicker() {
      if (this.state.datatype == "date") {
        return true;
      }
      return false;
    }
  }, {
    key: 'inputRef',
    value: function inputRef() {
      if (this._showDatePicker()) {
        return this.refs.datepicker.refs.dateinput.refs.entry;
      } else {
        return this.refs.entry;
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var inputClasses = {};
      inputClasses[this.props.customClasses.input] = !!this.props.customClasses.input;
      var inputClassList = _react2.default.addons.classSet(inputClasses);

      var classes = {
        typeahead: true
      };
      classes[this.props.className] = !!this.props.className;
      var classList = _react2.default.addons.classSet(classes);

      if (this._showDatePicker()) {
        return _react2.default.createElement(
          'span',
          { ref: 'input', className: classList, onFocus: this._onFocus },
          _react2.default.createElement(_reactDatepicker2.default, { ref: 'datepicker', dateFormat: "YYYY-MM-DD", selected: (0, _moment2.default)(), onChange: this._handleDateChange, onKeyDown: this._onKeyDown })
        );
      }

      return _react2.default.createElement(
        'span',
        { ref: 'input', className: classList, onFocus: this._onFocus },
        _react2.default.createElement('input', { ref: 'entry', type: 'text',
          placeholder: this.props.placeholder,
          className: inputClassList, defaultValue: this.state.entryValue,
          onChange: this._onTextEntryUpdated, onKeyDown: this._onKeyDown
        }),
        this._renderIncrementalSearchResults()
      );
    }
  }]);

  return Typeahead;
}(_react.Component);

Typeahead.propTypes = {
  customClasses: _react2.default.PropTypes.object,
  maxVisible: _react2.default.PropTypes.number,
  options: _react2.default.PropTypes.array,
  header: _react2.default.PropTypes.string,
  datatype: _react2.default.PropTypes.string,
  defaultValue: _react2.default.PropTypes.string,
  placeholder: _react2.default.PropTypes.string,
  onOptionSelected: _react2.default.PropTypes.func,
  onKeyDown: _react2.default.PropTypes.func
};
;

exports.default = (0, _decorator2.default)(Typeahead);