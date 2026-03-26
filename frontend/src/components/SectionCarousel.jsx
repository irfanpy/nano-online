import { useEffect, useState } from "react";

export default function SectionCarousel({ items, renderItem, getKey, ariaLabel, visibleCount = 1 }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [resolvedVisibleCount, setResolvedVisibleCount] = useState(visibleCount);
  const total = items.length;

  if (!total) return null;

  useEffect(() => {
    const resolveVisibleCount = () => {
      if (window.innerWidth <= 760) {
        setResolvedVisibleCount(1);
        return;
      }
      if (window.innerWidth <= 1080) {
        setResolvedVisibleCount(Math.min(2, visibleCount));
        return;
      }
      setResolvedVisibleCount(visibleCount);
    };

    resolveVisibleCount();
    window.addEventListener("resize", resolveVisibleCount);
    return () => window.removeEventListener("resize", resolveVisibleCount);
  }, [visibleCount]);

  const cardsPerView = Math.max(1, Math.min(total, resolvedVisibleCount));
  const maxIndex = Math.max(0, total - cardsPerView);
  const slideWidthPct = 100 / cardsPerView;

  useEffect(() => {
    if (activeIndex > maxIndex) {
      setActiveIndex(maxIndex);
    }
  }, [activeIndex, maxIndex]);

  const goTo = (nextIndex) => {
    if (nextIndex < 0) {
      setActiveIndex(0);
      return;
    }
    if (nextIndex > maxIndex) {
      setActiveIndex(maxIndex);
      return;
    }
    setActiveIndex(nextIndex);
  };

  return (
    <div className="section-carousel" aria-label={ariaLabel}>
      <div className="section-carousel-outer">
        <button
          type="button"
          className="section-carousel-arrow"
          onClick={() => goTo(activeIndex - 1)}
          aria-label="Previous"
          disabled={activeIndex === 0}
        >
          <span className="section-carousel-arrow-icon" aria-hidden="true">&#8592;</span>
        </button>

        <div className="section-carousel-viewport">
          <div
            className="section-carousel-track"
            style={{ transform: `translateX(-${activeIndex * slideWidthPct}%)` }}
          >
            {items.map((item, index) => (
              <article
                key={getKey(item, index)}
                className="section-carousel-slide"
                style={{ minWidth: `${slideWidthPct}%` }}
              >
                {renderItem(item, index)}
              </article>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="section-carousel-arrow"
          onClick={() => goTo(activeIndex + 1)}
          aria-label="Next"
          disabled={activeIndex >= maxIndex}
        >
          <span className="section-carousel-arrow-icon" aria-hidden="true">&#8594;</span>
        </button>
      </div>

      <div className="section-carousel-dots" role="tablist" aria-label="Slide navigation">
        {Array.from({ length: maxIndex + 1 }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`section-carousel-dot ${activeIndex === i ? "active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-selected={activeIndex === i}
            role="tab"
          />
        ))}
      </div>
    </div>
  );
}
