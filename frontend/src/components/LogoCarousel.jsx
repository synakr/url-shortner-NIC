import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';

import myGovLogo from '../assets/mygov.svg';
import pmIndiaLogo from '../assets/pmindia.svg';
import digitalIndiaLogo from '../assets/digital_india.svg';
import indiaPortalLogo from '../assets/india_portal.svg';
import incredibleIndiaLogo from '../assets/incredible_india.svg';
import dataGovLogo from '../assets/data_gov.svg';

const LOGOS = [
  { src: myGovLogo, alt: "myGov India", link: "https://www.mygov.in" },
  { src: pmIndiaLogo, alt: "PMINDIA", link: "https://www.pmindia.gov.in" },
  { src: digitalIndiaLogo, alt: "Digital India", link: "https://www.digitalindia.gov.in" },
  { src: indiaPortalLogo, alt: "India Portal", link: "https://www.india.gov.in" },
  { src: incredibleIndiaLogo, alt: "Incredible India", link: "https://www.incredibleindia.org" },
  { src: dataGovLogo, alt: "Data.gov.in", link: "https://data.gov.in" },
];

export default function LogoCarousel() {
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const autoPlayInterval = useRef(null);

  // Responsive items to display
  const [itemsToShow, setItemsToShow] = useState(6);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setItemsToShow(2);
      } else if (window.innerWidth <= 1024) {
        setItemsToShow(4);
      } else {
        setItemsToShow(6);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalLogos = LOGOS.length;
  const maxPosition = Math.max(0, totalLogos - itemsToShow);

  const nextSlide = () => {
    setCurrentPosition((prev) => (prev < maxPosition ? prev + 1 : 0));
  };

  const prevSlide = () => {
    setCurrentPosition((prev) => (prev > 0 ? prev - 1 : maxPosition));
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayInterval.current = setInterval(nextSlide, 3000);
  };

  const stopAutoPlay = () => {
    if (autoPlayInterval.current) {
      clearInterval(autoPlayInterval.current);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
    return () => stopAutoPlay();
  }, [isPlaying, itemsToShow, currentPosition]);

  const toggleAutoPlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleMouseEnter = () => {
    stopAutoPlay();
  };

  const handleMouseLeave = () => {
    if (isPlaying) {
      startAutoPlay();
    }
  };

  const logoWidthPercentage = 100 / itemsToShow;

  return (
    <section className="logo-carousel-section">
      {/* Dual Color Top Border */}
      <div className="split-border">
        <div className="split-border-left"></div>
        <div className="split-border-right"></div>
      </div>

      <div className="logo-carousel-container group">
        <div className="logo-carousel-wrapper">
          <div
            className="carousel-track"
            style={{
              transform: `translateX(-${currentPosition * logoWidthPercentage}%)`,
              width: `${(totalLogos / itemsToShow) * 100}%`
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {LOGOS.map((logo, idx) => (
              <a
                key={idx}
                className="partner-logo hover:opacity-85 transition-opacity"
                style={{ width: `${100 / totalLogos}%`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                href={logo.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  title={logo.alt}
                />
              </a>
            ))}
          </div>
        </div>

        {/* Carousel Control Arrows */}
        <button
          className="carousel-control-btn left"
          onClick={prevSlide}
          aria-label="Previous Partner Logo"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          className="carousel-control-btn right"
          onClick={nextSlide}
          aria-label="Next Partner Logo"
        >
          <ChevronRight size={18} />
        </button>

        {/* Play / Pause indicator */}
        <div className="carousel-play-pause">
          <button
            className="carousel-play-pause-btn"
            onClick={toggleAutoPlay}
            title={isPlaying ? "Pause auto scroll" : "Play auto scroll"}
          >
            {isPlaying ? <Pause size={10} /> : <Play size={10} />}
          </button>
        </div>
      </div>
    </section>
  );
}
