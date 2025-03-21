import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import PersonalInfo from './pages/PersonalInfo';
import PaymentRecord from './pages/PaymentRecord';
import Result from './pages/Result';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'personal-info',
        element: <PersonalInfo />,
      },
      {
        path: 'payment-record',
        element: <PaymentRecord />,
      },
      {
        path: 'result',
        element: <Result />,
      },
    ],
  },
]);

export default router;