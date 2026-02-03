import { SparklesCore } from './SparklesCore';

interface SparklesTitleProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export const SparklesTitle = ({ 
  title = 'Collab', 
  subtitle,
  className = '' 
}: SparklesTitleProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* Title with gradient */}
      <h1 className="text-3xl md:text-4xl font-bold text-center relative z-10">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
          {title}
        </span>
      </h1>
      
      {/* Subtitle */}
      {subtitle && (
        <p className="text-gray-600 text-center mt-1 relative z-10 flex items-center justify-center gap-1">
          {subtitle} <span>💰</span>
        </p>
      )}
      
      {/* Sparkles overlay - positioned around text */}
      <div className="absolute inset-0 -inset-x-8 -inset-y-4 pointer-events-none">
        <SparklesCore
          id="title-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1.5}
          particleDensity={40}
          particleColor="#8B5CF6"
          speed={0.5}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default SparklesTitle;
