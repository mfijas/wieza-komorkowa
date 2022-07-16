import { render, screen } from '@testing-library/react';
import App from './App';

test('renders header', () => {
    render(<App width={5} height={5}/>);
    const headerElement = screen.getByText(/Wieża komórkowa/i);
    expect(headerElement).toBeInTheDocument();
});
