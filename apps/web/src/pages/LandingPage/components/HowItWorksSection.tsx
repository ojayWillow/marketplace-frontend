const HowItWorksSection = () => (
  <section className="py-12 sm:py-16 md:py-24 border-t border-[#1a1a24]">
    <div className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">How it works</h2>
        <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
          Whether you need help or want to earn money — it's simple
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-16">
        {/* Need help? */}
        <div className="bg-[#1a1a24]/50 rounded-2xl p-5 sm:p-6 md:p-8 border border-[#2a2a3a]">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-5 sm:mb-6">
            Need help?
          </div>
          <div className="space-y-5 sm:space-y-6">
            {[
              { num: '1', title: 'Post your task', desc: 'Describe what you need help with and set your budget' },
              { num: '2', title: 'Get offers', desc: 'Local helpers will apply — review their profiles and ratings' },
              { num: '3', title: 'Get it done', desc: 'Pick your helper, they complete the task, you pay them directly' },
            ].map((item) => (
              <div key={item.num} className="flex gap-3 sm:gap-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-400 font-bold text-sm sm:text-base">{item.num}</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">{item.title}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Want to earn? */}
        <div className="bg-[#1a1a24]/50 rounded-2xl p-5 sm:p-6 md:p-8 border border-[#2a2a3a]">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-medium mb-5 sm:mb-6">
            Want to earn?
          </div>
          <div className="space-y-5 sm:space-y-6">
            {[
              { num: '1', title: 'Browse the map', desc: 'See tasks posted near you in real-time on the map' },
              { num: '2', title: 'Apply to tasks', desc: 'Found something you can help with? Send your offer' },
              { num: '3', title: 'Earn money', desc: 'Complete tasks, build your reputation, and get paid' },
            ].map((item) => (
              <div key={item.num} className="flex gap-3 sm:gap-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-green-400 font-bold text-sm sm:text-base">{item.num}</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1 text-sm sm:text-base">{item.title}</h3>
                  <p className="text-gray-400 text-xs sm:text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
