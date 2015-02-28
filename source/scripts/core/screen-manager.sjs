// # module: screen-manager
//
// Provides a way of managing screens in the application, with one screen
// active at any given time.
module.exports = function(Platform) {

  // -- Dependencies ---------------------------------------------------
  var {React}           = Platform;
  var {Base}            = require('adt-simple');
  var Maybe             = require('data.maybe');
  var Task              = require('data.future');
  var {curry}           = require('core.lambda');
  var {delay, parallel} = require('control.async')(Task);

  var {addons: {classSet}} = React;

  // -- Helpers --------------------------------------------------------

  // ### function: directionClass
  //
  // Returns the class for a direction
  //
  // @type Direction → String
  function directionClass {
    Left  => 'left',
    Right => 'right'
  }
  
  // ### function: stateClass
  //
  // Returns the class for a ScreenState
  //
  // @type: ScreenState → [String]
  function stateClass {
    Entering(dir, *) => ['entering', 'entering-' + dir],
    Leaving(dir, *)  => ['leaving', 'leaving-' + dir],
    Hidden(*)        => ['hidden'],
    Visible(*)       => ['visible']
  }

  // ### function: getScreen
  //
  // Returns the screen from a ScreenState
  //
  // @type: ScreenState → React.Class
  function getScreen {
    Entering(*, a) => a,
    Leaving(*, a)  => a,
    Hidden(a)      => a,
    Visible(a)     => a
  }

  // #### function: changeTo
  //
  // Changes the current screen.
  //
  // @type: Display, Direction, React.Class, ScreenManager → Task(α, unit)
  function changeTo(display, dir, screen, sm) {
    return sm.getCurrent().cata({
      Nothing: pushNewScreen,
      Just:    replaceScreen
    });

    function replaceScreen(old) {
      return $do {
        var x = Leaving(dir, old);
        display.equals(Display.Stack)?
          new Task(λ(_, f) -> { sm.setState({ history: sm.state.history.concat([x]) }); f() })
        : Task.of();
        parallel([hideOldScreen(x, old), pushNewScreen]);
      }
    }

    function hideOldScreen(old, screen) {
      return $do {
        delay(sm.props.transitionDuration);
        Task.of(sm.setState({ history: history.map(replace(old, Hidden(screen))) }));
      }
    }

    function pushNewScreen() {
      return $do {
        new Task(λ(_, f) -> { sm.setState({ current: Maybe.Just(Entering(dir, screen)) }); f() });
        delay(sm.props.transitionDuration);
        Task.of(sm.setState({ current: Maybe.Just(Visible(screen)) }));
      }
    }

    function replace(a, b){ return function(x) {
      return x === a? b : a
    }}
  }


  // -- Types ----------------------------------------------------------

  // ### object: Display
  //
  // Represents the strategy for displaying a screen. `Stack` will
  // add the screen on top of the current one, whereas `Replace` will
  // replace the current one.
  union Display {
    Stack,
    Replace
  } deriving (Base)

  // ### object: Direction
  //
  // Represents the direction of the transition for a Screen.
  union Direction {
    Left,
    Right
  } deriving (Base)

  Left.invert = λ[Right];
  Right.invert = λ[Left];

  // ### object: ScreenState
  //
  // Represents the state of a screen that can be manipulated by the ScreenManager.
  union ScreenState {
    Entering(Direction, *),
    Leaving(Direction, *),
    Hidden(*),
    Visible(*)
  } deriving (Base)
  

  // ### object: ScreenManager
  //
  // A React component that manages screens in an application.
  var ScreenManager = React.createClass({
    statics: {
      display: Display,
      direction: Direction,
      screenState: ScreenState
    },

    // #### method: getDefaultProps
    //
    // @type: Unit → { transitionDuration: Number }
    getDefaultProps: function() {
      return {
        transitionDuration: 300
      }
    },

    // #### method: getInitialState
    //
    // @type:: 
    //   Unit → { history: Array(ScreenState)
    //          , current: Maybe(ScreenState)
    //          , transitionDuration: Number
    //          }
    getInitialState: function() {
      return {
        history: [],
        current: Maybe.Nothing()
      }
    },

    // #### method: getHistory
    //
    // Returns a list of screens that have been previously displayed.
    //
    // @type: this:ScreenManager → Array(ScreenState)
    getHistory: function() {
      return this.state.history
    },

    // #### method: getCurrent
    //
    // Returns the current screen being displayed.
    //
    // @type: this:ScreenManager → Maybe(ScreenState)
    getCurrent: function() {
      return this.state.current;
    },

    // #### method: show
    //
    // Shows a screen.
    //
    // @type: this:ScreenManager, React.Class → Task(α, unit)
    show: function(screen) {
      return changeTo(Stack, Left, screen, this);
    },

    // #### method: back
    //
    // Returns to the previous screen in history.
    //
    // @type: this:ScreenManager → Task(Error, unit)
    back: function() {
      var history = this.state.history;
      if (history.length > 0) {
        var screen = history[history.length - 1];
        return $do {
          new Task(λ(_, f) -> { sm.setState({ history: history.slice(0, -1) }) });
          changeTo(Replace, Right, screen, this);
        }
      } else {
        return Task.rejected(new Error('No history available.'));
      }
    },

    // #### method: renderScreen
    //
    // Renders a ScreenState.
    //
    // @type: this:ScreenManager, ScreenState → React.Class
    renderScreen: function(screenState) {
      var frameClass = 'screen-frame ' + stateClass(screenState).join(' ');

      return (
        <div className={ frameClass }>
          { getScreen(screenState) }
        </div>
      )
    },

    // #### method: render
    //
    // Returns the render tree for this component.
    //
    // @type: this:ScreenManager → React.Class
    render: function() {
      return (
        <div className="application screen-manager">
          { this.state.history.map(this.renderScreen) }
          { this.state.current.map(this.renderScreen) }
        </div>
      )
    }
    
  });

  return ScreenManager
}
