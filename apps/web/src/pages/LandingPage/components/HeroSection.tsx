import { MapPin, Zap, Shield, Star } from 'lucide-react';

const HeroSection = () => (
  <div className="mb-8 lg:mb-0">
    <div className="inline-flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs lg:text-sm font-medium mb-4 lg:mb-6">
      <MapPin className="w-3 h-3 lg:w-4 lg:h-4" />
      Available in Latvia
    </div>

    <h1 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 lg:mb-6 leading-tight">
      Get help with
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400"> everyday tasks</span>
    </h1>

    <p className="text-base lg:text-xl text-gray-400 mb-6 lg:mb-8 leading-relaxed">
      Need someone to walk your dog, help you move, or fix something at home?
      Connect with trusted locals who can help<span className="hidden lg:inline"> — usually within hours</span>.
    </p>

    <div className="grid grid-cols-3 gap-3 lg:flex lg:flex-wrap lg:gap-6 mb-8">
      <div className="text-center lg:text-left lg:flex lg:items-center lg:gap-2">
        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto lg:mx-0 mb-1 lg:mb-0">
          <Zap className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <div className="text-white font-medium lg:font-semibold text-sm">Fast</div>
          <div className="text-gray-500 text-xs lg:text-sm">Get offers in minutes</div>
        </div>
      </div>
      <div className="text-center lg:text-left lg:flex lg:items-center lg:gap-2">
        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto lg:mx-0 mb-1 lg:mb-0">
          <Shield className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <div className="text-white font-medium lg:font-semibold text-sm">Verified</div>
          <div className="text-gray-500 text-xs lg:text-sm">Phone-verified<span className="hidden lg:inline"> users</span></div>
        </div>
      </div>
      <div className="text-center lg:text-left lg:flex lg:items-center lg:gap-2">
        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mx-auto lg:mx-0 mb-1 lg:mb-0">
          <Star className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <div className="text-white font-medium lg:font-semibold text-sm">Rated</div>
          <div className="text-gray-500 text-xs lg:text-sm">Trusted reviews</div>
        </div>
      </div>
    </div>
  </div>
);

export default HeroSection;
