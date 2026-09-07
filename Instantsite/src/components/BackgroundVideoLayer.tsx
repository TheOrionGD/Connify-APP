import React from 'react';
import CinematicParticleCanvas from './CinematicParticleCanvas';

export default function BackgroundVideoLayer() {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-0 select-none">
      {/* Looping Ambient Video Background - Crisp & High Clarity */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-75 scale-100"
      >
        <source src="/onbording.mp4" type="video/mp4" />
      </video>

      {/* Cinematic Instanced 3D Particle Field Canvas */}
      <CinematicParticleCanvas className="absolute inset-0 w-full h-full opacity-60" />

      {/* Subtle Vignette & Gradient Overlays for Depth and Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#090a0f]/50 via-transparent to-[#090a0f]/70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#090a0f_90%)] opacity-60" />
    </div>
  );
}
