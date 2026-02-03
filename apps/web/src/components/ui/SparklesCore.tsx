"use client";
import { useId, useMemo } from "react";
import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { Container } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

type ParticlesProps = {
  id?: string;
  className?: string;
  background?: string;
  particleSize?: number;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
};

export const SparklesCore = (props: ParticlesProps) => {
  const {
    id,
    className,
    background,
    minSize,
    maxSize,
    speed,
    particleColor,
    particleDensity,
  } = props;
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container) => {
    // Particles loaded
  };

  const generatedId = useId();

  const options = useMemo(
    () => ({
      background: {
        color: {
          value: background || "transparent",
        },
      },
      fullScreen: {
        enable: false,
        zIndex: 1,
      },
      fpsLimit: 120,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push",
          },
          onHover: {
            enable: true,
            mode: "repulse",
          },
        },
        modes: {
          push: {
            quantity: 4,
          },
          repulse: {
            distance: 100,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: particleColor || "#ffffff",
        },
        move: {
          enable: true,
          speed: speed || 1,
          direction: "none" as const,
          random: true,
          straight: false,
          outModes: {
            default: "out" as const,
          },
        },
        number: {
          density: {
            enable: true,
            width: 400,
            height: 400,
          },
          value: particleDensity || 100,
        },
        opacity: {
          value: {
            min: 0.1,
            max: 1,
          },
          animation: {
            enable: true,
            speed: 1,
            sync: false,
          },
        },
        size: {
          value: {
            min: minSize || 1,
            max: maxSize || 3,
          },
        },
      },
      detectRetina: true,
    }),
    [background, minSize, maxSize, speed, particleColor, particleDensity]
  );

  if (init) {
    return (
      <Particles
        id={id || generatedId}
        className={className}
        particlesLoaded={particlesLoaded}
        options={options}
      />
    );
  }

  return null;
};

export default SparklesCore;
