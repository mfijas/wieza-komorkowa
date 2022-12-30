import './Instructions.scss';
import example from './example.png';

interface InstructionsProps {
    onShowGame: () => void;
}

export function Instructions({ onShowGame }: InstructionsProps) {
    const margin = 1;
    return <div id="instructions">
        Cała plansza pokryta jest wyrazami. Wyrazy tworzą ciągłe obszary czytane z lewa do prawa, z góry do dołu, na
        przykład „klatka”:
        <img id="exampleImg" src={example} alt="Word example"/>
        Należy je odkryć, co czynisz zaznaczając je, a potem klikając przycisk &quot;Dodaj słowo&quot; na dole. Gdy już
        zapełnisz wyrazami całą planszę, odbierz gratulacje, otwórz menu w lewym górnym rogu ekranu i zacznij od
        nowa.
        <button onClick={() => onShowGame()}>
            <svg viewBox="0 0 100 14">
                <rect
                    x={margin}
                    y={margin}
                    width={100 - 2 * margin}
                    height={14 - 2 * margin}
                    rx={margin}
                    ry={margin}
                />
                <text x="50%" y="50%">Rozpocznij grę</text>
            </svg>
        </button>
    </div>;
}
