import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Loader from './components/Loader/Loader'

const HomePage = React.lazy(() => import('./pages/Home'))
const LoginPage = React.lazy(() => import('./pages/Login'))
const RegisterPage = React.lazy(() => import('./pages/Register'))
function App() {

  return (
    <div className='h-screen max-w-[500px] mx-auto'>

      <Routes>
        <Route path="/" element={
          <Suspense fallback={<Loader />}>
            <HomePage />
          </Suspense>
        } />
        <Route path="/login" element={
          <Suspense fallback={<Loader />}>
            <LoginPage />
          </Suspense>
        } />
        <Route path="/register" element={
          <Suspense fallback={<Loader />}>
            <RegisterPage />
          </Suspense>
        } />
      </Routes>

    </div>
  )
}

export default App
