import React from "react";
import { Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-gray-400 text-sm">© JobMatch 2025</div>

        <nav className="flex items-center space-x-6">
          <a
            href="/contact"
            className="text-white hover:text-gray-300 text-base font-medium transition-colors duration-200"
          >
            Contáctanos
          </a>
          <a
            href="/support"
            className="text-white hover:text-gray-300 text-base font-medium transition-colors duration-200"
          >
            Soporte al Cliente
          </a>
          <a
            href="/terms"
            className="text-white hover:text-gray-300 text-base font-medium transition-colors duration-200"
          >
            Términos y Condiciones
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          <a
            href="#"
            className="text-white hover:text-gray-300 transition-colors duration-200"
            aria-label="Facebook"
          >
            <Facebook className="w-6 h-6" />
          </a>
          <a
            href="#"
            className="text-white hover:text-gray-300 transition-colors duration-200"
            aria-label="Twitter"
          >
            <Twitter className="w-6 h-6" />
          </a>
          <a
            href="#"
            className="text-white hover:text-gray-300 transition-colors duration-200"
            aria-label="Instagram"
          >
            <Instagram className="w-6 h-6" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
