import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';

const PageLayout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default PageLayout;
