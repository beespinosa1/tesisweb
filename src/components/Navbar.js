import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scale, BarChart3, Home } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <Scale className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-800">
                Sesgo Analyzer
              </span>
            </Link>
          </div>
          
          <div className="flex space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Inicio</span>
            </Link>
            
            <Link
              to="/analyzer"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/analyzer')
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              <Scale className="h-4 w-4" />
              <span>Analizador</span>
            </Link>
            
            <Link
              to="/dashboard"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 