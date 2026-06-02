import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ModuleSections from "@/components/ModuleSections";
import WorkflowSection from "@/components/WorkflowSection";
import Features from "@/components/Features";
import Testimonial from "@/components/Testimonial";
import SocialProof from "@/components/SocialProof";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ModuleSections />
        <WorkflowSection />
        <Features />
        <Testimonial />
        <SocialProof />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
