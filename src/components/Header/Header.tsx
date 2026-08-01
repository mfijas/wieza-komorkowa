import { FaBars } from 'react-icons/fa';
import './Header.scss';

interface HeaderProps {
    onClick: () => void;
}

export function Header(props: HeaderProps) {
    return (
        <div className="header">
            <button onClick={() => props.onClick()} aria-label="Menu">
                <FaBars/>
            </button>
            <div className="title">Wieża komórkowa</div>
        </div>
    );
}
