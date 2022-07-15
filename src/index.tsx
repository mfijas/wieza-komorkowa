import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
)
root.render(
    <React.StrictMode>
        <App width={7} height={12}/>
    </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()

window.addEventListener('resize', resizeFont)
resizeFont()

function resizeFont() {
    function getCssRule(selectorText: string) {
        for (let cssRule of document.styleSheets[1].cssRules) {
            const cssStyleRule = cssRule as CSSStyleRule
            if (cssStyleRule.selectorText === selectorText) {
                return cssStyleRule
            }
        }
        throw new Error(`Rule for ${selectorText} not found!`)
    }
    function setFontSizeForElement(selectorText: string, fontSize: number) {
        getCssRule(selectorText).style.fontSize = `${fontSize}px`
    }

    const fontSize = window.innerHeight * 0.0357

    setFontSizeForElement('body', fontSize);
    setFontSizeForElement('button', fontSize);
}
