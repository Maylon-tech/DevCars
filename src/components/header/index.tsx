import { Link } from 'react-router-dom'
import logoImg from '../../assets/logo.svg'
import { FiLogIn, FiUser } from 'react-icons/fi'
import { useContext } from 'react'
import { AuthContext } from '../../contexts/AuthContext'

export function Header() { 
  const { signed, loadingAuth } = useContext(AuthContext)


  return (
    <div className='w-full flex items-center justify-center h-16 bg-white drop-shadow mb-4'>
      <header className='flex justify-between w-full max-w-7xl items-center px-4 mx-auto'>
        <Link to="/">
          <img src={logoImg} alt="logo do site" />
        </Link>

        {
          !loadingAuth && signed && (
            <Link to="/dashboard">
              <div className='border-2 rounded-full p-2 border-gray-900'>
                <FiUser size={24} color='#000' />
              </div>
            </Link>
          )
        }
        {
          !loadingAuth && !signed && (
            <Link to="/login">
              <div className='border-2 rounded-full p-2 border-gray-900'>
                <FiLogIn size={24} color='#000' />
              </div>
            </Link>
          )
        }
      </header>
    </div>
  )
}

