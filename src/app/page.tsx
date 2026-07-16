import Nav from "@/components/chrome/Nav";
import Hero from "@/components/sections/Hero";
import WhyUs from "@/components/sections/WhyUs";
import Chevrons from "@/components/sections/Chevrons";
import Steps from "@/components/sections/Steps";
import ForPartners from "@/components/sections/ForPartners";
import Testimonials from "@/components/sections/Testimonials";
import Services from "@/components/sections/Services";

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
      </main>
    </>
  );
}
