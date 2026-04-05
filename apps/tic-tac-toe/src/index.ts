import {
  cleanup,
  createComputed,
  createSignal,
  render,
  h,
  type HJChild,
} from 'hello-js';
import './index.css';

type Player = 'X' | 'O';

function createModel() {
  const turn = createSignal<Player>('X');
  const board = createSignal<(null | Player)[][]>(
    new Array(3).fill(null).map(() => new Array(3).fill(null)),
  );

  function move(column: number, row: number) {
    const prev = board();
    if (prev[column][row]) {
      return;
    }
    prev[column][row] = turn();
    turn.set(turn() === 'X' ? 'O' : 'X');
    board.set(prev);
  }

  function reset() {
    board.set(new Array(3).fill(null).map(() => new Array(3).fill(null)));
  }

  const winner = createComputed<null | 'stalemate' | 'X' | 'O'>(() => {
    const prev = board();

    if (prev.every((row) => row.every((cell) => cell !== null))) {
      return 'stalemate';
    }

    for (const player of ['X', 'O'] as const) {
      for (let i = 0; i < 3; i++) {
        if (prev.every((r) => r[i] === player)) {
          return player;
        }
        if (prev[i].every((c) => c === player)) {
          return player;
        }
      }

      if (
        prev[0][0] === player &&
        prev[1][1] === player &&
        prev[2][2] === player
      ) {
        return player;
      }

      if (
        prev[0][2] === player &&
        prev[1][1] === player &&
        prev[2][0] === player
      ) {
        return player;
      }
    }

    return null;
  });

  return { turn, board, move, reset, winner };
}

function createOnclickRef(
  onClick: (ev: PointerEvent) => void,
): (element: HTMLElement) => void {
  return (element: HTMLElement) => {
    element.addEventListener('click', onClick);
    cleanup(() => element.removeEventListener('click', onClick));
  };
}

function TicTacToe() {
  const model = createModel();

  const cells: HJChild[] = [];

  for (let row = 0; row < 3; row++) {
    for (let column = 0; column < 3; column++) {
      cells.push(() =>
        h(
          'button',
          {
            className: 'cell',
            ref: createOnclickRef(() => model.move(column, row)),
          },
          () => model.board()[column][row],
        ),
      );
    }
  }

  const status = () => {
    const winner = model.winner();
    if (winner) {
      if (winner === 'stalemate') {
        return 'Stalemate';
      } else {
        return h(
          'div',
          `Player ${winner} wins.`,
          h(
            'button',
            { ref: createOnclickRef(() => model.reset()) },
            'Play again?',
          ),
        );
      }
    } else {
      return `Player ${model.turn()} turn`;
    }
  };

  return () =>
    h(
      'div',
      { className: 'wrapper' },
      h('div', { className: 'board' }, ...cells),
      h('div', { className: 'status' }, status),
    );
}

render(() => TicTacToe(), document.getElementById('app')!);
