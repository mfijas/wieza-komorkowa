interface MenuParams {
  newGame: () => void;
}

export function Menu({ newGame }: MenuParams) {
  return (
    <div>
      <button onClick={() => newGame()} style={{ width: '100%', height: '2em' }}>Nowa gra</button>
    </div>
  );
}
