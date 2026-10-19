import React from 'react';
import { Sparkles, Clock, BedDouble, ChefHat } from 'lucide-react';

export default function Benefits() {
  const benefits = [
    {
      icon: Sparkles,
      title: 'Fresh Ingredients',
      description: 'Prepared fresh by our kitchen daily.',
    },
    {
      icon: Clock,
      title: 'Fast Delivery',
      description: 'Delivered hot to your room in 20-25 mins.',
    },
    {
      icon: BedDouble,
      title: 'In-Room Dining',
      description: 'Enjoy meals in private luxury.',
    },
    {
      icon: ChefHat,
      title: 'Hotel Quality',
      description: 'Crafted by our certified master chefs.',
    },
  ];

  return (
    <section className="py-5 sm:py-7 border-b border-[#E6E1D5] bg-white" aria-label="Hotel Dining Benefits">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="flex items-center sm:items-start gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl bg-[#FAF8F5] border border-[#E6E1D5] transition-all hover:border-[#C99A4A]/50"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#FBF6EE] border border-[#C99A4A]/20 flex items-center justify-center text-[#C99A4A] shrink-0">
                  <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
                <div>
                  <h4 className="font-serif text-xs sm:text-sm font-bold text-[#1A1814]">
                    {benefit.title}
                  </h4>
                  <p className="hidden sm:block text-[11px] text-[#77736C] mt-0.5 leading-snug">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
