import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'

function Square(props) {
  return (
    <button 
      className={`square  ${(props.highlight) ? 'highlight' : ''}`} 
      onClick={props.onClick}
    >
      {props.value}
    </button>
  )
}

class Board extends React.Component {
  renderSquare(i) {
    var highlight = false;
    if (this.props.winner) {
      if (this.props.winner.includes(i)) {
        highlight = true;
      }
    }
    return <Square
      highlight={highlight}
      key={i}
      value={this.props.squares[i]} 
      onClick={() => this.props.onClick(i)}
    />;
  }

  render() {
    return (
      <div>
        { 
          // Generate the board
          [0,1,2].map((row, i) => (
            <div key={i} className="board-row">
              {
                [0,1,2].map((col, j) => (
                  this.renderSquare(3 * i + j)
                ))
              }
            </div>
          ))
        }
      </div>
    )
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        position: null, // The index of the cell that a piece was put in
      }],
      moveSort: 'ASC',
      stepNumber: 0,
      xIsNext: true,
    }
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';

    this.setState({
      history: history.concat([{
        squares: squares,
        position: i,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  handleSort() {
    this.setState({
      moveSort: (this.state.moveSort === 'ASC') ? 'DESC' : 'ASC',
    })
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    // Move history
    let moves = history.map((step, move) => {
      const col = step.position % 3;
      const row = Math.floor(step.position / 3);
      // Currently selected point in history
      const className = (step.position === current.position) ?
        'selected' : ''; 
      const desc = move ?
        'Go to move #' + move + ` (Col ${col}, Row ${row})` :
        'Go to game start';
      return (
        <li className={className} key={move}>
          <button 
            onClick={() => this.jumpTo(move)}
          >
            {desc}
          </button>
        </li>
      )
    });

    moves = (this.state.moveSort === 'ASC') ? moves : moves.reverse();

    let status;
    if (winner) {
      // Uses xIsNext to find the piece that is currently going (the winner)
      status = 'Winner: ' + (this.state.xIsNext ? 'O' : 'X');
    } else if (!winner && !current.squares.includes(null)) {
      status = 'Draw!';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            winner={winner}
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div className='status'>{status}</div>
          <button onClick={() => this.handleSort()}>
            {`Sort By ${(this.state.moveSort === 'ASC') ? 'Descending' : 'Ascending'}`}
          </button>
          <ol reversed={this.state.moveSort === 'DESC'}>{moves}</ol>
        </div>
      </div>
    );
  }
}

// Attempts to find a winner, returns the line of the winner if found,
// returns null otherwise
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i];
    }
  }
  return null;
}

ReactDOM.render(<Game />, document.getElementById('root'));