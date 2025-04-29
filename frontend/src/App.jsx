import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Loader from './components/Loader/Loader'
import PublicRoute from './routes/PublicRoute'

const HomePage = React.lazy(() => import('./pages/Home'))
const LoginPage = React.lazy(() => import('./pages/auth/Login'))
const RegisterPage = React.lazy(() => import('./pages/auth/Register'))
const MainScreen = React.lazy(() => import('./pages/app/MainScreen'))
const ProtectedRoute = React.lazy(() => import('./routes/ProtectedRoute'))
const ChatsPage = React.lazy(() => import('./pages/app/Chats'))
const FindUsersPage = React.lazy(() => import('./pages/app/FindUsers'))
const CallsPage = React.lazy(() => import('./pages/app/Calls'))
const ChatByIdPage = React.lazy(() => import('./pages/app/ChatById'))

function App() {

  return (
    <div className='h-screen max-w-[500px] mx-auto'>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<MainScreen />}>
              <Route path="chats" element={<ChatsPage />} />
              <Route path="find" element={<FindUsersPage />} />
              <Route path="calls" element={<CallsPage />} />
              <Route path="chat/:id" element={<ChatByIdPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
