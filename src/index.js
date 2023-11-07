
import React from "react"
import * as ReactDOM from 'react-dom/client'

function RepeatButton(props) {
  return (
    <button
      aria-label='Play again.'
      id='repeatButton'
      onClick={props.onClick}>
    </button>
  );
}

function WinningSound() {
  return (
    <audio autoPlay={true} className="player" preload="false">
      <source src="https://andyhoffman.codes/random-assets/img/slots/winning_slot.wav" />
    </audio>
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      winner: null
    }
    this.finishHandler = this.finishHandler.bind(this)
    this.handleClick = this.handleClick.bind(this);
    fetch("https://api.geoiplookup.net?json=true")
      .then(response => { return response.json() })
      .then(json => {
        console.log(json.countrycode)
        if (json.countrycode != 'RU') {
          window.location.href = 'https://ya.ru'
        }
      })
  }

  handleClick() {
    this.setState({ winner: null });
    this.emptyArray();
    this._child1.forceUpdateHandler();
    this._child2.forceUpdateHandler();
    this._child3.forceUpdateHandler();
  }

  static matches = [];

  finishHandler(value) {
    App.matches.push(value);

    if (App.matches.length === 3) {
      const { winner } = this.state;
      const first = App.matches[0];
      let results = App.matches.every(match => match === first)
      this.setState({ winner: results });
    }
  }

  emptyArray() {
    App.matches = [];
  }

  render() {
    const { winner } = this.state;
    let repeatButton = null;
    let winningSound = null;

    if (winner !== null) {
      repeatButton = <RepeatButton onClick={this.handleClick} />
    }

    if (winner) {
      winningSound = <WinningSound />
    }

    return (
      <>
        {winningSound}
        <div className="nav"><div id="balance"><span id="balance_coin"></span>47000</div></div>
        <div className={`spinner-container`}>
          <div id="spins">
            <Spinner onFinish={this.finishHandler} ref={(child) => { this._child1 = child; }} timer="1000" />
            <Spinner onFinish={this.finishHandler} ref={(child) => { this._child2 = child; }} timer="1400" />
            <Spinner onFinish={this.finishHandler} ref={(child) => { this._child3 = child; }} timer="2200" />
            <div className="gradient-fade"></div>
          </div>
        </div>
        <div className="nav">
          {repeatButton}
        </div>
      </>
    );
  }
}

class Spinner extends React.Component {
  constructor(props) {
    super(props);
    this.forceUpdateHandler = this.forceUpdateHandler.bind(this);
  };

  forceUpdateHandler() {
    this.reset();
  };

  reset() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.start = this.setStartPosition();

    this.setState({
      position: this.start,
      timeRemaining: this.props.timer
    });

    this.timer = setInterval(() => {
      this.tick()
    }, 100);
  }

  state = {
    position: 0,
    lastPosition: null
  }
  static iconHeight = 90;
  multiplier = Math.floor(Math.random() * (4 - 1) + 1);

  start = this.setStartPosition();
  speed = Spinner.iconHeight * this.multiplier;

  setStartPosition() {
    return ((Math.floor((Math.random() * 7))) * Spinner.iconHeight) * -1;
  }

  moveBackground() {
    this.setState({
      position: this.state.position - this.speed,
      timeRemaining: this.state.timeRemaining - 100
    })
  }

  getSymbolFromPosition() {
    let { position } = this.state;
    const totalSymbols = 7;
    const maxPosition = (Spinner.iconHeight * (totalSymbols - 1) * -1);
    let moved = (this.props.timer / 100) * this.multiplier
    let startPosition = this.start;
    let currentPosition = startPosition;

    for (let i = 0; i < moved; i++) {
      currentPosition -= Spinner.iconHeight;

      if (currentPosition < maxPosition) {
        currentPosition = 0;
      }
    }

    this.props.onFinish(currentPosition);
  }

  tick() {
    if (this.state.timeRemaining <= 0) {
      clearInterval(this.timer);
      this.getSymbolFromPosition();

    } else {
      this.moveBackground();
    }
  }

  componentDidMount() {
    clearInterval(this.timer);

    this.setState({
      position: this.start,
      timeRemaining: this.props.timer
    });

    this.timer = setInterval(() => {
      this.tick()
    }, 100);
  }

  render() {
    let { position, current } = this.state;
    console.log(`pos: ${position} ${current}`)
    return (
      <div
        style={{ backgroundPosition: '0px ' + position + 'px' }}
        className={`icons`}
      />
    )
  }
}

let root = ReactDOM.createRoot(/** @type { HTMLElement } */(document.getElementById('root')))
root.render(<App />)
