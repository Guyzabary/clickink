import React from 'react';
import { Palette, Shield, Calendar } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="space-y-12">
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">About ClickInk</h1>
        <p className="text-lg text-gray-600">
          ClickInk is revolutionizing the tattoo industry by connecting talented artists with clients through an innovative platform. We combine AI-powered design assistance with a curated marketplace of verified artists to make your tattoo journey seamless and enjoyable.
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          <Palette className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">AI Matching</h3>
          <p className="text-gray-600">
            Our AI analyzes your preferences and matches you with artists who specialize in your desired style.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Verified Artists</h3>
          <p className="text-gray-600">
            Every artist on our platform is thoroughly vetted for quality, safety, and professionalism.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          <Calendar className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
          <p className="text-gray-600">
            Schedule consultations and appointments with your chosen artist in just a few clicks.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;