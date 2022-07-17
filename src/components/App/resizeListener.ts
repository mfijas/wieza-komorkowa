export default function addResizeListener() {
    function getCssRule(selectorText: string) {
        for (const styleSheet of document.styleSheets) {
            for (const cssRule of styleSheet.cssRules) {
                const cssStyleRule = cssRule as CSSStyleRule;
                if (cssStyleRule.selectorText === selectorText) {
                    return cssStyleRule;
                }
            }
        }
        throw new Error(`Rule for ${selectorText} not found!`);
    }

    const cssRules = ['body', 'button'].map(elem => getCssRule(elem));
    console.log(cssRules);

    function resizeFont() {
        const fontSize = window.innerHeight * 0.0357;
        cssRules.forEach(cssRule => {
            cssRule.style.fontSize = `${fontSize}px`;
        });
    }

    window.addEventListener('resize', resizeFont);
    resizeFont();
}
