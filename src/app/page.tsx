import Nav from "@/components/chrome/Nav";
import Hero from "@/components/sections/Hero";
import WhyUs from "@/components/sections/WhyUs";
import Chevrons from "@/components/sections/Chevrons";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <WhyUs />
        <Chevrons />
      </main>
    </>
  );
}
