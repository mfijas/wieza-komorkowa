import { FaBars } from 'react-icons/fa';

interface HeaderProps {
    onClick: () => void;
}

export function Header(props: HeaderProps) {
    return (
        <div className="header">
            <button onClick={() => props.onClick()}>
                <FaBars/>
            </button>
            <div className="title">Wieża komórkowa</div>
        </div>
    );
}
