import Nav from "@/components/chrome/Nav";
import Footer from "@/components/chrome/Footer";
import Hero from "@/components/sections/Hero";
import WhyUs from "@/components/sections/WhyUs";
import Chevrons from "@/components/sections/Chevrons";
import Steps from "@/components/sections/Steps";
import ForPartners from "@/components/sections/ForPartners";
import Testimonials from "@/components/sections/Testimonials";
import Services from "@/components/sections/Services";
import Features from "@/components/sections/Features";
import LatestPosts from "@/components/sections/LatestPosts";
import Outro from "@/components/sections/Outro";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <WhyUs />
        <Chevrons />
        <Steps />
        <ForPartners />
        <Testimonials />
        <Services />
        <Features />
        <LatestPosts />
        <Outro />
      </main>
      <Footer />
    </>
  );
}
