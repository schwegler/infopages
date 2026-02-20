/**
 * Creates and configures an IntersectionObserver for reveal animations.
 * @param {Object} options - Configuration options
 * @param {string} [options.activeClass='is-visible'] - Class to add when element is intersecting
 * @param {number} [options.threshold=0.1] - Intersection threshold
 * @param {boolean} [options.unobserve=true] - Whether to stop observing after first intersection
 * @param {Function} [options.onIntersect] - Optional callback when intersection occurs
 * @returns {IntersectionObserver} The configured observer
 */
export function createRevealObserver({
    activeClass = 'is-visible',
    threshold = 0.1,
    unobserve = true,
    onIntersect = null
} = {}) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (activeClass) {
                    entry.target.classList.add(activeClass);
                }
                if (onIntersect) {
                    onIntersect(entry);
                }
                if (unobserve) {
                    observer.unobserve(entry.target);
                }
            }
        });
    }, { threshold });

    return observer;
}
