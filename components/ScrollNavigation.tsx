'use client';

import { useState, useEffect } from 'react';

interface Section {
  id: string;
  label: string;
}

interface ScrollNavigationProps {
  sections: Section[];
}

export default function ScrollNavigation({ sections }: ScrollNavigationProps) {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      // If at the bottom of the page, activate the last section
      if (scrollTop + 5 >= docHeight) {
        setActiveSection(sections[sections.length - 1].id);
        return;
      }

      // Find active section based on scroll position
      const sectionElements = sections.map((section) => {
        const el = document.getElementById(section.id);
        return el ? { id: section.id, offset: el.offsetTop } : null;
      }).filter(Boolean) as { id: string; offset: number }[];

      const currentSection = sectionElements
        .reverse()
        .find((section) => scrollTop >= section.offset - 100);

      if (currentSection) {
        setActiveSection(currentSection.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
  };

  if (sections.length === 0) return null;

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
      <div className="relative flex flex-col gap-6 py-4">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          return (
            <div
              key={section.id}
              className="relative group cursor-pointer"
              onClick={() => scrollToSection(section.id)}
            >
              <div
                className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                  isActive
                    ? 'bg-[#00f0ff] border-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.6)]'
                    : 'bg-transparent border-white/40 hover:border-white/70'
                }`}
              />
              
              <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-black/90 border border-[#00f0ff]/50 rounded px-3 py-1.5 text-xs text-white whitespace-nowrap shadow-lg">
                  {section.label}
                </div>
                <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-[#00f0ff]/50" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}