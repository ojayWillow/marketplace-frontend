const categories = [
  { icon: '🐕', label: 'Pet Care', desc: 'Walking, sitting' },
  { icon: '📦', label: 'Moving', desc: 'Furniture, boxes' },
  { icon: '🧹', label: 'Cleaning', desc: 'Home, office' },
  { icon: '🚗', label: 'Delivery', desc: 'Pick up & drop' },
  { icon: '🔧', label: 'Repairs', desc: 'Handyman tasks' },
  { icon: '💻', label: 'Tech Help', desc: 'Setup, support' },
];

const CategoriesSection = () => (
  <section className="py-12 sm:py-16 md:py-24 border-t border-[#1a1a24]">
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">Popular tasks</h2>
        <p className="text-gray-400 text-base sm:text-lg">People in your area are getting help with...</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {categories.map((cat, i) => (
          <div
            key={i}
            className="bg-[#1a1a24]/50 hover:bg-[#1a1a24] border border-[#2a2a3a] hover:border-[#3a3a4a] rounded-xl p-3 sm:p-4 text-center transition-all group"
          >
            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{cat.icon}</div>
            <div className="text-white font-medium text-xs sm:text-sm group-hover:text-blue-400 transition-colors">{cat.label}</div>
            <div className="text-gray-500 text-[10px] sm:text-xs hidden sm:block">{cat.desc}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default CategoriesSection;
