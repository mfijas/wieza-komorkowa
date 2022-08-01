export default function addResizeListener() {
    function resizeFont() {
        const fontSize = window.innerHeight * 0.0357;
        document.body.style.fontSize = `${fontSize}px`;
    }

    window.addEventListener('resize', resizeFont);
    resizeFont();
}
