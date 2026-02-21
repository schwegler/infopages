/**
 * Creates an IntersectionObserver to animate elements on scroll.
 *
 * @param {Object} options - Configuration options.
 * @param {string} [options.selector] - CSS selector for elements to observe immediately.
 * @param {string} [options.activeClass='active'] - Class to add when element intersects.
 * @param {number|number[]} [options.threshold=0.1] - Intersection threshold.
 * @param {string} [options.rootMargin='0px'] - Root margin.
 * @param {boolean} [options.unobserve=true] - Whether to unobserve after first intersection.
 * @returns {IntersectionObserver} The created observer.
 */
export function createScrollObserver({
    selector = null,
    activeClass = 'active',
    threshold = 0.1,
    rootMargin = '0px',
    unobserve = true
} = {}) {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(activeClass);
                if (unobserve) {
                    obs.unobserve(entry.target);
                }
            }
        });
    }, { root: null, rootMargin, threshold });

    if (selector) {
        document.querySelectorAll(selector).forEach(el => observer.observe(el));
    }

    return observer;
}
