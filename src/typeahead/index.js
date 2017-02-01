
import {
  default as React,
  Component,
} from 'react';

import listensToClickOutside from 'react-onclickoutside/decorator';

import TypeaheadSelector from './selector';
import KeyEvent from '../keyevent';
import fuzzy from 'fuzzy';
import DatePicker from 'react-datepicker';
import moment from 'moment';

/**
 * A "typeahead", an auto-completing text input
 *
 * Renders an text input that shows options nearby that you can use the
 * keyboard or mouse to select.  Requires CSS for MASSIVE DAMAGE.
 */

class Typeahead extends Component {
  static propTypes = {
    customClasses: React.PropTypes.object,
    maxVisible: React.PropTypes.number,
    options: React.PropTypes.array,
    header: React.PropTypes.string,
    datatype: React.PropTypes.string,
    defaultValue: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    onOptionSelected: React.PropTypes.func,
    onKeyDown: React.PropTypes.func,
  }


  getDefaultProps() {
    return {
      options: [],
      header: 'Category',
      datatype: 'text',
      customClasses: {},
      defaultValue: '',
      placeholder: '',
      onKeyDown: ( event ) => null,
      onOptionSelected: ( option ) => null,
    };
  }

  getInitialState() {
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

  componentWillReceiveProps(nextProps) {
    this.setState({options: nextProps.options,
      header: nextProps.header,
      datatype: nextProps.datatype,
      visible: nextProps.options});
  }

  getOptionsForValue(value, options) {
    var result = fuzzy.filter(value, options).map(function(res) {
      return res.string;
    });

    if (this.props.maxVisible) {
      result = result.slice(0, this.props.maxVisible);
    }
    return result;
  }

  setEntryText(value) {
    if (this.refs.entry != null) {
      this.refs.entry.getDOMNode().value = value;
    }
    this._onTextEntryUpdated();
  }

  _renderIncrementalSearchResults() {
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

    return (
      <TypeaheadSelector
        ref="sel" options={ this.state.visible }
		header={this.state.header}
        onOptionSelected={ this._onOptionSelected }
        customClasses={this.props.customClasses} />
    );
  }

  _onOptionSelected(option) {
    var nEntry = this.refs.entry.getDOMNode();
    nEntry.focus();
    nEntry.value = option;
    this.setState({visible: this.getOptionsForValue(option, this.state.options),
                   selection: option,
                   entryValue: option});

    this.props.onOptionSelected(option);
  }

  _onTextEntryUpdated() {
    var value = "";
    if (this.refs.entry != null) {
      value = this.refs.entry.getDOMNode().value;
    }
    this.setState({visible: this.getOptionsForValue(value, this.state.options),
                   selection: null,
                   entryValue: value});
  }

  _onEnter(event) {
    if (!this.refs.sel.state.selection) {
      return this.props.onKeyDown(event);
    }

    this._onOptionSelected(this.refs.sel.state.selection);
  }

  _onEscape() {
    this.refs.sel.setSelectionIndex(null)
  }

  _onTab(event) {
    var option = this.refs.sel.state.selection ?
      this.refs.sel.state.selection : this.state.visible[0];
    this._onOptionSelected(option)
  }

  eventMap(event) {
    var events = {};

    events[KeyEvent.DOM_VK_UP] = this.refs.sel.navUp;
    events[KeyEvent.DOM_VK_DOWN] = this.refs.sel.navDown;
    events[KeyEvent.DOM_VK_RETURN] = events[KeyEvent.DOM_VK_ENTER] = this._onEnter;
    events[KeyEvent.DOM_VK_ESCAPE] = this._onEscape;
    events[KeyEvent.DOM_VK_TAB] = this._onTab;

    return events;
  }

  _onKeyDown(event) {
    // If Enter pressed
    if (event.keyCode === KeyEvent.DOM_VK_RETURN || event.keyCode === KeyEvent.DOM_VK_ENTER) {
      // If no options were provided so we can match on anything
      if (this.props.options.length===0) {
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

  _onFocus(event) {
    this.setState({focused: true});
  }

  handleClickOutside(event) {
    this.setState({focused:false});
  }

  isDescendant(parent, child) {
     var node = child.parentNode;
     while (node != null) {
         if (node == parent) {
             return true;
         }
         node = node.parentNode;
     }
     return false;
  }

  _handleDateChange(date) {
    this.props.onOptionSelected(date.format("YYYY-MM-DD"));
  }

  _showDatePicker() {
    if (this.state.datatype == "date") {
      return true;
    }
    return false;
  }

  inputRef() {
    if (this._showDatePicker()) {
      return this.refs.datepicker.refs.dateinput.refs.entry;
    } else {
      return this.refs.entry;
    }
  }

  render() {
    var inputClasses = {}
    inputClasses[this.props.customClasses.input] = !!this.props.customClasses.input;
    var inputClassList = React.addons.classSet(inputClasses)

    var classes = {
      typeahead: true
    }
    classes[this.props.className] = !!this.props.className;
    var classList = React.addons.classSet(classes);

    if (this._showDatePicker()) {
      return (
        <span ref="input" className={classList} onFocus={this._onFocus}>
          <DatePicker ref="datepicker" dateFormat={"YYYY-MM-DD"} selected={moment()} onChange={this._handleDateChange} onKeyDown={this._onKeyDown}/>
        </span>
      );
    }

    return (
      <span ref="input" className={classList} onFocus={this._onFocus}>
        <input ref="entry" type="text"
          placeholder={this.props.placeholder}
          className={inputClassList} defaultValue={this.state.entryValue}
          onChange={this._onTextEntryUpdated} onKeyDown={this._onKeyDown}
          />
        { this._renderIncrementalSearchResults() }
      </span>
    );
  }
};


export default listensToClickOutside(Typeahead)
