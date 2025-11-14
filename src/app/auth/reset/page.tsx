"use client";

import { useState, useEffect } from "react";

type View = "forgot-password" | "login" | "register";
type NavHandler = (v: View) => void;

type HeaderProps = { onNavigate: NavHandler };
const Header = ({ onNavigate }: HeaderProps) => {
  const go =
    (v: View) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      onNavigate(v);
    };
  return (
    <header className="w-full py-4 px-8 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <a href="#" onClick={go("forgot-password")}>
            <img
              src="https://placehold.co/100x40/5c6ac4/ffffff?text=JobMatch"
              alt="JobMatch Logo"
              className="h-8 w-auto object-contain"
            />
          </a>
          <span className="text-xl font-bold text-blue-600">JobMatch</span>
        </div>

        <div className="flex items-center space-x-4">
          <a href="#" onClick={go("register")} className="text-blue-600 hover:text-blue-700 font-semibold">
            Registro
          </a>
          <a
            href="#"
            onClick={go("login")}
            className="text-white bg-blue-600 hover:bg-blue-700 rounded-md px-4 py-2 font-bold transition-colors"
          >
            Iniciar Sesión
          </a>
        </div>
      </div>
    </header>
  );
};

type ForgotPasswordProps = { onNavigate: NavHandler };
const ForgotPassword = ({ onNavigate }: ForgotPasswordProps) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLinkSent, setIsLinkSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined; // tipado cross-env
    if (isLinkSent && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      setIsLinkSent(false);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLinkSent, countdown]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLinkSent(true);
    setCountdown(60);
    setMessage(
      `Instrucciones para restablecer la contraseña enviadas a ${email}. Revisa tu bandeja de entrada.`
    );
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md text-center border border-gray-200">
        <h2 className="text-3xl font-extrabold mb-4 text-gray-800">¿Olvidaste tu Contraseña?</h2>
        <p className="text-gray-600 mb-6 font-medium">No te preocupes. Te ayudaremos a recuperarla.</p>
        <p className="text-sm text-gray-500 mb-6">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Correo Electrónico"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-xl text-base outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            required
            disabled={isLinkSent}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-colors transform hover:scale-105 disabled:bg-gray-400 disabled:shadow-none disabled:transform-none"
            disabled={isLinkSent && countdown > 0}
          >
            {isLinkSent && countdown > 0 ? `Reenviar en (${countdown})` : "Enviar Enlace"}
          </button>
        </form>
        {message && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-semibold">{message}</p>
          </div>
        )}
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate("login"); }} className="mt-6 inline-block text-sm text-blue-600 hover:underline">
          &larr; Volver a Iniciar Sesión
        </a>
      </div>
    </div>
  );
};

type SimpleProps = { onNavigate: NavHandler };
const Login = ({ onNavigate }: SimpleProps) => (
  <div className="flex-grow flex items-center justify-center bg-gray-100 p-4">
    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Iniciar Sesión</h2>
      <p className="text-gray-600 mb-6">Esta es la página de inicio de sesión.</p>
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); onNavigate("forgot-password"); }}
        className="mt-4 inline-block text-sm text-blue-600 hover:underline"
      >
        ¿Olvidaste tu contraseña?
      </a>
    </div>
  </div>
);

const Register = ({ onNavigate }: SimpleProps) => (
  <div className="flex-grow flex items-center justify-center bg-gray-100 p-4">
    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Registro</h2>
      <p className="text-gray-600 mb-6">Esta es la página de registro.</p>
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); onNavigate("login"); }}
        className="mt-4 inline-block text-sm text-blue-600 hover:underline"
      >
        Volver a Iniciar Sesión
      </a>
    </div>
  </div>
);

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("forgot-password");

  const renderView = () => {
    switch (currentView) {
      case "forgot-password":
        return <ForgotPassword onNavigate={setCurrentView} />;
      case "login":
        return <Login onNavigate={setCurrentView} />;
      case "register":
        return <Register onNavigate={setCurrentView} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header onNavigate={setCurrentView} />
      {renderView()}
    </div>
  );
}
