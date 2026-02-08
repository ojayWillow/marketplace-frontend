import { Phone, Star, MessageCircle } from 'lucide-react';

const trustItems = [
  {
    icon: Phone,
    color: 'blue',
    title: 'Phone Verified',
    desc: 'Every user verifies their phone number \u2014 no anonymous accounts',
  },
  {
    icon: Star,
    color: 'yellow',
    title: 'Ratings & Reviews',
    desc: 'See real feedback from other users before you decide',
  },
  {
    icon: MessageCircle,
    color: 'green',
    title: 'In-App Chat',
    desc: 'Communicate directly and securely within the app',
  },
];

const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  green: { bg: 'bg-green-500/10', text: 'text-green-400' },
};

const TrustSection = () => (
  <section className="py-12 sm:py-16 md:py-24 border-t border-[#1a1a24]">
    <div className="max-w-4xl mx-auto px-4">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">Built on trust</h2>
        <p className="text-gray-400 text-base sm:text-lg">Your safety and security come first</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {trustItems.map((item) => {
          const colors = colorMap[item.color];
          const Icon = item.icon;
          return (
            <div key={item.title} className="text-center p-4 sm:p-6">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 ${colors.bg} rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${colors.text}`} />
              </div>
              <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">{item.title}</h3>
              <p className="text-gray-400 text-xs sm:text-sm">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default TrustSection;
