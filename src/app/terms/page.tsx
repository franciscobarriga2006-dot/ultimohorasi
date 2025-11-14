import RegisterHelp from '@/components/RegisterHelp';

export default function TermsPage() {
  return (
    <div>
      <main className="p-6">
        <RegisterHelp
          steps={[
            {
              title: 'Términos y condiciones - resumen',
              content: (
                <div>
                  <p>Lee detenidamente los términos. Si estás de acuerdo, continúa usando la plataforma.</p>
                </div>
              ),
            },
          ]}
        />
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Términos y Condiciones
        </h1>

        <div className="bg-gray-100 p-8 rounded-xl shadow-md max-w-4xl mx-auto space-y-8 leading-relaxed text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">1. Introducción</h2>
            <p>
              Este sitio web es operado por <strong>JobMatch</strong>. En todo el sitio, los términos
              “nosotros”, “nos” y “nuestro” se refieren a JobMatch. JobMatch ofrece este sitio web,
              incluyendo toda la información, herramientas y servicios disponibles para ti como usuario,
              condicionado a la aceptación de todos los términos, condiciones, políticas y notificaciones aquí establecidos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">2. Aceptación de los Términos</h2>
            <p>
              Al visitar nuestro sitio y/o utilizar nuestros servicios, participas en nuestro “Servicio” y
              aceptas los siguientes <strong>Términos de Servicio</strong> (“Términos”), incluidos todos los
              términos y condiciones adicionales y las políticas a las que se hace referencia en este documento
              y/o disponibles a través de hipervínculos. Estas condiciones se aplican a todos los usuarios del
              sitio, incluyendo sin limitación navegadores, proveedores, clientes, comerciantes y colaboradores
              de contenido.
            </p>
            <p>
              Si no estás de acuerdo con estos términos, por favor no accedas ni utilices este sitio web. Tu
              uso continuado del sitio constituye tu aceptación expresa de estos Términos de Servicio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">3. Compromiso con Nuestros Usuarios</h2>
            <p>
              Como <strong>gerente de JobMatch</strong>, quiero agradecerte por confiar en nuestra plataforma.
              Nuestro propósito es ofrecerte una experiencia segura, eficiente y satisfactoria. Estos términos y
              condiciones están diseñados para garantizar que todos los usuarios puedan disfrutar de nuestros
              servicios de manera justa, responsable y transparente.
            </p>
            <p>
              En JobMatch creemos que las conexiones laborales deben basarse en la confianza mutua. Por eso, 
              trabajamos constantemente para mejorar nuestras herramientas, fortalecer la seguridad y ofrecerte 
              un entorno digital donde puedas crecer profesionalmente con tranquilidad.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">4. Uso Responsable de la Plataforma</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Proporcionar información veraz, actualizada y completa al momento de registrarte o interactuar con la plataforma.</li>
              <li>Abstenerte de utilizar los servicios con fines fraudulentos o que infrinjan los derechos de terceros.</li>
              <li>Mantener la confidencialidad de tus credenciales y notificar cualquier uso no autorizado.</li>
              <li>Cumplir con las leyes aplicables en materia de protección de datos y propiedad intelectual.</li>
            </ul>
            <p className="mt-3">
              JobMatch se reserva el derecho de suspender o cancelar cuentas que incumplan con estas normas
              o que, a criterio de la empresa, comprometan la integridad de la comunidad.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">5. Transparencia y Mejora Continua</h2>
            <p>
              Valoramos profundamente la retroalimentación de nuestros usuarios. Cada comentario y sugerencia
              que recibimos nos ayuda a mejorar nuestros servicios y construir una comunidad más sólida. Nuestro
              equipo de soporte está disponible para atender tus inquietudes y ofrecerte asistencia oportuna.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">6. Agradecimiento Final</h2>
            <p>
              En nombre de todo el equipo de <strong>JobMatch</strong>, te agradecemos sinceramente por ser parte
              de nuestra comunidad. Tu confianza es el motor que nos impulsa a seguir creciendo, innovando y
              creando un espacio donde el talento y las oportunidades se conectan.
            </p>
            <p>
              Recuerda que el uso de nuestra plataforma implica la aceptación de estos términos. Estamos
              comprometidos con tu seguridad y con ofrecerte siempre la mejor experiencia posible.
            </p>
            <p className="font-medium text-gray-800 mt-4">
              Gracias por elegir JobMatch. Estamos aquí para ayudarte a crecer, conectar y avanzar.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
