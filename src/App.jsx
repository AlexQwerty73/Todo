import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components';
import { CreateUserPage, LoginPage, NotFoundPage, UserTodosPage, UserPage, UserEditPage } from './pages';

const App = () => {

  return (
    <div className="container">

      <Routes>

        <Route path='/' >
          <Route index element={<Navigate to="/login" />} />

          <Route path='login/' element={<LoginPage />} />

          <Route path='user/' element={<Layout />}>

            <Route path='create/' element={<CreateUserPage />} />

            <Route path=':id/'>
              <Route index element={<UserPage />} />
              <Route path='edit/' element={<UserEditPage />} />

              <Route path='todos/' element={<UserTodosPage />} />

              <Route path='*' element={<NotFoundPage />} />
            </Route>

            <Route path='*' element={<NotFoundPage />} />
          </Route>

          <Route path='*' element={<NotFoundPage />} />
        </Route>

      </Routes>

    </div >
  );
}

export default App;
