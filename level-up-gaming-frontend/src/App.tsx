// level-up-gaming-frontend/src/App.tsx

import React from 'react';

// Componentes del Layout
import Header from './components/Header';
import Footer from './components/Footer';
import AppRouter from './routes/AppRouter'; // Importar el nuevo enrutador

const App: React.FC = () => {
  return (
    <div className="d-flex flex-column min-vh-100"> 
      
      <Header />
      
      <main className="flex-grow-1"> 
        <AppRouter />
      </main>

      <Footer />
    </div>
  );
}

export default App;