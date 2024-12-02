import { Star } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Ouma',
    role: 'Business Owner',
    content: 'This platform has transformed how I manage my business. The AI assistance and user-friendly interface make it incredibly easy to connect with customers.',
    image: 'https://ui-avatars.com/api/?name=Ouma&background=06B6D4&color=fff'
  },
  {
    id: '2',
    name: 'Ken',
    role: 'Regular Customer',
    content: 'I love how easy it is to find and connect with local businesses. The verified reviews and AI recommendations have never steered me wrong!',
    image: 'https://ui-avatars.com/api/?name=Ken&background=FB923C&color=fff'
  },
  {
    id: '3',
    name: 'Kamau',
    role: 'Entrepreneur',
    content: 'The platform\'s features and support have helped me grow my customer base significantly. It\'s more than just a directory - it\'s a business growth tool.',
    image: 'https://ui-avatars.com/api/?name=Kamau&background=22C55E&color=fff'
  }
];

export function TestimonialSection() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Trusted by Business Owners & Customers
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Don't just take our word for it - hear what our community has to say about their experience.
          </p>
        </div>
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="flex flex-col justify-between rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 hover:shadow-lg transition-shadow duration-300 animate-fade-in"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    className="h-12 w-12 rounded-full"
                    src={testimonial.image}
                    alt={testimonial.name}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-orange-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed">{testimonial.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}