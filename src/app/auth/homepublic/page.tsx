"use client";

import {
  Users,
  MapPin,
  Shield,
  Calendar,
  Star,
  Search,
  Phone,
  Mail,
  Clock,
  TrendingUp,
  Award,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useHelp } from "@/components/HelpWidget";

export default function JobMatchHomePublic() {
  const { register, unregister } = useHelp();
  const pageRef = useRef<HTMLDivElement>(null);

  // ✅ Guía de ayuda
  useEffect(() => {
    register([
      {
        title: "¿Qué es JobMatch?",
        content: (
          <div>
            <p>
              Aquí podrás conocer las características principales de JobMatch.
            </p>
            <p style={{ marginTop: 8 }}>
              Si ya tienes una cuenta puedes usar el botón{" "}
              <strong>Iniciar Sesión</strong> arriba a la derecha. Y si eres nuevo,
              puedes crear tu cuenta con el botón <strong>Registrarse</strong>.
            </p>
          </div>
        ),
      },
    ]);

    return () => unregister();
  }, [register, unregister]);

  // ✅ Animaciones GSAP adaptadas
  useLayoutEffect(() => {
    if (!pageRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Animación principal del Hero
      gsap.from(".hero-heading", {
        y: 60,
        autoAlpha: 0,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(".hero-subtext", {
        y: 30,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.12,
        delay: 0.2,
      });

      gsap.from(".hero-cta", {
        y: 25,
        autoAlpha: 0,
        duration: 0.7,
        delay: 0.4,
      });

      // Animación de tarjetas de estadísticas (Hero right)
      gsap.from(".stats-block", {
        scale: 0.85,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.5)",
        delay: 0.3,
      });

      // Animaciones scroll: features + contacto + CTA final
      gsap.utils.toArray<HTMLElement>(".reveal-on-scroll").forEach((el) => {
        gsap.from(el, {
          y: 50,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        });
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: <Search className="w-8 h-8 text-blue-600" />,
      title: "Ofertas laborales al instante",
      description:
        "Encuentra oportunidades de trabajo que se adapten a tu perfil.",
    },
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Chatea con tu Match",
      description:
        "Comunicación directa con quienes requieren tus servicios.",
    },
    {
      icon: <MapPin className="w-8 h-8 text-blue-600" />,
      title: "Geolocaliza trabajos",
      description: "Encuentra trabajos cerca de tu ubicación.",
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Seguridad y confianza",
      description:
        "Ofertas verificadas y supervisadas por el equipo de JobMatch.",
    },
    {
      icon: <Calendar className="w-8 h-8 text-blue-600" />,
      title: "Horarios flexibles",
      description: "Trabaja cuando tú puedas, sin compromisos.",
    },
    {
      icon: <Star className="w-8 h-8 text-blue-600" />,
      title: "Feedback transparente",
      description: "Comentarios claros para mejorar tu perfil.",
    },
  ];

  return (
    <div ref={pageRef} className="min-h-screen bg-gray-50">
      {/* ✅ Hero con animación */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="hero-heading invisible text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Trabaja a tu ritmo,{" "}
              <span className="text-blue-600">gana en tu tiempo</span>
            </h1>

            <p className="hero-subtext invisible text-lg text-gray-600 mb-8 leading-relaxed">
              Conecta con oportunidades reales que se ajusten a tus horarios.
            </p>

            <Link
              href="/publications/publications_view"
              className="hero-cta invisible inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-lg text-lg font-semibold transition-colors shadow-md"
            >
              Explorar trabajos
              <Search className="w-5 h-5" />
            </Link>
          </div>

          {/* Estadísticas animadas */}
          <div className="grid grid-cols-2 gap-4">
            {[ 
              { icon: Briefcase, label: "Empleos", value: "5,000+" },
              { icon: Users, label: "Usuarios", value: "10,000+" },
              { icon: TrendingUp, label: "Éxito", value: "95%" },
              { icon: Award, label: "Rating", value: "4.8" },
            ].map(({ icon: Icon, label, value }, i) => (
              <div
                key={i}
                className="stats-block invisible bg-white shadow-md rounded-xl p-5 text-center"
              >
                <Icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-sm text-gray-600">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ Features animadas */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">¿Por qué nosotros?</h2>
            <p className="text-lg text-gray-600">Razones para elegir JobMatch</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="reveal-on-scroll invisible text-center p-6 rounded-xl bg-gray-50 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 text-xl mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ Contact & CTA animado */}
      <section className="reveal-on-scroll invisible bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Únete a miles que ya encontraron su Match laboral
          </p>

          <Link
            href="/auth/register"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
          >
            Registrarse Ahora
          </Link>
        </div>
      </section>
    </div>
  );
}
