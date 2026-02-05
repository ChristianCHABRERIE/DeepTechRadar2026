(function () {
    // Simple loader that matches the logic in index.html, with error handling
    function renderMarkmap() {
        if (!window.markmap) {
            console.warn('Markmap libraries not yet loaded. Retrying...');
            // If scripts are deferred, we might be too early.
            requestAnimationFrame(renderMarkmap);
            return;
        }

        const { Transformer } = window.markmap;
        const { Markmap, loadCSS, loadJS } = window.markmap;
        const { Toolbar } = window.markmap.Toolbar;

        // Default transformer
        const transformer = new Transformer();

        // Find all the code blocks that are marked as markmap
        const markmaps = document.querySelectorAll('.markmap');

        markmaps.forEach((el) => {
            // If already processed, skip
            if (el.getAttribute('data-processed')) return;
            el.setAttribute('data-processed', 'true');

            const content = el.textContent;

            // Cleanup the element
            el.innerHTML = '';

            // Create SVG container
            const svg = document.createElement('svg');
            svg.style.width = '100%';
            svg.style.height = '100%';
            // Ensure the parent container has height
            if (!el.style.height) {
                el.style.height = '500px';
            }
            el.appendChild(svg);

            // Transform the markdown
            const { root, features } = transformer.transform(content);

            // Load any necessary assets
            const { styles, scripts } = transformer.getUsedAssets(features);
            if (styles) loadCSS(styles);
            if (scripts) loadJS(scripts, { getMarkmap: () => window.markmap });

            // Create the markmap
            const mm = Markmap.create(svg, undefined, root);

            // Create and attach the toolbar
            if (Toolbar) {
                const toolbar = new Toolbar();
                toolbar.attach(mm);
                const tbDom = toolbar.render();
                tbDom.style.position = 'absolute';
                tbDom.style.bottom = '20px';
                tbDom.style.right = '20px';
                el.style.position = 'relative'; // Make el the positioning context
                el.appendChild(tbDom);
            }
        });
    }

    // Load immediately if possible, or wait for content
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderMarkmap);
    } else {
        setTimeout(renderMarkmap, 100); // Small delay to ensuring scripts parsed
    }
})();
