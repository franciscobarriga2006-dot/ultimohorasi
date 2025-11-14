"use client";
import {
  Users,
  MapPin,
  Briefcase,
  Search,
  Phone,
  Mail,
  Clock,
  Wrench,
  Home,
  Package,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
// 1. Importa useLayoutEffect
import { useEffect, useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useHelp } from "@/components/HelpWidget";

export default function JobMatchHome() {
  const { register, unregister } = useHelp();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    register([
      {
        title: "Inicio - ¿Qué veo aquí?",
        content: (
          <div>
            <p>Esta es la página principal de JobMatch.</p>
            <p style={{ marginTop: 8 }}>
              En la parte principal verás dos acciones principales: "Buscar
              trabajo" (botón azul) y "Publicar necesidad" (botón blanco con
              borde). Estas te llevan a las secciones de exploración y creación
              de publicaciones.
            </p>
          </div>
        ),
      },
      {
        title: "Si quiero buscar trabajos",
        content: (
          <div>
            <p>
              Pulsa "Buscar trabajo" para ir a la lista de publicaciones. Allí
              puedes usar filtros para buscar por palabra clave, ciudad o
              estado.
            </p>
            <p style={{ marginTop: 8 }}>
              Si quieres volver aquí, usa el menú superior o el logo para
              regresar al inicio.
            </p>
          </div>
        ),
      },
      {
        title: "Si quiero publicar una necesidad",
        content: (
          <div>
            <p>
              Pulsa "Publicar necesidad" para iniciar el flujo de creación. Si no
              tienes cuenta te pedirá registrarte o iniciar sesión.
            </p>
            <p style={{ marginTop: 8 }}>
              Completa el formulario con los datos de tu necesidad y al finalizar
              se publicará para que otros puedan postular.
            </p>
          </div>
        ),
      },
      {
        title: "Usa esta guía cuando necesites ayuda",
        content: (
          <div>
            <p>
              Puedes pulsar en cualquier momento el botón de ayuda en la
              esquina inferior derecha para abrir nuevamente esta guía
              interactiva.
            </p>
            <p style={{ marginTop: 8 }}>
              Utiliza los botones "Siguiente" y "Atrás" para navegar entre los
              pasos de la guía, o la ✕ arriba a la derecha para cerrarla cuando
              ya no la necesites.
            </p>
          </div>
        ),
      },
    ]);

    return () => unregister();
  }, [register, unregister]);


  // 2. Cambia el hook de animación a useLayoutEffect
  useLayoutEffect(() => {
    if (!pageRef.current) {
      return undefined;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      heroTimeline
        .from(".hero-heading", {
          y: 60,
          autoAlpha: 0, // 3. Cambiado de opacity a autoAlpha
          duration: 0.9,
        })
        .from(
          ".hero-subtext",
          {
            y: 30,
            autoAlpha: 0, // 3. Cambiado de opacity a autoAlpha
            duration: 0.7,
            stagger: 0.15,
          },
          "-=0.5",
        )
        .from(
          ".hero-cta",
          {
            y: 24,
            autoAlpha: 0, // 3. Cambiado de opacity a autoAlpha
            duration: 0.6,
            stagger: 0.1,
          },
          "-=0.4",
        )
        .from(
          ".hero-bullet",
          {
            y: 40,
            autoAlpha: 0, // 3. Cambiado de opacity a autoAlpha
            duration: 0.6,
            stagger: 0.12,
          },
          "-=0.5",
        );

      gsap.from(".hero-showcase", {
        y: 40,
        autoAlpha: 0, // 3. Cambiado de opacity a autoAlpha
        duration: 1.1,
        ease: "power3.out",
      });

      gsap.to(".hero-showcase", {
        y: "-=10",
        duration: 3.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });

      gsap.utils
        .toArray<HTMLElement>(".stats-card")
        .forEach((card, index) => {
          gsap.from(card, {
            y: 50,
            autoAlpha: 0, // 3. Cambiado de opacity a autoAlpha
            duration: 0.8,
            delay: index * 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          });
        });

      gsap.utils
        .toArray<HTMLElement>(".reveal-on-scroll")
        .forEach((element) => {
          gsap.from(element, {
            y: 60,
            autoAlpha: 0, // 3. Cambiado de opacity a autoAlpha
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          });
        });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const news = [
    {
      title: "Nuevas oportunidades en servicios del hogar",
      description:
        "Más de 200 nuevas solicitudes de ayuda doméstica y mantenimiento esta semana",
      date: "03 Oct 2025",
      category: "Servicios",
    },
    {
      title: "Tendencias en trabajos flexibles",
      description:
        "El 85% de los usuarios prefiere trabajos puntuales con horarios adaptables",
      date: "28 Sep 2025",
      category: "Tendencias",
    },
    {
      title: "JobMatch conecta más de 5,000 matches",
      description:
        "Celebramos miles de conexiones exitosas entre trabajadores y empleadores",
      date: "25 Sep 2025",
      category: "Empresa",
    },
  ];

  return (
    <div ref={pageRef} className="min-h-screen bg-gray-50">
      {/* Hero Section - Descripción de JobMatch */}
      <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* 4. Añadida la clase 'invisible' */}
              <h1 className="hero-heading invisible text-5xl font-bold text-gray-900 mb-6">
                Conecta con{" "}
                <span className="text-blue-600">trabajos flexibles</span> y
                personas cuando las necesites
              </h1>
              {/* 4. Añadida la clase 'invisible' */}
              <p className="hero-subtext invisible text-lg text-gray-700 mb-6 leading-relaxed">
                JobMatch es la plataforma que te conecta con oportunidades de
                trabajo puntual y casual. Ya sea que necesites ayuda con una
                mudanza, jardinería, reparaciones del hogar o cualquier tarea
                específica, aquí encontrarás a la persona indicada.
              </p>
              {/* 4. Añadida la clase 'invisible' */}
              <p className="hero-subtext invisible text-lg text-gray-700 mb-8 leading-relaxed">
                ¿Buscas trabajar? Explora cientos de publicaciones de personas
                que necesitan tus habilidades. ¿Necesitas contratar? Publica tu
                solicitud y recibe postulaciones de trabajadores calificados.
                Todo en un solo lugar, de manera simple y directa.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/publications/publications_view"
                  // 4. Añadida la clase 'invisible'
                  className="hero-cta invisible inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
                >
                  <span>Buscar trabajo</span>
                  <Search className="w-5 h-5" />
                </Link>
                <Link
                  href="/publications/publications_own"
                  // 4. Añadida la clase 'invisible'
                  className="hero-cta invisible inline-flex items-center gap-2 bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
                >
                  <span>Publicar necesidad</span>
                  <Briefcase className="w-5 h-5" />
                </Link>
              </div>
            </div>
            <div className="relative">
              {/* 4. Añadida la clase 'invisible' */}
              <div className="hero-showcase invisible bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Trabajos populares
                </h3>
                <div className="space-y-4">
                  {/* 4. Añadida la clase 'invisible' */}
                  <div className="hero-bullet invisible flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="bg-blue-600 p-3 rounded-lg">
                      <Home className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        Mudanzas y transporte
                      </div>
                      <div className="text-sm text-gray-600">
                        350+ publicaciones
                      </div>
                    </div>
                  </div>
                  {/* 4. Añadida la clase 'invisible' */}
                  <div className="hero-bullet invisible flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="bg-blue-600 p-3 rounded-lg">
                      <Wrench className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        Reparaciones y mantenimiento
                      </div>
                      <div className="text-sm text-gray-600">
                        280+ publicaciones
                      </div>
                    </div>
                  </div>
                  {/* 4. Añadida la clase 'invisible' */}
                  <div className="hero-bullet invisible flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="bg-blue-600 p-3 rounded-lg">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        Servicios del hogar
                      </div>
                      <div className="text-sm text-gray-600">
                        420+ publicaciones
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Invitación a explorar publicaciones */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* 4. Añadida la clase 'invisible' */}
          <div className="reveal-on-scroll invisible bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 shadow-2xl">
            <Users className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">
              Miles de oportunidades te esperan
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Explora nuestra plataforma y descubre trabajos puntuales que se
              ajusten a tu tiempo y habilidades. Desde tareas sencillas hasta
              proyectos más complejos, hay algo para todos.
            </p>
            <Link
              href="/publications/publications_view"
              className="inline-flex items-center gap-3 bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 rounded-lg text-lg font-bold transition-colors shadow-lg"
            >
              <span>Explorar publicaciones ahora</span>
              <ArrowRight className="w-6 h-6" />
            </Link>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 4. Añadida la clase 'invisible' */}
              <div className="stats-card invisible bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <MapPin className="w-10 h-10 text-white mx-auto mb-3" />
                <div className="text-white">
                  <div className="text-3xl font-bold mb-1">100+</div>
                  <div className="text-blue-100">Ciudades activas</div>
                </div>
              </div>
              {/* 4. Añadida la clase 'invisible' */}
              <div className="stats-card invisible bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <Briefcase className="w-10 h-10 text-white mx-auto mb-3" />
                <div className="text-white">
                  <div className="text-3xl font-bold mb-1">5,000+</div>
                  <div className="text-blue-100">Trabajos publicados</div>
                </div>
              </div>
              {/* 4. Añadida la clase 'invisible' */}
              <div className="stats-card invisible bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <TrendingUp className="w-10 h-10 text-white mx-auto mb-3" />
                <div className="text-white">
                  <div className="text-3xl font-bold mb-1">92%</div>
                  <div className="text-blue-100">Tasa de conexión</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Últimas Noticias
            </h2>
            <p className="text-lg text-gray-600">
              Mantente al día con las tendencias del mercado laboral
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((article, index) => (
              <article
                key={index}
                // 4. Añadida la clase 'invisible'
                className="reveal-on-scroll invisible bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {article.category}
                    </span>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {article.date}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {article.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Contáctanos
            </h2>
            <p className="text-lg text-gray-600">
              ¿Tienes preguntas? Estamos aquí para ayudarte
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 4. Añadida la clase 'invisible' */}
            <div className="reveal-on-scroll invisible text-center p-6 bg-blue-50 rounded-lg">
              <div className="flex justify-center mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Correo Electrónico
              </h3>
              <p className="text-gray-600">Jobmatchsupport@gmail.com</p>
            </div>
            {/* 4. Añadida la clase 'invisible' */}
            <div className="reveal-on-scroll invisible text-center p-6 bg-blue-50 rounded-lg">
              <div className="flex justify-center mb-4">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Teléfono
              </h3>
              <p className="text-gray-600">+1 (555) 123-4567</p>
            </div>
            {/* 4. Añadida la clase 'invisible' */}
            <div className="reveal-on-scroll invisible text-center p-6 bg-blue-50 rounded-lg">
              <div className="flex justify-center mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Horarios de Atención
              </h3>
              <p className="text-gray-600">Lun - Vie: 9:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
