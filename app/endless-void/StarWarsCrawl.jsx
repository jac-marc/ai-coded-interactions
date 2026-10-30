import React from 'react';

export function StarWarsCrawl({ crawlRef }) {
  return (
    <div className="fixed inset-0 z-5 flex items-end justify-center overflow-hidden pointer-events-none">
      <div
        ref={crawlRef}
        className="w-full max-w-5xl px-12 text-center text-yellow-300 transition-transform duration-100"
        style={{
          transform: 'perspective(400px) rotateX(25deg) translateY(100vh)',
          transformOrigin: 'center bottom',
          fontFamily: 'sans-serif',
          lineHeight: '2',
        }}
      >
        <div className="space-y-12 text-5xl font-bold leading-relaxed">
          <p className="text-7xl tracking-widest mb-16">
            GALACTIC CONFLICT
          </p>
          
          <p className="text-4xl leading-loose">
            It is a period of civil wars in the galaxy. A brave alliance of 
            underground freedom fighters has challenged the tyranny and 
            oppression of the awesome GALACTIC EMPIRE.
          </p>
          
          <p className="text-4xl leading-loose">
            Striking from a fortress hidden among the billion stars of the 
            galaxy, rebel spaceships have won their first victory in a battle 
            with the powerful Imperial Starfleet. The EMPIRE fears that 
            another defeat could bring a thousand more solar systems into 
            the rebellion, and Imperial control over the galaxy would be 
            lost forever.
          </p>
          
          <p className="text-4xl leading-loose">
            To crush the rebellion once and for all, the EMPIRE is 
            constructing a sinister new battle station. Powerful enough to 
            destroy an entire planet, its completion spells certain doom for 
            the champions of freedom.
          </p>
        </div>
      </div>
    </div>
  );
}

