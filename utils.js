/**
 * Shared utility for IntersectionObserver based scroll animations.
 *
 * @param {string|Element|NodeList|Array} selectorOrElements - The CSS selector string, an Element, or a NodeList/Array of elements to observe.
 * @param {object} options - Configuration options.
 * @param {string} [options.activeClass='active'] - The class to add when the element intersects.
 * @param {number} [options.threshold=0.1] - The intersection threshold (0.0 to 1.0).
 * @param {boolean} [options.unobserve=true] - Whether to stop observing the element after it intersects.
 * @param {string} [options.rootMargin='0px'] - Margin around the root.
 * @returns {IntersectionObserver} The created observer instance.
 */
export function initScrollObserver(selectorOrElements, { activeClass = 'active', threshold = 0.1, unobserve = true, rootMargin = '0px' } = {}) {
    const observerOptions = {
        root: null,
        rootMargin,
        threshold
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(activeClass);
                if (unobserve) {
                    observer.unobserve(entry.target);
                }
            }
        });
    }, observerOptions);

    if (selectorOrElements) {
        if (typeof selectorOrElements === 'string') {
            const elements = document.querySelectorAll(selectorOrElements);
            elements.forEach(el => observer.observe(el));
        } else if (selectorOrElements instanceof NodeList || Array.isArray(selectorOrElements)) {
            selectorOrElements.forEach(el => observer.observe(el));
        } else if (selectorOrElements instanceof Element) {
            observer.observe(selectorOrElements);
        }
    }

    return observer;
}
