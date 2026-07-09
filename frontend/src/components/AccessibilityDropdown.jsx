import { useState, useEffect, useRef } from "react";
import { 
  Accessibility, Check, Link, Sun, Contrast, EyeOff, Volume2, ArrowUp, ArrowDown, Type, ChevronDown
} from "lucide-react";

export default function AccessibilityDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // States for accessibility options
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem("acc-high-contrast") === "true";
  });
  const [highlightLinks, setHighlightLinks] = useState(() => {
    return localStorage.getItem("acc-highlight-links") === "true";
  });
  const [invert, setInvert] = useState(() => {
    return localStorage.getItem("acc-invert") === "true";
  });
  const [saturation, setSaturation] = useState(() => {
    return localStorage.getItem("acc-saturation") === "true";
  });
  const [fontScale, setFontScale] = useState(() => {
    return parseFloat(localStorage.getItem("acc-font-scale")) || 1.0;
  });
  const [textSpacing, setTextSpacing] = useState(() => {
    return localStorage.getItem("acc-text-spacing") === "true";
  });
  const [lineHeight, setLineHeight] = useState(() => {
    return localStorage.getItem("acc-line-height") === "true";
  });
  const [screenReader, setScreenReader] = useState(() => {
    return localStorage.getItem("acc-screen-reader") === "true";
  });
  const [bigCursor, setBigCursor] = useState(() => {
    return localStorage.getItem("acc-big-cursor") === "true";
  });
  const [hideImages, setHideImages] = useState(() => {
    return localStorage.getItem("acc-hide-images") === "true";
  });

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update classes and styles on root element when states change
  useEffect(() => {
    const root = document.documentElement;

    // Contrast & Colors
    if (highContrast) {
      root.classList.add("accessibility-high-contrast");
      localStorage.setItem("acc-high-contrast", "true");
    } else {
      root.classList.remove("accessibility-high-contrast");
      localStorage.setItem("acc-high-contrast", "false");
    }

    if (highlightLinks) {
      root.classList.add("accessibility-highlight-links");
      localStorage.setItem("acc-highlight-links", "true");
    } else {
      root.classList.remove("accessibility-highlight-links");
      localStorage.setItem("acc-highlight-links", "false");
    }

    if (invert) {
      root.classList.add("accessibility-invert");
      localStorage.setItem("acc-invert", "true");
    } else {
      root.classList.remove("accessibility-invert");
      localStorage.setItem("acc-invert", "false");
    }

    if (saturation) {
      root.classList.add("accessibility-saturation");
      localStorage.setItem("acc-saturation", "true");
    } else {
      root.classList.remove("accessibility-saturation");
      localStorage.setItem("acc-saturation", "false");
    }

    // Font Sizing
    root.style.setProperty("--accessibility-font-scale", fontScale);
    localStorage.setItem("acc-font-scale", fontScale);

    // Spacing
    if (textSpacing) {
      root.classList.add("accessibility-text-spacing");
      localStorage.setItem("acc-text-spacing", "true");
    } else {
      root.classList.remove("accessibility-text-spacing");
      localStorage.setItem("acc-text-spacing", "false");
    }

    if (lineHeight) {
      root.classList.add("accessibility-line-height");
      localStorage.setItem("acc-line-height", "true");
    } else {
      root.classList.remove("accessibility-line-height");
      localStorage.setItem("acc-line-height", "false");
    }

    // Big Cursor
    if (bigCursor) {
      root.classList.add("accessibility-big-cursor");
      localStorage.setItem("acc-big-cursor", "true");
    } else {
      root.classList.remove("accessibility-big-cursor");
      localStorage.setItem("acc-big-cursor", "false");
    }

    // Hide Images
    if (hideImages) {
      root.classList.add("accessibility-hide-images");
      localStorage.setItem("acc-hide-images", "true");
    } else {
      root.classList.remove("accessibility-hide-images");
      localStorage.setItem("acc-hide-images", "false");
    }
  }, [highContrast, highlightLinks, invert, saturation, fontScale, textSpacing, lineHeight, bigCursor, hideImages]);

  // Screen Reader logic
  useEffect(() => {
    if (!screenReader) {
      window.speechSynthesis?.cancel();
      return;
    }

    let activeSpeechElement = null;

    const handleMouseOver = (e) => {
      const target = e.target.closest("p, a, button, h1, h2, h3, h4, h5, h6, li, label, img, [role='button']");
      if (!target) return;
      if (activeSpeechElement === target) return;

      if (activeSpeechElement) {
        activeSpeechElement.classList.remove("accessibility-speaking-highlight");
      }

      activeSpeechElement = target;
      target.classList.add("accessibility-speaking-highlight");

      let textToSpeak = "";
      if (target.tagName === "IMG") {
        textToSpeak = target.alt || "Image without description";
      } else {
        textToSpeak = target.innerText || target.getAttribute("aria-label") || "";
      }

      if (textToSpeak.trim()) {
        window.speechSynthesis?.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        window.speechSynthesis?.speak(utterance);
      }
    };

    const handleMouseOut = (e) => {
      if (activeSpeechElement) {
        activeSpeechElement.classList.remove("accessibility-speaking-highlight");
        activeSpeechElement = null;
      }
      window.speechSynthesis?.cancel();
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      if (activeSpeechElement) {
        activeSpeechElement.classList.remove("accessibility-speaking-highlight");
      }
      window.speechSynthesis?.cancel();
    };
  }, [screenReader]);

  const handleResetContrast = () => {
    setHighContrast(false);
    setInvert(false);
    setSaturation(false);
  };

  const handleHighContrast = () => {
    setHighContrast(true);
    setInvert(false);
    setSaturation(false);
  };

  const handleInvert = () => {
    setInvert(!invert);
    setHighContrast(false);
    setSaturation(false);
  };

  const handleSaturation = () => {
    setSaturation(!saturation);
    setHighContrast(false);
    setInvert(false);
  };

  const increaseFontSize = () => {
    setFontScale((prev) => Math.min(prev + 0.15, 1.45));
  };

  const decreaseFontSize = () => {
    setFontScale((prev) => Math.max(prev - 0.15, 0.85));
  };

  const resetFontSize = () => {
    setFontScale(1.0);
  };

  // Determine if Normal Contrast is active
  const isNormalContrast = !highContrast && !invert && !saturation;

  return (
    <div className="accessibility-dropdown-wrapper" ref={dropdownRef}>
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)} 
        className="accessibility-trigger"
        aria-label="Toggle Accessibility Menu"
      >
        <Accessibility size={15} />
        <span>Accessibility Options</span>
        <ChevronDown size={12} style={{ marginLeft: 2, opacity: 0.8 }} />
      </button>

      {isOpen && (
        <div className="accessibility-menu">
          <h2 className="accessibility-menu-title">Accessibility Tools</h2>

          {/* Section: Color Contrast */}
          <div className="accessibility-section">
            <h3 className="accessibility-section-title">Color Contrast</h3>
            <div className="accessibility-grid cols-3">
              <button 
                type="button"
                className={`accessibility-btn btn-high-contrast ${highContrast ? "active" : ""}`}
                onClick={handleHighContrast}
              >
                <Contrast size={20} />
                <span>High Contrast</span>
              </button>

              <button 
                type="button"
                className={`accessibility-btn ${isNormalContrast ? "active-badge" : ""}`}
                onClick={handleResetContrast}
              >
                <Sun size={20} />
                <span>Normal Contrast</span>
                {isNormalContrast && (
                  <span className="badge-checkmark">
                    <Check size={8} strokeWidth={4} />
                  </span>
                )}
              </button>

              <button 
                type="button"
                className={`accessibility-btn ${highlightLinks ? "active" : ""}`}
                onClick={() => setHighlightLinks(!highlightLinks)}
              >
                <Link size={20} />
                <span>Highlight Links</span>
              </button>
            </div>

            <div className="accessibility-grid cols-2 mt-2">
              <button 
                type="button"
                className={`accessibility-btn ${invert ? "active" : ""}`}
                onClick={handleInvert}
              >
                <div className="half-circle-icon"></div>
                <span>Invert</span>
              </button>

              <button 
                type="button"
                className={`accessibility-btn ${saturation ? "active" : ""}`}
                onClick={handleSaturation}
              >
                <div className="droplet-icon"></div>
                <span>Saturation</span>
              </button>
            </div>
          </div>

          {/* Section: Text Size */}
          <div className="accessibility-section">
            <h3 className="accessibility-section-title">Text Size</h3>
            <div className="accessibility-grid cols-3">
              <button 
                type="button"
                className="accessibility-btn font-control-btn"
                onClick={increaseFontSize}
              >
                <span className="font-icon-label large">A+</span>
                <span>Font Size Increase</span>
              </button>

              <button 
                type="button"
                className="accessibility-btn font-control-btn"
                onClick={decreaseFontSize}
              >
                <span className="font-icon-label small">A-</span>
                <span>Font Size Decrease</span>
              </button>

              <button 
                type="button"
                className={`accessibility-btn font-control-btn ${fontScale === 1.0 ? "active-badge" : ""}`}
                onClick={resetFontSize}
              >
                <span className="font-icon-label">A</span>
                <span>Normal Font</span>
                {fontScale === 1.0 && (
                  <span className="badge-checkmark">
                    <Check size={8} strokeWidth={4} />
                  </span>
                )}
              </button>
            </div>

            <div className="accessibility-grid cols-2 mt-2">
              <button 
                type="button"
                className={`accessibility-btn ${textSpacing ? "active" : ""}`}
                onClick={() => setTextSpacing(!textSpacing)}
              >
                <div className="text-spacing-icon">
                  <span>T</span>
                  <div className="arrows">↔</div>
                </div>
                <span>Text Spacing</span>
              </button>

              <button 
                type="button"
                className={`accessibility-btn ${lineHeight ? "active" : ""}`}
                onClick={() => setLineHeight(!lineHeight)}
              >
                <div className="line-height-icon">
                  <span>T</span>
                  <div className="arrows">↕</div>
                </div>
                <span>Line Height</span>
              </button>
            </div>
          </div>

          {/* Section: Other Controls */}
          <div className="accessibility-section">
            <h3 className="accessibility-section-title">Other controls</h3>
            <div className="accessibility-grid cols-3">
              <button 
                type="button"
                className={`accessibility-btn ${screenReader ? "active" : ""}`}
                onClick={() => setScreenReader(!screenReader)}
              >
                <Volume2 size={20} />
                <span>Screen Reader</span>
              </button>

              <button 
                type="button"
                className={`accessibility-btn ${bigCursor ? "active" : ""}`}
                onClick={() => setBigCursor(!bigCursor)}
              >
                <div className="cursor-icon"></div>
                <span>Big Cursor</span>
              </button>

              <button 
                type="button"
                className={`accessibility-btn ${hideImages ? "active" : ""}`}
                onClick={() => setHideImages(!hideImages)}
              >
                <EyeOff size={20} />
                <span>Hide Images</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
