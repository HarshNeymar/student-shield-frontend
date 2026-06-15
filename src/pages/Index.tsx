import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, School, Users, GraduationCap, Heart, BookOpen, CheckCircle, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-illustration.jpg";

const plans = [
  { name: "Basic Plan", price: "₹399", period: "/yearly", features: ["Accidental Protection", "Student ID Card", "Basic Wellness Reports", "Email Support"], popular: false },
  { name: "Standard Plan", price: "₹799", period: "/yearly", features: ["Everything in Basic", "Future Financial Security", "Counseling Sessions", "Priority Support", "Smart Buddy Access"], popular: true },
  { name: "Premium Plan", price: "₹1199", period: "/yearly", features: ["Everything in Standard", "Full Student Protection", "Unlimited Sessions", "Dedicated Counselor", "Parent Dashboard", "24/7 Support"], popular: false },
];

const features = [
  { icon: <Shield className="w-6 h-6" />, title: "Student Protection", desc: "Comprehensive accidental & financial protection for every student." },
  { icon: <Heart className="w-6 h-6" />, title: "Wellness Reports", desc: "Regular behavioral, emotional & academic wellness assessments." },
  { icon: <BookOpen className="w-6 h-6" />, title: "Smart Buddy", desc: "AI-powered mentorship program for personalized student growth." },
  { icon: <Users className="w-6 h-6" />, title: "Multi-School Management", desc: "Manage multiple schools, teachers & students from one dashboard." },
  { icon: <GraduationCap className="w-6 h-6" />, title: "Session Management", desc: "Conduct & track counseling sessions with class-level visibility." },
  { icon: <School className="w-6 h-6" />, title: "Role-Based Access", desc: "Secure, tiered access for company, school, teacher & student." },
];

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" />
            <span className="font-bold text-lg text-foreground">Student Shield</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#plans" className="hover:text-foreground transition-colors">Plans</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
          </div>
          <Link to="/login">
            <Button size="sm">Login</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-hero text-primary-foreground py-20 lg:py-28">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 rounded-full px-4 py-1.5 text-sm">
              <Shield className="w-4 h-4" /> Trusted by 500+ Schools
            </div>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight">
              Protecting Students,<br />Empowering Futures
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto lg:mx-0">
              A comprehensive multi-school management platform for student protection, wellness tracking, and mentorship programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link to="/login">
                <Button variant="hero" size="lg" className="gap-2">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="hero-outline" size="lg">Learn More</Button>
              </a>
            </div>
          </div>
          <div className="flex-1 max-w-lg">
            <img src={heroImage} alt="Happy school children with shield" className="rounded-2xl shadow-2xl" width={1280} height={720} />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground">Everything You Need</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              A complete ecosystem for student welfare management across all levels.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-card rounded-xl p-6 shadow-card border border-border hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-lg text-card-foreground">{f.title}</h3>
                <p className="text-muted-foreground text-sm mt-2">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground">Choose a Plan</h2>
            <p className="text-muted-foreground mt-3">Simple, transparent pricing for every school.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map((plan, i) => (
              <div key={i} className={`relative bg-card rounded-2xl p-7 border shadow-card transition-all duration-300 hover:shadow-card-hover ${plan.popular ? "border-primary ring-2 ring-primary/20 scale-105" : "border-border"}`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">Most Popular</span>
                )}
                <h3 className="font-bold text-lg text-card-foreground">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/login">
                  <Button className="w-full mt-6" variant={plan.popular ? "default" : "outline"}>
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="gradient-hero text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6" />
              <span className="font-bold text-lg">Student Shield</span>
            </div>
            <p className="text-primary-foreground/70 text-sm">
              © 2026 Student Shield. Protecting students, empowering futures.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
