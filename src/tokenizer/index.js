import {
  default as React,
  Component,
} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Token from './token';
import KeyEvent from '../keyevent';
import Typeahead from '../typeahead';
import classNames from 'classnames';
import objectAssign from 'object-assign';
import '../react-structured-filter.css';
import onClickOutside from 'react-onclickoutside';

var WrappedTypeahead = onClickOutside( Typeahead );

/**
 * A typeahead that, when an option is selected, instead of simply filling
 * the text entry widget, prepends a renderable "token", that may be deleted
 * by pressing backspace on the beginning of the line with the keyboard.
 *
 * Example usage:
 *
 *      import StructuredFilter from 'react-structured-filter';
 *
 *      <StructuredFilter
 *        placeholder="Search..."
 *        options={[
 *          {category:"Name",type:"text"},
 *          {category:"Price",type:"number"},
 *        ]}
 *      />
 */
export default class Tokenizer extends Component {

  static propTypes = {
  /**
   * An array of structures with the components `category` and `type`
   *
   * * _category_: Name of the first thing the user types.
  * * _categorykey_: optional key for input and output, is useful if translations are involved
   * * _type_: This can be one of the following:
   *   * _text_: Arbitrary text for the value. No autocomplete options.
   *     Operator choices will be: `==`, `!=`, `contains`, `!contains`.
   *   * _textoptions_: You must additionally pass an options value which
   *     will be a function that returns the list of options choices as an
   *     array (for example `function getOptions() {return ["MSFT", "AAPL",
   *     "GOOG"]}`). Operator choices will be: `==`, `!=`.
   *   * _number_: Arbitrary text for the value. No autocomplete options.
   *     Operator choices will be: `==`, `!=`, `<`, `<=`, `>`, `>=`.
   *   * _date_: Shows a calendar and the input must be of the form
   *     `MMM D, YYYY H:mm A`. Operator choices will be: `==`, `!=`, `<`, `<=`, `>`,
   *     `>=`.
   *
   * Example:
   *
   *     [
   *       {
   *         "category": "Symbol",
   *           "categorykey": "symbol",
   *         "type": "textoptions",
   *         "options": function() {return ["MSFT", "AAPL", "GOOG"]}
   *       },
   *       {
   *         "category": "Name",
   *          "categorykey": "name",
   *         "type": "text",
   *          "isValid": (v)=>!!v
   *       },
   *       {
   *         "category": "Price",
   *          "categorykey": "packet_price",
   *         "type": "number"
   *       },
   *       {
   *         "category": "MarketCap",
   *         "categorykey": "market_cap_symbol",
   *         "type": "number",
   *         "isValid": (v)=>!isNaN(+v)
   *       },
   *       {
   *         "category": "IPO",
   *         "type": "date"
   *       }
   *     ]
   */
    options: PropTypes.array,

    /**
     * An object containing custom class names for child elements. Useful for
     * integrating with 3rd party UI kits. Allowed Keys: `input`, `results`,
     * `listItem`, `listAnchor`, `typeahead`, `hover`
     *
     * Example:
     *
     *     {
     *       input: 'filter-tokenizer-text-input',
     *       results: 'filter-tokenizer-list__container',
     *       listItem: 'filter-tokenizer-list__item'
     *     }
     */
    customClasses: PropTypes.object,

    /**
     * **Uncontrolled Component:** A default set of values of tokens to be
     * loaded on first render. Each token should be an object with a
     * `category`, `operator`, and `value` key.
     *
     * Example:
     *
     *     [
     *       {
     *         category: 'Industry',
     *         operator: '==',
     *         value: 'Books',
     *       },
     *       {
     *         category: 'IPO',
     *         operator: '>',
     *         value: 'Dec 8, 1980 10:50 PM',
     *       },
     *       {
     *         category: 'Name',
     *         operator: 'contains',
     *         value: 'Nabokov',
     *       },
     *     ]
     */
    defaultValue: PropTypes.array,

    /**
     * **Controlled Component:** A set of values of tokens to be loaded on
     * each render. Each token should be an object with a `category`,
     * `operator`, and `value` key.
     *
     * Example:
     *
     *     [
     *       {
     *         category: 'Industry',
     *         operator: '==',
     *         value: 'Books',
     *       },
     *       {
     *         category: 'IPO',
     *         operator: '>',
     *         value: 'Dec 8, 1980 10:50 PM',
     *       },
     *       {
     *         category: 'Name',
     *         operator: 'contains',
     *         value: 'Nabokov',
     *       },
     *     ]
     */
    value: PropTypes.array,

    /**
     * Placeholder text for the typeahead input.
     */
    placeholder: PropTypes.string,

    /**
     * Event handler triggered whenever the filter is changed and a token
     * is added or removed. Params: `(filter)`
     */
    onChange: PropTypes.func,
    /**
   * Event handler triggered whenever no filter is being entered
   * is ment as a way to triger actions on double enter
   */
    onFullEnter: PropTypes.func,
    /**
     * A mapping of datatypes to operators.
     * Resolved by merging with default operators.
     * Example:
     *
     * ```javascript
     * {
     *    "textoptions":["equals","does not equal"],
     *    "text":["like","not like","equals","does not equal","matches","does not match"]
     * }
     * ```
     */
    operators: PropTypes.object,
    /**
     * Translations for selection lists headers
     * Example:
     *
     * ```javascript
     *  {
     *     category: 'Category',
     *     operator: 'Operator',
     *     value: 'Value',
     *  }
     * ```
     */
    translations: PropTypes.object,
    /**
     * if operator suppose to have difference in select box and the chip  use this option
     * Example:
     *
     * ```javascript
     *  operatorSigns: {
     *     textoptions: { '!empty':'!n', 'empty':n, '==':'==', '!=':'!=' },
     *     text: { '!empty':'!n', 'empty':n, '==':'==', '!=':'!=', 'contains':'in', '!contains':'!in' },
     *   },
     * ```
     */
    operatorSigns: PropTypes.object,
  }

  static defaultProps = {
    // value: [],
    // defaultValue: [],
    options: [],
    customClasses: {},
    placeholder: '',
    onChange() {},
    onFullEnter() {},
    operators: {
      textoptions: [ '!empty', 'empty', '==', '!=' ],
      text: [ '!empty', 'empty', '==', '!=', 'contains', '!contains' ],
      number: [ '!empty', 'empty', '==', '!=', '<', '<=', '>', '>=' ],
      date: [ '!empty', 'empty', '==', '!=', '<', '<=', '>', '>=', 'in last days' ],
      bool: [ '!empty', 'empty', 'is on', 'is off' ],
    },
    translations: {
      category: 'Category',
      operator: 'Operator',
      value: 'Value',
    },
  }

  constructor( ...args ) {
    super( ...args );
    this._addTokenForValue = this._addTokenForValue.bind( this );
    this._onKeyDown = this._onKeyDown.bind( this );
    this._getOptionsForTypeahead = this._getOptionsForTypeahead.bind( this );
    this._removeTokenForValue = this._removeTokenForValue.bind( this );
    this._getCategory = this._getCategory.bind( this );
  }

  state = {
    selected: this.getStateFromProps( this.props ),
    category: '',
    categorykey: '',
    operator: '',
  }

  componentDidMount() {
    this.props.onChange( this.state.selected );
  }

  componentWillReceiveProps( nextProps ) {
    const update = {};
    if ( nextProps.value !== this.props.value ) {
      update.selected = this.getStateFromProps( nextProps );
    }
    this.setState( update );
  }

  getStateFromProps( props ) {
    const value = props.value || props.defaultValue || [];
    return value.slice( 0 );
  }

  _renderTokens() {
    const tokenClasses = {};
    tokenClasses[ this.props.customClasses.token ] = !!this.props.customClasses.token;
    const classList = classNames( tokenClasses );
    const result = this.state.selected.map(( selected, index ) => {
      return (
        <Token
          key={ index }
          className={ classList }
          onRemove={ this._removeTokenForValue }
        >
          { selected }
        </Token>
      );
    }, this );
    return result;
  }

  _getOptionsForTypeahead() {
    let categoryType;

    if ( this.state.category === '' ) {
      const categories = [];
      for ( let i = 0; i < this.props.options.length; i++ ) {
        categories.push( this.props.options[ i ].category );
      }
      return categories;
    } else if ( this.state.operator === '' ) {
      categoryType = this._getCategoryType();

      const operators = objectAssign({}, Tokenizer.defaultProps.operators, this.props.operators );
      switch ( categoryType ) {
        case 'text': return operators.text;
        case 'textoptions': return operators.textoptions;
        case 'date': return operators.date;
        case 'number': return operators.number;
        case 'bool': return operators.bool;
        default:
          /* eslint-disable no-console */
          console.warn( `WARNING: Unknown category type in tokenizer: "${categoryType}"` );
          /* eslint-enable no-console */
          return [];
      }
    }
    const options = this._getCategoryOptions();
    if ( options === null || options === undefined ) return [];
    return options();
  }

  _getHeader() {
    if ( this.state.category === '' ) {
      return this.props.translations.category;
    } else if ( this.state.operator === '' ) {
      return this.props.translations.operator;
    }

    return this.props.translations.value;
  }

  _getCategory( category ) {
    let cat = category;
    if ( !category || category === '' ) {
      cat = this.state.category;
    }
    for ( let i = 0; i < this.props.options.length; i++ ) {
      if ( this.props.options[ i ].category === cat ) {
        return this.props.options[ i ];
      }
    }
  }

  _getCategoryType( category ) {
    return (this._getCategory( category ) || {}).type;
  }

  _getCategoryValidation( category ) {
    return (this._getCategory( category ) || {}).isValid;
  }

  _getCategoryOptions() {
    for ( let i = 0; i < this.props.options.length; i++ ) {
      if ( this.props.options[ i ].category === this.state.category ) {
        return this.props.options[ i ].options;
      }
    }
  }
  

  _onKeyDown( event ) {
    // enter case
    if ( event.keyCode === KeyEvent.DOM_VK_ENTER || event.keyCode === KeyEvent.DOM_VK_RETURN ) {
      if ( this.state.category === '' ) {
        this.props.onFullEnter();
      }
      return;
    }

    // We only care about intercepting backspaces
    if ( event.keyCode !== KeyEvent.DOM_VK_BACK_SPACE ) {
      return;
    }

    // Remove token ONLY when bksp pressed at beginning of line
    // without a selection
    const typeaheadRef = this.typeahead;
    const typeaheadObj = typeaheadRef.getInstance();
    const entry = ReactDOM.findDOMNode( typeaheadObj.inputRef());
    if ( entry.selectionStart === entry.selectionEnd &&
        entry.selectionStart === 0 ) {
      if ( this.state.operator !== '' ) {
        this.setState({ operator: '' });
      } else if ( this.state.category !== '' ) {
        this.setState({ category: '' });
        this.setState({ categorykey: '' });
      } else {
        // No tokens
        if ( !this.state.selected.length ) {
          return;
        }
        const lastSelected = JSON.parse(
          JSON.stringify( this.state.selected[ this.state.selected.length - 1 ])
        );
        this._removeTokenForValue(
          this.state.selected[ this.state.selected.length - 1 ]
        );
        if ( this._getCategoryType( lastSelected.category ) === 'date' ) {
          this.setState({});
          return;
        }
        this.setState({
          category: lastSelected.category,
          categorykey: lastSelected.categorykey,
          operator: lastSelected.operator,
        });
        if ( this._getCategoryType( lastSelected.category ) !== 'textoptions' ) {
          typeaheadObj.setEntryText( lastSelected.value );
        }
      }
      event.preventDefault();
    }
  }

  _removeTokenForValue( value ) {
    const index = this.state.selected.indexOf( value );
    if ( index === -1 ) {
      return;
    }

    this.state.selected.splice( index, 1 );
    this.setState({ selected: this.state.selected });
    this.props.onChange( this.state.selected );

    return;
  }

  _addTokenForValue( value ) {
    const typeaheadRef = this.typeahead;
    const typeaheadObj = typeaheadRef.getInstance();
    let assignValue = value || '';

    if ( this.state.category === '' ) {
      const categoryOptions = this._getOptionsForTypeahead();
      if ( categoryOptions.indexOf( assignValue ) !== -1 ) {
        this.setState({ category: assignValue });
        const thisOption = this.props.options.find( option => option.category === assignValue );
        if ( thisOption !== undefined ) {
          this.setState({ categorykey: thisOption.categorykey });
        }
        typeaheadObj.setEntryText( '' );
        return;
      }
      typeaheadObj.setEntryText( '' );
      return;
    }

    if ( this.state.operator === '' ) {
      const operatorOptions = this._getOptionsForTypeahead();
      if ( operatorOptions.indexOf( assignValue ) !== -1 ) {
        let tempValue = assignValue;
        if ( this.props.operatorSigns [ assignValue ]) {
          tempValue = this.props.operatorSigns [ assignValue ];
        }
        if ( this.props.operators.bool.indexOf( assignValue ) < 0 ) {
          this.setState({ operator: tempValue });
          typeaheadObj.setEntryText( '' );
          return;
        }
        this.state.operator = tempValue;
        assignValue = '';
      } else {
        typeaheadObj.setEntryText( '' );
        return;
      }
    }

    const newValue = {
      category: this.state.category,
      categorykey: this.state.categorykey,
      operator: this.state.operator,
      value: assignValue,
    };

    this.state.selected.push( newValue );
    this.setState({ selected: this.state.selected });
    typeaheadObj.setEntryText( '' );
    this.props.onChange( this.state.selected );

    this.setState({
      category: '',
      operator: '',
    });

    return;
  }

  /*
   * Returns the data type the input should use ("date" or "text")
   */
  _getInputType() {
    if ( this.state.category !== '' && this.state.operator !== '' ) {
      return this._getCategoryType();
    }

    return 'text';
  }

  renderTypeahead( classList ) {
    return ( <WrappedTypeahead ref={ comp => { this.typeahead = comp; } }
      className={ classList }
      placeholder={ this.props.placeholder }
      customClasses={ this.props.customClasses }
      options={ this._getOptionsForTypeahead() }
      header={ this._getHeader() }
      datatype={ this._getInputType() }
      onOptionSelected={ this._addTokenForValue }
      onKeyDown={ this._onKeyDown }
      isChangeValid={ ( this.state.category!=='' && this.state.operator!=='') 
        ? this._getCategoryValidation()
        : undefined
      }
    /> );
  }

  render() {
    const classes = {};
    classes[ this.props.customClasses.typeahead ] = !!this.props.customClasses.typeahead;
    const classList = classNames( classes );
    return (
      <div className="filter-tokenizer">
        <div className="token-collection">
          { this._renderTokens() }

          <div className="filter-input-group">
            <div className="filter-category">{ this.state.category } </div>
            <div className="filter-operator">{ this.state.operator } </div>

            { this.renderTypeahead( classList ) }
            </div>
          </div>
      </div>
    );
  }
}
