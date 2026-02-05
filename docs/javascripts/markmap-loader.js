(function () {
    const { Transformer } = window.markmap;
    const { Markmap, loadCSS, loadJS } = window.markmap;
    const { Toolbar } = window.markmap.Toolbar;

    const transformer = new Transformer();

    function renderMarkmap() {
        // Find all the code blocks that are marked as markmap
        const markmaps = document.querySelectorAll('.markmap');

        markmaps.forEach((el) => {
            // If already processed, skip
            if (el.getAttribute('data-processed')) return;
            el.setAttribute('data-processed', 'true');

            const content = el.textContent;
            const svg = document.createElement('svg');
            svg.style.width = '100%';
            svg.style.height = '100%';
            // Replace the div with the svg
            el.parentNode.replaceChild(svg, el);

            // Transform the markdown
            const { root, features } = transformer.transform(content);

            // Load any necessary assets (like mathjax/prism if used in the map)
            const { styles, scripts } = transformer.getUsedAssets(features);
            if (styles) loadCSS(styles);
            if (scripts) loadJS(scripts, { getMarkmap: () => window.markmap });

            // Create the markmap
            const mm = Markmap.create(svg, undefined, root);

            // Attach the toolbar
            const toolbar = new Toolbar();
            toolbar.attach(mm);

            // Position the toolbar
            const tbDom = toolbar.render();
            // Style it to be within the container or fixed - usually absolute bottom-right of the container
            tbDom.style.position = 'absolute';
            tbDom.style.bottom = '1rem';
            tbDom.style.right = '1rem';

            // Need to ensure the parent has relative positioning for the absolute toolbar to work correctly
            // However, mkdocs material theme might be tricky. 
            // Often better to wrap the svg in a div with position relative.

            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.height = '100%'; // Markmap needs height
            wrapper.style.minHeight = '400px'; // Give it some default height

            svg.parentNode.insertBefore(wrapper, svg);
            wrapper.appendChild(svg);
            wrapper.appendChild(tbDom);

            // Adjust SVG to fit the wrapper
            // (Markmap usually handles resizing, but good to be sure)
        });
    }

    // Run on load and maybe on navigation changes if SPA (MkDocs Material Instant Loading)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderMarkmap);
    } else {
        renderMarkmap();
    }

    // Keep an eye out for changes if needed (e.g. instant loading)
    // For standard mkdocs, DOMContentLoaded is usually enough. 
    // If 'navigation.instant' feature is on, we might need more headers.
    // Using MutationObserver is a common fallback or just hooking into document event if available.
})();
