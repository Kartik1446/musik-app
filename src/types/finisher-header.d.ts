interface FinisherHeaderConfig {
  count: number;
  size: {
    min: number;
    max: number;
    pulse: number;
  };
  speed: {
    x: {
      min: number;
      max: number;
    };
    y: {
      min: number;
      max: number;
    };
  };
  colors: {
    background: string;
    particles: string[];
  };
  blending: string;
  opacity: {
    center: number;
    edge: number;
  };
  skew: number;
  shapes: string[];
}

declare global {
  interface Window {
    FinisherHeader: new (config: FinisherHeaderConfig) => void;
  }
}