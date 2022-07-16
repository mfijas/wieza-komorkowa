export default function addResizeListener() {
    function resizeFont() {
        function getCssRule(selectorText: string) {
            for (const cssRule of document.styleSheets[1].cssRules) {
                const cssStyleRule = cssRule as CSSStyleRule;
                if (cssStyleRule.selectorText === selectorText) {
                    return cssStyleRule;
                }
            }
            throw new Error(`Rule for ${selectorText} not found!`);
        }

        function setFontSizeForElement(selectorText: string, fontSize: number) {
            getCssRule(selectorText).style.fontSize = `${fontSize}px`;
        }

        const fontSize = window.innerHeight * 0.0357;

        setFontSizeForElement('body', fontSize);
        setFontSizeForElement('button', fontSize);
    }

    window.addEventListener('resize', resizeFont);
    resizeFont();
}
